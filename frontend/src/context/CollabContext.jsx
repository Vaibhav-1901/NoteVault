import { createContext, useEffect, useState, useContext } from "react";
import React from "react";

const CollabContext=createContext();

export const CollabProvider=({children})=>{
    const [sessionId,setSessionId]=useState(null);
    const [allMembers,setAllMembers]=useState([]);
    const[onlineMembers,setOnlineMembers]=useState([]);
    return (
        <CollabContext.Provider value={{sessionId,setSessionId,allMembers,setAllMembers,onlineMembers,setOnlineMembers}}>
            {children}
        </CollabContext.Provider>
    )
}

export function useCollab(){
    return useContext(CollabContext);
}


