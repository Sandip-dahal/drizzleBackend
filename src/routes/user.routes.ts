import { validatelogin, validateUser } from "../middleware/zodvalidation.middleware.js";
//import users from '../db/schema.js'
import { login, registerUser } from "../controller/user.controller.js";
import { Hono } from "hono";


const route = new Hono()


route.post("/registerUser",validateUser,registerUser)
route.post("/login",validatelogin, login)


export default route;