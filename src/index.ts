import { env } from './config/env'
import { createApp } from './app'

const app = createApp().listen(env.port)

console.log(
	`🧠 The Brain is running at http://${app.server?.hostname}:${app.server?.port}`,
)

export type { App } from './app'
