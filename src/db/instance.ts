import { DatabaseManager } from "./connection";
import { EntityRepository } from "./entity-repository";
import { EventRepository } from "./event-repository";
import { eq, orm, schema } from "./orm-client";
import { AnalyticsRepository } from "./repository";

// Global singleton instance for Next.js server runtime
const globalForDb = globalThis as unknown as {
	dbManager?: DatabaseManager;
};

const dbPath = process.env.DATABASE_PATH || ":memory:";
export const dbManager = globalForDb.dbManager ?? new DatabaseManager(dbPath);

if (process.env.NODE_ENV !== "production") {
	globalForDb.dbManager = dbManager;
}

const db = dbManager.getDb();
export const analyticsRepo = new AnalyticsRepository(db);
export const eventRepo = new EventRepository(db);
export const entityRepo = new EntityRepository(db);

export function seedDefaults() {
	const q = orm
		.select()
		.from(schema.accounts)
		.where(eq(schema.accounts.id, "acc_1"))
		.toSQL();
	const hasAcc = db.prepare(q.sql).get(...(q.params as any[]));
	if (!hasAcc) {
		const now = Date.now();
		db.exec(`
      INSERT OR IGNORE INTO accounts (id, name, share_data, created_at, updated_at)
      VALUES ('acc_1', 'Default Organization', 0, ${now}, ${now});

      INSERT OR IGNORE INTO containers (id, account_id, name, public_id, usage_context, is_360, created_at, updated_at)
      VALUES ('GTM-OPENSOURCE', 'acc_1', 'Production Container', 'GTM-OPENSOURCE', 'WEB', 1, ${now}, ${now});

      INSERT OR IGNORE INTO workspaces (id, container_id, name, is_default, created_at, updated_at)
      VALUES ('ws_default', 'GTM-OPENSOURCE', 'Default Workspace', 1, ${now}, ${now});

      INSERT OR IGNORE INTO ga4_properties (id, account_id, display_name, is_360, data_retention_months, created_at, updated_at)
      VALUES ('prop_1', 'acc_1', 'Production GA4 Property', 1, 14, ${now}, ${now});

      INSERT OR IGNORE INTO ga4_data_streams (id, property_id, stream_type, display_name, measurement_id, api_secret, config_json, created_at)
      VALUES ('stream_1', 'prop_1', 'WEB', 'Web Data Stream', 'G-TESTSTREAM', 'sec_123', '{}', ${now});

      CREATE TABLE IF NOT EXISTS annotations (
        id TEXT PRIMARY KEY,
        property_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        date TEXT NOT NULL,
        color TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );

      INSERT OR IGNORE INTO annotations (id, property_id, title, description, date, color, created_at)
      VALUES 
        ('ann_1', 'prop_1', 'Black Friday Sale 2026', 'Annual site-wide 30% discount promo launched.', '2026-11-20', '#188038', ${now}),
        ('ann_2', 'prop_1', 'Cart Checkout Service Outage', 'Upstream payment gateway timeout incident for 42 minutes.', '2026-11-14', '#d93025', ${now}),
        ('ann_3', 'prop_1', 'Redesigned Product Detail Page', 'Frontend migration to Next.js Turbopack template.', '2026-11-05', '#1a73e8', ${now});
    `);
	}
}

seedDefaults();
