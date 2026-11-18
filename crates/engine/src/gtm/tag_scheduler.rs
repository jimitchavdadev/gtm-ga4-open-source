use serde::{Deserialize, Serialize};
use std::collections::HashSet;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum FiringRule {
    OncePerEvent,
    OncePerPage,
    Unlimited,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tag {
    pub id: String,
    pub name: String,
    pub tag_type: String,
    #[serde(default)]
    pub priority: i32,
    #[serde(default = "default_firing_rule")]
    pub firing_rule: FiringRule,
    #[serde(default)]
    pub setup_tag_ids: Vec<String>,
    #[serde(default)]
    pub cleanup_tag_ids: Vec<String>,
    #[serde(default)]
    pub required_consent: Vec<String>,
}

fn default_firing_rule() -> FiringRule {
    FiringRule::Unlimited
}

#[derive(Default)]
pub struct TagScheduler {
    fired_on_page: HashSet<String>,
    fired_on_event: HashSet<String>,
}

impl TagScheduler {
    pub fn new() -> Self {
        Self {
            fired_on_page: HashSet::new(),
            fired_on_event: HashSet::new(),
        }
    }

    pub fn schedule_tags(&mut self, tags: &[Tag]) -> Vec<String> {
        let mut sorted = tags.to_vec();
        // Higher priority executes first
        sorted.sort_by(|a, b| b.priority.cmp(&a.priority));

        let mut execution_order = Vec::new();
        self.fired_on_event.clear();

        for tag in sorted {
            if !self.can_fire(&tag) {
                continue;
            }

            // Setup tags first
            for setup_id in &tag.setup_tag_ids {
                if !execution_order.contains(setup_id) {
                    execution_order.push(setup_id.clone());
                }
            }

            // Main tag
            execution_order.push(tag.id.clone());
            self.mark_fired(&tag);

            // Cleanup tags after
            for cleanup_id in &tag.cleanup_tag_ids {
                if !execution_order.contains(cleanup_id) {
                    execution_order.push(cleanup_id.clone());
                }
            }
        }

        execution_order
    }

    fn can_fire(&self, tag: &Tag) -> bool {
        match tag.firing_rule {
            FiringRule::OncePerPage => !self.fired_on_page.contains(&tag.id),
            FiringRule::OncePerEvent => !self.fired_on_event.contains(&tag.id),
            FiringRule::Unlimited => true,
        }
    }

    fn mark_fired(&mut self, tag: &Tag) {
        self.fired_on_page.insert(tag.id.clone());
        self.fired_on_event.insert(tag.id.clone());
    }

    pub fn reset_page(&mut self) {
        self.fired_on_page.clear();
        self.fired_on_event.clear();
    }
}
