import { Router } from "express";
import {registerUser, loginUser, logoutUser, refreshAccessToken, uploadUserProfilePicture, updateUserDetails} from "../controllers/user.controller.js"
import { verifyAuth } from "../middlewares/authenticate.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/logout").get(verifyAuth,logoutUser)
router.route("/refresh-token").post(verifyAuth,refreshAccessToken )
router.route("/upload-avatar").post(verifyAuth,upload.single("avatar"),uploadUserProfilePicture)
router.route("/update-user-details").post(verifyAuth,updateUserDetails)

export default router