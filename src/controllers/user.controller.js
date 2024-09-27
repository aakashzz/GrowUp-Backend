import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
const registerUser = asyncHandler(async (req, res) => {
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
   
});

export { registerUser };
