import type {APIContext} from 'astro';
import {getPagedTransactions} from 'lib/server';

export async function GET({params, request}: APIContext) {
	const startAfter = params.startAfter ? new Date(params.startAfter) : undefined;

	const parentSpanId = request.headers.get('X-B3-ParentSpanId');

	if (!parentSpanId) {
		throw new Error('Missing X-B3-ParentSpanId header');
	}

	const traceId = request.headers.get('X-B3-TraceId');

	if (!traceId) {
		throw new Error('Missing X-B3-TraceId header');
	}

	return new Response(
		JSON.stringify(await getPagedTransactions({
			traceId,
			parentSpanId,
			arguments_: {startAfter},
		})),
		{
			status: 200,
			headers: {
				'content-type': 'application/json',
			},
		},
	);
}
