import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { sendMail } from "../utils/mail.js";
import ApiResponse from "../utils/ApiResponse.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.js";

const registerUser = asyncHandler(async (req, res) => {
   //frontend-inp -> receive
   //check filed not empty
   //check user account already exist
   //create user account
   //send mail to verify user email

   const { fullName, email, password, role } = req.body;

   if (
      [fullName, email, role, password].some((field) => field?.trim() === "")
   ) {
      throw new ApiError(400, "All Filed is required");
   }

   const existedUser = await User.findOne({
      $or: [{ fullName, email }],
   });
   if (existedUser) {
      throw new ApiError(401, "User Account has Already created please login");
   }

   //account create
   const createdUser = await User.create({
      fullName,
      email,
      password,
      role,
   });

   if (!createdUser) {
      throw new ApiError(500, "Server has not creating User account");
   }
   const savedUser = await createdUser.save();

   await sendMail(email, "VERIFY", savedUser._id, savedUser.fullName);

   return res
      .status(201)
      .json(
         new ApiResponse(
            201,
            createdUser,
            "User Account SuccessFully Created !"
         )
      );
});

// login controller
const loginUser = asyncHandler(async (req, res) => {
   //value get -> frontend
   //email verify ! not checking
   //user existed and not
   //not error bhejna hai || true main process continue krni hai
   //session create krna hai usme access, refreshToken create krne hai

   const { email, password } = req.body;
   //checking value nots empty
   if ([email, password].some((field) => field?.trim() === "")) {
      throw new ApiError(400, "All Filed is required");
   }

   const existedUser = await User.findOne({ email });
   //user find
   if (!existedUser) {
      throw new ApiError(400, "User Account not be created Please signup!");
   }
   //email verification block
   if (!existedUser.isVerified) {
      const sendVerifyMail = await sendMail(
         existedUser.email,
         "VERIFY",
         existedUser._id,
         existedUser.fullName
      );
      if (!sendVerifyMail)
         throw new ApiError(500, "Verify Email in Login portal Not Working");

      throw new ApiError(
         400,
         "Your email is not verify please verify your email !."
      );
   }
   //password check 
   const isPasswordChecked = await existedUser.IsPasswordCorrect(password)
   if (!isPasswordChecked) {
      throw new ApiError(400,"Password Incorrect!");
   }
   //generate tokens to login user
   const {accessToken} =  generateAccessToken(existedUser._id,existedUser.email);
   const {refreshToken} =  generateRefreshToken(existedUser._id);
   let options = {httpOnly:true,secure:true}
   return res.status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",refreshToken,options)
   .json(
      new ApiResponse(200,
         {
            user:existedUser,
            accessToken,
            refreshToken
         },
         "Logged-in SuccessFully"
      )
   )
});
export { registerUser, loginUser };
