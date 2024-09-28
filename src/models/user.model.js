import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import JWT from 'jsonwebtoken'

const userSchema = new Schema(
   {
      fullName: {
         type: String,
         required: true,
         trim: true,
      },
      email: {
         type: String,
         required: true,
         unique: true,
         lowercase: true,
      },
      password: {
         type: String,
         required: [true, "Password Is Required"],
      },
      avatar: {
         type: String,
      },
      role: {
         type: String,
         enum: ["student", "instructor"],
         required: true,
         default: "student",
      },
      isVerified: {
         type: Boolean,
         default:false
      },
      isAdmin: {
         type: Boolean,
         default:false
      },
      bio: {
         type: String,
      },
      enrolledCourses: [
         {
            type: Schema.Types.ObjectId,
            ref: "Course",
         },
      ],
      createdCourse: [
         {
            type: Schema.Types.ObjectId,
            ref: "Course",
         },
      ],
      subscription: {
         type: Schema.Types.ObjectId,
         ref: "Subscription",
         // required: function () {
         //    return  !this.isOnTrial;
         // },
      },
      isOnTrial: {
         type: Boolean, 
         // default: false,
      }, // Indicates if user is on a trial
      trialStartDate: {
         type: Date,
      }, // Date when trial starts
      trialEndDate: {
         type: Date,
      },
      isVerifiedToken:{
        type:String,
      },
      refreshToken: {
         type: String,
      },
   },
   { timestamps: true }
);

userSchema.pre("save", async function (next) {
   if (!this.isModified("password")) next();
   this.password = await bcrypt.hash(this.password, 10);
   next();
});

userSchema.methods.IsPasswordCorrect = async function (password) {
   return await bcrypt.compare(password, this.password);
};

export const User = model("User", userSchema);
