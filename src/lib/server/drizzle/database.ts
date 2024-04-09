import {drizzle} from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = import.meta.env.DATABASE_URL as string;

const client = postgres(connectionString);

export const database = drizzle(client);
