import { Router } from "express";
import { createNote , getAllNotes,editNote,deleteNote,getSingleNote,getSessionNotes} from "../controllers/note.controller.js";

const noteRouter=Router();
noteRouter.route("/create").post(createNote);
noteRouter.route("/:userId").get(getAllNotes);
noteRouter.route("/:id").get(getSingleNote);
noteRouter.route("/edit/:id").put(editNote);
noteRouter.route("/delete/:id").delete(deleteNote);
noteRouter.route("/:sessionId/notes").get(getSessionNotes);

export default noteRouter
