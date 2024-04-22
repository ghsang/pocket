import type {APIContext} from 'astro';
import {
	getTransactionById, type transactions, deleteTransactionById, updateTransactionById,
} from 'lib/server';

export async function GET({params, request}: APIContext) {
	const id = params.id!;

	const parentSpanId = request.headers.get('X-B3-ParentSpanId');

	if (!parentSpanId) {
		throw new Error('Missing X-B3-ParentSpanId header');
	}

	const traceId = request.headers.get('X-B3-TraceId');

	if (!traceId) {
		throw new Error('Missing X-B3-TraceId header');
	}

	const transaction = await getTransactionById({traceId, parentSpanId, arguments_: {id}});

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

export async function DELETE({params, request}: APIContext) {
	const id = params.id!;

	const parentSpanId = request.headers.get('X-B3-ParentSpanId');

	if (!parentSpanId) {
		throw new Error('Missing X-B3-ParentSpanId header');
	}

	const traceId = request.headers.get('X-B3-TraceId');

	if (!traceId) {
		throw new Error('Missing X-B3-TraceId header');
	}

	await deleteTransactionById({traceId, parentSpanId, arguments_: {id}});

	return new Response(
		undefined,
		{
			status: 204,
		},
	);
}

export async function PATCH({params, request}: APIContext) {
	const parentSpanId = request.headers.get('X-B3-ParentSpanId');

	if (!parentSpanId) {
		throw new Error('Missing X-B3-ParentSpanId header');
	}

	const traceId = request.headers.get('X-B3-TraceId');

	if (!traceId) {
		throw new Error('Missing X-B3-TraceId header');
	}

	const id = params.id!;

	const body = await request.json() as typeof transactions.$inferInsert;

	await updateTransactionById({traceId, parentSpanId, arguments_: {id, data: body}});

	return new Response(
		undefined,
		{
			status: 204,
		},
	);
}
