import { useEffect, useRef, useState } from "react";
import socket from "../socket/socket.js";
import useNote from "./useNote.js";


const useCollaboration = (sessionId, userId, setNotes, isRemoteUpdate) => {
    const [members, setMembers] = useState([]);//have userId
    // const isBroadcasting = useRef(false); // prevent  loop // rather use id matching to prevent loop
    console.log("useCollaboration mounted");
    console.log("sessionId:", sessionId);
    console.log("userId:", userId);

    useEffect(() => {
        if (!sessionId || !userId) return;
        setIsConnected(true); //marking UI as connected to the session
        socket.on("userJoined", ({ userId }) => {
            console.log("SOMEONE NEW JOINED")
            setMembers((prevMembers) => [...prevMembers, userId]);
        })
        socket.on("userLeft", ({ userId }) => {
            console.log("SOMEONE LEFT")
            setMembers((prevMembers) => prevMembers.filter((id) => id !== userId));
        })
        socket.on("user-updated-note", ({ note, updatedBy }) => {
            console.log("REMOTE UPDATE");
            if (updatedBy === userId) return; //using in place of isBrodcast to prevent loop //CAN ALSO simply use socket.to(sessionId).emit instead of io.emit in the backend to prevent sending the update to the user who made the change
            isRemoteUpdate.current = true;
            setNotes((prevNotes) => prevNotes.map((n) => n.id === note.id ? note : n));
        })
        socket.on("sessionMembers", ({ members }) => {
            setAllMembers(members);
        });
        return () => {
            socket.off("userJoined");
            socket.off("userLeft");
            socket.off("user-updated-note");
            socket.off("sessionMembers");
        };

    }, [sessionId, userId])

    return { members, isConnected };
}
export default useCollaboration;  