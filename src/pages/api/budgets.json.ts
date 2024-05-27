import type {APIContext} from 'astro';
import {createTransaction} from 'lib/server';

export async function POST({request}: APIContext) {
	const parentSpanId = request.headers.get('X-B3-ParentSpanId');

	if (!parentSpanId) {
		throw new Error('Missing X-B3-ParentSpanId header');
	}

	const traceId = request.headers.get('X-B3-TraceId');

	if (!traceId) {
		throw new Error('Missing X-B3-TraceId header');
	}

	const body = await request.json();

	await createTransaction({
		traceId,
		parentSpanId,
		arguments_: {
			isExpense: false, ...body
		},
	});

	return new Response(
		JSON.stringify({ok: true}),
		{
			status: 201,
			headers: {
				'content-type': 'application/json',
			},
		},
	);
}
