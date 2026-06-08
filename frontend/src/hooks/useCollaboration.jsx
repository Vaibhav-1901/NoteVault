import { useEffect, useRef, useState } from "react";
import socket from "../socket/socket.js";
import useNote from "./useNote.js";
import { useCollab } from '../context/CollabContext.jsx';
import useToast from "./useToast.js";

const useCollaboration = (sessionId, userId, setNotes, isRemoteUpdate) => {
    //have userId
    // const isBroadcasting = useRef(false); // prevent  loop // rather use id matching to prevent loop
    
    // console.log("sessionId:", sessionId);
    // console.log("userId:", userId);
    const { allMembers, setAllMembers, onlineMembers, setOnlineMembers } = useCollab();
    const {show}=useToast();
    useEffect(() => {
        socket.on("sessionMembers", ({ members }) => {
            // console.log("Current session members: ", members);
            setAllMembers(members);
        });

        socket.on("onlineMembers", (members) => {
            // console.log("Current online members: ", members);
            setOnlineMembers(members);
        });

        return () => {
            socket.off("sessionMembers");
            socket.off("onlineMembers");
        }
    }, [])
    useEffect(() => {
        if (!sessionId || !userId) return;
        //marking UI as connected to the session
        socket.on("userJoined", ({ userId,username }) => {
            console.log("SOMEONE NEW JOINED")
            show(`${username} joined the session`, "join");
        })
        socket.on("userLeft", ({ userId,username }) => {
            console.log("SOMEONE LEFT")
            show(`${username} left the session`, "leave");
            setOnlineMembers((prevMembers)=>prevMembers.filter(((id)=> id.toString() !==userId.toString())));
            
        })
        socket.on("user-updated-note", ({ note, updatedBy }) => {
            console.log("REMOTE UPDATE");
            if (updatedBy === userId) return; 
            isRemoteUpdate.current = true;
            setNotes((prevNotes) => prevNotes.map((n) => n.id === note.id ? note : n));
        })
        socket.on("user-added-note", ({note,username})=>{
            show(`${username} added a new note`, "add");
            console.log("Remote note added: ", note);
            setNotes((prev) => [note, ...prev]);
        })
        socket.on("user-deleted-note",({id,username})=>{
            show(`${username} deleted a note`, "delete");
            setNotes((prev)=> prev.filter((note)=> note.id !=id));
        })
        return () => {
            socket.off("userJoined");
            socket.off("userLeft");
            socket.off("user-updated-note");
            socket.off("user-added-note");
            socket.off("user-deleted-note");
        };

    }, [sessionId, userId]);
}
export default useCollaboration;  