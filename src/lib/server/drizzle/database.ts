import {drizzle, type PostgresJsQueryResultHKT} from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import type {PgTransaction} from 'drizzle-orm/pg-core';
import type {ExtractTablesWithRelations} from 'drizzle-orm';
import * as schema from './schema';

const connectionString = import.meta.env.DATABASE_URL as string;

const client = postgres(connectionString);

export const database = drizzle(client, {schema});

export type Transaction = PgTransaction<
PostgresJsQueryResultHKT,
  typeof schema,
ExtractTablesWithRelations<typeof schema>
>;
