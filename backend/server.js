import { app } from "./app.js";
import dotenv from "dotenv"
import connectDB from "./src/db/index.js";
dotenv.config({
    path: './.env'
})
app.get("/",(req,res)=>{
    res.send("Working")
})
const PORT = process.env.PORT || 5000;

connectDB() 
.then(()=>{
    app.listen(PORT,()=>{
    console.log(`Server is running at port ${PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})



