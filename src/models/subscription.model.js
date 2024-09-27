import { Schema, model } from "mongoose";

const subscriptionSchema = new Schema({
   user: {
      type: Schema.Types.ObjectId,
      required: true,
   },
   startingDate: {
      type: Date,
      required: true,
   },
   endingDate: {
      type: Date,
      required: true,
   },
   isActive: { type: Boolean, default: true },
   paymentDetails: {
      amount: { type: Number, required: true },
      paymentDate: { type: Date, default: Date.now },
      paymentMethod: {
         type: String,
         enum: ["credit_card", "paypal", "stripe"],
         required: true,
      },
   },
});

export const Subscription = model("Subscription", subscriptionSchema);
	
