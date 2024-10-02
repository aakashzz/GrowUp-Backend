import nodemailer from "nodemailer";
import JWT from "jsonwebtoken";
import { User } from "../models/user.model.js";
import ApiError from "./ApiError.js";

export const sendMail = async (email,emailType,userID,fullName) => {
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

      if (emailType === "VERIFY") {
         await User.findByIdAndUpdate(userID, {
            $set: {
               isVerifiedToken: hashedToken,
            }
         },{
            new:true,
         }
      );
      } else if (emailType === "FORGOT_PASSWORD") {
         await User.findByIdAndUpdate(userID, {
            $set: {
               forgotPasswordToken: hashedToken,
            }
         },{
            new:true
         }
      )
      } else {
         throw new ApiError(500, "Invalid email type");
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


      const receiver = {
         from: `"GrowUp-Learning" ${process.env.MAIL_AUTH_USER}`,
         to: email,
         subject: emailType === "VERIFY" ? "Verify Your Email" : "Forgot Your Password",
         html: `
            <h2>Hi ${fullName}</h2>
            <p>${emailType === "VERIFY" ? "We just need to verify your email address before you can access GrowUp learning platform." : "We received a request to reset your password for your GrowUp-Learning account."}
            </p>
            <p>
                  <a href="${process.env.DOMAIN}/${emailType === "VERIFY" ? "verify-email":"update-forgot-password"}?token=${hashedToken}" style="display: inline-block; background-color: #3772FF; color: white; font-family: 'Inter', sans-serif; padding: 6px 10px; text-decoration: none; border-radius: 5px; font-size: 13px; font-weight: bold;">
                     ${emailType === 'VERIFY' ? "Verify Email":"Recover Password"}
                  </a>
            </p> 
            
            
            <p>Thanks! – The GrowUp-Learning team</p>
         `
      };

      const mailResponse = await transport.sendMail(receiver);
      return mailResponse;
   } catch (error) {
      console.log("Error", error.message);
      throw new Error("Error in mailing", error);
   }
};

