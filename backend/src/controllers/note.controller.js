import { Note } from "../models/note.model.js";
import { User } from "../models/user.model.js";
import { Session } from "../models/session.model.js";
const createNote= async(req,res)=>{
    try{
        const{title,content,sessionId}=req.body;
        if(!title){
            return res.status(400).json({message:"Title  cannot be empty"}); 
        }
        let session;
        if(sessionId){
            session = await Session.findOne({sessionId});
            console.log(session)
            if(!session){
                console.log("No session found with ID:", sessionId);
                return res.status(400).json({message:"No Session Found for this ID"});
                console.log("No session found with ID:", sessionId);
            }
        }
        
        const note= await Note.create({
            title,
            content,
            userId:req.user._id,
            sessionId:session?._id
        })
        return res.status(200).json({note})

    } catch(error){
        console.log(error.message)
        return res.status(400).json({error:error.message});
    }
}

const getAllNotes= async(req,res)=>{
    try{
        const {userId}=req.params;
        let notes= await Note.find({userId}).sort({createdAt: -1});
        if(!notes){
            return res.status(400).json({message:"No Notes Found"});
        }
        notes=notes.filter(note => note.sessionId == null); 
        return res.status(200).json({notes});
    } catch(error){
        console.log(error.message);
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
        console.log(error.message);
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

const getSessionNotes=async(req,res)=>{
    try {
        const {sessionId}=req.params;
        const session = await Session.findOne({sessionId}).sort({updatedAt:-1});
        if(!session){
            console.log("No session found with ID:", sessionId);
            return res.status(400).json({message:"No Session Found for this ID"});
        }
        // console.log("Session found:", session);
        // console.log("Got session:", session._id);
        const notes = await Note.find({sessionId:session._id}).sort({updatedAt:-1});
        if(!notes){
            console.log("No notes found for session:", sessionId);
            return res.status(400).json({message:"No Notes Found for this session"});
        }
        return res.status(200).json({notes});   
    } catch (error) {
        console.log("Error fetching session notes:", error.message);
        return res.status(400).json({error:error.message});
    }
}

export {createNote, getAllNotes, editNote, deleteNote, getSingleNote, getSessionNotes}

