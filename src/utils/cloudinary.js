import { v2 as cloudinary } from "cloudinary";
import ApiError from "./ApiError.js";
import fs from 'fs'
import "dotenv/config"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (localPath,type) => {
    try {
        if(!localPath)throw new ApiError(400,"LocalPath Not Here");
        let response;
        if (type === "PROFILE-PICTURE") {
             response = await cloudinary.uploader.upload(localPath,{
                resource_type:"auto",
            })
        }else if (type === "COURSE-VIDEO") {
            response = await cloudinary.v2.uploader.upload_large("elephants_4k.mp4", 
                { resource_type: "video"});
        }
        const optimizeUrl = cloudinary.url(response.public_id, {
            fetch_format: 'auto',
            quality:"100"
        });
        fs.unlinkSync(localPath);
        return {optimizeUrl}
    } catch (error) {
        fs.unlinkSync(localPath)
        throw new ApiError(500,"Cloudinary Service file: " + error?.message)
    }
}