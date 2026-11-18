use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum DefinitionScope {
    Event,
    User,
    Item,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CustomDimension {
    pub parameter_name: String,
    pub display_name: String,
    pub description: String,
    pub scope: DefinitionScope,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CustomMetric {
    pub parameter_name: String,
    pub display_name: String,
    pub description: String,
    pub measurement_unit: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum PropertyTier {
    Standard,
    Analytics360,
}

pub struct CustomDefinitionsManager {
    tier: PropertyTier,
    dimensions: Vec<CustomDimension>,
    metrics: Vec<CustomMetric>,
}

impl CustomDefinitionsManager {
    pub fn new(tier: PropertyTier) -> Self {
        Self {
            tier,
            dimensions: Vec::new(),
            metrics: Vec::new(),
        }
    }

    pub fn max_event_dimensions(&self) -> usize {
        match self.tier {
            PropertyTier::Standard => 50,
            PropertyTier::Analytics360 => 125,
        }
    }

    pub fn max_user_dimensions(&self) -> usize {
        match self.tier {
            PropertyTier::Standard => 25,
            PropertyTier::Analytics360 => 100,
        }
    }

    pub fn max_metrics(&self) -> usize {
        match self.tier {
            PropertyTier::Standard => 50,
            PropertyTier::Analytics360 => 125,
        }
    }

    pub fn add_dimension(&mut self, dim: CustomDimension) -> Result<(), String> {
        let count = self.dimensions.iter().filter(|d| d.scope == dim.scope).count();
        let limit = match dim.scope {
            DefinitionScope::Event => self.max_event_dimensions(),
            DefinitionScope::User => self.max_user_dimensions(),
            DefinitionScope::Item => 10,
        };
        if count >= limit {
            return Err(format!("Quota exceeded for {:?} dimensions (limit: {})", dim.scope, limit));
        }
        self.dimensions.push(dim);
        Ok(())
    }

    pub fn add_metric(&mut self, met: CustomMetric) -> Result<(), String> {
        if self.metrics.len() >= self.max_metrics() {
            return Err(format!("Quota exceeded for custom metrics (limit: {})", self.max_metrics()));
        }
        self.metrics.push(met);
        Ok(())
    }

    pub fn evaluate_formula(formula: &str, variables: &std::collections::HashMap<String, f64>) -> f64 {
        let mut expr = formula.to_string();
        for (k, v) in variables {
            expr = expr.replace(&format!("{{{}}}", k), &v.to_string());
        }
        // Simple 2-operand evaluator for basic formulas like {revenue} / {transactions}
        if expr.contains('/') {
            let parts: Vec<&str> = expr.split('/').collect();
            let a: f64 = parts[0].trim().parse().unwrap_or(0.0);
            let b: f64 = parts[1].trim().parse().unwrap_or(1.0);
            if b == 0.0 { 0.0 } else { a / b }
        } else if expr.contains('*') {
            let parts: Vec<&str> = expr.split('*').collect();
            let a: f64 = parts[0].trim().parse().unwrap_or(0.0);
            let b: f64 = parts[1].trim().parse().unwrap_or(0.0);
            a * b
        } else {
            expr.trim().parse().unwrap_or(0.0)
        }
    }
}
