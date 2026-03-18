import express from "express"
import noteRouter from "./src/routes/note.route.js";
import cors from "cors";

const app=express();
app.use(express.json());
app.use(cors());
//note routes
app.use("/api/notes", noteRouter);


export {app}