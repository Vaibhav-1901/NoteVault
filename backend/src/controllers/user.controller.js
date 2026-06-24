import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async function (UserId) {
    try {
        const user = await User.findOne({ _id: UserId });
        const AccessToken = user.generateAccessToken();
        const RefreshToken = user.generateRefreshToken();
    
        user.RefreshToken = RefreshToken;
        await user.save({ validateBeforeSave: false });
    
        return { AccessToken, RefreshToken };

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }

}


const registerUser = async function (req, res) {
   

    try {
        const { username, password, email } = req.body;
    

        if ([username, password, email].some((field => field?.trim() === ""))) {
        
            return res.status(400).json({ message: "All fields are required" });
        }
        const exisitngUser = await User.findOne({
            $or: [{ username }, { email }]
        })
        if (exisitngUser) {
      
            return res.status(400).json({ message: "User already exists" });

        }
        const user = await User.create({
            username,
            password,
            email
        })
        const { AccessToken, RefreshToken } = await generateAccessAndRefreshToken(user._id);
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            path: "/",
        }
        return res
        .status(200)
        .cookie("AccessToken", AccessToken, options)
        .cookie("RefreshToken", RefreshToken, options)
        .json({ user, message: "User registered" });
        
    } catch (error) {
    
        res.status(400).json({ message: error.message });

    }
}

const loginUser = async function (req, res) {


    try {
        const { username, email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const user = await User.findOne({ $or: [{ email }, { username }] });
        if (!user) {
            return res.status(400).json({ message: "User does not exist please register" });
        }
        const isPasswordCorrect = await user.isPasswordCorrect(password)
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Password is Incorrect!" });
        }
        const { AccessToken, RefreshToken } = await generateAccessAndRefreshToken(user._id);

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",   // false in dev, true in prod
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            path: "/",
        }
        return res
            .status(200)
            .cookie("AccessToken", AccessToken, options)
            .cookie("RefreshToken", RefreshToken, options)
            .json({
                user,
                message: "User Successfully Logged In"
            })
    } catch (error) {
        res.status(400).json({ message: error.message });

    }

}

const logoutUser = async function (req, res) {

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",   // false in development, true in production
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
    }
    const user = req.user;
   
    await User.findByIdAndUpdate(
        user._id,
        {
            $unset: {
                RefreshToken: 1
            }
        },
        {
            new: true
        }

    )
    return res
        .status(200)
        .clearCookie("AccessToken", options)
        .clearCookie("RefreshToken", options)
        .json({
            message: "User SuccessFully Logged Out"
        })


}
const getCurrentUser = async function (req, res) {
    if (!req.user) {
        return res.status(400).json({ message: "User not logged in" })
    }
    res.status(200).json({
        status: 200,
        data: req.user,
        message: "User displayed successfully"
    });

}
const RefreshAccessToken = async (req, res) => {
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", 
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
    }

    const IncomingRefreshToken = req.cookies?.RefreshToken || req.body?.RefreshToken
    if (!IncomingRefreshToken) { 
        return res.status(400).json({ message: "No Refresh Token" });
    }
    try {
        const DecodedRefreshToken = jwt.verify(IncomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const id = DecodedRefreshToken._id;


        const user = await User.findById(id);
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        if (user?.RefreshToken != IncomingRefreshToken) {
            return res.status(400).json({ message: "Invalid Refresh Token" })

        }
        const { AccessToken, RefreshToken } = await generateAccessAndRefreshToken(user._id);

        return res
            .status(200)
            .cookie("AccessToken", AccessToken, options)
            .cookie("RefreshToken", RefreshToken, options)
            .json({
                message: "Access Token Renewed",
                 AccessToken
            })

    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}
export { registerUser, loginUser, logoutUser, getCurrentUser, RefreshAccessToken }