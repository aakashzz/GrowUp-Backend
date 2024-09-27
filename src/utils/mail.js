import nodemailer from "nodemailer";
import JWT from "jsonwebtoken";
import { User } from "../models/user.model";
import { ApiError } from "./ApiError";

export const sendMail = async (
   email,
   emailType = "VERIFY",
   userID,
   fullName
) => {
   try {
      const hashedToken = await JWT.sign(
         {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName,
         },
         process.env.VERIFY_TOKEN_SECRET,
         {
            expiresIn: process.env.VERIFY_TOKEN_EXPIRY,
         }
      );

      if (emailType === "VERIFY") {
         await User.findByIdAndUpdate(userID, {
            $set: {
               isVerifiedToken: hashedToken,
            },
         });
      } else {
         throw new ApiError(500, "Other mailing process not execute");
      }

      const auth = nodemailer.createTransport({
         service: "gmail",
         secure: true,
         port: process.env.MAIL_PORT,
         auth: {
            user: process.env.MAIL_AUTH_USER,
            pass: process.env.MAIL_AUTH_PASS,
         },
      });

      const receiver = {
         from: `"GrowUp" ${process.env.MAIL_AUTH_USER}`,
         to: email,
         subject: "Verify Your Email ",
         text: `
            Hi [name],

            We just need to verify your email address before you can access [customer portal].

            Verify your email address [verification link]

            Thanks! – The GrowUp team`,
      };

      auth.sendMail(receiver, (error) => {
         if (error) throw error;
         console.log("success!");
      });
   } catch (error) {
      throw new Error(error.message);
   }
};
