import type { SqliteDatabase } from "./connection";
import { desc, eq, orm, schema } from "./orm-client";

export interface PropertyRecord {
	id: string;
	account_id: string;
	display_name: string;
	is_360: number;
	data_retention_months: number;
	parent_property_id?: string | null;
	created_at: number;
	updated_at: number;
}

export interface DataStreamRecord {
	id: string;
	property_id: string;
	stream_type: string;
	display_name: string;
	measurement_id: string;
	api_secret: string;
	config_json: string;
	created_at: number;
}

export interface RawEventRecord {
	id: string;
	property_id: string;
	stream_id: string;
	event_name: string;
	client_id: string;
	user_id?: string | null;
	session_id: number;
	timestamp_micros: number;
	event_params_json: string;
	user_properties_json?: string | null;
	items_json?: string | null;
	consent_json?: string | null;
	is_conversion: number;
	created_at: number;
}

export class EventRepository {
	constructor(private db: SqliteDatabase) {}

	public createProperty(
		prop: Omit<PropertyRecord, "created_at" | "updated_at">,
	): PropertyRecord {
		const now = Date.now();
		const q = orm
			.insert(schema.ga4Properties)
			.values({
				id: prop.id,
				accountId: prop.account_id,
				displayName: prop.display_name,
				is360: prop.is_360,
				dataRetentionMonths: prop.data_retention_months,
				parentPropertyId: prop.parent_property_id ?? null,
				createdAt: now,
				updatedAt: now,
			})
			.toSQL();

		this.db.prepare(q.sql).run(...(q.params as any[]));
		return { ...prop, created_at: now, updated_at: now };
	}

	public getProperty(id: string): PropertyRecord | null {
		const q = orm
			.select()
			.from(schema.ga4Properties)
			.where(eq(schema.ga4Properties.id, id))
			.toSQL();

		const row = this.db.prepare(q.sql).get(...(q.params as any[])) as any;
		return row
			? {
					id: row.id,
					account_id: row.account_id,
					display_name: row.display_name,
					is_360: row.is_360,
					data_retention_months: row.data_retention_months,
					parent_property_id: row.parent_property_id,
					created_at: row.created_at,
					updated_at: row.updated_at,
				}
			: null;
	}

	public createDataStream(
		stream: Omit<DataStreamRecord, "created_at">,
	): DataStreamRecord {
		const now = Date.now();
		const q = orm
			.insert(schema.ga4DataStreams)
			.values({
				id: stream.id,
				propertyId: stream.property_id,
				streamType: stream.stream_type,
				displayName: stream.display_name,
				measurementId: stream.measurement_id,
				apiSecret: stream.api_secret,
				configJson: stream.config_json,
				createdAt: now,
			})
			.toSQL();

		this.db.prepare(q.sql).run(...(q.params as any[]));
		return { ...stream, created_at: now };
	}

	public getDataStreamByMeasurementId(
		measurementId: string,
	): DataStreamRecord | null {
		const q = orm
			.select()
			.from(schema.ga4DataStreams)
			.where(eq(schema.ga4DataStreams.measurementId, measurementId))
			.toSQL();

		const row = this.db.prepare(q.sql).get(...(q.params as any[])) as any;
		return row
			? {
					id: row.id,
					property_id: row.property_id,
					stream_type: row.stream_type,
					display_name: row.display_name,
					measurement_id: row.measurement_id,
					api_secret: row.api_secret,
					config_json: row.config_json,
					created_at: row.created_at,
				}
			: null;
	}

	public insertRawEvent(
		event: Omit<RawEventRecord, "created_at">,
	): RawEventRecord {
		const now = Date.now();
		const q = orm
			.insert(schema.rawEvents)
			.values({
				id: event.id,
				propertyId: event.property_id,
				streamId: event.stream_id,
				eventName: event.event_name,
				clientId: event.client_id,
				userId: event.user_id ?? null,
				sessionId: event.session_id,
				timestampMicros: event.timestamp_micros,
				eventParamsJson: event.event_params_json,
				userPropertiesJson: event.user_properties_json ?? null,
				itemsJson: event.items_json ?? null,
				consentJson: event.consent_json ?? null,
				isConversion: event.is_conversion,
				createdAt: now,
			})
			.toSQL();

		this.db.prepare(q.sql).run(...(q.params as any[]));
		return { ...event, created_at: now };
	}

	public getRecentEvents(propertyId: string, limit = 50): RawEventRecord[] {
		const q = orm
			.select()
			.from(schema.rawEvents)
			.where(eq(schema.rawEvents.propertyId, propertyId))
			.orderBy(desc(schema.rawEvents.timestampMicros))
			.limit(limit)
			.toSQL();

		const rows = this.db.prepare(q.sql).all(...(q.params as any[])) as any[];
		return rows.map((r) => ({
			id: r.id,
			property_id: r.property_id,
			stream_id: r.stream_id,
			event_name: r.event_name,
			client_id: r.client_id,
			user_id: r.user_id,
			session_id: r.session_id,
			timestamp_micros: r.timestamp_micros,
			event_params_json: r.event_params_json,
			user_properties_json: r.user_properties_json,
			items_json: r.items_json,
			consent_json: r.consent_json,
			is_conversion: r.is_conversion,
			created_at: r.created_at,
		}));
	}
}
