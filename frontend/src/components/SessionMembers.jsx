import React from 'react'
import { useCollab } from '../context/CollabContext.jsx';
import { useUser } from '../context/UserContext.jsx';

function SessionMembers() {
  const { allMembers, onlineMembers } = useCollab();
  const { currentUser } = useUser();
  return (
    <div className="bg-[#111113] border border-white/8 rounded-xl p-3 shadow-2xl w-[200px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-white/30 text-[10px] uppercase tracking-widest font-medium">
          Members
        </span>
        <span className="text-white/20 text-[10px]">
          {onlineMembers.length} online
        </span>
      </div>

      {/* Top glow */}
      <div className="h-px bg-white/5 mb-3" />

      {allMembers.map((user) => {
        const isActive = onlineMembers.includes(user._id.toString());
        const isYou = user._id.toString() === currentUser?._id.toString();

        return (
          <div key={user._id}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/4 transition-colors"
          >
            <span className="relative flex-shrink-0">
              <span className={`block w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-400" : "bg-white/20"
                }`} />
              {isActive && (
                <span className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping" />
              )}
            </span>
{/* 
            <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-semibold flex-shrink-0 ${isActive ? "bg-white/10 text-white/70" : "bg-white/4 text-white/25"
              }`}>
              {user.username?.[0]?.toUpperCase()}
            </div> */}

            <span className={`text-xs truncate ${isActive ? "text-white/60" : "text-white/25"
              }`}>
              {user.username}
              {isYou && <span className="text-white/20 ml-1">(you)</span>}
            </span>
          </div>
        );
      })}
    </div>
  )
}

export default SessionMembers