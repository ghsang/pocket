import type {APIContext} from 'astro';
import {
	deleteTransactionById, getTransactionById, type transactions, updateTransactionById,
} from 'lib/server';

export async function GET({params}: APIContext) {
	const id = params.id!;

	const transaction = await getTransactionById(id);

	return new Response(
		JSON.stringify(transaction),
		{
			status: 200,
			headers: {
				'content-type': 'application/json',
			},
		},
	);
}

export async function DELETE({params}: APIContext) {
	const id = params.id!;

	await deleteTransactionById(id);

	return new Response(
		undefined,
		{
			status: 204,
		},
	);
}

export async function PATCH({params, request}: APIContext) {
	const id = params.id!;

	const body = await request.json() as typeof transactions.$inferInsert;

	await updateTransactionById(id, body);

	return new Response(
		undefined,
		{
			status: 204,
		},
	);
}
