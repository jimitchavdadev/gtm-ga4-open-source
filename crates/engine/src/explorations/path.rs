use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PathNode {
    pub name: String,
    pub step: usize,
    pub count: u64,
    pub children: Vec<PathNode>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PathExplorationReport {
    pub starting_node: String,
    pub is_reverse_path: bool,
    pub tree: PathNode,
    pub total_paths: usize,
}

pub struct PathExplorationEngine;

impl PathExplorationEngine {
    pub fn build_forward_path(starting_event: &str, journeys: &[Vec<String>], max_depth: usize) -> PathExplorationReport {
        let mut root = PathNode {
            name: starting_event.to_string(),
            step: 0,
            count: 0,
            children: Vec::new(),
        };

        for j in journeys {
            if let Some(pos) = j.iter().position(|ev| ev == starting_event) {
                root.count += 1;
                Self::insert_path(&mut root, &j[pos + 1..], 1, max_depth);
            }
        }

        PathExplorationReport {
            starting_node: starting_event.to_string(),
            is_reverse_path: false,
            tree: root,
            total_paths: journeys.len(),
        }
    }

    fn insert_path(current_node: &mut PathNode, remaining: &[String], step: usize, max_depth: usize) {
        if remaining.is_empty() || step > max_depth {
            return;
        }

        let next_event = &remaining[0];
        let child_idx = if let Some(idx) = current_node.children.iter().position(|c| &c.name == next_event) {
            idx
        } else {
            current_node.children.push(PathNode {
                name: next_event.clone(),
                step,
                count: 0,
                children: Vec::new(),
            });
            current_node.children.len() - 1
        };

        current_node.children[child_idx].count += 1;
        Self::insert_path(&mut current_node.children[child_idx], &remaining[1..], step + 1, max_depth);
    }
}
