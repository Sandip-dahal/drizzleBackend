import { zValidator } from "@hono/zod-validator"
import { z } from "zod"

 export const OrganisationSchema = z.object({
    name: z
    .string()
    .trim()
    .min(2,"organisation must be at least 2 character")
    .max(100,"organisatiion must not excees 100 character")
})

export const validateOrganisation = zValidator("json",OrganisationSchema)
export type orgtype = z.infer<typeof OrganisationSchema>
