import { Router } from "express";
import { createNote , getAllNotes,editNote,deleteNote,getSingleNote} from "../controllers/note.controller.js";

const noteRouter=Router();
noteRouter.route("/create").post(createNote);
noteRouter.route("/").get(getAllNotes);
noteRouter.route("/:id").get(getSingleNote);
noteRouter.route("/edit/:id").put(editNote);
noteRouter.route("/delete/:id").delete(deleteNote);

export default noteRouter
