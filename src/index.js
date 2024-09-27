import "dotenv/config"
import { connectDB } from "./db/connectDB.js"
import { app } from "./app.js"

connectDB().then(()=>{
    app.on("error",(err)=>{
        console.log("Error in express on:", err);
    })
    app.listen(process.env.PORT || 8000,()=>{
        console.log("Server Is Start",process.env.PORT);
    })
})
.catch((err)=>{
console.log("MongoDb connection failed !!", err);
})