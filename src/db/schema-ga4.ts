import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const ga4Properties = sqliteTable("ga4_properties", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	displayName: text("display_name").notNull(),
	is360: integer("is_360").notNull().default(0),
	dataRetentionMonths: integer("data_retention_months").notNull().default(14),
	parentPropertyId: text("parent_property_id"),
	createdAt: integer("created_at").notNull(),
	updatedAt: integer("updated_at").notNull(),
});

export const ga4DataStreams = sqliteTable("ga4_data_streams", {
	id: text("id").primaryKey(),
	propertyId: text("property_id").notNull(),
	streamType: text("stream_type").notNull(), // WEB, IOS, ANDROID
	displayName: text("display_name").notNull(),
	measurementId: text("measurement_id").notNull().unique(),
	apiSecret: text("api_secret").notNull(),
	configJson: text("config_json").notNull(),
	createdAt: integer("created_at").notNull(),
});

export const rawEvents = sqliteTable("raw_events", {
	id: text("id").primaryKey(),
	propertyId: text("property_id").notNull(),
	streamId: text("stream_id").notNull(),
	eventName: text("event_name").notNull(),
	clientId: text("client_id").notNull(),
	userId: text("user_id"),
	sessionId: integer("session_id").notNull(),
	timestampMicros: integer("timestamp_micros").notNull(),
	eventParamsJson: text("event_params_json").notNull(),
	userPropertiesJson: text("user_properties_json"),
	itemsJson: text("items_json"),
	consentJson: text("consent_json"),
	isConversion: integer("is_conversion").notNull().default(0),
	createdAt: integer("created_at").notNull(),
});

export const sessions = sqliteTable("sessions", {
	id: text("id").primaryKey(),
	propertyId: text("property_id").notNull(),
	clientId: text("client_id").notNull(),
	sessionId: integer("session_id").notNull(),
	sessionNumber: integer("session_number").notNull(),
	startTimestamp: integer("start_timestamp").notNull(),
	lastTimestamp: integer("last_timestamp").notNull(),
	engagementTimeMs: integer("engagement_time_ms").notNull().default(0),
	pageViewCount: integer("page_view_count").notNull().default(0),
	hasKeyEvent: integer("has_key_event").notNull().default(0),
	isEngaged: integer("is_engaged").notNull().default(0),
	trafficSourceJson: text("traffic_source_json"),
});

export const annotations = sqliteTable("annotations", {
	id: text("id").primaryKey(),
	propertyId: text("property_id").notNull(),
	title: text("title").notNull(),
	description: text("description").notNull(),
	date: text("date").notNull(),
	color: text("color").notNull(),
	createdAt: integer("created_at").notNull(),
});
