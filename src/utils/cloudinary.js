import { v2 as cloudinary } from "cloudinary";
import ApiError from "./ApiError.js";
import fs from 'fs'
import "dotenv/config"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (localPath) => {
    try {
        if(!localPath) return null;
        const response = await cloudinary.uploader.upload(localPath,{
            resource_type:"auto",
        })
        fs.unlink(localPath);
        console.log(response);
        return response;
    } catch (error) {
        fs.unlinkSync(localPath)
        throw new ApiError(500,error?.message)
    }
}