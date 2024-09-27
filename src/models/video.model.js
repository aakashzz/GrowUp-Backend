import { Schema, model } from "mongoose"

const videosSchema = new Schema({
    title:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    description:{
        type: String,
        required: true,
        lowercase: trusted,
    },
    videoFile:{
        type:String,
        required: true,
        //cloudinary url
    },
    duration:{
        type: String,
        required: true,
    },
    thumbnail:{
        type: String,
        required: true,
        //Cloudinary url
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref:"User",
    },
    views:Number,
    
},{timestamps: true});

export const Video = model("Video",videosSchema);