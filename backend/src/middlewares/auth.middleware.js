import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

//MODIFYING THE REQ OBJECT SO THAT IT HAS USER 

const verifyJWT = async (req, res, next) => {
    try {
        const token = req.cookies?.AccessToken || req.header("Authorization")?.replace("Bearer", "");
        //Either User sent the cookies Normally or using head either way we accessed it
        // console.log(req.cookies)
        if (!token) {
            console.log("Unathorized Request")
            return res.status(400).json({ message: "User is not logged in" });//Also checking if user is logged in or not 
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)//Decoded the TOKEN
        const user = await User.findById(decodedToken?._id).select("-password-")
        if (!user) {
            console.log("Invalid Access Token")
        }
        req.user = user;
        next()
    } catch (error) {
        console.log("Invalid Access Token")
        return res.status(401).json({ message: "Invalid Access Token" })
    }



}
export { verifyJWT }