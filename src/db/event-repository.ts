import type { Database } from "bun:sqlite";

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
	constructor(private db: Database) {}

	public createProperty(
		prop: Omit<PropertyRecord, "created_at" | "updated_at">,
	): PropertyRecord {
		const now = Date.now();
		const stmt = this.db.prepare(`
      INSERT INTO ga4_properties (id, account_id, display_name, is_360, data_retention_months, parent_property_id, created_at, updated_at)
      VALUES ($id, $account_id, $display_name, $is_360, $data_retention_months, $parent_property_id, $created_at, $updated_at)
    `);
		stmt.run({
			$id: prop.id,
			$account_id: prop.account_id,
			$display_name: prop.display_name,
			$is_360: prop.is_360,
			$data_retention_months: prop.data_retention_months,
			$parent_property_id: prop.parent_property_id ?? null,
			$created_at: now,
			$updated_at: now,
		});
		return { ...prop, created_at: now, updated_at: now };
	}

	public getProperty(id: string): PropertyRecord | null {
		const stmt = this.db.prepare("SELECT * FROM ga4_properties WHERE id = ?");
		return stmt.get(id) as PropertyRecord | null;
	}

	public createDataStream(
		stream: Omit<DataStreamRecord, "created_at">,
	): DataStreamRecord {
		const now = Date.now();
		const stmt = this.db.prepare(`
      INSERT INTO ga4_data_streams (id, property_id, stream_type, display_name, measurement_id, api_secret, config_json, created_at)
      VALUES ($id, $property_id, $stream_type, $display_name, $measurement_id, $api_secret, $config_json, $created_at)
    `);
		stmt.run({
			$id: stream.id,
			$property_id: stream.property_id,
			$stream_type: stream.stream_type,
			$display_name: stream.display_name,
			$measurement_id: stream.measurement_id,
			$api_secret: stream.api_secret,
			$config_json: stream.config_json,
			$created_at: now,
		});
		return { ...stream, created_at: now };
	}

	public getDataStreamByMeasurementId(
		measurementId: string,
	): DataStreamRecord | null {
		const stmt = this.db.prepare(
			"SELECT * FROM ga4_data_streams WHERE measurement_id = ?",
		);
		return stmt.get(measurementId) as DataStreamRecord | null;
	}

	public insertRawEvent(
		event: Omit<RawEventRecord, "created_at">,
	): RawEventRecord {
		const now = Date.now();
		const stmt = this.db.prepare(`
      INSERT INTO raw_events (id, property_id, stream_id, event_name, client_id, user_id, session_id, timestamp_micros, event_params_json, user_properties_json, items_json, consent_json, is_conversion, created_at)
      VALUES ($id, $property_id, $stream_id, $event_name, $client_id, $user_id, $session_id, $timestamp_micros, $event_params_json, $user_properties_json, $items_json, $consent_json, $is_conversion, $created_at)
    `);
		stmt.run({
			$id: event.id,
			$property_id: event.property_id,
			$stream_id: event.stream_id,
			$event_name: event.event_name,
			$client_id: event.client_id,
			$user_id: event.user_id ?? null,
			$session_id: event.session_id,
			$timestamp_micros: event.timestamp_micros,
			$event_params_json: event.event_params_json,
			$user_properties_json: event.user_properties_json ?? null,
			$items_json: event.items_json ?? null,
			$consent_json: event.consent_json ?? null,
			$is_conversion: event.is_conversion,
			$created_at: now,
		});
		return { ...event, created_at: now };
	}

	public getRecentEvents(propertyId: string, limit = 50): RawEventRecord[] {
		const stmt = this.db.prepare(
			"SELECT * FROM raw_events WHERE property_id = ? ORDER BY timestamp_micros DESC LIMIT ?",
		);
		return stmt.all(propertyId, limit) as RawEventRecord[];
	}
}
