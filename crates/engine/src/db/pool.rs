use rusqlite::{Connection, Result};
use std::sync::{Arc, Mutex};

#[derive(Clone)]
pub struct DatabasePool {
    conn: Arc<Mutex<Connection>>,
}

impl DatabasePool {
    pub fn new_in_memory() -> Result<Self> {
        let conn = Connection::open_in_memory()?;
        super::schema::init_database(&conn)?;
        Ok(Self {
            conn: Arc::new(Mutex::new(conn)),
        })
    }

    pub fn new_file(path: &str) -> Result<Self> {
        let conn = Connection::open(path)?;
        super::schema::init_database(&conn)?;
        Ok(Self {
            conn: Arc::new(Mutex::new(conn)),
        })
    }

    pub fn with_conn<F, R>(&self, f: F) -> Result<R>
    where
        F: FnOnce(&Connection) -> Result<R>,
    {
        let lock = self.conn.lock().unwrap();
        f(&lock)
    }

    pub fn with_conn_mut<F, R>(&self, f: F) -> Result<R>
    where
        F: FnOnce(&mut Connection) -> Result<R>,
    {
        let mut lock = self.conn.lock().unwrap();
        f(&mut lock)
    }
}
