import * as v from 'valibot';
import {
	categories, paymentMethods,
} from './values';

export const TransactionDaoSchema = v.object({
	date: v.date(),
	category: v.picklist(categories),
	description: v.string([v.minLength(1)]),
	amount: v.number(),
	paymentMethod: v.picklist(paymentMethods),
});

export const TransactionDtoSchema = v.object({
	id: v.string([v.uuid()]),
	date: v.date(),
	category: v.picklist(categories),
	description: v.string([v.minLength(1)]),
	amount: v.number(),
	paymentMethod: v.picklist(paymentMethods),
});

export type TransactionDao = v.Input<typeof TransactionDaoSchema>;

export type TransactionDto = {
	id: string;
	date: string;
	category: string;
	description: string;
	amount: number;
	paymentMethod: string;
};
