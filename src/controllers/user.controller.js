import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { sendMail } from "../utils/mail.js";
import ApiResponse from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req, res) => {
   //frontend-inp -> receive
   //check filed not empty
   //check user account already exist
   //create user account
   //send mail to verify user email

   const { fullName, email, password, role } = req.body;

   if (
      [fullName, email, role, password].some(
         (field) => field?.trim() === ""
      )
   ) {
      throw new ApiError(400, "All Filed is required");
   }

   const existedUser = await User.findOne({
    $or:[{fullName,email}]
   })
   if (existedUser) {
        throw new ApiError(401,"User Account has Already created please login");
   }

   //account create 
   const createdUser = await User.create({
      fullName,
      email,
      password,
      role
   });
   
   if (!createdUser) {
      throw new ApiError(500,"Server has not creating User account");
   }
   // await createdUser.save();

   await sendMail(email,"VERIFY",createdUser._id,createdUser.fullName);

   return res.status(201).json(new ApiResponse(201,createdUser,"User Account SuccessFully Created !"));
});

export { registerUser };
