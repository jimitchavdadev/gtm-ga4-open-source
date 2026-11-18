use super::types::{AttributionResult, Journey};
use std::collections::HashMap;

pub struct LastClickAttribution;

impl LastClickAttribution {
    pub fn calculate(journeys: &[Journey]) -> AttributionResult {
        let mut counts: HashMap<String, f64> = HashMap::new();
        let mut revenue: HashMap<String, f64> = HashMap::new();
        let mut total_converted = 0.0;

        for j in journeys {
            if !j.converted || j.touchpoints.is_empty() {
                continue;
            }
            total_converted += 1.0;

            // Find last non-direct touchpoint, fallback to direct
            let mut chosen_channel = &j.touchpoints.last().unwrap().channel;
            for tp in j.touchpoints.iter().rev() {
                if tp.channel != "Direct" {
                    chosen_channel = &tp.channel;
                    break;
                }
            }

            *counts.entry(chosen_channel.clone()).or_insert(0.0) += 1.0;
            *revenue.entry(chosen_channel.clone()).or_insert(0.0) += j.revenue;
        }

        let mut weights = HashMap::new();
        if total_converted > 0.0 {
            for (ch, cnt) in &counts {
                weights.insert(ch.clone(), (cnt / total_converted * 1000.0).round() / 1000.0);
            }
        }

        AttributionResult {
            weights,
            allocated_revenue: revenue,
        }
    }
}
