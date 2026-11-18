use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConversionModelInput {
    pub observed_conversions: u64,
    pub observed_revenue: f64,
    pub observed_conversion_rate: f64,
    pub modeled_sessions: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConversionModelOutput {
    pub observed_conversions: u64,
    pub modeled_conversions: u64,
    pub blended_conversions: u64,
    pub modeled_revenue: f64,
    pub blended_revenue: f64,
    pub modeled_lift_pct: f64,
}

pub struct ConversionModelEngine;

impl ConversionModelEngine {
    pub fn model_conversions(input: &ConversionModelInput) -> ConversionModelOutput {
        // Average order value observed
        let aov = if input.observed_conversions > 0 {
            input.observed_revenue / (input.observed_conversions as f64)
        } else {
            0.0
        };

        // Estimate unconsented conversions: modeled_sessions * observed_cr
        let modeled_conv_raw = (input.modeled_sessions as f64) * input.observed_conversion_rate;
        let modeled_conversions = modeled_conv_raw.round() as u64;
        let modeled_revenue = (modeled_conversions as f64) * aov;

        let blended_conversions = input.observed_conversions + modeled_conversions;
        let blended_revenue = input.observed_revenue + modeled_revenue;

        let lift = if input.observed_conversions > 0 {
            ((modeled_conversions as f64) / (input.observed_conversions as f64)) * 100.0
        } else {
            0.0
        };

        ConversionModelOutput {
            observed_conversions: input.observed_conversions,
            modeled_conversions,
            blended_conversions,
            modeled_revenue: (modeled_revenue * 100.0).round() / 100.0,
            blended_revenue: (blended_revenue * 100.0).round() / 100.0,
            modeled_lift_pct: (lift * 10.0).round() / 10.0,
        }
    }
}
