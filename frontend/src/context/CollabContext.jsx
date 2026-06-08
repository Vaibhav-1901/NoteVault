import { createContext, useEffect, useState, useContext } from "react";
import React from "react";

const CollabContext=createContext();

export const CollabProvider=({children})=>{
    const [sessionId,setSessionId]=useState(null);
    const [allMembers,setAllMembers]=useState([]);
    const[onlineMembers,setOnlineMembers]=useState([]);
    const [toasts, setToasts] = useState([]);
    return (
        <CollabContext.Provider value={{sessionId,setSessionId,allMembers,setAllMembers,onlineMembers,setOnlineMembers,toasts,setToasts}}>
            {children}
        </CollabContext.Provider>
    )
}

export function useCollab(){
    return useContext(CollabContext);
}


