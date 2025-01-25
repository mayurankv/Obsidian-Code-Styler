import { LANGUAGES } from "src/Internal/constants/decoration";
import CodeStylerPlugin from "src/main";

export function loadLanguageIcons(): Record<string, string> {
	return Object.keys(LANGUAGES).reduce(
		(result: { [key: string]: string }, key: string) => {
			if (LANGUAGES[key]?.icon)
				result[key] = URL.createObjectURL(
					new Blob(
						[`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32">${LANGUAGES[key].icon}</svg>`],
						{ type: "image/svg+xml" }
					)
				);

			return result;
		},
		{},
	);
}

export function unloadLanguageIcons(
	languageIcons: Record<string,string>,
) {
	Object.values(languageIcons).forEach((url: string) => URL.revokeObjectURL(url))
}
