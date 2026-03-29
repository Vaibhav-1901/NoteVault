const { mongo } = require("mongoose");
import mongoose from "mongoose";
import Note from "./note.model.js";
import User from "./user.model.js";

const sessionSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true
    },
    notes:[ {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Note",
    }],
    members:[ {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }]
}, {
    timestamps: true
});

export const Session = mongoose.model('Session', sessionSchema);