import { describe, expect, it } from "bun:test";
import { DataLayerEngine } from "../src/gtm/datalayer";
import { MacroDagEngine } from "../src/gtm/macro-dag";
import { PredicateEvaluator } from "../src/gtm/predicates";

describe("GTM Core Engine (Data Layer, Macro DAG & Predicates)", () => {
	it("processes dataLayer deep merges and array overwrites according to GTM spec", () => {
		const dl = new DataLayerEngine(2);
		dl.push({ ecommerce: { currency: "USD", items: [{ id: "A" }] } });

		expect(dl.get("ecommerce.currency")).toBe("USD");
		expect(dl.get("ecommerce.items.0.id")).toBe("A");

		// Array overwrite rule
		dl.push({ ecommerce: { items: [{ id: "B" }, { id: "C" }] } });
		expect(dl.get("ecommerce.items.0.id")).toBe("B");
		expect(dl.get("ecommerce.items.1.id")).toBe("C");
		expect(dl.get("ecommerce.currency")).toBe("USD"); // preserved
	});

	it("dispatches events with monotonic uniqueEventId", () => {
		const dl = new DataLayerEngine(2);
		let capturedEventId = 0;
		dl.onEvent((payload) => {
			capturedEventId = payload["gtm.uniqueEventId"];
		});

		const id1 = dl.push({ event: "page_view" });
		expect(id1).toBe(1);
		expect(capturedEventId).toBe(1);

		const id2 = dl.push({ event: "purchase", value: 100 });
		expect(id2).toBe(2);
		expect(capturedEventId).toBe(2);
	});

	it("resolves macro DAG dependencies and memoizes per event", () => {
		const dag = new MacroDagEngine();
		let evalCount = 0;

		dag.registerVariable(
			{ name: "VarBase", type: "constant", parameters: {} },
			() => 10,
		);

		dag.registerVariable(
			{
				name: "VarComputed",
				type: "computed",
				parameters: {},
				dependencies: ["VarBase"],
			},
			(_ctx, _dl) => {
				evalCount++;
				const base = dag.resolve("VarBase", _ctx, _dl);
				return base * 2;
			},
		);

		const context = { "gtm.uniqueEventId": 101 };
		const result1 = dag.resolve("VarComputed", context, {});
		const result2 = dag.resolve("VarComputed", context, {});

		expect(result1).toBe(20);
		expect(result2).toBe(20);
		expect(evalCount).toBe(1); // Memoized!
	});

	it("detects circular variable dependencies", () => {
		const dag = new MacroDagEngine();
		dag.registerVariable(
			{ name: "A", type: "custom", parameters: {}, dependencies: ["B"] },
			() => 1,
		);
		dag.registerVariable(
			{ name: "B", type: "custom", parameters: {}, dependencies: ["A"] },
			() => 2,
		);

		expect(() => dag.resolve("A", {}, {})).toThrow(
			/Circular variable dependency detected/,
		);
	});

	it("evaluates predicate operators accurately", () => {
		expect(
			PredicateEvaluator.evaluate(
				{ variableName: "page", operator: "EQUALS", targetValue: "/checkout" },
				"/checkout",
			),
		).toBe(true);

		expect(
			PredicateEvaluator.evaluate(
				{
					variableName: "val",
					operator: "GREATER_THAN",
					targetValue: "50",
				},
				100,
			),
		).toBe(true);

		expect(
			PredicateEvaluator.evaluate(
				{
					variableName: "url",
					operator: "MATCHES_REGEX_IGNORE_CASE",
					targetValue: "^/SHOP/.*",
				},
				"/shop/shoes",
			),
		).toBe(true);
	});
});
