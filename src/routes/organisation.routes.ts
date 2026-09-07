import {
    validateOrganisation
} from "../middleware/organisation.validator.js"



import { Hono } from "hono"
import { verifyJWT } from "../middleware/verifyjwt.middleware.js"
import { createOrganisationController, getUserOrganisationController } from "../controller/organisation.controller.js"

const route = new Hono()

route.post(
    "/organisation", 
    verifyJWT,
    validateOrganisation, 
    createOrganisationController
)

route.get(
    "/getUserOrg", 
    verifyJWT,
    getUserOrganisationController
)

export default route