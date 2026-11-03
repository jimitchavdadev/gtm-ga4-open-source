import type { VariableConfig, VariableResolver } from "./types";

export class MacroDagEngine {
	private variables = new Map<string, VariableConfig>();
	private resolvers = new Map<string, VariableResolver>();
	private memoCache = new Map<string, Map<string, any>>();

	public registerVariable(
		config: VariableConfig,
		resolver: VariableResolver,
	): void {
		this.variables.set(config.name, config);
		this.resolvers.set(config.name, resolver);
	}

	public resolve(
		variableName: string,
		context: Record<string, any>,
		dataLayer: Record<string, any>,
	): any {
		const eventId = String(context["gtm.uniqueEventId"] ?? "global");
		let eventCache = this.memoCache.get(eventId);
		if (!eventCache) {
			eventCache = new Map<string, any>();
			this.memoCache.set(eventId, eventCache);
		}

		if (eventCache.has(variableName)) {
			return eventCache.get(variableName);
		}

		this.detectCycle(variableName, new Set<string>());

		const config = this.variables.get(variableName);
		const resolver = this.resolvers.get(variableName);

		if (!config || !resolver) {
			return dataLayer[variableName] ?? context[variableName] ?? undefined;
		}

		if (config.dependencies) {
			for (const dep of config.dependencies) {
				this.resolve(dep, context, dataLayer);
			}
		}

		const result = resolver(context, dataLayer);
		eventCache.set(variableName, result);
		return result;
	}

	public clearCache(eventId?: string): void {
		if (eventId) {
			this.memoCache.delete(eventId);
		} else {
			this.memoCache.clear();
		}
	}

	private detectCycle(current: string, visited: Set<string>): void {
		if (visited.has(current)) {
			throw new Error(`Circular variable dependency detected: ${current}`);
		}
		visited.add(current);
		const config = this.variables.get(current);
		if (config?.dependencies) {
			for (const dep of config.dependencies) {
				this.detectCycle(dep, new Set(visited));
			}
		}
	}
}
