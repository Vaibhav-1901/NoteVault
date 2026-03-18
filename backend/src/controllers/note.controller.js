import { Note } from "../models/note.model.js";

const createNote= async(req,res)=>{
    try{
        const{title,content}=req.body;
        if(!title){
            return res.status(400).json({message:"Title  cannot be empty"}); 
        }
        const note= await Note.create({
            title,
            content
        })
        return res.status(200).json({note})

    } catch(error){
        console.log(error.message)
        return res.status(400).json({error:error.message});
    }
}

const getAllNotes= async(req,res)=>{
    try{
        const notes= await Note.find().sort({createdAt: -1});
        if(!notes){
            return res.status(400).json({message:"No Notes Found"});
        }
        return res.status(200).json({notes});
    } catch(error){
        return res.status(400).json({error:error.message});
    }
}
const getSingleNote= async(req,res)=>{
    try{
        const {id}=req.params;
        const note= await Note.findById(id);
        if(!note){
            return res.status(400).json({message:"No Note Found"});
        }
        return res.status(200).json({note});
    } catch(error){
        return res.status(400).json({error:error.message});
    }
}

const editNote= async(req,res)=>{
    try{
        const {id}=req.params;  
        const {title,content,tags}=req.body;
        // if(!title){
        //     return res.status(400).json({message:"Title and Content cannot be empty"});
        // }
        const note= await Note.findByIdAndUpdate(id,{
            title,
            content,
            tags
        },{returnDocument: "after" })
        if(!note){
            console.log("Error:", error.message);
            return res.status(400).json({message:"No Note Found"});
        }
        return res.status(200).json({message:"Note Successfully Updated", note}); 
    }
    catch(error){
        console.log(error.message);
        return res.status(400).json({error:error.message}); 
    }
}
const deleteNote= async(req,res)=>{
    try{
        const {id}=req.params;
        const note = await Note.findByIdAndDelete(id)
        if(!note){
            return res.status(400).json({message:"No Note Found"});
        }
        return res.status(200).json({message:"Note Successfully Deleted", note});
    }
    catch(error){
        return res.status(400).json({error:error.message}); 
    }
}


export {createNote, getAllNotes, editNote, deleteNote, getSingleNote}

