import { drizzle } from "drizzle-orm/sqlite-proxy";
import * as schema from "./drizzle-schema";

export const orm = drizzle(async () => ({ rows: [] }), { schema });
export { and, asc, desc, eq, sql } from "drizzle-orm";
export * as schema from "./drizzle-schema";
