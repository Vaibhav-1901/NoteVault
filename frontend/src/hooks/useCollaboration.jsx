import { useEffect, useRef, useState } from "react";
import socket from "../socket/socket.js";
import useNote from "./useNote.js";
import { useCollab } from '../context/CollabContext.jsx';

const useCollaboration = (sessionId, userId, setNotes, isRemoteUpdate) => {
    //have userId
    // const isBroadcasting = useRef(false); // prevent  loop // rather use id matching to prevent loop
    console.log("useCollaboration mounted");
    // console.log("sessionId:", sessionId);
    // console.log("userId:", userId);
    const { allMembers, setAllMembers, onlineMembers, setOnlineMembers } = useCollab();
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
        console.log("REGISTERING LISTENERS");
        if (!sessionId || !userId) return;
        //marking UI as connected to the session
        console.log("socket connected?", socket.connected);
        socket.on("userJoined", ({ userId }) => {
            console.log("SOMEONE NEW JOINED")
            // setAllMembers((prevMembers) => [...new Set([...prevMembers, userId])]);
        })
        socket.on("userLeft", ({ userId }) => {
            console.log("SOMEONE LEFT")
            setOnlineMembers((prevMembers)=>prevMembers.filter(((id)=> id.toString() !==userId.toString())));
            
        })
        socket.on("user-updated-note", ({ note, updatedBy }) => {
            console.log("REMOTE UPDATE");
            if (updatedBy === userId) return; //using in place of isBrodcast to prevent loop //CAN ALSO simply use socket.to(sessionId).emit instead of io.emit in the backend to prevent sending the update to the user who made the change
            isRemoteUpdate.current = true;
            setNotes((prevNotes) => prevNotes.map((n) => n.id === note.id ? note : n));
        })

        return () => {
            socket.off("userJoined");
            socket.off("userLeft");
            socket.off("user-updated-note");

        };

    }, [sessionId, userId]);
}
export default useCollaboration;  