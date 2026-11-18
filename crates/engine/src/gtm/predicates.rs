use regex::Regex;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum PredicateOperator {
    Equals,
    DoesNotEqual,
    Contains,
    DoesNotContain,
    StartsWith,
    EndsWith,
    RegexMatch,
    GreaterThan,
    LessThan,
    GreaterOrEqual,
    LessOrEqual,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PredicateFilter {
    pub operator: PredicateOperator,
    pub arg0: String,
    pub arg1: String,
    #[serde(default)]
    pub ignore_case: bool,
    #[serde(default)]
    pub negate: bool,
}

impl PredicateFilter {
    pub fn new(op: PredicateOperator, arg0: &str, arg1: &str) -> Self {
        Self {
            operator: op,
            arg0: arg0.to_string(),
            arg1: arg1.to_string(),
            ignore_case: false,
            negate: false,
        }
    }

    pub fn with_ignore_case(mut self, ignore: bool) -> Self {
        self.ignore_case = ignore;
        self
    }

    pub fn with_negate(mut self, negate: bool) -> Self {
        self.negate = negate;
        self
    }

    pub fn evaluate(&self) -> bool {
        let (val0, val1) = if self.ignore_case {
            (self.arg0.to_lowercase(), self.arg1.to_lowercase())
        } else {
            (self.arg0.clone(), self.arg1.clone())
        };

        let result = match self.operator {
            PredicateOperator::Equals => val0 == val1,
            PredicateOperator::DoesNotEqual => val0 != val1,
            PredicateOperator::Contains => val0.contains(&val1),
            PredicateOperator::DoesNotContain => !val0.contains(&val1),
            PredicateOperator::StartsWith => val0.starts_with(&val1),
            PredicateOperator::EndsWith => val0.ends_with(&val1),
            PredicateOperator::RegexMatch => {
                let pattern = if self.ignore_case {
                    format!("(?i){}", self.arg1)
                } else {
                    self.arg1.clone()
                };
                Regex::new(&pattern).map(|r| r.is_match(&self.arg0)).unwrap_or(false)
            }
            PredicateOperator::GreaterThan => {
                let n0: f64 = val0.parse().unwrap_or(0.0);
                let n1: f64 = val1.parse().unwrap_or(0.0);
                n0 > n1
            }
            PredicateOperator::LessThan => {
                let n0: f64 = val0.parse().unwrap_or(0.0);
                let n1: f64 = val1.parse().unwrap_or(0.0);
                n0 < n1
            }
            PredicateOperator::GreaterOrEqual => {
                let n0: f64 = val0.parse().unwrap_or(0.0);
                let n1: f64 = val1.parse().unwrap_or(0.0);
                n0 >= n1
            }
            PredicateOperator::LessOrEqual => {
                let n0: f64 = val0.parse().unwrap_or(0.0);
                let n1: f64 = val1.parse().unwrap_or(0.0);
                n0 <= n1
            }
        };

        if self.negate {
            !result
        } else {
            result
        }
    }
}
