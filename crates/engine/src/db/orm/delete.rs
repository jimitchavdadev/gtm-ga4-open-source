use super::types::{ComparisonOp, SqlValue, WhereClause};
use crate::db::connector::DatabaseEngine;

pub struct DeleteBuilder {
    table: &'static str,
    where_clauses: Vec<WhereClause>,
}

impl DeleteBuilder {
    pub fn from_table(table: &'static str) -> Self {
        Self {
            table,
            where_clauses: Vec::new(),
        }
    }

    pub fn where_eq(mut self, column: &'static str, val: impl Into<SqlValue>) -> Self {
        self.where_clauses.push(WhereClause {
            column,
            op: ComparisonOp::Eq,
            value: val.into(),
        });
        self
    }

    pub fn build(&self, engine: DatabaseEngine) -> (String, Vec<SqlValue>) {
        let mut sql = format!("DELETE FROM {}", self.table);
        let mut values = Vec::new();

        if !self.where_clauses.is_empty() {
            let mut param_idx = 1;
            let parts: Vec<String> = self
                .where_clauses
                .iter()
                .map(|w| {
                    let placeholder = match engine {
                        DatabaseEngine::Postgres => format!("${}", param_idx),
                        _ => format!("?{}", param_idx),
                    };
                    param_idx += 1;
                    values.push(w.value.clone());
                    format!("{} = {}", w.column, placeholder)
                })
                .collect();
            sql.push_str(&format!(" WHERE {}", parts.join(" AND ")));
        }

        (sql, values)
    }
}
