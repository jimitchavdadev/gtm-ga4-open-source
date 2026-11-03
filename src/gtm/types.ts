export type OperatorType =
	| "EQUALS"
	| "DOES_NOT_EQUAL"
	| "CONTAINS"
	| "DOES_NOT_CONTAIN"
	| "STARTS_WITH"
	| "DOES_NOT_START_WITH"
	| "ENDS_WITH"
	| "DOES_NOT_END_WITH"
	| "MATCHES_REGEX"
	| "MATCHES_REGEX_IGNORE_CASE"
	| "MATCHES_CSS"
	| "LESS_THAN"
	| "LESS_THAN_OR_EQUAL"
	| "GREATER_THAN"
	| "GREATER_THAN_OR_EQUAL";

export interface PredicateConfig {
	variableName: string;
	operator: OperatorType;
	targetValue: string;
}

export interface TriggerConfig {
	id: string;
	name: string;
	eventName?: string;
	predicates: PredicateConfig[];
	isBlocking?: boolean;
}

export interface TagConfig {
	id: string;
	name: string;
	type: string;
	priority?: number;
	firingTriggers: string[];
	blockingTriggers?: string[];
	parameters: Record<string, any>;
	setupTags?: { tagId: string; stopOnFailure: boolean }[];
	teardownTags?: { tagId: string }[];
	firingOption?: "ONCE_PER_EVENT" | "ONCE_PER_PAGE" | "UNLIMITED";
}

export type VariableResolver = (
	context: Record<string, any>,
	dataLayer: Record<string, any>,
) => any;

export interface VariableConfig {
	name: string;
	type: string;
	parameters: Record<string, any>;
	dependencies?: string[];
}
