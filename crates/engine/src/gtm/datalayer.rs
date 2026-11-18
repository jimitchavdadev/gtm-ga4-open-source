use serde_json::{Map, Value};
use std::sync::atomic::{AtomicU64, Ordering};

pub struct DataLayer {
    state: Map<String, Value>,
    event_counter: AtomicU64,
    events: Vec<Map<String, Value>>,
}

impl Default for DataLayer {
    fn default() -> Self {
        Self::new()
    }
}

impl DataLayer {
    pub fn new() -> Self {
        Self {
            state: Map::new(),
            event_counter: AtomicU64::new(1),
            events: Vec::new(),
        }
    }

    pub fn push(&mut self, mut item: Map<String, Value>) -> Option<u64> {
        let mut event_id = None;
        if item.contains_key("event") {
            let id = self.event_counter.fetch_add(1, Ordering::SeqCst);
            item.insert("gtm.uniqueEventId".to_string(), Value::from(id));
            event_id = Some(id);
            self.events.push(item.clone());
        }

        for (k, v) in item {
            Self::merge_into(&mut self.state, &k, v);
        }

        event_id
    }

    fn merge_into(target: &mut Map<String, Value>, key: &str, value: Value) {
        if key.contains('.') {
            let parts: Vec<&str> = key.splitn(2, '.').collect();
            let parent_key = parts[0];
            let child_key = parts[1];

            let entry = target.entry(parent_key.to_string()).or_insert_with(|| {
                Value::Object(Map::new())
            });

            if let Value::Object(ref mut child_map) = entry {
                Self::merge_into(child_map, child_key, value);
            }
        } else {
            match (target.get_mut(key), &value) {
                (Some(Value::Object(ref mut existing)), Value::Object(ref incoming)) => {
                    for (k, v) in incoming {
                        Self::merge_into(existing, k, v.clone());
                    }
                }
                _ => {
                    target.insert(key.to_string(), value);
                }
            }
        }
    }

    pub fn query(&self, path: &str) -> Option<Value> {
        if let Some(val) = self.state.get(path) {
            return Some(val.clone());
        }
        let parts: Vec<&str> = path.split('.').collect();
        let mut current = &Value::Object(self.state.clone());

        for part in parts {
            match current {
                Value::Object(map) => match map.get(part) {
                    Some(val) => current = val,
                    None => return None,
                },
                _ => return None,
            }
        }
        Some(current.clone())
    }

    pub fn get_state(&self) -> &Map<String, Value> {
        &self.state
    }

    pub fn get_events(&self) -> &[Map<String, Value>] {
        &self.events
    }
}
