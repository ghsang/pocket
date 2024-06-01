import {
	type TransactionDao,
	type TransactionDto,
	createTransactionElement,
	getDateFromAnchorElement,
	$,
} from "lib/client";
import { nanoid } from "nanoid";

function handleFormOpen(
	formOpenDiv: HTMLDivElement, 
	dialog: HTMLDialogElement
) {
	return () => {
		setTimeout(() => {
			formOpenDiv.style.display = "none";
			dialog.showModal();
		}, 100);
	};
}

function closeDialog(
	formOpenDiv: HTMLDivElement, 
	dialog: HTMLDialogElement
) {
	formOpenDiv.style.display = "";
	dialog.close();
}

function getFormData(form: HTMLFormElement) {
	const formData = new FormData(form);
	const temporary = Object.fromEntries(formData.entries());

	return {
		...temporary,
		amount: Number(temporary.amount),
	};
}

function handleSubmit(
	table: HTMLDivElement,
	template: HTMLTemplateElement,
	form: HTMLFormElement,
	formOpenDiv: HTMLDivElement,
	dialog: HTMLDialogElement,
	isExpense: boolean,
	user?: string
) {
	return async (event: Event) => {
			event.preventDefault();

			const data = {
				...getFormData(form),
				user,
				isExpense,
			} as TransactionDao;

			const allRows = table.querySelectorAll("a");

			const { id } = await fetch("/api/transactions.json", {
				method: "POST",
				headers: { 
					"Content-Type": "application/json",
					"X-B3-TraceId": nanoid(),
					"X-B3-ParentSpanId": "/pages/index/scroll",
				},
				body: JSON.stringify(data),
			}).then((response) => response.json());

			const a = createTransactionElement(template, {
				id,
				...data,
				date: data.date.toString(),
			} as TransactionDto);

			let inserted = false;

			for (const r of allRows) {
				const date = getDateFromAnchorElement(r);

				if (new Date(data.date) >= date) {
					r.before(a);

					inserted = true;

					break;
				}
			}

			if (!inserted) table.append(a);

			form.reset();

			closeDialog(formOpenDiv, dialog);

			a.scrollIntoView({ block: "center", behavior: "smooth"});

			setTimeout(() => { a.style.animation = "" }, 200);
	}
}

export default class TransactionHandler extends HTMLElement {
	constructor() {
		super();

		const formOpenDiv = $<HTMLDivElement>(this, "div.form-open");

		const formOpenButton = $<HTMLButtonElement>(this, "button.form-open");

		const dialog = $<HTMLDialogElement>(this, "dialog");

		const expenseForm = $<HTMLFormElement>(this, "form.expense");

		const budgetForm = $<HTMLFormElement>(this, "form.budget");

		const template = $<HTMLTemplateElement>(this, "template");

		const table = $<HTMLDivElement>(this, ".table");

		formOpenButton.addEventListener("click", handleFormOpen(formOpenDiv, dialog));

		expenseForm.addEventListener("submit", handleSubmit(
			table,
			template,
			expenseForm,
			formOpenDiv,
			dialog,
			true,
			this.dataset!.user!,
		));

		budgetForm.addEventListener("submit", handleSubmit(
			table,
			template,
			budgetForm,
			formOpenDiv,
			dialog,
			false,
		));

		dialog.addEventListener("click", (event) => {
			if (event.target === dialog) {
				closeDialog(formOpenDiv, dialog);
			}
		});
	}
}

