use super::types::{AttributionResult, Journey};
use std::collections::{HashMap, HashSet};

pub struct ShapleyAttribution;

impl ShapleyAttribution {
    pub fn calculate(journeys: &[Journey]) -> AttributionResult {
        let mut all_channels = HashSet::new();
        let mut total_rev = 0.0;

        for j in journeys {
            if j.converted {
                total_rev += j.revenue;
            }
            for tp in &j.touchpoints {
                all_channels.insert(tp.channel.clone());
            }
        }

        let channel_list: Vec<String> = all_channels.into_iter().collect();
        let n = channel_list.len().min(8); // limit to 8 for coalition evaluation
        let active_channels = &channel_list[0..n];

        // Evaluate characteristic function v(S) = conversion rate of coalition S
        let mut coalition_values: HashMap<u32, f64> = HashMap::new();
        let num_subsets = 1 << n;

        for mask in 0..num_subsets {
            let mut matching_conversions = 0.0;
            let mut matching_total = 0.0;

            for j in journeys {
                let journey_mask = Self::get_journey_mask(&j.touchpoints, active_channels);
                if (journey_mask & mask) == journey_mask && journey_mask != 0 {
                    matching_total += 1.0;
                    if j.converted {
                        matching_conversions += 1.0;
                    }
                }
            }

            let val = if matching_total > 0.0 {
                matching_conversions / matching_total
            } else {
                0.0
            };
            coalition_values.insert(mask, val);
        }

        // Calculate Shapley values
        let mut raw_shapley: HashMap<String, f64> = HashMap::new();
        let mut total_shapley = 0.0;

        for (i, ch) in active_channels.iter().enumerate() {
            let mut phi_i = 0.0;
            let bit_i = 1 << i;

            for mask in 0..num_subsets {
                if (mask & bit_i) == 0 {
                    let s_size = mask.count_ones() as usize;
                    let weight = Self::factorial(s_size) * Self::factorial(n - s_size - 1)
                        / Self::factorial(n);
                    let v_s = *coalition_values.get(&mask).unwrap_or(&0.0);
                    let v_with_i = *coalition_values.get(&(mask | bit_i)).unwrap_or(&0.0);
                    let marginal = (v_with_i - v_s).max(0.0);
                    phi_i += weight * marginal;
                }
            }
            raw_shapley.insert(ch.clone(), phi_i);
            total_shapley += phi_i;
        }

        let mut weights = HashMap::new();
        let mut allocated_revenue = HashMap::new();

        if total_shapley > 0.0 {
            for (ch, phi) in raw_shapley {
                let w = phi / total_shapley;
                weights.insert(ch.clone(), (w * 1000.0).round() / 1000.0);
                allocated_revenue.insert(ch, (w * total_rev * 100.0).round() / 100.0);
            }
        }

        AttributionResult {
            weights,
            allocated_revenue,
        }
    }

    fn get_journey_mask(touchpoints: &[super::types::Touchpoint], channels: &[String]) -> u32 {
        let mut mask = 0u32;
        for tp in touchpoints {
            if let Some(pos) = channels.iter().position(|c| c == &tp.channel) {
                mask |= 1 << pos;
            }
        }
        mask
    }

    fn factorial(k: usize) -> f64 {
        match k {
            0 | 1 => 1.0,
            2 => 2.0,
            3 => 6.0,
            4 => 24.0,
            5 => 120.0,
            6 => 720.0,
            7 => 5040.0,
            8 => 40320.0,
            _ => (1..=k).map(|x| x as f64).product(),
        }
    }
}
