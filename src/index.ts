import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import userRoutes from "./routes/user.routes.js"
import {cors} from "hono/cors"

const app = new Hono()

app.use("*",cors())

app.route("/api/v1/user", userRoutes)




app.onError((err,c)=>{
  console.error(err)
  return c.json({
    success:false,
    message:"internal server error"
  }, 500)
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
