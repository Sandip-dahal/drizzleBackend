import type { Context } from "hono";
import { db } from "../db/db.js";
import { users } from "../db/schema.js";
import type {register, logintype } from "../middleware/zodvalidation.middleware.js"
import { ApiError } from "../utility/ApiError.utility.js";
import argon2 from 'argon2'
import { eq } from "drizzle-orm";
import { uploadOnCloudinary } from "../utility/cloudinary.utility.js";



type registers = Context<any, any, {in:{ form:register}; out: { form:register}}>


const MAX_SIZE = 5*1024*1024;
const registerUser = async(c:registers) =>{

    const userData = c.req.valid("form")

    const user =  await c.req.parseBody()
    const profileFile = user.profile

    

    if(!(profileFile instanceof File)){
        throw new ApiError(400, "profile picture is required")
    }

        if(!profileFile.type.startsWith("image/")){
            throw new ApiError(400,"profile must be an image")

        }
        if(profileFile.size > MAX_SIZE){
            throw new ApiError(400, "profile must be under 5 MB")
        }

        const buffer = Buffer.from(await profileFile.arrayBuffer())
        const profileUrl = await uploadOnCloudinary(buffer)
        
        if(!profileUrl){
            throw new ApiError(500, "Failed to uploda profile pic to cloudianary")
        }

    const hashedPassword = await argon2.hash(userData.password)

try {
        const [createdUser] = await db
        .insert(users)
        .values({...userData, password: hashedPassword, profile: profileUrl })
        .returning()

        const{password,id,...safeUser} = createdUser;
    
    
    
        return c.json({
            success:true,
            message:"user data received",
            data:safeUser,
        } ,201);
} catch (err: unknown) {


    //this is for unique voilation.....
    if(err && 
        typeof err ==="object" && 
        "code" in err &&
        "constraint" in err &&
        err.code ==="23505" && err.constraint ==="users_email_unique")
        {

    throw new ApiError(409,"user already exists")
    
}
throw err

}
}


type  loginType = Context <any, any, {in:{ json:logintype}; out:{ json:logintype}}>
const login = async(c:loginType) =>{
    const {email,password} = c.req.valid("json")


    if(!email){
        throw new ApiError(401,"email is required")
    }

    const [existingUser] = await db.select().from(users).where(eq(users.email,email))

    if(!existingUser){
        throw new ApiError(401,"Invalid email")
    }

    const isPasswordCorrect = await argon2.verify(existingUser.password, password)

    if(!isPasswordCorrect){
        throw new ApiError(401,"Please enter the correct password")
    }

    const { password: _password,id,...safeuser} = existingUser

    return c.json({
        success: true,
        message:"login successfull",
        data: safeuser,

    },200)


}


export { registerUser, login }
