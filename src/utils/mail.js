import nodemailer from "nodemailer";
import JWT from "jsonwebtoken";
import { User } from "../models/user.model.js";
import ApiError from "./ApiError.js";

export const sendMail = async (
   email,
   emailType = "VERIFY",
   userID,
   fullName
) => {
   try {
      const hashedToken = JWT.sign(
         {
            id: userID,
            email: email,
            fullName: fullName,
         },
         process.env.VERIFY_TOKEN_SECRET,
         {
            expiresIn: "1h",
         }
      );

      console.log(hashedToken);

      if (emailType === "VERIFY") {
         await User.findByIdAndUpdate(userID, {
            $set: {
               isVerifiedToken: hashedToken,
            },
         });
      } else {
         throw new ApiError(500, "Other mailing process not execute");
      }

      const transport = nodemailer.createTransport({
         service: "gmail",
         secure: true,
         port: process.env.MAIL_PORT,
         auth: {
            user: process.env.MAIL_AUTH_USER,
            pass: process.env.MAIL_AUTH_PASS,
         },
      });

      //TODO: More concistant email content sental ment noted content adjustment 

      const receiver = {
         from: `"GrowUp-Learning" ${process.env.MAIL_AUTH_USER}`,
         to: email,
         subject: "Verify Your Email ",
         html: `
               <h2 >Hii ${fullName}</h2>
               <p>We just need to verify your email address before you can access GrowUp learning platform.</p>
                  <p style="font-size:10px; font-weight:semibold" >Verify your email address
                  <a href="YOUR_VERIFICATION_LINK" style="display: inline-block; background-color: #3772FF; color: white; font-family: 'Inter', sans-serif; padding: 6px 10px; text-decoration: none; border-radius: 5px; font-size: 13px; font-weight: bold;">
                     Verify Email
                  </a>
                  <br>
                  Thanks! – The GrowUp-Learning team
            </p>`,
      };

      const mailResponse = await transport.sendMail(receiver);
      return mailResponse;
   } catch (error) {
      console.log("Error", error.message);
      throw new Error("Error in mailing", error.message);
   }
};
