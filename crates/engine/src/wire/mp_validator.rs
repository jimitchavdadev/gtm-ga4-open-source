use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationMessage {
    pub field_path: String,
    pub description: String,
    pub validation_code: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationResponse {
    pub validation_messages: Vec<ValidationMessage>,
}

pub struct MpValidator;

impl MpValidator {
    pub fn validate(payload: &serde_json::Value) -> ValidationResponse {
        let mut messages = Vec::new();

        let client_id = payload.get("client_id").and_then(|v| v.as_str());
        let app_instance_id = payload.get("app_instance_id").and_then(|v| v.as_str());

        if client_id.is_none() && app_instance_id.is_none() {
            messages.push(ValidationMessage {
                field_path: "client_id".to_string(),
                description: "Either client_id or app_instance_id must be provided.".to_string(),
                validation_code: "VALUE_REQUIRED".to_string(),
            });
        }

        let events = payload.get("events").and_then(|v| v.as_array());
        if let Some(events_list) = events {
            if events_list.is_empty() {
                messages.push(ValidationMessage {
                    field_path: "events".to_string(),
                    description: "events list cannot be empty.".to_string(),
                    validation_code: "VALUE_REQUIRED".to_string(),
                });
            } else if events_list.len() > 25 {
                messages.push(ValidationMessage {
                    field_path: "events".to_string(),
                    description: "Maximum of 25 events allowed per batch request.".to_string(),
                    validation_code: "VALUE_OUT_OF_RANGE".to_string(),
                });
            }

            for (idx, ev) in events_list.iter().enumerate() {
                let name = ev.get("name").and_then(|v| v.as_str());
                if name.is_none() || name.unwrap().trim().is_empty() {
                    messages.push(ValidationMessage {
                        field_path: format!("events[{}].name", idx),
                        description: "Event name is required.".to_string(),
                        validation_code: "NAME_REQUIRED".to_string(),
                    });
                } else if let Some(n) = name {
                    if n.len() > 40 {
                        messages.push(ValidationMessage {
                            field_path: format!("events[{}].name", idx),
                            description: "Event name cannot exceed 40 characters.".to_string(),
                            validation_code: "NAME_INVALID".to_string(),
                        });
                    }

                    if n == "purchase" {
                        let params = ev.get("params");
                        let currency = params.and_then(|p| p.get("currency")).and_then(|c| c.as_str());
                        let value = params.and_then(|p| p.get("value")).and_then(|v| v.as_f64());
                        if currency.is_none() || value.is_none() {
                            messages.push(ValidationMessage {
                                field_path: format!("events[{}].params", idx),
                                description: "purchase event requires 'currency' and 'value' parameters.".to_string(),
                                validation_code: "REQUIRED_PARAMS_MISSING".to_string(),
                            });
                        }
                    }
                }
            }
        } else {
            messages.push(ValidationMessage {
                field_path: "events".to_string(),
                description: "Field 'events' is required.".to_string(),
                validation_code: "VALUE_REQUIRED".to_string(),
            });
        }

        ValidationResponse {
            validation_messages: messages,
        }
    }
}
