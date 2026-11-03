export type DataLayerMessage =
	| Record<string, any>
	| ((this: any, ...args: any[]) => void);

export class DataLayerEngine {
	private internalModel: Record<string, any> = {};
	private eventListeners: Array<(eventPayload: Record<string, any>) => void> =
		[];
	private nextEventId = 1;

	constructor(private version: 1 | 2 = 2) {}

	public push(message: DataLayerMessage): number {
		if (typeof message === "function") {
			(message as (this: any, ...args: any[]) => void).call(this);
			return this.nextEventId;
		}

		if (this.version === 2) {
			this.deepMerge(this.internalModel, message);
		} else {
			Object.assign(this.internalModel, message);
		}

		if (typeof message.event === "string") {
			const eventId = this.nextEventId++;
			const snapshot = JSON.parse(JSON.stringify(this.internalModel));
			snapshot["gtm.uniqueEventId"] = eventId;

			for (const listener of this.eventListeners) {
				listener(snapshot);
			}
			return eventId;
		}

		return this.nextEventId;
	}

	public get(path: string): any {
		const parts = path.split(".");
		let current = this.internalModel;
		for (const part of parts) {
			if (current === null || current === undefined) return undefined;
			current = current[part];
		}
		return current;
	}

	public getModel(): Record<string, any> {
		return JSON.parse(JSON.stringify(this.internalModel));
	}

	public onEvent(callback: (eventPayload: Record<string, any>) => void): void {
		this.eventListeners.push(callback);
	}

	public reset(): void {
		this.internalModel = {};
		this.eventListeners = [];
		this.nextEventId = 1;
	}

	private deepMerge(
		target: Record<string, any>,
		source: Record<string, any>,
	): void {
		for (const key of Object.keys(source)) {
			const sourceVal = source[key];
			if (sourceVal === undefined || sourceVal === null) {
				delete target[key];
			} else if (Array.isArray(sourceVal)) {
				// GTM Rule: Pushing an array overwrites target array
				target[key] = [...sourceVal];
			} else if (typeof sourceVal === "object") {
				if (
					!target[key] ||
					typeof target[key] !== "object" ||
					Array.isArray(target[key])
				) {
					target[key] = {};
				}
				this.deepMerge(target[key], sourceVal);
			} else {
				target[key] = sourceVal;
			}
		}
	}
}
