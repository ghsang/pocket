import type {APIContext} from 'astro';
import {createTransaction, type transactions} from 'lib/server';

export async function POST({request}: APIContext) {
	const body = await request.json() as typeof transactions.$inferInsert;

	const id = await createTransaction(body);

	return new Response(
		JSON.stringify({id}),
		{
			status: 201,
			headers: {
				'content-type': 'application/json',
			},
		},
	);
}
