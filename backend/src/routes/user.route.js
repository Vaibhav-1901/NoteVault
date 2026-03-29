import { Router } from "express";
import { registerUser,loginUser,logoutUser , RefreshAccessToken,getCurrentUser} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const userRouter = Router();
userRouter.route("/signup").post(registerUser)
userRouter.route("/signin").post(loginUser)
userRouter.route("/logout").post(verifyJWT,logoutUser)
userRouter.route("/refresh").post(RefreshAccessToken)
userRouter.route("/me").get(verifyJWT, getCurrentUser)


export { userRouter }