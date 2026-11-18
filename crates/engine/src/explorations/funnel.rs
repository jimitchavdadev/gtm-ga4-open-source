use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FunnelStepConfig {
    pub step_name: String,
    pub event_name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FunnelStepResult {
    pub step_number: usize,
    pub step_name: String,
    pub users: u64,
    pub completion_rate: f64,
    pub drop_off_count: u64,
    pub drop_off_rate: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FunnelExplorationReport {
    pub is_open_funnel: bool,
    pub steps: Vec<FunnelStepResult>,
    pub overall_conversion_rate: f64,
}

pub struct FunnelExplorationEngine;

impl FunnelExplorationEngine {
    pub fn evaluate(
        steps_config: &[FunnelStepConfig],
        user_journeys: &[Vec<String>], // each journey is a list of event_names in order
        is_open_funnel: bool,
    ) -> FunnelExplorationReport {
        if steps_config.is_empty() {
            return FunnelExplorationReport {
                is_open_funnel,
                steps: vec![],
                overall_conversion_rate: 0.0,
            };
        }

        let mut step_users: Vec<u64> = vec![0; steps_config.len()];

        for events in user_journeys {
            let mut current_step = 0;
            for ev in events {
                if current_step < steps_config.len() && ev == &steps_config[current_step].event_name {
                    step_users[current_step] += 1;
                    current_step += 1;
                } else if is_open_funnel {
                    // In open funnel, user can jump into an arbitrary intermediate step
                    for (idx, sc) in steps_config.iter().enumerate() {
                        if ev == &sc.event_name && idx >= current_step {
                            step_users[idx] += 1;
                            current_step = idx + 1;
                            break;
                        }
                    }
                }
            }
        }

        let mut results = Vec::new();
        let first_step_count = step_users[0].max(1);

        for (i, cfg) in steps_config.iter().enumerate() {
            let count = step_users[i];
            let prev_count = if i == 0 { count } else { step_users[i - 1] };
            let drop_count = if prev_count >= count { prev_count - count } else { 0 };
            let drop_rate = if prev_count > 0 {
                ((drop_count as f64 / prev_count as f64) * 100.0).round() / 100.0
            } else {
                0.0
            };
            let comp_rate = if prev_count > 0 {
                ((count as f64 / prev_count as f64) * 100.0).round() / 100.0
            } else {
                0.0
            };

            results.push(FunnelStepResult {
                step_number: i + 1,
                step_name: cfg.step_name.clone(),
                users: count,
                completion_rate: comp_rate,
                drop_off_count: drop_count,
                drop_off_rate: drop_rate,
            });
        }

        let last_step_count = step_users.last().copied().unwrap_or(0);
        let overall_cr = ((last_step_count as f64 / first_step_count as f64) * 100.0).round() / 100.0;

        FunnelExplorationReport {
            is_open_funnel,
            steps: results,
            overall_conversion_rate: overall_cr,
        }
    }
}
