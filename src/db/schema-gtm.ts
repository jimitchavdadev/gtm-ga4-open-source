import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const accounts = sqliteTable("accounts", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	shareData: integer("share_data").notNull().default(0),
	gmpOrgId: text("gmp_org_id"),
	createdAt: integer("created_at").notNull(),
	updatedAt: integer("updated_at").notNull(),
});

export const containers = sqliteTable("containers", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	name: text("name").notNull(),
	publicId: text("public_id").notNull().unique(),
	usageContext: text("usage_context").notNull(), // WEB, SERVER, IOS, ANDROID, AMP
	is360: integer("is_360").notNull().default(0),
	createdAt: integer("created_at").notNull(),
	updatedAt: integer("updated_at").notNull(),
});

export const workspaces = sqliteTable("workspaces", {
	id: text("id").primaryKey(),
	containerId: text("container_id").notNull(),
	name: text("name").notNull(),
	description: text("description"),
	isDefault: integer("is_default").notNull().default(0),
	createdAt: integer("created_at").notNull(),
	updatedAt: integer("updated_at").notNull(),
});

export const containerEntities = sqliteTable("container_entities", {
	id: text("id").primaryKey(),
	workspaceId: text("workspace_id").notNull(),
	entityType: text("entity_type").notNull(), // TAG, TRIGGER, VARIABLE, TEMPLATE, ZONE
	name: text("name").notNull(),
	dataJson: text("data_json").notNull(),
	fingerprint: text("fingerprint").notNull(),
	createdAt: integer("created_at").notNull(),
	updatedAt: integer("updated_at").notNull(),
});

export const containerVersions = sqliteTable("container_versions", {
	id: text("id").primaryKey(),
	containerId: text("container_id").notNull(),
	versionNumber: integer("version_number").notNull(),
	name: text("name"),
	description: text("description"),
	snapshotJson: text("snapshot_json").notNull(),
	createdAt: integer("created_at").notNull(),
});

export const approvalRequests = sqliteTable("approval_requests", {
	id: text("id").primaryKey(),
	workspaceId: text("workspace_id").notNull(),
	status: text("status").notNull(), // PENDING, APPROVED, REJECTED
	requestedBy: text("requested_by").notNull(),
	reviewedBy: text("reviewed_by"),
	commentsJson: text("comments_json"),
	createdAt: integer("created_at").notNull(),
	updatedAt: integer("updated_at").notNull(),
});
