use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PredictiveMetrics {
    pub purchase_probability: f64,
    pub churn_probability: f64,
    pub predicted_revenue_28d: f64,
}

pub struct PredictiveEngine;

impl PredictiveEngine {
    pub fn calculate_metrics(
        days_since_last_active: u32,
        total_sessions_30d: u32,
        total_purchases_30d: u32,
        lifetime_revenue: f64,
    ) -> PredictiveMetrics {
        // Churn Probability Model (sigmoid curve based on recency)
        let recency_penalty = (days_since_last_active as f64 / 7.0).min(5.0);
        let churn_prob = (1.0 / (1.0 + (-0.8 * (recency_penalty - 2.0)).exp())).clamp(0.01, 0.99);

        // Purchase Probability Model (logistic regression on frequency and past conversions)
        let freq_score = (total_sessions_30d as f64).min(20.0) * 0.05;
        let past_purchase_boost = if total_purchases_30d > 0 { 0.35 } else { 0.05 };
        let purchase_prob = (freq_score + past_purchase_boost - (days_since_last_active as f64 * 0.04)).clamp(0.01, 0.98);

        // 28-day Predicted Revenue (Expected Monetary Value = Probability * Historical Average Value)
        let avg_order_value = if total_purchases_30d > 0 {
            lifetime_revenue / (total_purchases_30d as f64)
        } else {
            35.0 // Industry baseline AOV
        };
        let predicted_revenue = (purchase_prob * avg_order_value * 1.5).max(0.0);

        PredictiveMetrics {
            purchase_probability: (purchase_prob * 100.0).round() / 100.0,
            churn_probability: (churn_prob * 100.0).round() / 100.0,
            predicted_revenue_28d: (predicted_revenue * 100.0).round() / 100.0,
        }
    }
}
