import z from 'zod';
import {Category, PaymentMethod} from './values';

export const TransactionDaoSchema = z.object({
	date: z.date(),
	category: z.nativeEnum(Category),
	description: z.string({required_error: '내역을 입력하세요.'}).min(1, '내역을 입력하세요.'),
	amount: z.coerce.number({required_error: '금액을 입력하세요.'}).min(1, '금액을 입력하세요.'),
	paymentMethod: z.nativeEnum(PaymentMethod),
});

export const TransactionDtoSchema = z.object({
	id: z.string().uuid(),
	date: z.date(),
	category: z.nativeEnum(Category),
	description: z.string({required_error: '내역을 입력하세요.'}).min(1, '내역을 입력하세요.'),
	amount: z.coerce.number({required_error: '금액을 입력하세요.'}).min(1, '금액을 입력하세요.'),
	paymentMethod: z.nativeEnum(PaymentMethod),
});

export type TransactionDao = z.infer<typeof TransactionDaoSchema>;

export type TransactionDto = z.infer<typeof TransactionDtoSchema>;
