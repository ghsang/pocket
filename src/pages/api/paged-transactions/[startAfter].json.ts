import type {APIContext} from 'astro';
import {getPagedTransactions} from 'lib/server';

export async function GET({params}: APIContext) {
	const startAfter = params.startAfter ? new Date(params.startAfter) : undefined;

	return new Response(
		JSON.stringify(await getPagedTransactions({startAfter})),
		{
			status: 200,
			headers: {
				'content-type': 'application/json',
			},
		},
	);
}
