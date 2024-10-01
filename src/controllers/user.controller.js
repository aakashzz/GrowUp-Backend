import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { sendMail } from "../utils/mail.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
   generateAccessToken,
   generateRefreshToken,
} from "../utils/generateToken.js";
import JWT from "jsonwebtoken";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

//registerUser controller
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
   const isPasswordChecked = await existedUser.IsPasswordCorrect(password);
   if (!isPasswordChecked) {
      throw new ApiError(400, "Password Incorrect!");
   }

   //generate tokens to login user

   const { accessToken } = generateAccessToken(
      existedUser._id,
      existedUser.email
   );
   const { refreshToken } = generateRefreshToken(existedUser._id);

   //adding refreshToken in database

   existedUser.refreshToken = refreshToken;
   existedUser.save({ validateBeforeSave: false });

   //return response
   let options = { httpOnly: true, secure: true };
   return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
         new ApiResponse(
            200,
            {
               user: existedUser,
               accessToken,
               refreshToken,
            },
            "Logged-in SuccessFully"
         )
      );
});

//logout functionality
const logoutUser = asyncHandler(async (req, res) => {
   const { id } = req.user;
   await User.findByIdAndUpdate(
      id,
      {
         $unset: {
            refreshToken: 1,
         },
      },
      {
         new: true,
      }
   );
   let options = { httpOnly: true, secure: true };
   return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "User Logout SuccessFully"));
});

//refreshAccessToken controller
const refreshAccessToken = asyncHandler(async (req, res) => {
   const incomingRefreshToken =
      req.cookies?.refreshToken || req.body.refreshToken;

   if (!incomingRefreshToken) throw new ApiError(401, "Unauthorized Request");

   try {
      const decodedToken = JWT.verify(
         incomingRefreshToken,
         REFRESH_TOKEN_SECRET
      );

      const user = await User.findById(decodedToken.id);

      if (incomingRefreshToken !== user?.refreshToken) {
         throw new ApiError(400, "Refresh Token is expire and used");
      }

      const { accessToken } = generateAccessToken(user._id, user.email);
      const { newRefreshToken } = generateRefreshToken(user._id);

      //adding refreshToken in database

      user.refreshToken = newRefreshToken;
      user.save({ validateBeforeSave: false });

      //return response
      let options = { httpOnly: true, secure: true };
      return res
         .status(200)
         .cookie("accessToken", accessToken, options)
         .cookie("refreshToken", newRefreshToken, options)
         .json(
            new ApiResponse(
               200,
               {
                  accessToken,
                  refreshToken: newRefreshToken,
               },
               "Access Token Refresh"
            )
         );
   } catch (error) {
      throw new ApiError(401, error?.message || "Invalid refresh token");
   }
});

//changePassword
const updatePassword = asyncHandler(async (req, res) => {
   const { oldPassword, newPassword } = req.body;
   if ([oldPassword, newPassword].some((field) => field?.trim() === "")) {
      throw new ApiError(400, "All Filed is required");
   }
   const user = await User.findById(req.user?.id).select(
      "-refreshToken -subscription"
   );

   const isPasswordCheck = await user.IsPasswordCorrect(oldPassword);

   if (!isPasswordCheck) {
      throw new ApiError(400, "Old Password is not correct");
   }

   user.password = newPassword;
   await user.save({ validateBeforeSave: false });

   return res
      .status(200)
      .json(new ApiResponse(200, {}, "Your Password Is Updated"));
});

//getUser details
const getUserProfileDetail = asyncHandler(async (req, res) => {
   return res
      .status(200)
      .json(new ApiResponse(200, req.user, "Getting User Profile details"));
});

//uploadProfile
const uploadUserProfilePicture = asyncHandler(async (req, res) => {
   const filePath = req.file?.path;
   
   if(!filePath) throw new ApiError(400, "File Path Required");
   const {optimizeUrl} = await uploadOnCloudinary(filePath,"PROFILE-PICTURE");

   if(!optimizeUrl) throw new ApiError(500, "Upload UnsuccessFully");
   const user = await User.findByIdAndUpdate(
      req.user._id,
      {
         $set: {
            avatar: optimizeUrl,
         },
      },
      {
         new: true,
      }
   ).select("-password -refreshToken -subscription");
   await user.save();

   return res.status(200).json(new ApiResponse(200, user,"Profile Upload SuccessFully"));
});

//update User details
const updateUserDetails = asyncHandler(async (req,res) =>{
   const {fullName, bio} = req.body;

   if(!(fullName || bio)) throw new ApiError(400,"Field are empty")

   const updatedUserDetails = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set:{
         fullName:fullName,
         bio:bio
        }
      },
      {
         new:true,
      }
   ).select("-password -refreshToken -subscription")

   if(!updatedUserDetails) throw new ApiError(500,"Not Updating User Details");
   await updatedUserDetails.save();

   return res.status(200).json(
      new ApiResponse(200,updatedUserDetails,"User Details Updated")
   )

})

const forgotPassword = asyncHandler(async(req,res)=>{
   const {email, otp} = req.body;
})

export {
   registerUser,
   loginUser,
   logoutUser,
   refreshAccessToken,
   updatePassword,
   getUserProfileDetail,
   uploadUserProfilePicture,
   updateUserDetails,
};
