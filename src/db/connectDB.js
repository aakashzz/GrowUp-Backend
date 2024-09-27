import mongoose from "mongoose";

export const connectDB = async ()=>{
    try {
        const connectionResponse = await mongoose.connect(`${process.env.MONGODB_URL}/GrowUp`);
        console.log("run at: ",connectionResponse.connection.host);
    } catch (error) {
        throw new Error(error.message);
        process.exit(1);
    }
}