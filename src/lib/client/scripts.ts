import {type TransactionDto} from 'lib/client';

export function createTransactionElement(template: HTMLTemplateElement, d: TransactionDto) {
	const temporary = template.content.cloneNode(true) as HTMLAnchorElement;

	const a = temporary.querySelector('a')!;

	a.setAttribute('href', `/transactions/${d.id}`);

	a.querySelector('span:nth-of-type(1)')!.textContent = toDateString(d.date);
	a.querySelector('span:nth-of-type(2)')!.textContent = d.description;
	a.querySelector('span:nth-of-type(3)')!.textContent
		= d.amount.toLocaleString();

	return a;
}

export function toDateString(dateString: string) {
	const date = new Date(dateString);
	const month = date.getMonth() + 1;
	const day = date.getDate();
	return `${month}/${day}`;
}
