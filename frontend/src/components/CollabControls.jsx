import React from 'react'
import { Users, LogIn, LogOut, Wifi } from "lucide-react";
import { useCollab } from '../context/CollabContext.jsx';
import { useUser } from '../context/UserContext.jsx';
import socket from '../socket/socket.js';

function CollabControls({ openModal }) {
    const { sessionId, allMembers, onlineMembers, setSessionId, setAllMembers, setOnlineMembers } = useCollab();
    const { user } = useUser();
    const handleLeaveSession = () => {
        socket.emit("leaveSession", { sessionId, userId: user._id });
        socket.once("sessionLeft", () => {
            setSessionId(null);
            setAllMembers([]);
            setOnlineMembers([]);
            socket.disconnect();
        })
    }
    return (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2">
            {!sessionId && (
                <button
                    className="group flex items-center gap-2 h-9 px-4 
                               bg-[#141414] border border-white/8 
                               hover:border-white/16 hover:bg-[#1c1c1c]
                               rounded-lg transition-all duration-200
                               text-white/40 hover:text-white/70"
                    onClick={openModal}
                >
                    <Users size={13} strokeWidth={1.8} />
                    <span className="text-xs font-medium tracking-wide">
                        Collaborate
                    </span>
                </button>
            )}
            {sessionId && (
                <div className="flex items-center gap-px 
                                bg-[#141414] border border-white/8 
                                rounded-lg overflow-hidden">

                    <div className="flex items-center gap-2 h-9 px-3 border-r border-white/6">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                        </span>
                        <span className="text-[11px] text-white/35 font-mono tracking-wider">
                            {sessionId}
                        </span>
                    </div>

                    <button
                        className="group flex items-center gap-1.5 h-9 px-3
                                   text-white/30 hover:text-red-400
                                   hover:bg-red-500/8
                                   transition-all duration-200"
                        onClick={handleLeaveSession}
                    >
                        <LogOut size={13} strokeWidth={1.8} />
                        <span className="text-xs font-medium">
                            Leave
                        </span>
                    </button>
                </div>
            )}
        </div>
    )
}

export default CollabControls