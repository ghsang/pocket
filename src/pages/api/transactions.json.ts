import type {APIContext} from 'astro';
import {createTransaction, type transactions} from 'lib/server';

export async function POST({request}: APIContext) {
	const body = await request.json() as typeof transactions.$inferInsert;

	const parentSpanId = request.headers.get('X-B3-ParentSpanId');

	if (!parentSpanId) {
		throw new Error('Missing X-B3-ParentSpanId header');
	}

	const traceId = request.headers.get('X-B3-TraceId');

	if (!traceId) {
		throw new Error('Missing X-B3-TraceId header');
	}

	const {id} = await createTransaction({
		traceId,
		parentSpanId,
		arguments_: body,
	});

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
