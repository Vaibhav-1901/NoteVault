import mongoose from "mongoose";
import { DB_NAME } from "../utilities/constants.js";

const connectDB = async () => {
    mongoose.connect(`${process.env.MONGODB_URI}`)
        .then(() => {
            console.log("Connected to MONGODB")
        })
        .catch(() => {
            console.log("MONGODB conenction failed")
            process.exit(1)
        })
}
export default connectDB