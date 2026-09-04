import nodemailer from "nodemailer"
import { emailOtp } from "../db/schema.js"

const transporter = nodemailer.createTransport({

    host : process.env.SMTP_HOST,
    port :  Number(process.env.SMTP_PORT),
    secure: false,
    requireTLS: true,
    auth:{
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },

    tls: {
        rejectUnauthorized: false
    }

})


const sendOtpEmail = async(
    email:string,
    otp: string,
    purpose: "email-verification" | "password-reset"
): Promise<void> =>{

    const title =
        purpose === "email-verification"? "email verification" : "password-reset";
    
    await transporter.sendMail({
        from:process.env.SMTP_FROM,
        to: email,
        subject: `${title} OTP`,
        text: `your password reser OTP is ${otp}. It will expire in 10 min`,

        html: `<div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
                
                <h2>${title.toLowerCase()}</h2>

                <p>
                    We received a request to reset your password.
                </p>

                <p>
                    Your OTP is:
                </p>

                <h1 style="letter-spacing: 8px;">
                    ${otp}
                </h1>

                <p>
                    This OTP will expire in <strong>10 minutes</strong>.
                </p>

                <p>
                    If you did not request a password reset, you can safely
                    ignore this email.
                </p>

            </div>`
    })
}

export { sendOtpEmail }