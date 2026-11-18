use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EcommerceItem {
    pub item_id: String,
    pub item_name: String,
    pub price: f64,
    pub quantity: i32,
    pub item_category: Option<String>,
    pub discount: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EcommerceValidationResult {
    pub is_valid: bool,
    pub errors: Vec<String>,
}

pub struct EcommerceEngine;

impl EcommerceEngine {
    pub fn validate_purchase(
        params: &serde_json::Map<String, serde_json::Value>,
        items: &[EcommerceItem],
    ) -> EcommerceValidationResult {
        let mut errors = Vec::new();

        if !params.contains_key("transaction_id") {
            errors.push("Missing required purchase parameter: transaction_id".to_string());
        }
        if !params.contains_key("value") {
            errors.push("Missing required purchase parameter: value".to_string());
        }
        if !params.contains_key("currency") {
            errors.push("Missing required purchase parameter: currency".to_string());
        }
        if items.is_empty() {
            errors.push("Purchase event must contain at least one item".to_string());
        }

        EcommerceValidationResult {
            is_valid: errors.is_empty(),
            errors,
        }
    }

    pub fn calculate_cart_abandonment_rate(add_to_carts: usize, purchases: usize) -> f64 {
        if add_to_carts == 0 {
            return 0.0;
        }
        if purchases >= add_to_carts {
            return 0.0;
        }
        let abandoned = add_to_carts - purchases;
        (abandoned as f64 / add_to_carts as f64) * 100.0
    }

    pub fn calculate_item_revenue(items: &[EcommerceItem]) -> f64 {
        items
            .iter()
            .map(|i| {
                let disc = i.discount.unwrap_or(0.0);
                (i.price - disc) * (i.quantity as f64)
            })
            .sum()
    }
}
