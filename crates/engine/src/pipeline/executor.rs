use super::rules::{PipelineAction, PipelineRule};
use crate::crypto::hash::sha256_hex;
use crate::wire::model::CanonicalEvent;
use std::collections::HashSet;

pub struct PipelineExecutor {
    rules: Vec<PipelineRule>,
}

impl Default for PipelineExecutor {
    fn default() -> Self {
        Self::new()
    }
}

impl PipelineExecutor {
    pub fn new() -> Self {
        Self { rules: Vec::new() }
    }

    pub fn add_rule(&mut self, rule: PipelineRule) {
        self.rules.push(rule);
        self.rules.sort_by(|a, b| b.priority.cmp(&a.priority));
    }

    pub fn execute(&self, mut event: CanonicalEvent) -> CanonicalEvent {
        for rule in &self.rules {
            match rule.action {
                PipelineAction::Allowlist => {
                    let allowed: HashSet<&str> = rule.target_fields.iter().map(|s| s.as_str()).collect();
                    event.event_params.retain(|k, _| allowed.contains(k.as_str()));
                }
                PipelineAction::Blocklist => {
                    let blocked: HashSet<&str> = rule.target_fields.iter().map(|s| s.as_str()).collect();
                    event.event_params.retain(|k, _| !blocked.contains(k.as_str()));
                    if blocked.contains("user_id") {
                        event.user_id = None;
                    }
                    if blocked.contains("ip_override") {
                        event.ip_override = None;
                    }
                }
                PipelineAction::HashSha256 => {
                    for field in &rule.target_fields {
                        if field == "client_id" {
                            event.client_id = sha256_hex(&event.client_id);
                        } else if let Some(val) = event.event_params.get_mut(field) {
                            if let Some(s) = val.as_str() {
                                *val = serde_json::Value::String(sha256_hex(s));
                            }
                        }
                    }
                }
                PipelineAction::Augment => {
                    if let Some(augment) = &rule.augment_data {
                        for (k, v) in augment {
                            event.event_params.insert(k.clone(), v.clone());
                        }
                    }
                }
            }
        }
        event
    }
}
