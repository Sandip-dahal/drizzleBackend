import crypto from "node:crypto"
import argon2 from "argon2"
import  {db} from "../db/db.js"
import { and , eq} from "drizzle-orm"
import { emailOtp } from "../db/schema.js"
import { sendOtpEmail } from "./email.services.js"
//import {} from "drizzle-kit"



const generateAndVerificationOtp = async (userId: string, email: string) =>{

    const otp = crypto.randomInt(100000,1000000).toString()
    const otpHash = await argon2.hash(otp)
    const expiresAt = new Date( Date.now() +10*60*1000)

    await db
        .delete(emailOtp)
        .where(
            and(
                eq(emailOtp.userId,userId),
                eq(emailOtp.purpose,"email-verification")
            )
        )

    await sendOtpEmail(email,otp,"email-verification")

    await db
        .insert(emailOtp)
        .values({
            userId,
            otpHash,
            expiresAt,
            purpose:"email-verification"
        })

}

export { generateAndVerificationOtp}