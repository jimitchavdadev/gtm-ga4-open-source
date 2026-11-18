use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum KeyEventType {
    Primary,
    Secondary,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum CountingMethod {
    OncePerEvent,
    OncePerSession,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KeyEventConfig {
    pub event_name: String,
    pub key_type: KeyEventType,
    pub counting_method: CountingMethod,
    #[serde(default)]
    pub default_value: Option<f64>,
}

pub struct KeyEventsManager {
    is_360: bool,
    key_events: Vec<KeyEventConfig>,
}

impl KeyEventsManager {
    pub fn new(is_360: bool) -> Self {
        Self {
            is_360,
            key_events: Vec::new(),
        }
    }

    pub fn max_key_events(&self) -> usize {
        if self.is_360 { 50 } else { 30 }
    }

    pub fn register_key_event(&mut self, config: KeyEventConfig) -> Result<(), String> {
        if self.key_events.len() >= self.max_key_events() {
            return Err(format!(
                "Max key events quota exceeded ({})",
                self.max_key_events()
            ));
        }
        if self.key_events.iter().any(|k| k.event_name == config.event_name) {
            return Err(format!("Key event '{}' is already configured", config.event_name));
        }
        self.key_events.push(config);
        Ok(())
    }

    pub fn is_primary(&self, event_name: &str) -> bool {
        self.key_events
            .iter()
            .any(|k| k.event_name == event_name && k.key_type == KeyEventType::Primary)
    }

    pub fn get_key_events(&self) -> &[KeyEventConfig] {
        &self.key_events
    }
}
