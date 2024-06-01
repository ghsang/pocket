import * as v from 'valibot';
import {
	categories,
} from './values';

const base = {
	date: v.pipe(v.string(), v.transform(Date)),
	user: v.nullable(v.string()),
	category: v.picklist(categories),
	description: v.nullable(v.string()),
	amount: v.number(),
	paymentMethod: v.nullable(v.string()),
	isExpense: v.boolean(),
}

export const TransactionDaoSchema = v.object(base);

export const TransactionDtoSchema = v.object({
	id: v.pipe(v.string(), v.uuid()),
	createdAt: v.date(),
	...base
});

export type TransactionDao = v.InferInput<typeof TransactionDaoSchema>;

export type TransactionDto = v.InferInput<typeof TransactionDtoSchema>;
