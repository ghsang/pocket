import type {APIContext} from 'astro';
import type {Category} from 'lib/client';
import {getBudgets, updateBudgets} from 'lib/server';

export async function GET() {
	const budgets = await getBudgets();

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

export async function PATCH({request}: APIContext) {
	const body = await request.json() as {category: Category; amountChange: number};

	await updateBudgets(body);

	return new Response(
		undefined,
		{
			status: 204,
		},
	);
}
