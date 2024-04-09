import {drizzle} from 'drizzle-orm/postgres-js';
import {migrate} from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;

const client = postgres(connectionString);

export const database = drizzle(client);

await migrate(database, {migrationsFolder: 'drizzle'});

await client.end();
