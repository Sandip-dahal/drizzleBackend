import { z} from "zod"
import { zValidator } from "@hono/zod-validator"

const userSchemaValidaition = z.object({
    name:z.string().min(3,'Name is required at least 3 char'),
    email: z.string().regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,"enter a valid email addresh"),
    number:z.string().regex(/^[0-9]{10}$/,"enter the valid phone number"),
    age:z.string().min(18,"you must be atleast 18"),
    profile:z.string().min(1,"profile is required"),
    password: z.string().min(8,"password must be atleast 8 char"),

});


export const validateUser = zValidator("json", userSchemaValidaition)