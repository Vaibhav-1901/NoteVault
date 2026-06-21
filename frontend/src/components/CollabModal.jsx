import socket from "../socket/socket";
import { useState } from "react";
import { useUser } from "../context/UserContext.jsx";
import React from "react";
import { useCollab } from "../context/CollabContext.jsx";
import useToast from "../hooks/useToast.js";
import { BASE_URL } from "../../constants.js";

import {
    X, Users, Plus, LogIn,
    Copy, Check, ArrowLeft, Wifi
} from "lucide-react";



function CollabModal({ onClose }) {
    const { user } = useUser();
    const { sessionId, setSessionId } = useCollab();
    const [mode, setMode] = useState("");
    const [loading, setLoading] = useState(false);
    const [inputSessionId, setInputSessionId] = useState("");
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState("");
    const { show } = useToast();

    const handleChange = (e) => {
        setInputSessionId(e.target.value);
        setError("");
    }
    const handleCreate = () => {
        setError("");
        socket.auth = { token: user.AccessToken };
        socket.connect();
        setLoading(true);
        socket.emit("createSession");
        socket.once("sessionCreated", ({ sessionId }) => {//uisng once because we only want to listen for this event once, not every time a session is created
            setInputSessionId(sessionId);
            setMode("created");
            setLoading(false);
            socket.disconnect();
        })
        socket.on("error", ({ message }) => {
            setLoading(false);
            setError(message);
            console.log("Error creating session:", message);
        });
        socket.on("connect_error", (err) => {
            console.log(err.message); // 
            setLoading(false);
            setError(err.message);
        });
    }

    const handleJoin = () => {
        setError("");
        if (!inputSessionId) return;
        setLoading(true);
        socket.auth = { token: user.AccessToken };
         socket.connect(); // as had autoConnect false, need to connect before emitting
        console.log("Attempting to join session with ID:", inputSessionId);
        socket.emit("joinSession", { sessionId: inputSessionId });

        socket.once("sessionJoined", ({ sessionId }) => {
            setMode("joined");
            setSessionId(sessionId);
            show(`Session joined successfully`, "sessionJoin");
            setLoading(false);
            onClose(); //what is onClose? its to close the modal and open collab page
        })
        socket.on("error", ({ message }) => {
            setLoading(false);
            setError(message);
            console.log("Error joining session:", message);
        });
        socket.on("connect_error", async (err) => {
            if (err.message !== "Unauthorized"){
                console.log("Connection error:", err.message);
                setError(err.message);
                setLoading(false);
                return;
            }
            try {
                const renew = await fetch(`${BASE_URL}/api/users/refresh`, {
                    method: "POST",
                    credentials: "include"
                });
                if (!renew.ok) {
                    throw new Error("Session expired");
                    return;
                }
                const data = await renew.json();
                socket.auth = {
                    token: data.AccessToken,
                };
              
                socket.connect();
            } catch (error) {
                console.log("Error refreshing access token:", error);
                setLoading(false);
                setError("Session expired. Please log in again.");
            }

        });

    }
    const handleCopy = async () => {
        await navigator.clipboard.writeText(sessionId);
        setCopied(true);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-[440px] bg-[#111113] border border-white/8 rounded-2xl shadow-2xl overflow-hidden">

                {/* Top glow accent */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2  w-48 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                            <Users size={15} className="text-white/70" />
                        </div>
                        <div>
                            <h2 className="text-white text-[15px] font-semibold tracking-tight">
                                Collaborate
                            </h2>
                            <p className="text-white/30 text-xs mt-0.5">
                                Real-time note editing
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/5 transition-all"
                    >
                        <X size={14} />
                    </button>
                </div>

                {/* Divider */}
                <div className="h-px bg-white/5 mx-6" />

                {/* Body */}
                <div className="px-6 py-5">

                    {/* ── Initial choice ── */}
                    {!mode && (
                        <div className="flex flex-col gap-2.5">
                            <p className="text-white/40 text-xs uppercase tracking-widest font-medium mb-1">
                                Choose an option
                            </p>

                            {/* Create */}
                            <button
                                onClick={handleCreate}
                                disabled={loading}
                                className="group flex items-center gap-4 w-full bg-white/4 hover:bg-white/7 border border-white/8 hover:border-white/15 rounded-xl px-4 py-4 transition-all text-left"
                            >
                                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/15 transition-all">
                                    <Plus size={16} className="text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-white text-sm font-medium">
                                        {loading ? "Creating..." : "Create Session"}
                                    </p>
                                    <p className="text-white/35 text-xs mt-0.5">
                                        Start a new collab room & invite others
                                    </p>
                                </div>
                            </button>

                            {/* Join */}
                            <button
                                onClick={() => setMode("join")}
                                className="group flex items-center gap-4 w-full bg-white/4 hover:bg-white/7 border border-white/8 hover:border-white/15 rounded-xl px-4 py-4 transition-all text-left"
                            >
                                <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-sky-500/15 transition-all">
                                    <LogIn size={16} className="text-sky-400" />
                                </div>
                                <div>
                                    <p className="text-white text-sm font-medium">
                                        Join Session
                                    </p>
                                    <p className="text-white/35 text-xs mt-0.5">
                                        Enter a session ID to join a room
                                    </p>
                                </div>
                            </button>
                        </div>
                    )}

                    {/* ── Session Created ── */}
                    {mode === "created" && (
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <p className="text-emerald-400 text-xs font-medium">
                                    Session created
                                </p>
                            </div>

                            <div>
                                <p className="text-white/40 text-xs mb-2">
                                    Share this ID with collaborators
                                </p>
                                <div className="flex items-center justify-between bg-white/4 border border-white/8 rounded-xl px-4 py-3.5">
                                    <span className="text-white font-mono text-base tracking-[0.2em] font-medium">
                                        {inputSessionId}
                                    </span>
                                    <button
                                        onClick={handleCopy}
                                        className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors ml-3"
                                    >
                                        {copied
                                            ? <><Check size={12} className="text-emerald-400" /><span className="text-emerald-400">Copied</span></>
                                            : <><Copy size={12} /><span>Copy</span></>
                                        }
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={handleJoin}
                                className="flex items-center justify-center gap-2 w-full bg-white text-black font-semibold text-sm py-3 rounded-xl hover:bg-white/90 transition-all"
                            >
                                <Wifi size={14} />
                                Start Collaborating
                            </button>
                        </div>
                    )}

                    {/* ── Join flow ── */}
                    {mode === "join" && (
                        <div className="flex flex-col gap-3">
                            <p className="text-white/40 text-xs">
                                Paste the session ID you received
                            </p>

                            <input
                                type="text"
                                placeholder="e.g. aB3kR9mX"
                                value={inputSessionId}
                                onChange={(e) => handleChange(e)}
                                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                                className="w-full bg-white/4 border border-white/8 focus:border-white/20 text-white placeholder-white/20 font-mono tracking-[0.15em] text-base px-4 py-3.5 rounded-xl outline-none transition-all"
                                autoFocus
                            />

                            <button
                                onClick={handleJoin}
                                disabled={loading || !inputSessionId.trim()}
                                className="flex items-center justify-center gap-2 w-full bg-white text-black font-semibold text-sm py-3 rounded-xl hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <LogIn size={14} />
                                {loading ? "Joining..." : "Join Session"}
                            </button>

                            <button
                                onClick={() => { setMode(null); setSessionId(""); }}
                                className="flex items-center justify-center gap-1.5 text-white/30 hover:text-white/60 text-xs transition-colors py-1"
                            >
                                <ArrowLeft size={12} />
                                Back
                            </button>
                            {error && (
                                <div className=" px-3.5 py-2.5 bg-[#1a1010] border border-[#3a1f1f] rounded-md font-mono text-xs text-[#e07070]">
                                    {error}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 pb-5 pt-1">
                    <p className="text-white/15 text-xs text-center">
                        Changes sync in real-time across all members
                    </p>
                </div>
            </div>
        </div>
    )
}

export default CollabModal;