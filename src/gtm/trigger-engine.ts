import { evaluatePredicate } from "./predicates";
import type { TriggerConfig } from "./types";

export interface TriggerEvaluationContext {
	eventName: string;
	dataLayer: Record<string, any>;
	resolveVariable: (name: string) => any;
}

export class TriggerEngine {
	private triggers = new Map<string, TriggerConfig>();
	private firedTriggerHistory = new Set<string>();

	public registerTrigger(trigger: TriggerConfig): void {
		this.triggers.set(trigger.id, trigger);
	}

	public evaluateTrigger(
		triggerId: string,
		context: TriggerEvaluationContext,
	): boolean {
		const trigger = this.triggers.get(triggerId);
		if (!trigger) return false;

		// 1. Check event name matching
		if (trigger.eventName && trigger.eventName !== context.eventName) {
			return false;
		}

		// 2. Evaluate all predicates (AND logic)
		for (const predicate of trigger.predicates) {
			const actualValue = context.resolveVariable(predicate.variableName);
			const matches = evaluatePredicate(predicate, actualValue);
			if (!matches) {
				return false;
			}
		}

		this.firedTriggerHistory.add(triggerId);
		return true;
	}

	public isTriggerQualified(
		triggerId: string,
		context: TriggerEvaluationContext,
	): boolean {
		return this.evaluateTrigger(triggerId, context);
	}

	public hasTriggerFired(triggerId: string): boolean {
		return this.firedTriggerHistory.has(triggerId);
	}

	public resetPageHistory(): void {
		this.firedTriggerHistory.clear();
	}

	public evaluateTriggerGroup(
		triggerIds: string[],
		context: TriggerEvaluationContext,
	): boolean {
		// Evaluate if the current event qualifies any trigger in the group
		for (const id of triggerIds) {
			this.evaluateTrigger(id, context);
		}
		// Group only qualifies when all member triggers have fired at least once
		return triggerIds.every((id) => this.firedTriggerHistory.has(id));
	}
}
