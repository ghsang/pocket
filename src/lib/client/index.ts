export * from './domain';
export * from './scripts';

export function $<T extends Element>(base: Element, selector: string): T {
	const el = base.querySelector<T>(selector);

	if (!el) {
		throw new Error(`Element not found: ${selector}`);
	}

	return el;
}


export function $$<T extends Element>(base: Element, selector: string): NodeListOf<T> {
	const els = base.querySelectorAll<T>(selector);

	if (els.length === 0) {
		throw new Error(`Element not found: ${selector}`);
	}

	return els;
}
