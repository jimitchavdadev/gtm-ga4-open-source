use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum SqlValue {
    Text(String),
    Int(i64),
    Float(f64),
    Bool(bool),
    Null,
    Json(serde_json::Value),
}

impl From<&str> for SqlValue {
    fn from(s: &str) -> Self {
        Self::Text(s.to_string())
    }
}

impl From<String> for SqlValue {
    fn from(s: String) -> Self {
        Self::Text(s)
    }
}

impl From<i64> for SqlValue {
    fn from(i: i64) -> Self {
        Self::Int(i)
    }
}

impl From<usize> for SqlValue {
    fn from(u: usize) -> Self {
        Self::Int(u as i64)
    }
}

impl From<bool> for SqlValue {
    fn from(b: bool) -> Self {
        Self::Bool(b)
    }
}

impl From<f64> for SqlValue {
    fn from(f: f64) -> Self {
        Self::Float(f)
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum OrderDirection {
    Asc,
    Desc,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ComparisonOp {
    Eq,
    NotEq,
    Gt,
    Lt,
    In,
}

#[derive(Debug, Clone, PartialEq)]
pub struct WhereClause {
    pub column: &'static str,
    pub op: ComparisonOp,
    pub value: SqlValue,
}
