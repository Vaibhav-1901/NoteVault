import React from 'react'
import AppPreview from "../assets/AppPreview.png";
import Auth from './Auth.jsx';
import { useNavigate } from 'react-router-dom';
function LandingPage() {
    const navigate = useNavigate();

    return (
        <>
            {/* ── Background: treated screenshot ── */}


            {/* ── Color grade: dark tint + emerald hue to match app accent ── */}
            <div className="absolute inset-0 bg-[#080809]/75" />

            {/* ── Subtle emerald tint so it feels designed not just darkened ── */}
            <div className="absolute inset-0 opacity-10"
                style={{ background: 'radial-gradient(ellipse at 70% 40%, rgba(52,211,153,0.3) 0%, transparent 60%)' }}
            />

            {/* ── Strong vignette on all edges ── */}
            <div className="absolute inset-0"
                style={{ background: 'radial-gradient(ellipse 80% 80% at center, transparent 20%, rgba(8,8,9,0.85) 100%)' }}
            />

            {/* ── Top + bottom hard fade ── */}
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#080809] to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#080809] to-transparent" />

            {/* ── dot grid on top of everything ── */}
            <div className="absolute inset-0 opacity-[0.04]"
                style={{
                    backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
                    backgroundSize: '32px 32px'
                }}
            />

            {/* ── Your floating mock cards go here, unchanged ── */}
            <div className="relative w-screen h-screen overflow-hidden bg-[#080809]">
                <img
                    src={AppPreview}
                    alt=""
                    className="absolute opacity-40 inset-0 w-full h-full object-cover object-center"
                />


                {/* Mock note card being edited — top left */}
                <div className="
  absolute
  right-16
  top-1/2
  -translate-y-1/2
  w-72
  rounded-2xl
  border border-white/10
  bg-[#18181b]/80
  backdrop-blur-md
  p-5
  shadow-2xl
">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white/80 text-sm font-semibold">
                            Active Members
                        </h3>

                        <span className="text-xs text-white/40">
                            2 online
                        </span>
                    </div>

                    {[
                        { name: "Vaibhav", active: true },
                        { name: "John", active: true },
                        { name: "Sarah", active: false },
                    ].map((user) => (
                        <div
                            key={user.name}
                            className="flex items-center gap-3 py-2"
                        >
                            <div className="relative">
                                <div className="
          w-8 h-8
          rounded-lg
          bg-white/10
          flex items-center justify-center
          text-sm text-white/70
          font-medium
        ">
                                    {user.name[0]}
                                </div>

                                <span
                                    className={`
            absolute
            bottom-0
            right-0
            w-2 h-2
            rounded-full
            border border-[#18181b]
            ${user.active ? "bg-emerald-400" : "bg-zinc-500"}
          `}
                                />
                            </div>

                            <span
                                className={
                                    user.active
                                        ? "text-white/70"
                                        : "text-white/30"
                                }
                            >
                                {user.name}
                            </span>
                        </div>
                    ))}
                </div>



                {/* ── Center dark radial — keeps card readable ── */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_center,_rgba(8,8,9,0.85)_0%,_transparent_100%)]" />

                {/* ── Top + bottom fade ── */}
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#080809] to-transparent" />
                {/* <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#080809] to-transparent" /> */}

                {/* ── Content ── */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full gap-6 px-4">
                    <div className="flex flex-col items-center gap-1.5">
                        <h1 className="text-white text-4xl font-bold tracking-tight font-mono">notes</h1>
                        <div className="text-center max-w-md">
                            <p className="text-white/60 text-sm">
                                Collaborative notes for teams.
                            </p>

                            <p className="text-white/35 text-xs mt-1">
                                Create a session, invite others,
                                and write together in real time.
                            </p>
                        </div>
                    </div>

                    <Auth onSuccess={() => navigate("/home")} standalone={false} />

                    <p className="text-white/10 text-[10px] tracking-widest uppercase">
                        your notes. your pace.
                    </p>
                </div>
            </div>
        </>
    )
}

export default LandingPage