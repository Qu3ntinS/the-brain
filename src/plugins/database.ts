import { Elysia } from 'elysia'
import { db } from '../database/client'

export const database = new Elysia({ name: 'database' }).decorate('db', db)
