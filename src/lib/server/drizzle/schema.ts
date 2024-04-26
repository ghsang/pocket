import {
	pgTable, uuid, text, date, integer, pgEnum, timestamp, index, char,
	customType,
} from 'drizzle-orm/pg-core';
import {categories} from 'lib/client';

export const category = pgEnum('category', categories as [string, ...string[]]);

export const transactions = pgTable('transactions', {
	id: uuid('id').primaryKey().defaultRandom(),
	user: text('user').notNull(),
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

export const json = <TData>(name: string) =>
	customType<{data: TData; driverData: TData}>({
		dataType() {
			return 'json';
		},
		toDriver(value: TData): TData {
			return value;
		},
		fromDriver(value): TData {
			if (typeof value === 'string') {
				try {
					return JSON.parse(value) as TData;
				} catch {}
			}

			return value;
		},
	})(name);

export const budgets = pgTable('budgets', {
	id: char('id', {length: 6}).primaryKey().default('unique'),
	value: json('value').notNull().$type<
	Array<{current: number; budget: number; remain: number; category: string}>
	>(),
});
