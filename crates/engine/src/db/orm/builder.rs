use super::types::{ComparisonOp, OrderDirection, SqlValue, WhereClause};
use crate::db::connector::DatabaseEngine;

pub struct SelectBuilder {
    table: &'static str,
    columns: Vec<&'static str>,
    where_clauses: Vec<WhereClause>,
    order_by: Option<(&'static str, OrderDirection)>,
    limit: Option<usize>,
}

impl SelectBuilder {
    pub fn from_table(table: &'static str) -> Self {
        Self {
            table,
            columns: Vec::new(),
            where_clauses: Vec::new(),
            order_by: None,
            limit: None,
        }
    }

    pub fn columns(mut self, cols: &[&'static str]) -> Self {
        self.columns = cols.to_vec();
        self
    }

    pub fn where_eq(mut self, column: &'static str, val: impl Into<SqlValue>) -> Self {
        self.where_clauses.push(WhereClause {
            column,
            op: ComparisonOp::Eq,
            value: val.into(),
        });
        self
    }

    pub fn order_by(mut self, column: &'static str, dir: OrderDirection) -> Self {
        self.order_by = Some((column, dir));
        self
    }

    pub fn limit(mut self, n: usize) -> Self {
        self.limit = Some(n);
        self
    }

    pub fn build(&self, engine: DatabaseEngine) -> (String, Vec<SqlValue>) {
        let cols_str = if self.columns.is_empty() {
            "*".to_string()
        } else {
            self.columns.join(", ")
        };

        let mut sql = format!("SELECT {} FROM {}", cols_str, self.table);
        let mut values = Vec::new();
        let mut param_idx = 1;

        if !self.where_clauses.is_empty() {
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

        if let Some((col, dir)) = self.order_by {
            let dir_str = match dir {
                OrderDirection::Asc => "ASC",
                OrderDirection::Desc => "DESC",
            };
            sql.push_str(&format!(" ORDER BY {} {}", col, dir_str));
        }

        if let Some(n) = self.limit {
            let placeholder = match engine {
                DatabaseEngine::Postgres => format!("${}", param_idx),
                _ => format!("?{}", param_idx),
            };
            values.push(SqlValue::Int(n as i64));
            sql.push_str(&format!(" LIMIT {}", placeholder));
        }

        (sql, values)
    }
}

pub struct InsertBuilder {
    table: &'static str,
    columns: Vec<&'static str>,
    values: Vec<SqlValue>,
    on_conflict_update_cols: Option<Vec<&'static str>>,
}

impl InsertBuilder {
    pub fn into_table(table: &'static str) -> Self {
        Self {
            table,
            columns: Vec::new(),
            values: Vec::new(),
            on_conflict_update_cols: None,
        }
    }

    pub fn columns(mut self, cols: &[&'static str]) -> Self {
        self.columns = cols.to_vec();
        self
    }

    pub fn values(mut self, vals: Vec<SqlValue>) -> Self {
        self.values = vals;
        self
    }

    pub fn on_conflict_do_update(mut self, update_cols: &[&'static str]) -> Self {
        self.on_conflict_update_cols = Some(update_cols.to_vec());
        self
    }

    pub fn build(&self, engine: DatabaseEngine) -> (String, Vec<SqlValue>) {
        let cols_str = self.columns.join(", ");
        let placeholders: Vec<String> = (1..=self.values.len())
            .map(|i| match engine {
                DatabaseEngine::Postgres => format!("${}", i),
                _ => format!("?{}", i),
            })
            .collect();

        let mut sql = format!(
            "INSERT INTO {} ({}) VALUES ({})",
            self.table,
            cols_str,
            placeholders.join(", ")
        );

        if let Some(ref update_cols) = self.on_conflict_update_cols {
            let set_clauses: Vec<String> = update_cols
                .iter()
                .map(|c| format!("{}=excluded.{}", c, c))
                .collect();
            sql.push_str(&format!(
                " ON CONFLICT(id) DO UPDATE SET {}",
                set_clauses.join(", ")
            ));
        }

        (sql, self.values.clone())
    }
}
