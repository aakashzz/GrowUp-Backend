import { Router } from "express";
import {registerUser, loginUser, logoutUser, refreshAccessToken, uploadUserProfilePicture} from "../controllers/user.controller.js"
import { verifyAuth } from "../middlewares/authenticate.middleware.js";

const router = Router();

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/logout").get(verifyAuth,logoutUser)
router.route("/refresh-token").post(verifyAuth,refreshAccessToken )
router.route("/update-avatar").post(verifyAuth,uploadUserProfilePicture )

export default router