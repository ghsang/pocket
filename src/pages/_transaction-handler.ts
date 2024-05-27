import {
	type TransactionDao,
	type TransactionDto,
	createTransactionElement,
	getDateFromAnchorElement,
	$,
} from "lib/client";
import { nanoid } from "nanoid";

export default class TransactionHandler extends HTMLElement {
	constructor() {
		super();

		const formOpenDiv = $<HTMLDivElement>(this, "div.form-open");

		const formOpenButton = $<HTMLButtonElement>(this, "button.form-open");

		const dialog = $<HTMLDialogElement>(this, "dialog");

		const expenseForm = $<HTMLFormElement>(this, "form.expense");

		const budgetForm = $<HTMLFormElement>(this, "form.budget");

		const template = $<HTMLTemplateElement>(this, "template");

		function closeDialog() {
			setTimeout(() => {
				dialog.close();
				formOpenDiv.style.display = "flex";
			}, 100);
		}

		formOpenButton.addEventListener("click", () => {
			setTimeout(() => {
				formOpenDiv.style.display = "none";
				dialog.showModal();
			}, 100);
		});

		expenseForm.addEventListener("submit", async (event) => {
			event.preventDefault();

			const formData = new FormData(expenseForm);
			const temporary = Object.fromEntries(formData.entries());

			const data = {
				...temporary,
				user: this.dataset!.user!,
				amount: Number(temporary.amount),
			} as TransactionDao;

			const table = $<HTMLDivElement>(this, ".table");

			const allRows = table.querySelectorAll("a");

			const { id } = await fetch("/api/transactions.json", {
				method: "POST",
				headers: { 
					"Content-Type": "application/json",
					"X-B3-TraceId": nanoid(),
					"X-B3-ParentSpanId": "/pages/index/scroll",
				},
				body: JSON.stringify({
					...data,
					isExpense: true,
				}),
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

			if (!inserted) {
				table.append(a);
			}

			expenseForm.reset();

			closeDialog();

			a.scrollIntoView({
				block: "center",
				behavior: "smooth",
			});

			setTimeout(() => {
				a.style.animation = "";
			}, 200);
		});

		budgetForm.addEventListener("submit", async (event) => {
			event.preventDefault();

			const formData = new FormData(budgetForm);
			const temporary = Object.fromEntries(formData.entries());

			const data = {
				...temporary,
				user: this.dataset!.user!,
				amount: Number(temporary.amount),
			} as TransactionDao;

			const table = $<HTMLDivElement>(this, ".table");

			const allRows = table.querySelectorAll("a");

			const { id } = await fetch("/api/transactions.json", {
				method: "POST",
				headers: { 
					"Content-Type": "application/json",
					"X-B3-TraceId": nanoid(),
					"X-B3-ParentSpanId": "/pages/index/scroll",
				},
				body: JSON.stringify({
					...data,
					isExpense: false,
				}),
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

			if (!inserted) {
				table.append(a);
			}

			budgetForm.reset();

			closeDialog();

			a.scrollIntoView({
				block: "center",
				behavior: "smooth",
			});

			setTimeout(() => {
				a.style.animation = "";
			}, 200);
		});

		dialog.addEventListener("click", (event) => {
			if (event.target === dialog) {
				closeDialog();
			}
		});
	}
}

