import {
	desc, eq, gte, lt, sql, sum, and
} from 'drizzle-orm';
import pino from 'pino';
import {
	transactions, database, type Transaction,
	balances,
} from '../drizzle';
import type {TransactionDto} from '@/lib/client';

export const observable = <Arguments extends Record<string, unknown>, Return>({spanId, command}: {
	spanId: string;
	command: (arguments_: Arguments) => Promise<Return>;
}) => {
	const logger = pino().child({
		spanId,
	});

	return async ({traceId, parentSpanId, arguments_}: {
		traceId: string;
		parentSpanId: string;
		arguments_: Arguments;
	}) => {
		const start = Date.now();

		logger.info({
			traceId,
			parentSpanId,
			message: 'invoked',
		});

		try {
			const result = await command(arguments_);

			logger.info({
				traceId,
				parentSpanId,
				duration: Date.now() - start,
				message: 'done',
			});

			return result;
		} catch (error) {
			logger.error({
				traceId,
				parentSpanId,
				message: error,
			});

			throw error;
		}
	};
};

async function _getPagedTransactions({startAfter = new Date(), limit = 50}: {
	startAfter?: Date | undefined;
	limit?: number;
}): Promise<{
	data: TransactionDto[];
	startAfter: Date | undefined;
	hasNext: boolean;
}> {
	const res = await database
		.select()
		.from(transactions)
		.where(
			startAfter 
				? lt(transactions.createdAt, startAfter) 
				: undefined
		)
		.orderBy(desc(transactions.date), desc(transactions.createdAt))
		.limit(limit);

	const data = res as TransactionDto[];

	return {
		data,
		startAfter: data ? data.map(t => t.createdAt).pop() : startAfter,
		hasNext: data.length === limit,
	};
}

export const getPagedTransactions = observable({
	spanId: 'getPagedTransactions',
	command: _getPagedTransactions,
});

async function _getPagedTransactionsByCategory({category, startAfter = new Date(), limit = 50}: {
	category: string;
	startAfter?: Date;
	limit?: number;
}): Promise<{
	data: TransactionDto[];
	startAfter: Date | undefined;
	hasNext: boolean;
}> {
	const data = await database
		.select()
		.from(transactions)
		.where(
			and(
				startAfter 
					? lt(transactions.createdAt, startAfter) 
					: undefined,
				eq(transactions.category, category)
			)
		)
		.orderBy(desc(transactions.date), desc(transactions.createdAt))
		.limit(limit);

	return {
		data: data as TransactionDto[],
		startAfter: data ? data.map(t => t.createdAt).pop() : startAfter!,
		hasNext: data.length === limit,
	};
}

export const getPagedTransactionsByCategory = observable({
	spanId: 'getPagedTransactionsByCategory',
	command: _getPagedTransactionsByCategory,
});

async function _createTransaction(data: typeof transactions.$inferInsert): Promise<{id: string}> {
	return database.transaction(async tx => {
		const createTransaction_ = tx.insert(transactions).values(data).returning({id: transactions.id});

		const [transaction] = await Promise.all([
			createTransaction_,
			updateBalance({tx, category: data.category, amount: data.isExpense ? -data.amount : data.amount}),
		]);

		return transaction[0]!;
	});
}

export const createTransaction = observable({
	spanId: 'createTransaction',
	command: _createTransaction,
});

async function _getTransactionById({id}: {id: string}) {
	return database.query.transactions
		.findFirst({
			where: eq(transactions.id, id),
		}) as Promise<TransactionDto>;
}

export const getTransactionById = observable({
	spanId: 'getTransactionById',
	command: _getTransactionById,
});

async function _deleteTransactionById({id}: {id: string}) {
	return database.transaction(async tx => {
		const data = await tx.query.transactions.findFirst({
			where: eq(transactions.id, id),
		});

		await Promise.all([
			updateBalance({tx, category: data!.category, amount: data!.isExpense ? data!.amount : -data!.amount}),
			tx
				.delete(transactions)
				.where(eq(transactions.id, id)),
		]);
	});
}

export const deleteTransactionById = observable({
	spanId: 'deleteTransactionById',
	command: _deleteTransactionById,
});

async function updateBalance({tx, category, amount}: {
	tx: Transaction;
	category: string;
	amount: number;
}) {
	const yyyymm = getCurrentYYYYMM();

	const latest = await tx.query.balances.findFirst({
		orderBy: desc(balances.yyyymm),
		where: eq(balances.category, category),
	});

	if (latest === undefined) {
		await tx.insert(balances).values({
			yyyymm,
			category,
			remain: amount,
		});
		return;
	}

	if (latest.yyyymm !== yyyymm) {
		await tx.insert(balances).values({
			yyyymm,
			category,
			remain: latest.remain + amount,
		});
		return;
	}

	await tx.update(balances)
		.set({
			remain: sql`${balances.remain} + ${amount}`,
		})
		.where(
			and(
				eq(balances.yyyymm, yyyymm),
				eq(balances.category, category)
			)
		);
}

async function _updateTransactionById({id, data}: {id: string; data: typeof transactions.$inferInsert}) {
	return database.transaction(async tx => {
		const updateTransaction = tx
			.update(transactions)
			.set(data)
			.where(eq(transactions.id, id));

		const currentTransaction = await tx.query.transactions.findFirst({
				where: eq(transactions.id, id),
			});

		if (currentTransaction === undefined) {
			throw new Error('Transaction not found');
		}

		if (currentTransaction.category === data.category) {
			const changedAmount = data.amount - currentTransaction.amount;

			await Promise.all([
				updateTransaction, 
				updateBalance({
					tx, 
					category: data.category, 
					amount: data.isExpense ? changedAmount : -changedAmount
				})
			]);
		} else {
			await Promise.all([
				updateTransaction,
				updateBalance({
					tx, 
					category: currentTransaction.category, 
					amount: data.isExpense ? currentTransaction.amount : -currentTransaction.amount}),
				updateBalance({
					tx, 
					category: data.category, 
					amount: data.isExpense ? -data.amount : data.amount
				}),
			]);
		}
	});
}

export const updateTransactionById = observable({
	spanId: 'updateTransactionById',
	command: _updateTransactionById,
});

async function _getBudgets() {
	return database.transaction(async tx => {
		const transaction = await tx.select({
			isExpense: transactions.isExpense,
			category: transactions.category,
			value: sum(transactions.amount).mapWith(Number),
		})
			.from(transactions)
			.groupBy((t) => [t.category, t.isExpense])
			.where(gte(transactions.date, firstDayOfMonth()));

		const expense = transaction.filter(t => t.isExpense);

		const budget = transaction.filter(t => !t.isExpense);

		const balance = await tx.query.balances.findMany({
			where: eq(balances.yyyymm, getCurrentYYYYMM()),
		});

		return budget.map(b => ({
			category: b.category,
			current: expense.find(c => c.category === b.category)?.value ?? 0,
			budget: b.value,
			remain: balance!.find(r => r.category === b.category)?.remain ?? 0,
		}));
	});
}

export const getBudgets = observable({
	spanId: 'getBudgets',
	command: _getBudgets,
});

async function _getPaymentMethodInfo() {
	return database.select({
		amount: sum(transactions.amount),
		user: transactions.user,
		paymentMethod: transactions.paymentMethod,
	})
		.from(transactions)
		.where(
			gte(transactions.date, firstDayOfMonth()),
		)
		.groupBy(transactions.user, transactions.paymentMethod)
		.orderBy(transactions.user);
}

export const getPaymentMethodInfo = observable({
	spanId: 'getPaymentMethodInfo',
	command: _getPaymentMethodInfo,
});

function getCurrentYYYYMM() {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0');

	return `${year}${month}`;
}

function firstDayOfMonth() {
	const now = new Date();
	const firstDate = new Date(now.getFullYear(), now.getMonth(), 1);
	return firstDate.toISOString().split('T')[0]!;
}
