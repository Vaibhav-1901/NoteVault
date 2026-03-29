import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async function (UserId) {
    try {
        const user = await User.findOne({ _id: UserId });
        const AccessToken = user.generateAccessToken();
        const RefreshToken = user.generateRefreshToken();
        // console.log(AccessToken)
        //Have to Store Refresh Token in the DB 
        user.RefreshToken = RefreshToken;
        await user.save({ validateBeforeSave: false });
        // console.log("Access and Refresh Token Generated")
        return { AccessToken, RefreshToken };

    } catch (error) {
        console.log("Couldnt Generate Acess and Refresh Token", error.message)

    }

}


const registerUser = async function (req, res) {
    //all fields
    //check if user already exists
    //store in DB 
    //give access/refresh token 
    // console.log(req.body)

    try {
        const { username, password, email } = req.body;
        // console.log(req.body);

        if ([username, password, email].some((field => field?.trim() === ""))) {
            console.log("All fields are required")
            return res.status(400).json({ message: "All fields are required" });
        }
        const exisitngUser = await User.findOne({
            $or: [{ username }, { email }]
        })
        if (exisitngUser) {
            console.log("User already exists")
            return res.status(400).json({ message: "User already exists" });

        }
        const user = await User.create({
            username,
            password,
            email
        })
        return res.status(200).json({ user, message: "User registered" });
    } catch (error) {
        console.log("Error in registering user", error.message)
        res.status(400).json({ message: error.message });

    }
}

const loginUser = async function (req, res) {
    //except
    //validate
    //find user if not make him register
    //compare password
    //give access token

    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const user = await User.findOne({ email })
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
        secure: process.env.NODE_ENV === "production",   // false in dev, true in prod
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
    }
    const user = req.user;
    // console.log(user.email);
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
        secure: process.env.NODE_ENV === "production",   // false in dev, true in prod
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
    }

    const IncomingRefreshToken = req.cookies?.RefreshToken || req.body.RefreshToken
    if (!IncomingRefreshToken) {//Getting the token 
        return res.status(400).json({ message: "No Refresh Token" });
    }
    try {
        const DecodedRefreshToken = jwt.verify(IncomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);//Decoding

        const id = DecodedRefreshToken._id;


        const user = await User.findById(id);
        if (!user) {
            console.log("User not found")
        }

        if (user?.RefreshToken != IncomingRefreshToken) {
            return res.status(400).json({ message: "Invalid Refresh Token" })

        }

        //All verifications Done Generating Access Token

        const { AccessToken, RefreshToken } = await generateAccessAndRefreshToken(user._id);//Destructing cant be diff from what you are returning

        return res
            .status(200)
            .cookie("AccessToken", AccessToken, options)
            .cookie("RefreshToken", RefreshToken, options)
            .json({
                message: "Access Token Renewed"
            })

    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}
export { registerUser, loginUser, logoutUser, getCurrentUser, RefreshAccessToken }