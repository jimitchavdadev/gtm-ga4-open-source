export interface Touchpoint {
	channel: string;
	timestamp: number;
}

export interface ConversionJourney {
	id: string;
	touchpoints: Touchpoint[];
	converted: boolean;
	revenue: number;
}

function getConvProb(
	state: string,
	transitions: Map<string, Map<string, number>>,
	visited: Set<string>,
	removed?: string,
): number {
	if (state === "(conversion)") return 1;
	if (state === "(null)" || state === removed) return 0;
	if (visited.has(state)) return 0;
	visited.add(state);

	const nextMap = transitions.get(state);
	if (!nextMap) return 0;

	let total = 0;
	for (const count of nextMap.values()) total += count;
	if (total === 0) return 0;

	let prob = 0;
	for (const [nextState, count] of nextMap.entries()) {
		if (nextState === removed) continue;
		prob +=
			(count / total) *
			getConvProb(nextState, transitions, new Set(visited), removed);
	}
	return prob;
}

export class AttributionEngine {
	public static calculateLastClick(
		journeys: ConversionJourney[],
	): Record<string, number> {
		const credit: Record<string, number> = {};

		for (const j of journeys) {
			if (!j.converted || j.touchpoints.length === 0) continue;
			// Ignore Direct if other channels exist
			const nonDirect = j.touchpoints.filter(
				(t) => t.channel.toLowerCase() !== "direct",
			);
			const last =
				nonDirect.length > 0
					? nonDirect[nonDirect.length - 1]
					: j.touchpoints[j.touchpoints.length - 1];

			if (last) {
				credit[last.channel] = (credit[last.channel] ?? 0) + j.revenue;
			}
		}

		return credit;
	}

	public static calculateMarkovRemovalEffects(
		journeys: ConversionJourney[],
	): Record<string, number> {
		const transitions = new Map<string, Map<string, number>>();
		const allChannels = new Set<string>();

		const addTransition = (from: string, to: string) => {
			let map = transitions.get(from);
			if (!map) {
				map = new Map();
				transitions.set(from, map);
			}
			map.set(to, (map.get(to) ?? 0) + 1);
		};

		for (const j of journeys) {
			if (j.touchpoints.length === 0) continue;
			let current = "(start)";
			for (const t of j.touchpoints) {
				allChannels.add(t.channel);
				addTransition(current, t.channel);
				current = t.channel;
			}
			addTransition(current, j.converted ? "(conversion)" : "(null)");
		}

		const channelsList = Array.from(allChannels);
		if (channelsList.length === 0) return {};

		const baseline = getConvProb("(start)", transitions, new Set());
		if (baseline === 0) return {};

		const removalEffects: Record<string, number> = {};
		for (const channel of channelsList) {
			const probWithout = getConvProb(
				"(start)",
				transitions,
				new Set(),
				channel,
			);
			const effect = Math.max(0, (baseline - probWithout) / baseline);
			removalEffects[channel] = effect;
		}

		// Normalize removal effects to fractional weights
		const sumEffects = Object.values(removalEffects).reduce((a, b) => a + b, 0);
		const weights: Record<string, number> = {};
		for (const channel of channelsList) {
			const effect = removalEffects[channel] ?? 0;
			weights[channel] =
				sumEffects > 0 ? Number((effect / sumEffects).toFixed(4)) : 0;
		}

		return weights;
	}

	public static calculateShapleyAttribution(
		journeys: ConversionJourney[],
	): Record<string, number> {
		const channelSet = new Set<string>();
		for (const j of journeys) {
			for (const t of j.touchpoints) {
				channelSet.add(t.channel);
			}
		}
		const channels = Array.from(channelSet);
		const credit: Record<string, number> = {};
		for (const c of channels) credit[c] = 0;

		// Calculate total revenue per coalition
		const getCoalitionRev = (coalition: Set<string>): number => {
			let rev = 0;
			for (const j of journeys) {
				if (!j.converted) continue;
				const hasAll = j.touchpoints.every((t) => coalition.has(t.channel));
				if (hasAll) rev += j.revenue;
			}
			return rev;
		};

		// For each channel, compute marginal lift across subsets
		for (const c of channels) {
			let totalMarginal = 0;
			const otherChannels = channels.filter((ch) => ch !== c);

			// Subsets (simple powerset for up to 4 channels)
			const numSubsets = 1 << otherChannels.length;
			for (let i = 0; i < numSubsets; i++) {
				const subset = new Set<string>();
				for (let j = 0; j < otherChannels.length; j++) {
					if ((i & (1 << j)) !== 0) {
						const otherCh = otherChannels[j];
						if (otherCh) subset.add(otherCh);
					}
				}
				const revWithout = getCoalitionRev(subset);
				const subsetWith = new Set(subset);
				subsetWith.add(c);
				const revWith = getCoalitionRev(subsetWith);
				totalMarginal += revWith - revWithout;
			}
			credit[c] = Math.max(0, totalMarginal);
		}

		// Normalize
		const totalCredit = Object.values(credit).reduce((a, b) => a + b, 0);
		if (totalCredit > 0) {
			for (const c of channels) {
				credit[c] = Number(((credit[c] ?? 0) / totalCredit).toFixed(4));
			}
		}

		return credit;
	}
}
