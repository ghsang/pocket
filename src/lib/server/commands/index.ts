import {
	desc, eq, gte, lt, sum,
} from 'drizzle-orm';
import type {Category} from 'lib/client';
import pino from 'pino';
import {transactions, database, budgets} from '../drizzle';

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
		.where(startAfter ? lt(transactions.createdAt, startAfter) : undefined)
		.orderBy(desc(transactions.date), desc(transactions.createdAt))
		.limit(limit);

	return {
		data,
		startAfter: data ? data.map(t => t.createdAt).pop() : undefined,
		hasNext: data.length === limit,
	};
}

export const getPagedTransactions = observable({
	spanId: 'getPagedTransactions',
	command: _getPagedTransactions,
});

async function _createTransaction(data: typeof transactions.$inferInsert): Promise<{id: string}> {
	return database.transaction(async tx => {
		const current = await tx.query.budgets.findFirst();

		const createTransaction_ = tx.insert(transactions).values(data).returning({id: transactions.id});

		if (current === undefined) {
			const createBudget = tx.insert(budgets).values({
				value: [
					{
						category: data.category,
						current: data.amount,
						budget: 500_000,
						remain: 500_000 - data.amount,
					},
				],
			});

			const [,transaction] = await Promise.all([
				createBudget,
				createTransaction_,
			]);

			return transaction[0]!;
		}

		const isCategoryExist = current.value.some(b => b.category === data.category);

		const updateBudget = isCategoryExist
			? tx.update(budgets)
				.set({
					value: current.value.map(b => (
						b.category === data.category
							? ({
								...b,
								current: b.current + data.amount,
								remain: b.remain - data.amount,
							})
							: b)),
				})
			: tx.update(budgets)
				.set({
					value: [
						{
							category: data.category,
							current: data.amount,
							budget: 500_000,
							remain: 500_000 - data.amount,
						},
						...current.value,
					],
				});

		const [,transaction] = await Promise.all([
			updateBudget,
			createTransaction_,
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
		const current = await tx.query.budgets.findFirst();

		const data = await tx.query.transactions.findFirst({
			where: eq(transactions.id, id),
		});

		await Promise.all([
			tx.update(budgets)
				.set({
					value: current!.value.map(b => (
						b.category === data!.category
							? ({
								...b,
								current: b.current - data!.amount,
								remain: b.remain + data!.amount,
							})
							: b)),
				}),
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

		const changedAmount = data.amount - currentTransaction!.amount;

		const updateBudget = tx
			.update(budgets)
			.set({
				value:
					currentBudget!.value.map(b => (
						b.category === data.category
							? ({
								...b,
								current: b.current + changedAmount,
								remain: b.remain - changedAmount,
							})
							: b)),
			});

		await Promise.all([updateTransaction, updateBudget]);
	});
}

export const updateTransactionById = observable({
	spanId: 'updateTransactionById',
	command: _updateTransactionById,
});

async function _getBudgets() {
	return database.query.budgets.findFirst();
}

export const getBudgets = observable({
	spanId: 'getBudgets',
	command: _getBudgets,
});

async function _updateBudgets({category, amountChange}: {
	category: Category;
	amountChange: number;
}) {
	await database.transaction(async tx => {
		const current = await tx.query.budgets.findFirst();

		if (current === undefined) {
			return tx.insert(budgets).values({
				value: [
					{
						category,
						current: amountChange,
						budget: 500_000,
						remain: 500_000 - amountChange,
					},
				],
			});
		}

		return tx
			.update(budgets)
			.set({
				value: current.value.map(b => (
					b.category === category.toString()
						? ({
							...b,
							current: b.current + amountChange,
							remain: b.remain - amountChange,
						})
						: b)),
			});
	});
}

export const updateBudgets = observable({
	spanId: 'updateBudgets',
	command: _updateBudgets,
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
