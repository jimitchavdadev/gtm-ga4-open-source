import type { ConsentManager, ConsentType } from "./consent-manager";
import type { TriggerEngine, TriggerEvaluationContext } from "./trigger-engine";
import type { TagConfig } from "./types";

export interface TagExecutionRecord {
	tagId: string;
	status: "SUCCESS" | "FAILED" | "BLOCKED" | "SKIPPED_ONCE_PER_PAGE";
	executionTimeMs: number;
}

export type TagExecutor = (
	tag: TagConfig,
	parameters: Record<string, any>,
) => Promise<boolean> | boolean;

export class TagScheduler {
	private tags = new Map<string, TagConfig>();
	private firedOnPage = new Set<string>();
	private executors = new Map<string, TagExecutor>();

	constructor(
		private triggerEngine: TriggerEngine,
		private consentManager?: ConsentManager,
	) {}

	public registerTag(tag: TagConfig, executor: TagExecutor): void {
		this.tags.set(tag.id, tag);
		this.executors.set(tag.type, executor);
	}

	public async processEvent(
		context: TriggerEvaluationContext,
	): Promise<TagExecutionRecord[]> {
		const qualifiedTags: TagConfig[] = [];

		for (const tag of this.tags.values()) {
			// Check if any blocking trigger matches
			if (tag.blockingTriggers) {
				const isBlocked = tag.blockingTriggers.some((tId) =>
					this.triggerEngine.isTriggerQualified(tId, context),
				);
				if (isBlocked) continue;
			}

			// Check if firing triggers match
			const isFired = tag.firingTriggers.some((tId) =>
				this.triggerEngine.isTriggerQualified(tId, context),
			);

			if (isFired) {
				qualifiedTags.push(tag);
			}
		}

		// Sort by priority descending
		qualifiedTags.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

		const records: TagExecutionRecord[] = [];
		for (const tag of qualifiedTags) {
			const record = await this.executeTagWithSequencing(tag, context);
			records.push(record);
		}

		return records;
	}

	public resetPage(): void {
		this.firedOnPage.clear();
		this.triggerEngine.resetPageHistory();
	}

	private async executeTagWithSequencing(
		tag: TagConfig,
		context: TriggerEvaluationContext,
	): Promise<TagExecutionRecord> {
		if (tag.firingOption === "ONCE_PER_PAGE" && this.firedOnPage.has(tag.id)) {
			return {
				tagId: tag.id,
				status: "SKIPPED_ONCE_PER_PAGE",
				executionTimeMs: 0,
			};
		}

		const startTime = Date.now();

		// 1. Execute Setup Tags
		if (tag.setupTags) {
			for (const setup of tag.setupTags) {
				const setupTag = this.tags.get(setup.tagId);
				if (setupTag) {
					const ok = await this.invokeExecutor(setupTag, context);
					if (!ok && setup.stopOnFailure) {
						return {
							tagId: tag.id,
							status: "BLOCKED",
							executionTimeMs: Date.now() - startTime,
						};
					}
				}
			}
		}

		// 2. Execute Primary Tag
		const success = await this.invokeExecutor(tag, context);
		this.firedOnPage.add(tag.id);

		// 3. Execute Teardown Tags
		if (tag.teardownTags && success) {
			for (const teardown of tag.teardownTags) {
				const teardownTag = this.tags.get(teardown.tagId);
				if (teardownTag) {
					await this.invokeExecutor(teardownTag, context);
				}
			}
		}

		return {
			tagId: tag.id,
			status: success ? "SUCCESS" : "FAILED",
			executionTimeMs: Date.now() - startTime,
		};
	}

	private async invokeExecutor(
		tag: TagConfig,
		_context: TriggerEvaluationContext,
	): Promise<boolean> {
		// Optional consent gating
		if (tag.parameters.requiredConsent && this.consentManager) {
			const reqConsent = tag.parameters.requiredConsent as ConsentType;
			if (!this.consentManager.isGranted(reqConsent)) {
				return false;
			}
		}

		const executor = this.executors.get(tag.type);
		if (!executor) return false;

		try {
			return await executor(tag, tag.parameters);
		} catch {
			return false;
		}
	}
}
