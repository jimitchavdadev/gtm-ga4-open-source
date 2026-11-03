export interface EcommerceItem {
	item_id: string;
	item_name: string;
	price: number;
	quantity?: number;
	discount?: number;
	item_brand?: string;
	item_category?: string;
	coupon?: string;
	[key: string]: any;
}

export interface EcommercePayload {
	transaction_id?: string;
	value: number;
	currency: string;
	tax?: number;
	shipping?: number;
	coupon?: string;
	items: EcommerceItem[];
}

export const VALID_ECOMMERCE_EVENTS = new Set([
	"view_item_list",
	"select_item",
	"view_item",
	"view_promotion",
	"select_promotion",
	"add_to_cart",
	"remove_from_cart",
	"view_cart",
	"begin_checkout",
	"add_shipping_info",
	"add_payment_info",
	"purchase",
	"refund",
	"add_to_wishlist",
]);

export function validateEcommerce(
	eventName: string,
	payload: any,
): { isValid: boolean; errors: string[]; normalized?: EcommercePayload } {
	const errors: string[] = [];

	if (!VALID_ECOMMERCE_EVENTS.has(eventName)) {
		return {
			isValid: false,
			errors: [`Unrecognized ecommerce event: ${eventName}`],
		};
	}

	if (!payload || typeof payload !== "object") {
		return { isValid: false, errors: ["Missing ecommerce payload object"] };
	}

	if (typeof payload.value !== "number" || Number.isNaN(payload.value)) {
		errors.push("Field 'value' must be a valid number");
	}

	if (
		!payload.currency ||
		typeof payload.currency !== "string" ||
		payload.currency.length !== 3
	) {
		errors.push("Field 'currency' must be a 3-letter ISO code");
	}

	if (!Array.isArray(payload.items) || payload.items.length === 0) {
		errors.push("Field 'items' must be a non-empty array");
	} else {
		payload.items.forEach((item: any, idx: number) => {
			if (!item.item_id && !item.item_name) {
				errors.push(
					`Item at index ${idx} must contain at least 'item_id' or 'item_name'`,
				);
			}
			if (typeof item.price !== "number") {
				errors.push(`Item at index ${idx} must have numeric 'price'`);
			}
		});
	}

	if (eventName === "purchase") {
		if (!payload.transaction_id || typeof payload.transaction_id !== "string") {
			errors.push("Field 'transaction_id' is mandatory for 'purchase' events");
		}
	}

	if (errors.length > 0) {
		return { isValid: false, errors };
	}

	return {
		isValid: true,
		errors: [],
		normalized: {
			transaction_id: payload.transaction_id,
			value: Number(payload.value),
			currency: payload.currency.toUpperCase(),
			tax: payload.tax ? Number(payload.tax) : 0,
			shipping: payload.shipping ? Number(payload.shipping) : 0,
			coupon: payload.coupon,
			items: payload.items.map((it: any) => ({
				...it,
				price: Number(it.price),
				quantity: it.quantity ? Number(it.quantity) : 1,
			})),
		},
	};
}

export const EcommerceValidator = {
	VALID_EVENTS: VALID_ECOMMERCE_EVENTS,
	validate: validateEcommerce,
};
