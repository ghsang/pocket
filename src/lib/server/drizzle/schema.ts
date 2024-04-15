import {
	pgTable, uuid, text, date, integer, pgEnum, timestamp, index, char,
	json,
} from 'drizzle-orm/pg-core';
import {categories} from 'lib/client';

export const category = pgEnum('category', categories as [string, ...string[]]);

export const transactions = pgTable('transactions', {
	id: uuid('id').primaryKey().defaultRandom(),
	user: text('user'),
	date: date('date').notNull(),
	category: category('category').notNull(),
	description: text('description').notNull(),
	amount: integer('amount').notNull(),
	paymentMethod: text('payment_method').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
}, table => ({
	categoryIdx: index('category_idx').on(table.category),
	paymentMethodIdx: index('payment_method_idx').on(table.paymentMethod),
}));

export const budgets = pgTable('budgets', {
	id: char('id', {length: 6}).primaryKey().default('unique'),
	value: json('value').notNull().$type<
	Array<{current: number; budget: number; remain: number; category: string}>
	>(),
});
