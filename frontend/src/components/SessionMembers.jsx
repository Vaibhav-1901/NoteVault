import React from 'react'
import { useCollab } from '../context/CollabContext.jsx';
import { useUser } from '../context/UserContext.jsx';

function SessionMembers() {
  const { allMembers, onlineMembers } = useCollab();
  const { currentUser } = useUser();
  return (
    <div className="w-[220px] bg-[#111113] border border-white/8 border-b-0 rounded-t-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
        <span className="text-[10px] uppercase tracking-widest text-white/25 font-medium">
          Members
        </span>
        <span className='text-[10px] uppercase tracking-widest text-white/25 font-medium'>
          {onlineMembers.length} online
        </span>
      </div>

      <div className="max-h-[240px] overflow-y-auto px-2 py-2 flex flex-col gap-0.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
        {allMembers.map((user) => {
          const isActive = onlineMembers.includes(user._id.toString());
          const isYou = user._id.toString() === currentUser?._id.toString();

          return (
            <div key={user._id}
              className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/4 transition-colors"
            >
              {/* Avatar */}
              <div className={`relative w-6 h-6 rounded-md flex items-center justify-center  text-[11px] font-semibold flex-shrink-0 ${isActive
                  ? "bg-white/8 text-white/60"
                  : "bg-white/4 text-white/20"
                }`}>
                {user.username?.[0]?.toUpperCase()}

                {/* Status dot on avatar */}
                <span className={`absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5  rounded-full border border-[#111113] ${isActive ? "bg-emerald-400" : "bg-white/15"}`}
                />
                {isActive && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400/40 animate-ping" />
                )}
              </div>

              {/* Name */}
              <span className={`text-xs truncate flex-1 ${isActive ? "text-white/55" : "text-white/20"
                }`}>
                {user.username}
              </span>

              {/* You badge */}
              {isYou && (
                <span className="text-[9px] text-white/20 bg-white/5 px-1.5 py-0.5 rounded-md flex-shrink-0">
                  you
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  )
}

export default SessionMembers