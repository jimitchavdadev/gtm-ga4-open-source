import type { PredicateConfig } from "./types";

export function evaluatePredicate(
	predicate: PredicateConfig,
	actualValue: any,
): boolean {
	const strActual =
		actualValue !== undefined && actualValue !== null
			? String(actualValue)
			: "";
	const target = predicate.targetValue;

	switch (predicate.operator) {
		case "EQUALS":
			return strActual === target;
		case "DOES_NOT_EQUAL":
			return strActual !== target;
		case "CONTAINS":
			return strActual.includes(target);
		case "DOES_NOT_CONTAIN":
			return !strActual.includes(target);
		case "STARTS_WITH":
			return strActual.startsWith(target);
		case "DOES_NOT_START_WITH":
			return !strActual.startsWith(target);
		case "ENDS_WITH":
			return strActual.endsWith(target);
		case "DOES_NOT_END_WITH":
			return !strActual.endsWith(target);
		case "MATCHES_REGEX": {
			try {
				return new RegExp(target).test(strActual);
			} catch {
				return false;
			}
		}
		case "MATCHES_REGEX_IGNORE_CASE": {
			try {
				return new RegExp(target, "i").test(strActual);
			} catch {
				return false;
			}
		}
		case "LESS_THAN": {
			const numA = Number(actualValue);
			const numB = Number(target);
			return !Number.isNaN(numA) && !Number.isNaN(numB) && numA < numB;
		}
		case "LESS_THAN_OR_EQUAL": {
			const numA = Number(actualValue);
			const numB = Number(target);
			return !Number.isNaN(numA) && !Number.isNaN(numB) && numA <= numB;
		}
		case "GREATER_THAN": {
			const numA = Number(actualValue);
			const numB = Number(target);
			return !Number.isNaN(numA) && !Number.isNaN(numB) && numA > numB;
		}
		case "GREATER_THAN_OR_EQUAL": {
			const numA = Number(actualValue);
			const numB = Number(target);
			return !Number.isNaN(numA) && !Number.isNaN(numB) && numA >= numB;
		}
		case "MATCHES_CSS":
			return strActual.includes(target);
		default:
			return false;
	}
}

export const PredicateEvaluator = {
	evaluate: evaluatePredicate,
};
