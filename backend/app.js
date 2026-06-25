import express from "express"
import cookieParser from "cookie-parser";
import noteRouter from "./src/routes/note.route.js";
import cors from "cors";
import { userRouter } from "./src/routes/user.route.js";
import { initializeSocket } from "./src/socket/session.socket.js";
import http from "http";

const app = express();
const server = http.createServer(app);//whenever http request comes express handles 
initializeSocket(server);
app.use(express.json());
app.use(cors({
  origin: ["http://localhost:5173",
    "https://usecowrite.vercel.app",],
    credentials: true
}));
app.use(cookieParser());
//note routes
app.use("/api/notes", noteRouter);
app.use("/api/users", userRouter);
app.get("/health", (req, res) => {
  console.log("Ping received");
  res.status(200).json({ status: "ok" });
})


export { app, server }   