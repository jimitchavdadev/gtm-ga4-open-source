use super::types::{AttributionResult, Journey};
use std::collections::{HashMap, HashSet};

pub struct MarkovAttribution;

impl MarkovAttribution {
    pub fn calculate(journeys: &[Journey]) -> AttributionResult {
        let mut transitions: HashMap<(String, String), f64> = HashMap::new();
        let mut total_out: HashMap<String, f64> = HashMap::new();
        let mut channels = HashSet::new();
        let mut total_rev = 0.0;

        for j in journeys {
            if j.converted {
                total_rev += j.revenue;
            }
            if j.touchpoints.is_empty() {
                continue;
            }

            // Start -> first
            let first = &j.touchpoints[0].channel;
            channels.insert(first.clone());
            *transitions.entry(("START".to_string(), first.clone())).or_insert(0.0) += 1.0;
            *total_out.entry("START".to_string()).or_insert(0.0) += 1.0;

            // Sequential transitions
            for w in j.touchpoints.windows(2) {
                let from = &w[0].channel;
                let to = &w[1].channel;
                channels.insert(from.clone());
                channels.insert(to.clone());
                *transitions.entry((from.clone(), to.clone())).or_insert(0.0) += 1.0;
                *total_out.entry(from.clone()).or_insert(0.0) += 1.0;
            }

            // Last -> Conversion or Dropoff
            let last = &j.touchpoints.last().unwrap().channel;
            let end_state = if j.converted { "CONV" } else { "NULL" };
            *transitions.entry((last.clone(), end_state.to_string())).or_insert(0.0) += 1.0;
            *total_out.entry(last.clone()).or_insert(0.0) += 1.0;
        }

        let base_conv_prob = Self::simulate_conversion_rate(&transitions, &total_out, None);
        let mut removal_effects: HashMap<String, f64> = HashMap::new();
        let mut total_effect = 0.0;

        for ch in &channels {
            let removed_prob = Self::simulate_conversion_rate(&transitions, &total_out, Some(ch));
            let effect = if base_conv_prob > 0.0 {
                (base_conv_prob - removed_prob) / base_conv_prob
            } else {
                0.0
            }.max(0.0);
            removal_effects.insert(ch.clone(), effect);
            total_effect += effect;
        }

        let mut weights = HashMap::new();
        let mut allocated_revenue = HashMap::new();

        if total_effect > 0.0 {
            for (ch, eff) in removal_effects {
                let w = eff / total_effect;
                weights.insert(ch.clone(), (w * 1000.0).round() / 1000.0);
                allocated_revenue.insert(ch, (w * total_rev * 100.0).round() / 100.0);
            }
        }

        AttributionResult {
            weights,
            allocated_revenue,
        }
    }

    fn simulate_conversion_rate(
        transitions: &HashMap<(String, String), f64>,
        total_out: &HashMap<String, f64>,
        removed_channel: Option<&str>,
    ) -> f64 {
        // Simplified absorbing Markov chain conversion probability estimation
        let mut current_state_probs: HashMap<String, f64> = HashMap::new();
        current_state_probs.insert("START".to_string(), 1.0);
        let mut conv_prob = 0.0;

        for _step in 0..15 {
            let mut next_probs: HashMap<String, f64> = HashMap::new();
            for (curr, p) in &current_state_probs {
                if curr == "CONV" {
                    conv_prob += *p;
                    continue;
                }
                if curr == "NULL" {
                    continue;
                }
                if let Some(rem) = removed_channel {
                    if curr == rem {
                        continue;
                    }
                }

                let total = *total_out.get(curr).unwrap_or(&0.0);
                if total == 0.0 {
                    continue;
                }

                for ((from, to), count) in transitions {
                    if from == curr {
                        if let Some(rem) = removed_channel {
                            if to == rem {
                                continue;
                            }
                        }
                        let transition_prob = count / total;
                        *next_probs.entry(to.clone()).or_insert(0.0) += p * transition_prob;
                    }
                }
            }
            current_state_probs = next_probs;
            if current_state_probs.is_empty() {
                break;
            }
        }

        conv_prob + current_state_probs.get("CONV").copied().unwrap_or(0.0)
    }
}
