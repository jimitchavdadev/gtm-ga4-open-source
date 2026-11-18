use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudienceDefinition {
    pub id: String,
    pub name: String,
    pub description: String,
    pub membership_duration_days: u32,
    pub required_event: String,
    pub min_event_count: usize,
    pub audience_trigger_event: Option<String>,
}

pub struct AudienceEvaluationResult {
    pub is_member: bool,
    pub triggered_event: Option<String>,
}

pub struct AudienceEngine;

impl AudienceEngine {
    pub fn evaluate_user(
        audience: &AudienceDefinition,
        user_events: &[String],
    ) -> AudienceEvaluationResult {
        let matching_count = user_events
            .iter()
            .filter(|&ev| ev == &audience.required_event)
            .count();

        let is_member = matching_count >= audience.min_event_count;
        let triggered_event = if is_member {
            audience.audience_trigger_event.clone()
        } else {
            None
        };

        AudienceEvaluationResult {
            is_member,
            triggered_event,
        }
    }
}
