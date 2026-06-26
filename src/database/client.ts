import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { env } from '../config/env'
import * as schema from './schema'

const client = postgres(env.databaseUrl, {
	max: 10,
	idle_timeout: 20,
	connect_timeout: 10,
})

export const db = drizzle(client, { schema })

export const checkDatabase = async () => {
	try {
		await client`SELECT 1`
		return { ok: true as const }
	} catch (error) {
		return {
			ok: false as const,
			error:
				error instanceof Error ? error.message : 'Unknown database error',
		}
	}
}

export const closeDatabase = async () => {
	await client.end()
}
