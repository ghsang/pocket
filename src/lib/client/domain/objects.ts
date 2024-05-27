import * as v from 'valibot';
import {
	categories,
} from './values';

export const TransactionDaoSchema = v.object({
	date: v.date(),
	user: v.string([v.minLength(1)]),
	category: v.picklist(categories),
	description: v.string([v.minLength(1)]),
	amount: v.number(),
	paymentMethod: v.string([v.minLength(1)]),
});

export const TransactionDtoSchema = v.object({
	id: v.string([v.uuid()]),
	user: v.string([v.minLength(1)]),
	date: v.date(),
	category: v.picklist(categories),
	description: v.string([v.minLength(1)]),
	amount: v.number(),
	paymentMethod: v.string([v.minLength(1)]),
});

export type TransactionDao = v.Input<typeof TransactionDaoSchema>;

export type TransactionDto = {
	isExpense: boolean;
	id: string;
	date: string;
	category: string;
	amount: number;
	user: string | null;
	description: string | null;
	paymentMethod: string | null;
};
