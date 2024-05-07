import type {APIContext} from 'astro';
import {getBudgets} from 'lib/server';

export async function GET({request}: APIContext) {
	const parentSpanId = request.headers.get('X-B3-ParentSpanId');

	if (!parentSpanId) {
		throw new Error('Missing X-B3-ParentSpanId header');
	}

	const traceId = request.headers.get('X-B3-TraceId');

	if (!traceId) {
		throw new Error('Missing X-B3-TraceId header');
	}

	const budgets = await getBudgets({
		traceId,
		parentSpanId,
		arguments_: {},
	});

	return new Response(
		JSON.stringify(budgets),
		{
			status: 200,
			headers: {
				'content-type': 'application/json',
			},
		},
	);
}
