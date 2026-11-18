use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BuiltInVariable {
    pub name: String,
    pub token: String,
    pub category: String,
    pub is_enabled: bool,
}

pub struct BuiltInVariableRegistry;

impl BuiltInVariableRegistry {
    pub fn get_standard_catalog() -> Vec<BuiltInVariable> {
        vec![
            BuiltInVariable { name: "Page URL".into(), token: "{{Page URL}}".into(), category: "Pages".into(), is_enabled: true },
            BuiltInVariable { name: "Page Hostname".into(), token: "{{Page Hostname}}".into(), category: "Pages".into(), is_enabled: true },
            BuiltInVariable { name: "Page Path".into(), token: "{{Page Path}}".into(), category: "Pages".into(), is_enabled: true },
            BuiltInVariable { name: "Referrer".into(), token: "{{Referrer}}".into(), category: "Pages".into(), is_enabled: true },
            BuiltInVariable { name: "Event".into(), token: "{{Event}}".into(), category: "Utilities".into(), is_enabled: true },
            BuiltInVariable { name: "Container ID".into(), token: "{{Container ID}}".into(), category: "Utilities".into(), is_enabled: true },
            BuiltInVariable { name: "Container Version".into(), token: "{{Container Version}}".into(), category: "Utilities".into(), is_enabled: true },
            BuiltInVariable { name: "Environment Name".into(), token: "{{Environment Name}}".into(), category: "Utilities".into(), is_enabled: true },
            BuiltInVariable { name: "Random Number".into(), token: "{{Random Number}}".into(), category: "Utilities".into(), is_enabled: true },
            BuiltInVariable { name: "Click Element".into(), token: "{{Click Element}}".into(), category: "Clicks".into(), is_enabled: false },
            BuiltInVariable { name: "Click Classes".into(), token: "{{Click Classes}}".into(), category: "Clicks".into(), is_enabled: true },
            BuiltInVariable { name: "Click ID".into(), token: "{{Click ID}}".into(), category: "Clicks".into(), is_enabled: true },
            BuiltInVariable { name: "Click Target".into(), token: "{{Click Target}}".into(), category: "Clicks".into(), is_enabled: false },
            BuiltInVariable { name: "Click URL".into(), token: "{{Click URL}}".into(), category: "Clicks".into(), is_enabled: true },
            BuiltInVariable { name: "Click Text".into(), token: "{{Click Text}}".into(), category: "Clicks".into(), is_enabled: true },
            BuiltInVariable { name: "Form Element".into(), token: "{{Form Element}}".into(), category: "Forms".into(), is_enabled: false },
            BuiltInVariable { name: "Form Classes".into(), token: "{{Form Classes}}".into(), category: "Forms".into(), is_enabled: false },
            BuiltInVariable { name: "Form ID".into(), token: "{{Form ID}}".into(), category: "Forms".into(), is_enabled: true },
            BuiltInVariable { name: "Scroll Depth Threshold".into(), token: "{{Scroll Depth Threshold}}".into(), category: "Scrolling".into(), is_enabled: false },
            BuiltInVariable { name: "Scroll Depth Units".into(), token: "{{Scroll Depth Units}}".into(), category: "Scrolling".into(), is_enabled: false },
            BuiltInVariable { name: "Scroll Direction".into(), token: "{{Scroll Direction}}".into(), category: "Scrolling".into(), is_enabled: false },
            BuiltInVariable { name: "Error Message".into(), token: "{{Error Message}}".into(), category: "Errors".into(), is_enabled: false },
            BuiltInVariable { name: "Error URL".into(), token: "{{Error URL}}".into(), category: "Errors".into(), is_enabled: false },
            BuiltInVariable { name: "Error Line".into(), token: "{{Error Line}}".into(), category: "Errors".into(), is_enabled: false },
        ]
    }
}
