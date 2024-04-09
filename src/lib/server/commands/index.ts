import {desc, lt} from 'drizzle-orm';
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
