import {
	pgTable, uuid, text, date, integer, pgEnum, timestamp, index,
	varchar,
	primaryKey,
	boolean,
} from 'drizzle-orm/pg-core';
import {categories} from 'lib/client';

export const category = pgEnum('category', categories as [string, ...string[]]);

export const type = pgEnum('type', ['budget', 'expense']);

export const transactions = pgTable('transactions', {
	id: uuid('id').primaryKey().defaultRandom(),
	isExpense: boolean('is_expense').notNull(),
	category: category('category').notNull(),
	date: date('date').notNull(),
	amount: integer('amount').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	user: text('user'),
	description: text('description'),
	paymentMethod: text('payment_method'),
}, table => ({
	isExpenseIdx: index('is_expense_idx').on(table.isExpense),
	dateIdx: index('date_idx').on(table.date),
	categoryIdx: index('category_idx').on(table.category),
	paymentMethodIdx: index('payment_method_idx').on(table.paymentMethod),
}));

export const balances = pgTable('balances', {
	yyyymm: varchar('yyyymm', { length: 6 }).notNull(),
	category: category('category').notNull(),
	remain: integer('remain').notNull(),
}, table => ({
	pk: primaryKey({ columns: [table.yyyymm, table.category] }),
}));
