import {
	desc, eq, gte, lt, sql, sum, and
} from 'drizzle-orm';
import pino from 'pino';
import {
	transactions, database, budgets, type Transaction,
} from '../drizzle';

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
}) {
	const data = await database
		.select()
		.from(transactions)
		.where(
			startAfter 
				? lt(transactions.createdAt, startAfter) 
				: undefined
		)
		.orderBy(desc(transactions.date), desc(transactions.createdAt))
		.limit(limit);

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
}) {
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
		data,
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
			updateBudget({tx, category: data.category, amount: data.amount}),
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
		});
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
			updateBudget({tx, category: data!.category, amount: -data!.amount}),
			tx
				.delete(transactions)
				.where(eq(transactions.id, id)),
		]);
	});
}

async function updateBudget({tx, category, amount}: {
	tx: Transaction;
	category: string;
	amount: number;
}) {
	await tx.update(budgets)
		.set({
			remain: sql`${budgets.remain} + ${amount}`,
		})
		.where(eq(budgets.category, category));
}

export const deleteTransactionById = observable({
	spanId: 'deleteTransactionById',
	command: _deleteTransactionById,
});

async function _updateTransactionById({id, data}: {id: string; data: typeof transactions.$inferInsert}) {
	return database.transaction(async tx => {
		const updateTransaction = tx
			.update(transactions)
			.set(data)
			.where(eq(transactions.id, id));

		const [currentBudget, currentTransaction] = await Promise.all([
			tx.query.budgets.findFirst(),
			tx.query.transactions.findFirst({
				where: eq(transactions.id, id),
			}),
		]);

		if (currentBudget === undefined) {
			throw new Error('Budgets not found');
		}

		if (currentTransaction === undefined) {
			throw new Error('Transaction not found');
		}

		if (currentTransaction.category === data.category) {
			const changedAmount = data.amount - currentTransaction.amount;

			await Promise.all([updateTransaction, updateBudget({tx, category: data.category, amount: changedAmount})]);
		} else {
			await Promise.all([
				updateTransaction,
				updateBudget({tx, category: currentTransaction.category, amount: -currentTransaction.amount}),
				updateBudget({tx, category: data.category, amount: data.amount}),
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
		const budgets = await tx.query.budgets.findMany();

		const currentByCategory = await tx.select({
			category: transactions.category,
			value: sum(transactions.amount).mapWith(Number),
		})
			.from(transactions)
			.groupBy(transactions.category)
			.where(gte(transactions.date, firstDayOfMonth()));

		return budgets.map(b => ({
			category: b.category,
			current: currentByCategory.find(c => c.category === b.category)?.value ?? 0,
			budget: b.budget,
			remain: b.remain,
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

function firstDayOfMonth() {
	const now = new Date();
	const firstDate = new Date(now.getFullYear(), now.getMonth(), 1);
	return firstDate.toISOString().split('T')[0]!;
}
