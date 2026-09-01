import type { Context,Next } from "hono"
import jwt from "jsonwebtoken"
import { ApiError} from "../utility/ApiError.utility.js"
import { getCookie } from "hono/cookie"










export async function verifyJWT(c: Context, next:Next){
    const token = getCookie(c, "accessToken")||c.req.header("Authorization")?.replace("Bearer ","")
    

    if(!token){
        throw new ApiError(401,"Access token required")
    }


    try{
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!)
        //console.log("decoded token",decoded)
        c.set("user", decoded)
        await next()
    }
    catch(err){
        throw new ApiError(401,"invalid access token")
    }

}