export function convertDate(dateString: string) {
	const date = new Date(dateString);
	const month = date.getMonth() + 1;
	const day = date.getDate();
	return `${month}/${day}`;
}
