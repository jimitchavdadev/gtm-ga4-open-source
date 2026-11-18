use crate::gtm::predicates::PredicateFilter;
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TriggerType {
    PageView,
    DomReady,
    WindowLoaded,
    CustomEvent,
    Click,
    Timer,
    TriggerGroup,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Trigger {
    pub id: String,
    pub name: String,
    pub trigger_type: TriggerType,
    pub custom_event_name: Option<String>,
    #[serde(default)]
    pub filters: Vec<PredicateFilter>,
    #[serde(default)]
    pub member_trigger_ids: Vec<String>,
}

#[derive(Default)]
pub struct TriggerEngine {
    fired_history: HashSet<String>,
}

impl TriggerEngine {
    pub fn new() -> Self {
        Self {
            fired_history: HashSet::new(),
        }
    }

    pub fn evaluate(
        &mut self,
        trigger: &Trigger,
        event_name: &str,
        context: &HashMap<String, String>,
    ) -> bool {
        let matches_event = match trigger.trigger_type {
            TriggerType::PageView => event_name == "gtm.js" || event_name == "page_view",
            TriggerType::DomReady => event_name == "gtm.dom",
            TriggerType::WindowLoaded => event_name == "gtm.load",
            TriggerType::Click => event_name == "gtm.click" || event_name == "gtm.linkClick",
            TriggerType::Timer => event_name == "gtm.timer",
            TriggerType::CustomEvent => {
                if let Some(ref expected) = trigger.custom_event_name {
                    expected == event_name || expected == ".*"
                } else {
                    true
                }
            }
            TriggerType::TriggerGroup => {
                let all_members_fired = trigger
                    .member_trigger_ids
                    .iter()
                    .all(|id| self.fired_history.contains(id));
                all_members_fired
            }
        };

        if !matches_event {
            return false;
        }

        let filters_pass = trigger.filters.iter().all(|f| {
            let actual_arg0 = context.get(&f.arg0).cloned().unwrap_or_else(|| f.arg0.clone());
            let actual_arg1 = context.get(&f.arg1).cloned().unwrap_or_else(|| f.arg1.clone());
            let mut eval_filter = f.clone();
            eval_filter.arg0 = actual_arg0;
            eval_filter.arg1 = actual_arg1;
            eval_filter.evaluate()
        });

        if filters_pass {
            self.fired_history.insert(trigger.id.clone());
            true
        } else {
            false
        }
    }

    pub fn reset_history(&mut self) {
        self.fired_history.clear();
    }
}
