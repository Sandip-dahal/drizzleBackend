import type { Context } from "hono";
import { db } from "../db/db.js";
import { 
    users , 
    emailOtp
} from "../db/schema.js";

import type {
    register,
    validateResendOtpType,
    logintype,updateUserType,
    forgetPasswordType,
    updatePasswordType,
    validateOtpType,
    validateResetType
} from "../middleware/zodvalidation.middleware.js"

import { ApiError } from "../utility/ApiError.utility.js";
import argon2 from 'argon2'
import { desc, eq, and,sql } from "drizzle-orm";
import { uploadOnCloudinary } from "../utility/cloudinary.utility.js";
import { 
    generateAccessToken, 
    generateRefreshToken 
} from "../utility/accesstoken.utility.js";

import { 
    deleteCookie, 
    setCookie, 
    getCookie 
} from "hono/cookie";

import jwt from "jsonwebtoken"
import crypto from "node:crypto"
import { sendOtpEmail } from "../services/email.services.js";
import { jwtVerify, SignJWT} from "jose"
import { generateAndVerificationOtp } from "../services/otp.service.js"
import { email } from "zod";







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

        const otp = crypto.randomInt(100000,1000000).toString()
        const otpHash = await argon2.hash(otp)
        console.log("OTP:",otp)
        const expiresAt = new Date( Date.now() +10 *60 *1000)

        await db.insert(emailOtp).values({
            userId:createdUser.id,
            otpHash: otpHash,
            expiresAt:expiresAt,
            purpose: "email-verification"

        })

        //send otp........
        await sendOtpEmail(createdUser.email,otp,"email-verification")

        const{password,id,...safeUser} = createdUser;
    
    
    
        return c.json({
            success:true,
            message:"user data received, otp send to user",
            data:safeUser,
        } ,201);
} catch (err: unknown) {


    //this is for unique voilation.....
    if(err && 
        typeof err ==="object" && 
        "code" in err &&
        "constraint" in err &&
        err.code ==="23505" && err.constraint ==="user_email_unique")
        {

    throw new ApiError(409,"user already exists")
    
}
throw err

}
}


type verifyEmailType = Context<any, any, {in:{json:validateOtpType}; out:{json:validateOtpType}}>
const verifyEmail = async(c:verifyEmailType) =>{
    const {email,otp} = c.req.valid("json")

    const [user] = await db.select().from(users).where(eq(users.email,email))

    if(!user){
        throw new ApiError(401, "User not Found")
    }

    if(user.emailVerified === true){
        throw new ApiError(400,"Email is Already Verified")
    }

    const [otpRecord] = await db
                            .select()
                            .from(emailOtp)
                            .where(
                                and(
                                    eq(emailOtp.userId,user.id),
                                    eq(emailOtp.purpose, "email-verification")
                                )).orderBy(desc(emailOtp.createdAt)).limit(1)

    
    
    if(!otpRecord){
        throw new ApiError(400,"Invalid or otp expired")
    }

    if(otpRecord.expiresAt < new Date()){
        throw new ApiError(400, "OTP has expired")
    }
    if(otpRecord.attempts>= 5){
        throw new ApiError(429,"Too many incorrect attempts")
    }

    const isValid = await argon2.verify(otpRecord.otpHash, otp)

    if(!isValid){
        await db
        .update(emailOtp)
        .set({attempts: sql `${emailOtp.attempts} + 1`})
        .where(eq(emailOtp.id,otpRecord.id))

        throw new ApiError(401,"Invalid otp")
    }
// using database transaction for both update in user and dlt from emailotp tables becasue if one fails both fails otherwise both success to maintain database consistain becasue they create incosistency 
// set email verified true ....................
    await db
        .transaction( async(tx) =>{
            await tx
        .update(users)
        .set({
            emailVerified: true,
        })
        .where(eq(users.id,user.id))
// delete otp from table ..................
    await tx
        .delete(emailOtp)
        .where(eq(emailOtp.id,otpRecord.id))

    })

    return c.json({
        success: true,
        message: "Email verified sucessfully"
    })

}

type resendOtpType = Context<any, any,{in:{json:validateResendOtpType}; out:{json:validateResendOtpType}}>
const resendOtp = async(c:resendOtpType) =>{
    const {email} = c.req.valid("json")

    if(!email){
        throw new ApiError(401, "please enter the email")
    }

    const [user] = await db.select().from(users).where(eq(users.email,email))
    if(!user){
        throw new ApiError(404,"User not Found")
    }

    if(user.emailVerified){
        throw new ApiError(400, "Email is already Verified")
    }

    //await db.delete(emailOtp).where(eq(emailOtp.userId,user.id))

    const otp = crypto.randomInt(100000,1000000).toString()
    const otpHash = await argon2.hash(otp)
    console.log("resndotp:" , otp)
    const expireAt = new Date( Date.now()+ 10*60*1000)

    const [updatedOtp] = await db
        .update(emailOtp)
        .set({otpHash:otpHash, expiresAt: expireAt, attempts:0})
        .where(
            and(
                eq(emailOtp.userId,user.id),
                eq(emailOtp.purpose,"email-verification")
            )). returning({id:emailOtp.id})
    
    if(!updatedOtp){
        throw new ApiError(404,"OTP record not found")
    }

    await sendOtpEmail(email,otp,"email-verification")

    return c.json({
        success: true,
        message:"OTP resend successsfully"
    },201)



}


type  loginType = Context <any, any, {in:{ json:logintype}; out:{ json:logintype}}>
const login = async(c:loginType) =>{
    const {email,password} = c.req.valid("json")


    const [existingUser] = await db.select().from(users).where(eq(users.email,email))

    if(!existingUser){
        throw new ApiError(401,"Invalid email or password")
    }
    if(!existingUser.emailVerified){
        throw new ApiError(401, "Please Verify Your Email First")
    }

    const isPasswordCorrect = await argon2.verify(existingUser.password, password)

    if(!isPasswordCorrect){
        throw new ApiError(401,"Invalid email or passsword")
    }

    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(existingUser)

    //await db.update(users).set({refreshToken:refreshToken}).where (eq(users.id,existingUser.id))
    const options = {
        httpOnly:true,
        secure: process.env.NODE_ENV === "production",
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
    },200)
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
        //await db.update(users).set({refreshToken:refreshToken}).where(eq(users.id,user.id))

        const options = {
            httpOnly:true,
            secure: process.env.NODE_ENV === "production",
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
    catch{
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

    const toUpdateData = { 
        ...newData
    }

const newEmail = newData.email


    if(newEmail && newEmail !== user.email){
        toUpdateData.emailVerified= false
    }

//updating data to db...........
    try {
        const [updatedUser] = await db
            .update(users)
            .set(toUpdateData)
            .where(eq(users.id,user.id))
            .returning()

            
        if(!updatedUser){
            throw new ApiError(404,"User not found")
        }

        if(newEmail && newEmail !== user.email){
            await generateAndVerificationOtp(
                user.id,
                newEmail
            )
        }

//removing the sensitive info...................
        const{
            password,
            refreshToken, 
            ...safeUser
        } = updatedUser
    
        return c.json({
            success: true,
            message: "user Data is updated successfully",
            data : safeUser
        })
    } catch (err: unknown) {
        if(err && typeof err==="object" 
            && "code" in err 
            && "constraint" in err 
            && err.code === "23505" 
            && err.constraint ==="user_email_unique"
        ){
            throw new ApiError(409,"Email alreay in use")
        }
        throw err
        
    }
    

}

type updatePassworTypes = Context <any, any, {in:{json:updatePasswordType}; out:{json:updatePasswordType}}>
const updatePassword = async(c:updatePassworTypes) =>{
    const user = c.get("user")
    const { oldPassword, newPassword} =  c.req.valid("json")

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

type forgetType = Context<any, any, {in:{json:forgetPasswordType}; out:{json:forgetPasswordType}}>
const forgetPasswordAndSendOtp = async(c:forgetType) =>{
    const {email} = c.req.valid("json")
    const [user] = await db.select().from(users).where(eq(users.email,email))

    if(!user){
        throw new ApiError(404,"user not found, email is not register")

    }
    await db
        .delete(emailOtp)
        .where(
            and(
                eq(emailOtp.userId,user.id),
                eq(emailOtp.purpose, "password-reset")
            ))



    //generateing otp ..............
    const otp = crypto.randomInt(100000,1000000).toString();
    const hashOtp = await argon2.hash(otp)

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
    
//sending email first .............
    await sendOtpEmail(user.email,otp,"password-reset")
// save otp only if email was successfully sent..................
    await db.insert(emailOtp).values({
        userId : user.id,
        otpHash: hashOtp,
        purpose: "password-reset",
        expiresAt,
    })

    


    return c.json({
        success: true,
        message:"otp and hashopt generate successfully",
        
    },200)
    


}

type verifyOtpType = Context<any, any, {in:{json:validateOtpType}; out:{json:validateOtpType}}>
const verifyResetOtp = async(c:verifyOtpType) =>{
    
    const {email, otp} = c.req.valid("json")
    
    //find user.......
    const [user] = await db.select().from(users).where(eq(users.email,email))

    if(!user){
        throw new ApiError(401, "user not found")
    }

    const [otpRecords] = await db
                .select()
                .from(emailOtp)
                .where(and(eq(emailOtp.userId,user.id),eq(emailOtp.purpose,"password-reset")))
                .orderBy( desc (emailOtp.expiresAt))
                .limit(1);

    if(!otpRecords){
        throw new ApiError(400, "invalid or Expired otp")
    }

    if(otpRecords.expiresAt < new Date()){
        throw new ApiError(400,"OTP has expired")
    }

    if(otpRecords.attempts >=5){
        throw new ApiError(429,"Too many incorrect attempts")
    }

    const isValidOtp = await argon2.verify(otpRecords.otpHash,otp)

    if(!isValidOtp){
            await db
            .update(emailOtp)
            .set({attempts:otpRecords.attempts+1})
            .where(eq(emailOtp.id,otpRecords.id))
        throw new ApiError(401,"Invalid otp")
    }

    //if otp is valid dlt is so it cannot be used again

    await db
        .delete(emailOtp)
        .where(eq(emailOtp.id,otpRecords.id))


    //create temp passowrd reset token......

    const passwordResetToken = await new SignJWT({
        userId: user.id,
        purpose: "password-reset",
    })
    .setProtectedHeader({
        alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(
        new TextEncoder().encode(
            process.env.PASSWORD_RESET_TOKEN_SECRET!
        )
    )

    const Options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict" as const,
        maxAge: 10*60,    //10 min

    }

    setCookie(c,"passwordResetToken",passwordResetToken, Options)
    
    

    return c.json({
        success:true,
        message: "otp verified sucesssfully",
    })

}


type verifyResetType = Context<any, any, {in:{json:validateResetType}; out:{json:validateResetType}}>
const resetPassword = async(c:verifyResetType) =>{
    const resetPasswordToken = getCookie(c,"passwordResetToken")

    if(!resetPasswordToken){
        throw new ApiError(401,"password reset session expired")
    }
    const { newPassword} =  c.req.valid("json")

    //verify reset Token....
    // here resetToken is generated using jose, but decode using jwt, can also be decpded by jose....
    // let decoded: {userId: string; purpose:string}
    // try {
    //      decoded = jwt.verify(
    //         resetPasswordToken,
    //         process.env.PASSWORD_RESET_TOKEN_SECRET as string
    //     )as {
    //         userId:string;
    //         purpose:string,
    //     }

    // } catch (error) {
    //     throw new ApiError(401,"Invalid or expired password token")
        
    // }

    //Decoding using jose ...................

    let decoded: {userId: string; purpose: string}

    
        
    const {payload} = await jwtVerify(
        resetPasswordToken,
        new TextEncoder().encode(process.env.PASSWORD_RESET_TOKEN_SECRET!)
    )

    if( typeof payload.userId !== "string" ||
        payload.purpose !== "password-reset"
    ){
        throw new ApiError(401,"Invalid Password reseet Token")
    }

    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id,payload.userId))

    if(!user){
        throw new ApiError(404,"user not found")
    }

    //HASH THE NEW PASSWORD.....
    const hashPassword = await argon2.hash(newPassword)

    //update the database ................
    const [updatedUser] = await db
        .update(users)
        .set({password: hashPassword, refreshToken: null})
        .where(eq(users.id,user.id))
        .returning({id: users.id})
    if(!updatedUser){
        throw new ApiError(404, "User not found")
    }

    deleteCookie(c,"passwordResetToken")


    return c.json({
        success: true,
        message:"Password rest sucessfully"
    },200)

}





export { 
        registerUser,
        resendOtp,
        verifyEmail,
        login,
        logout, 
        refreshAccessToken,
        getCurrentUser, 
        updateUSerProfile, 
        updatePassword,
        forgetPasswordAndSendOtp,
        verifyResetOtp,
        resetPassword,
    } 
