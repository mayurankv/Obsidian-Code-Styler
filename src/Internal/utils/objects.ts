export function flattenObject(
	object: Record<string, any>,
	prefix: string = "",
	result: Record<string, any> = {},
): Record<string, any> {
	for (const key in object) {
		if (!object.hasOwnProperty(key))
			continue

		const newKey = prefix + "-" + key;

		if ((typeof object[key] === "object") && (object[key] !== null) && (!Array.isArray(object[key])))
			flattenObject(
				object[key],
				newKey,
				result,
			);
		else {
			if (result.hasOwnProperty(newKey))
				throw new Error(`Key conflict: '${newKey}' already exists.`);

			result[newKey] = object[key];
		}
	}
	return result;
}
