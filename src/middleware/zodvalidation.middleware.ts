import { z} from "zod"
import { zValidator } from "@hono/zod-validator"

const userSchemaValidaition = z.object({
    name:z
    .string()
    .min(3,'Name is required at least 3 char'),

    email: z
    .string()
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,"enter a valid email addresh"),

    number:z
    .string()
    .regex(/^[0-9]{10}$/,"enter the valid phone number"),

    age:z
    .coerce.number()
    .int()
    .min(18,"you must be atleast 18"),


    password: z
    .string()
    .min(8,"password must be atleast 8 char"),

});
export const validateUser = zValidator("form", userSchemaValidaition)
export type register = z.infer< typeof userSchemaValidaition >


//zod login scheme validaion ..........
export const loginSchema = userSchemaValidaition.pick({
    email:true, 
    password: true
})
export const validatelogin = zValidator("json",loginSchema)
export type logintype = z.infer<typeof loginSchema>



//zod update scheme .........
export const updateUserSchema = userSchemaValidaition.pick({
    name: true,
    email:true, 
    age:true, 
    number:true
}).partial()
export const validateUpdate = zValidator("json",updateUserSchema)
export type updateUserType = z.infer<typeof updateUserSchema>


export const updatePasswordSchema = z.object({
    oldPassword: z.string().min(1, "Old password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export const validateUpdatePassword = zValidator("json", updatePasswordSchema);