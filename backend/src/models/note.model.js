import mongoose, { mongo, Schema } from "mongoose";

const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
    },
    tags:{
        type:[
            String
        ]  
    }
}, { timestamps: true,
    toJSON: { virtuals: true }
})

noteSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

export const Note = mongoose.model("note", noteSchema);