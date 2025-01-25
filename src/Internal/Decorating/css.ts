import { ColorTranslator } from "colortranslator";
import { Colour, CSS, HEX } from "../types/decoration";

export function getColour(
	themeColour: Colour,
): Colour {
	return isCss(themeColour) ? getCssVariable(themeColour) : themeColour;
}

export function isCss(
	possibleCss: string,
): possibleCss is CSS {
	return possibleCss.startsWith("--") && typeof possibleCss === "string";
}

function getCssVariable(
	cssVariable: CSS,
): HEX {
	const variableValue = window.getComputedStyle(document.body).getPropertyValue(cssVariable).trim();

	if (typeof variableValue === "string" && variableValue.startsWith("#"))
		return `#${variableValue.trim().substring(1)}`;
	else if (variableValue.startsWith("rgb"))
		return `#${ColorTranslator.toHEXA(variableValue.replace(/calc\((.*?)\)/g,(match,capture)=>calc(capture))).substring(1)}`;
	else if (variableValue.startsWith("hsl"))
		return `#${ColorTranslator.toHEXA(variableValue.replace(/calc\((.*?)\)/g,(match,capture)=>calc(capture))).substring(1)}`;
	else
		console.warn(`Warning: Couldn't determine colour format - ${variableValue}`);

	return `#${ColorTranslator.toHEXA(variableValue).substring(1)}`;
}

function calc(
	calcString: string,
): string {
	const splitString = calcString.trim().replace(/(\d*)%/g,"$1").split(" ");
	const operators: {[key: string]: (num1:number, num2:number) => number} = {
		"+": (num1:number, num2:number):number => Math.max(num1+num2,0),
		"-": (num1:number ,num2:number):number => Math.max(num1-num2,0),
	};

	if (splitString.length === 3)
		if (splitString[1] in operators)
			return `${operators[splitString[1]](parseFloat(splitString[0]),parseFloat(splitString[2]))}%`;

	console.warn("Warning: Couldn't parse calc string");

	return calcString;
}
