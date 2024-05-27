import {type TransactionDto} from 'lib/client';

export function createTransactionElement(template: HTMLTemplateElement, d: TransactionDto) {
	const temporary = template.content.cloneNode(true) as HTMLAnchorElement;

	const a = temporary.querySelector('a')!;

	a.setAttribute('href', `/transactions/${d.id}`);

	a.querySelector('span:nth-of-type(1)')!.textContent = toDateString(d.date);
	a.querySelector('span:nth-of-type(2)')!.textContent = (d.isExpense ? d.description : d.category) as string;
	a.querySelector('span:nth-of-type(3)')!.textContent
		= d.amount.toLocaleString();
	
	a.classList.add('animate-new');

	if (!d.isExpense) {
		a.classList.add('bg-lime-100');
		a.classList.remove('odd:bg-gray-100');
	}

	return a;
}

export function toDateString(dateString: string) {
	const date = new Date(dateString);
	const month = date.getMonth() + 1;
	const day = date.getDate();
	return `${month}/${day}`;
}

export function getDateFromAnchorElement(a: HTMLAnchorElement) {
	const span = a.querySelector("span") as HTMLSpanElement;
	return new Date(span.dataset.date as string);
}
