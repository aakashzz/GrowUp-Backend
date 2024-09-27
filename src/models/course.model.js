import { Schema, model } from "mongoose";

const courseSchema = new Schema({
    name:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        index : true,
    },
    description:{
        type: String,
        required: true,
    },
    videosList:[
        {
            type: Schema.Types.ObjectId,
            ref:"Video",
        }
    ],
    createdBy:{
        type: Schema.Types.ObjectId,
        ref: "User",
    }
},{timestamps: true});

export const Course = model("Course", courseSchema);