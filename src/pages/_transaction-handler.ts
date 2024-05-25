import {
	type TransactionDao,
	type TransactionDto,
	createTransactionElement,
} from "lib/client";
import { nanoid } from "nanoid";

function getDateFromAnchorElement(a: HTMLAnchorElement) {
	const span = a.querySelector("span") as HTMLSpanElement;
	return new Date(span.dataset.date as string);
}

export default class TransactionHandler extends HTMLElement {
	constructor() {
		super();

		const formOpenDiv = this.querySelector("div.form-open") as HTMLDivElement;

		if (formOpenDiv === null) {
			throw new Error("formOpenDiv not found");
		}

		const formOpenButton = this.querySelector(
			"button.form-open",
		) as HTMLButtonElement;

		if (formOpenButton === null) {
			throw new Error("formOpenButton not found");
		}

		const dialog = this.querySelector("dialog") as HTMLDialogElement;

		if (dialog === null) {
			throw new Error("dialog not found");
		}

		const form = this.querySelector("form.add-transaction") as HTMLFormElement;

		if (form === null) {
			throw new Error("form not found");
		}

		const template = this.querySelector("template.new") as HTMLTemplateElement;

		if (template === null) {
			throw new Error("template not found");
		}

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

		form.addEventListener("submit", async (event) => {
			event.preventDefault();

			const formData = new FormData(form);
			const temporary = Object.fromEntries(formData.entries());
		const data = {
			...temporary,
			user: this.dataset!.user!,
			amount: Number(temporary.amount),
			} as TransactionDao;

			const table = this.querySelector(".table") as HTMLDivElement;
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

			if (!inserted) {
				table.append(a);
			}

			form.reset();

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

