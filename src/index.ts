import { serve } from '@hono/node-server'
import { Hono } from 'hono'

const app = new Hono()

app.get('/user', (c) => {
  return c.text('bt ho bhai ')
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
