import { validatelogin, validateUser,validateUpdate, validateUpdatePassword } from "../middleware/zodvalidation.middleware.js";
import  { verifyJWT } from "../middleware/verifyjwt.middleware.js";
//import users from '../db/schema.js'
import { login, registerUser,logout, refreshAccessToken, getCurrentUser,updateUSerProfile, updatePassword } from "../controller/user.controller.js";
import { Hono } from "hono";


const route = new Hono()


route.post("/registerUser",validateUser,registerUser)
route.post("/login",validatelogin, login)
route.post("/logout", verifyJWT, logout)
route.post("/refreshAccessToken",refreshAccessToken)
route.post("/getCurrentUser", verifyJWT, getCurrentUser)
route.post("/updateuserprofile", verifyJWT, validateUpdate,updateUSerProfile)
route.post("/updatepassword", verifyJWT, validateUpdatePassword, updatePassword)


export default route;