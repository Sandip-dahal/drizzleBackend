import { 
    validatelogin, 
    validateUser,
    validateUpdate, 
    validateUpdatePassword, 
    validateforgetPassword,
    validateOtp, 
    validateResetPassword, 
    validateResendOtp 
} from "../middleware/zodvalidation.middleware.js";

import  { verifyJWT } from "../middleware/verifyjwt.middleware.js";
import {  
    registerUser,
    verifyEmail,
    login,logout, 
    refreshAccessToken, 
    getCurrentUser,
    updateUSerProfile, 
    updatePassword, 
    forgetPasswordAndSendOtp,
    verifyResetOtp, 
    resetPassword, 
    resendOtp 
} from "../controller/user.controller.js";

import { Hono } from "hono";


const route = new Hono()


route.post("/registerUser",validateUser,registerUser)
route.post("/resendotp", validateResendOtp,resendOtp)
route.post("/verifyEmail",validateOtp, verifyEmail)
route.post("/login",validatelogin, login)
route.post("/logout", verifyJWT, logout)
route.post("/refreshAccessToken",refreshAccessToken)
route.post("/getCurrentUser", verifyJWT, getCurrentUser)
route.post("/updateuserprofile", verifyJWT, validateUpdate,updateUSerProfile)
route.post("/updatepassword", verifyJWT, validateUpdatePassword, updatePassword)
route.post("/forgetPassword",validateforgetPassword, forgetPasswordAndSendOtp)
route.post("/verifyotp",validateOtp, verifyResetOtp)
route.post("/resetpassword", validateResetPassword, resetPassword)


export default route;