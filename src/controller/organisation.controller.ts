import type { Context } from "hono"
import { createOrganisationServices, getUserOrganisationServices } from "../services/organisation.services.js"
import type  { orgtype} from "../middleware/organisation.validator.js"
import { success } from "zod";




type org = Context<any, any, {in:{ json:orgtype}; out: { json:orgtype}}>
async function createOrganisationController(c: org){

    
    const user = c.get("user")

    const { name} = c.req.valid("json")

    const organisation = await createOrganisationServices(
        user.id,
        name,
    )

    return c.json({
        success: true,
        message: "organisation created successfully",
        data: organisation
    }, 201)
}


const  getUserOrganisationController = async( c:Context) => {

    console.log("user from jwt: ", c.get("user"))
    const user = c.get("user")
    const organistations = await getUserOrganisationServices(user.id)

    return c.json({
        success: true,
        message: "organisation fetched succcessfully",
        data: organistations
    }, 201)
}

export { createOrganisationController, getUserOrganisationController}