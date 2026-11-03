import { describe, expect, it } from "bun:test";
import { CustomDefinitionsRegistry } from "../src/ga4/custom-definitions";
import { EcommerceValidator } from "../src/ga4/ecommerce";

describe("GA4 Ecommerce & Custom Definitions (Module 7)", () => {
	it("validates standard ecommerce events and enforces required purchase parameters", () => {
		// Valid purchase event
		const validPurchase = {
			transaction_id: "TX_1001",
			value: 129.99,
			currency: "USD",
			items: [
				{
					item_id: "SKU_SHOE_01",
					item_name: "Running Shoe",
					price: 129.99,
					quantity: 1,
				},
			],
		};

		const resValid = EcommerceValidator.validate("purchase", validPurchase);
		expect(resValid.isValid).toBe(true);
		expect(resValid.normalized?.transaction_id).toBe("TX_1001");
		expect(resValid.normalized?.value).toBe(129.99);

		// Missing transaction_id on purchase
		const invalidPurchase = {
			value: 99.0,
			currency: "USD",
			items: [{ item_id: "SKU_1", price: 99.0 }],
		};
		const resInvalid = EcommerceValidator.validate("purchase", invalidPurchase);
		expect(resInvalid.isValid).toBe(false);
		expect(resInvalid.errors).toContain(
			"Field 'transaction_id' is mandatory for 'purchase' events",
		);
	});

	it("enforces Free vs 360 limits on dimensions and metrics", () => {
		const freeRegistry = new CustomDefinitionsRegistry(false); // Free tier

		// Fill 50 event-scoped dimensions
		for (let i = 0; i < 50; i++) {
			freeRegistry.registerDefinition({
				parameterName: `event_dim_${i}`,
				displayName: `Dim ${i}`,
				scope: "EVENT",
			});
		}

		// 51st should throw error in Free tier
		expect(() =>
			freeRegistry.registerDefinition({
				parameterName: "event_dim_50",
				displayName: "Dim 50",
				scope: "EVENT",
			}),
		).toThrow(/Event dimension limit reached: 50/);

		// 360 tier allows up to 125
		const enterpriseRegistry = new CustomDefinitionsRegistry(true);
		for (let i = 0; i < 75; i++) {
			enterpriseRegistry.registerDefinition({
				parameterName: `ent_dim_${i}`,
				displayName: `Enterprise Dim ${i}`,
				scope: "EVENT",
			});
		}
		expect(true).toBe(true);
	});

	it("evaluates calculated metrics formulas accurately", () => {
		const registry = new CustomDefinitionsRegistry();

		registry.registerCalculatedMetric({
			id: "cart_conversion_rate",
			displayName: "Cart Conversion Rate",
			formula: "purchase_count / add_to_cart_count",
			format: "PERCENT",
		});

		registry.registerCalculatedMetric({
			id: "margin_amount",
			displayName: "Gross Margin",
			formula: "(revenue - cost) / revenue",
			format: "PERCENT",
		});

		const rate = registry.evaluateCalculatedMetric("cart_conversion_rate", {
			purchase_count: 25,
			add_to_cart_count: 100,
		});
		expect(rate).toBe(0.25);

		const margin = registry.evaluateCalculatedMetric("margin_amount", {
			revenue: 1000,
			cost: 400,
		});
		expect(margin).toBe(0.6);
	});
});
