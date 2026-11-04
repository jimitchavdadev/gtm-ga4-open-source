import { DatabaseSync } from "node:sqlite";
import { CREATE_TABLES_SQL } from "./schema";

export type SqliteDatabase = DatabaseSync;

export class DatabaseManager {
	private db: DatabaseSync;

	constructor(dbPath: string = ":memory:") {
		this.db = new DatabaseSync(dbPath);
		this.db.exec("PRAGMA foreign_keys = ON;");
		this.db.exec("PRAGMA journal_mode = WAL;");
		this.initialize();
	}

	private initialize(): void {
		this.db.exec(CREATE_TABLES_SQL);
	}

	public getDb(): DatabaseSync {
		return this.db;
	}

	public close(): void {
		this.db.close();
	}

	public reset(): void {
		const tables = [
			"sessions",
			"raw_events",
			"ga4_data_streams",
			"ga4_properties",
			"approval_requests",
			"container_versions",
			"container_entities",
			"workspaces",
			"containers",
			"accounts",
		];
		for (const table of tables) {
			this.db.exec(`DROP TABLE IF EXISTS ${table};`);
		}
		this.initialize();
	}
}
