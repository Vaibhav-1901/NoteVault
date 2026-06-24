import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";


const verifyJWT = async (req, res, next) => {
    try {
        const token = req.cookies?.AccessToken || req.header("Authorization")?.replace("Bearer", "");
   
        if (!token) {
       
            return res.status(400).json({ message: "User is not logged in" }); 
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id).select("-password")
        if (!user) {
            return res.status(401).json({ message: "Invalid Access Token" })
       
        }
        req.user = user;
        next()
    } catch (error) {

        return res.status(401).json({ message: "Invalid Access Token" })
    }



}
export { verifyJWT }