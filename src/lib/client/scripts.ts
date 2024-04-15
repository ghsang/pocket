import {type TransactionDto} from 'lib/client';

export function createTransactionElement(d: TransactionDto) {
	const a = document.createElement('a');

	a.setAttribute('href', `/transactions/${d.id}`);

	a.classList.add('px_2');

	a.innerHTML = `
					<span class="text-align_start">${toDateString(d.date)}</span>
					<span>${d.description}</span>
					<span class="text-align_end">${d.amount.toLocaleString()}</span>
				`;

	a.style.animation = 'tempBgColorChange 0.8s ease-in-out';

	return a;
}

export function toDateString(dateString: string) {
	const date = new Date(dateString);
	const month = date.getMonth() + 1;
	const day = date.getDate();
	return `${month}/${day}`;
}

export function toDate(dateString: string) {
	if (dateString.length !== 4) {
		return new Date(dateString);
	}

	const [month, day] = dateString.split('/');
	const year = new Date().getFullYear();

	return new Date(`${year}-${month!.padStart(2, '0')}-${day!.padStart(2, '0')}`);
}
