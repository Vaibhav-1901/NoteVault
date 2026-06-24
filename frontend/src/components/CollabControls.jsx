import React from 'react'
import { Users, LogIn, LogOut, Wifi , ChevronUp, ChevronDown} from "lucide-react";
import { useCollab } from '../context/CollabContext.jsx';
import { useUser } from '../context/UserContext.jsx';
import useToast from '../hooks/useToast.js';
import socket from '../socket/socket.js';



function CollabControls({ openModal, isOpen, toggleSessionMembers, sidebarVisible }) {
    const { sessionId, allMembers, onlineMembers, setSessionId, setAllMembers, setOnlineMembers } = useCollab();
    const { user } = useUser();
    const {show}=useToast();
    const handleLeaveSession = () => {
        socket.emit("leaveSession", { sessionId, userId: user._id });
        socket.once("sessionLeft", () => {
            setSessionId(null);
            setAllMembers([]);
            show(`Session left successfully`, "sessionLeave");
            setOnlineMembers([]);
            socket.disconnect();
        })
    }
    return (
        <div className={` ${sidebarVisible ? "hidden md:flex" : "fixed"} md:fixed  bottom-5 right-5 z-50 flex flex-col items-stretch w-[220px]`}>
            {!sessionId ? (
                <button
                    onClick={openModal}
                    className="flex items-center gap-2 h-9 px-4 self-end
                     bg-[#141414] border border-white/8
                     hover:border-white/16 hover:bg-[#1c1c1c]
                     rounded-lg transition-all duration-200
                     text-white/40 hover:text-white/70"
                >
                    <Users size={13} strokeWidth={1.8} />
                    <span className="text-xs font-medium tracking-wide">Collaborate</span>
                </button>
            ) : (
                <div className={`flex items-center bg-[#141414] border border-white/8 ${isOpen ? "rounded-b-xl" : "rounded-xl" }`}>
                    <button
                        onClick={toggleSessionMembers}
                        className="flex items-center gap-2  px-[18px] h-10 border-r border-white/6
                                       hover:bg-white/4 transition-colors duration-200 text-left"
                    >
                        <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
                            <span className="animate-ping absolute inset-0 rounded-full bg-emerald-400 opacity-50" />
                            <span className="relative rounded-full h-1.5 w-1.5 bg-emerald-400" />
                        </span>
                        <span className="text-[11px] text-white/30 font-mono tracking-wider truncate flex-1 ml-1">
                           {onlineMembers.length} online
                        </span>
                     
                        {isOpen
                            ? <ChevronDown size={11} className="text-white/20 flex-shrink-0 animate-pulse" />
                            : <ChevronUp size={11} className="text-white/20 flex-shrink-0 animate-pulse" />
                        }
                    </button>
                 
                    <button
                        onClick={handleLeaveSession}
                        className="flex items-center gap-1.5 h-10 px-[21px] 
                         text-white/25 hover:text-red-400
                         hover:bg-red-500/8 transition-all duration-200 rounded-lg"
                    >
                        <LogOut size={12} strokeWidth={1.8} />
                        <span className="text-xs font-medium">Leave</span>
                    </button>
                </div>
            )}
        </div>
    )
}

export default CollabControls