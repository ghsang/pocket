import {
	pgTable, uuid, text, date, integer, pgEnum, timestamp, index,
} from 'drizzle-orm/pg-core';

export const category = pgEnum('category', ['생활비', '경조사비', '문화/여행비', '저축', '비자금']);

export const paymentMethod = pgEnum('payment_method', [
	'Marlang_Kookmin',
	'Marlang_Shinhan_Travel',
	'Marlang_LG',
	'Bokchi_Woori_Living',
	'Bokchi_Woori_Spare',
	'BokChi_Shinhan',
	'BokChi_Shinhan_Travel',
	'Cash',
]);

export const transactions = pgTable('transactions', {
	id: uuid('id').primaryKey().defaultRandom(),
	date: date('date'),
	category: category('category'),
	description: text('description'),
	amount: integer('amount'),
	paymentMethod: paymentMethod('payment_method'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
}, table => ({
	categoryIdx: index('category_idx').on(table.category),
	paymentMethodIdx: index('payment_method_idx').on(table.paymentMethod),
}));
