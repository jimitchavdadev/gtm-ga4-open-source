use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SubpropertyRule {
    pub subproperty_id: String,
    pub source_property_id: String,
    pub filter_param: String,
    pub filter_value: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RollupProperty {
    pub rollup_id: String,
    pub source_property_ids: Vec<String>,
}

pub struct EnterprisePropertyRouter;

impl EnterprisePropertyRouter {
    pub fn route_to_subproperties(
        rules: &[SubpropertyRule],
        source_prop_id: &str,
        params: &serde_json::Map<String, serde_json::Value>,
    ) -> Vec<String> {
        let mut matched = Vec::new();
        for rule in rules {
            if rule.source_property_id != source_prop_id {
                continue;
            }
            if let Some(val) = params.get(&rule.filter_param) {
                let s = val.as_str().unwrap_or("");
                if s == rule.filter_value {
                    matched.push(rule.subproperty_id.clone());
                }
            }
        }
        matched
    }

    pub fn is_included_in_rollup(rollup: &RollupProperty, source_prop_id: &str) -> bool {
        rollup.source_property_ids.iter().any(|id| id == source_prop_id)
    }
}
