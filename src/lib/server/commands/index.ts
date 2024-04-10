import {desc, eq, lt} from 'drizzle-orm';
import {transactions, database} from '../drizzle';

export async function getPagedTransactions({startAfter, limit = 50}: {
	startAfter: Date | undefined;
	limit?: number;
}) {
	const data = await database
		.select()
		.from(transactions)
		.where(startAfter ? lt(transactions.createdAt, startAfter) : undefined)
		.limit(limit)
		.orderBy(desc(transactions.createdAt));

	return {
		data,
		startAfter: data ? data.map(t => t.createdAt).pop() : undefined,
		hasNext: data.length === limit,
	};
}

export async function createTransaction(data: typeof transactions.$inferInsert) {
	return database.insert(transactions).values(data).returning();
}

export async function getTransactionById(id: string) {
	return database.query.transactions
		.findFirst({
			where: eq(transactions.id, id),
		});
}

export async function deleteTransactionById(id: string) {
	return database
		.delete(transactions)
		.where(eq(transactions.id, id));
}

export async function updateTransactionById(id: string, data: typeof transactions.$inferInsert) {
	return database
		.update(transactions)
		.set(data)
		.where(eq(transactions.id, id));
}
