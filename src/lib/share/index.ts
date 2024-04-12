export function isEqual<T extends Record<string, unknown>>(object1: T, object2: T): boolean {
	const keys1 = Object.keys(object1) as Array<keyof T>;
	const keys2 = Object.keys(object2) as Array<keyof T>;

	if (keys1.length !== keys2.length) {
		return false;
	}

	for (const key of keys1) {
		const value1 = object1[key];
		const value2 = object2[key];
		const areObjects = isObject(value1) && isObject(value2);

		if (
			(areObjects && !isEqual(value1 as Record<string, unknown>, value2 as Record<string, unknown>))
      || (!areObjects && value1 !== value2)
		) {
			return false;
		}
	}

	return true;
}

function isObject(object: unknown): object is Record<string, unknown> {
	return typeof object === 'object' && object !== null;
}
