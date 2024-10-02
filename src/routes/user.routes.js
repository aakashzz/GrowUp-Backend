import { Router } from "express";
import {registerUser, loginUser, logoutUser, refreshAccessToken, uploadUserProfilePicture, updateUserDetails, verifyUserEmail, sendUserForgotPasswordMail, forgotPasswordUpdate} from "../controllers/user.controller.js"
import { verifyAuth } from "../middlewares/authenticate.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/logout").get(verifyAuth,logoutUser)
router.route("/refresh-token").post(verifyAuth,refreshAccessToken )
router.route("/upload-avatar").post(verifyAuth,upload.single("avatar"),uploadUserProfilePicture)
router.route("/update-user-details").post(verifyAuth,updateUserDetails)
router.route("/send-forgot-password-mail").post(sendUserForgotPasswordMail);
router.route("/verify-email").post(verifyUserEmail);
router.route("/update-forgot-password").post(forgotPasswordUpdate);

export default router