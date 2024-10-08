import ApiError from "../utils/ApiError.js";
import JWT from "jsonwebtoken";
import { User } from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";

export const verifyAuth = asyncHandler(async (req, res, next) => {
   try {
    const token =
       req.cookies?.accessToken ||
       req.header("Authorization")?.replace("Bearer ", "");
 
    if (!token) throw new ApiError(401, "Unauthorized Token");
    
    const decodedValue = JWT.verify(token, process.env.ACCESS_TOKEN_SECRET);
 
    const user = await User.findById(decodedValue?.id).select(
       "-password -refreshToken -isAdmin"
    );
    if (!user) {
       throw new ApiError(401, "Invalid Access Token");
    }
 
    //check email verified
    if (!user.isVerified) {
       throw new ApiError(400, "User email not verified");
    }
 
    req.user = user;
    next();
   } catch (error) {
        throw new ApiError(401,error?.message || "Invalid Access Token")
   }
});
