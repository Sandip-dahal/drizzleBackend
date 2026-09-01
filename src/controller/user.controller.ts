import type { Context } from "hono";
import { db } from "../db/db.js";
import { users } from "../db/schema.js";
import type {register, logintype,updateUserType } from "../middleware/zodvalidation.middleware.js"
import { ApiError } from "../utility/ApiError.utility.js";
import argon2 from 'argon2'
import { eq } from "drizzle-orm";
import { uploadOnCloudinary } from "../utility/cloudinary.utility.js";
import { generateAccessToken, generateRefreshToken } from "../utility/accesstoken.utility.js";
import { deleteCookie, setCookie, getCookie } from "hono/cookie";
import jwt from "jsonwebtoken"



const generateAccessTokenAndRefreshToken = async(user:{id:string,email:string}) =>{

    try{
    const [userData] = await db.select().from(users).where(eq(users.id,user.id))
    //console.log("userData", userData)

    if(!userData){
        throw new ApiError(404,"User not found")
    }

    const accessToken = generateAccessToken(userData)
    const refreshToken = generateRefreshToken(userData)

    
    await db.update(users).set({refreshToken:refreshToken}).where(eq(users.id,userData.id))

    return { accessToken, refreshToken }
}
catch(err) {
    throw new ApiError(500,"Failed to generate access token and refresh token")
}
    }






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

    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(existingUser)

    await db.update(users).set({refreshToken:refreshToken}).where (eq(users.id,existingUser.id))
    const options = {
        httpOnly:true,
        secure: true,
        sameSite: "strict" as const,
        maxAge: 10*24*60*60
    }

    setCookie(c, "refreshToken", refreshToken,options)
    setCookie(c, "accessToken", accessToken, options)

    const { password: _password,id,...safeuser} = existingUser

    return c.json({
        success: true,
        message:"login successfull",
        data: safeuser,

    },200)


}

const logout = async(c:Context) =>{
    const user = c.get("user") as { id:string, email:string}
    await db.update(users).set({refreshToken:null}).where(eq(users.id,user.id))
    
    deleteCookie(c,"accessToken")
    deleteCookie(c,"refreshToken")

    return c.json({
        success: true,
        message: "logout successfull"
    },201)
}

const refreshAccessToken = async(c:Context) =>{
    const inCommingRefreshToken = getCookie(c,"refreshToken")

    if(!inCommingRefreshToken){
        throw new ApiError(401,"Refresh token is required")
    }

    try{
        const decodedToken = jwt.verify(
            inCommingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET! as string
        ) as jwt.JwtPayload & {id: string}

        const [user] = await db.select().from(users).where(eq(users.id,decodedToken.id))

        if(!user){
            throw new ApiError(404, "user not found")
        }

        if(user.refreshToken !== inCommingRefreshToken){
            throw new ApiError(401,"Invalid refresh token")
        }

        const { accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user)
        await db.update(users).set({refreshToken:refreshToken}).where(eq(users.id,user.id))

        const options = {
            httpOnly:true,
            secure: true,
            sameSite: "strict" as const,
        }

        setCookie(c,"accessToken", accessToken,options)
        setCookie(c, "refreshToken",refreshToken, options)

        return c.json({
            success:true,
            message: "Access token Refreshed Successfully",
            data: {accessToken}

        },200)
    }
    catch(err){
        throw new ApiError(401,"Invalid refresh token")
    }

}


const getCurrentUser = async(c:Context) =>{
    const user = c.get("user");
    return c.json({
        success:true,
        message:"Current user is fetched successfully",
        data :{user}
    },200)


}


type UserType = Context <any, any, {in:{json:updateUserType}; out:{json:updateUserType}}>
const updateUSerProfile = async(c:UserType) =>{
    const user = c.get("user");
    const newData = c.req.valid("json")



    const [updatedUser] = await db.update(users).set(newData).where(eq(users.id,user.id)).returning()

    const{password,refreshToken, ...safeUser} = updatedUser

    return c.json({
        success: true,
        message: "user Data is updated successfully",
        data : safeUser
    })
    

}

const updatePassword = async(c:Context) =>{
    const user = c.get("user")
    const { oldPassword, newPassword} = await c.req.json()

    const [currentUSer] = await db.select().from(users).where(eq(users.id,user.id))

    if(!currentUSer){
        throw new ApiError(404, "User not found")
    }

    const isOldPasswordCorrect = await argon2.verify(currentUSer.password, oldPassword)

    if(!isOldPasswordCorrect){
        throw new ApiError(401, "Old Password is incorrect")
    }

    if(oldPassword === newPassword){
        throw new ApiError(400,"new Pasword must be different form old password")
    }

    const newHashPassword = await argon2.hash(newPassword)
    
    await db.update(users).set({password:newHashPassword, refreshToken: null}).where(eq(users.id,currentUSer.id))

    deleteCookie(c,"accessToken")
    deleteCookie(c,"refreshToken")

    return c.json({
        success: true,
        message: "password update successfully",
    })



}





export { registerUser, login,logout, refreshAccessToken,getCurrentUser, updateUSerProfile, updatePassword} 
