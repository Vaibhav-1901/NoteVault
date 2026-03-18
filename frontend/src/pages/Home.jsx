import React, { use } from 'react'
import { useEffect } from 'react';
import { useState } from 'react';
import useNote from '../hooks/useNote.js';

function Home() {

    const [sidebarVisible, setSidebarVisible] = useState(true);
    const [activeTag, setActiveTag] = useState("all");
    const [selectedId, setSelectedId] = useState(null);
    const { notes, error, addNote, deleteNote, editContent, toggleTag, changeTitle, saveNote, loading } = useNote();
    const [showTagPicker, setShowTagPicker] = useState(false);
    const [search, setSearch] = useState("");
    const selectedNote = notes?.find(note => note.id === selectedId);
    const filtered = notes?.filter((note) => {
        const matchTag = activeTag === "all" || note.tags.includes(activeTag);
        const matchSearch = !search || note.title?.toLowerCase().includes(search.toLowerCase()) || note.content?.toLowerCase().includes(search.toLowerCase())
        return matchTag && matchSearch;
    })
    // console.log(filtered)
    const ALL_TAGS = ["all", "work", "personal", "ideas", "archive"];
    const TAG_COLORS = {
        work: { bg: "#1e3a5f", text: "#60a5fa", dot: "#3b82f6" },
        personal: { bg: "#2d1b4e", text: "#c084fc", dot: "#a855f7" },
        ideas: { bg: "#1a3a2e", text: "#4ade80", dot: "#22c55e" },
        books: { bg: "#3b2a1a", text: "#fb923c", dot: "#f97316" },
        archive: { bg: "#1a1a1a", text: "#FFFFFF", dot: "#555" },
    };
    if (error) {
        return (
            <div className='bg-black text-red-700'>
                ⚠️ Error loading notes:{error}
            </div>
        )
    }
    // console.log(selectedNote)
    // console.log(search)

    function timeAgo(date) {
        const d = new Date(date);
        const diff = Date.now() - d.getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "just now";
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    }
    useEffect(() => {
        if (!loading) {
            if (notes?.length == 0) {
                addNote();
            }
            else if (notes) {
                setSelectedId(notes[0].id);
            }

        }
    }, [notes])

    useEffect(() => {
        if (!selectedNote) return;

        const timeout = setTimeout(() => {
            saveNote(selectedNote);
        }, 800);

        return () => clearTimeout(timeout);
    }, [selectedNote]);
    return (
        <>
            <div className="flex h-screen bg-[#111111] text-[#e0e0e0] overflow-hidden font-mono fade-in">
                {sidebarVisible && (
                    <aside className='fade-in w-55 md:min-w-85 md:w-85 bg-[#131313] border-r border-[#1f1f1f] flex flex-col h-screen overflow-hidden'>
                        {/* App header */}
                        <div className='flex items-center justify-between px-4 pt-4.5 pb-3'>
                            <div className='flex gap-2 items-center justify-center md:block md:gap-0'>
                                <button className=" md:hidden text-[#444] p-1.5 rounded-md flex items-center justify-center hover:text-[#e0e0e0] hover:bg-[#1e1e1e] transition-colors cursor-pointer border-none bg-transparent"
                                    onClick={() => setSidebarVisible((prev) => !prev)}
                                    title="Toggle sidebar">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="9" y1="3" x2="9" y2="21" />
                                    </svg>
                                </button>
                                <span className='text-[22px] font-serif color:[#e8e8e8] italic relative top-[-1px] md:top-0 '>
                                    notes
                                </span>
                            </div>
                            <button
                                onClick={addNote}
                                title="New note"
                                className="bg-[#1e1e1e] border border-[#2a2a2a] text-[#aaa] rounded-md w-7 h-7 flex items-center justify-center hover:bg-[#2a2a2a] transition-colors cursor-pointer"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                            </button>
                        </div>
                        {/* Search */}
                        <div className="mx-3 mb-3 relative flex items-center">
                            <svg className="absolute left-2.5 text-[#444] pointer-events-none" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search notes..."
                                className="w-full bg-[#1a1a1a] border border-[#222] rounded-lg py-[7px] pr-3 pl-8 text-[#ccc] text-xs font-dm focus:outline-none focus:ring-2 focus:ring-[#333] transition-colors"
                            />

                        </div>
                        {/* Tags */}
                        <div className="px-3 pb-2">
                            <div className="text-[9px] tracking-[0.12em] text-[#3a3a3a] mb-1.5 px-1">TAGS</div>
                            <div className="flex flex-col gap-px">
                                {ALL_TAGS.map((tag) => (
                                    <button
                                        key={tag}
                                        onClick={() => setActiveTag(tag)}
                                        className="flex items-center gap-2 px-2 py-[5px] rounded-md border-none text-xs text-left transition-all cursor-pointer hover:bg-[#1e1e1e] hover:text-[#e0e0e0]"
                                        style={{
                                            fontFamily: "'DM Mono', monospace",
                                            letterSpacing: "0.02em",
                                            background: activeTag === tag ? "#1e1e1e" : "transparent",
                                            color: activeTag === tag ? "#e8e8e8" : "#666",
                                        }}
                                    >
                                        <span
                                            className="w-1.5 h-1.5 rounded-full inline-block shrink-0"
                                            style={{ background: tag === "all" ? "#444" : TAG_COLORS[tag]?.dot || "#888" }}
                                        />
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="h-px bg-[#1a1a1a] my-1" />
                        {/* Notes list */}
                        <div className="flex-1 overflow-y-auto px-2 pb-4">
                            {filtered?.length === 0 && (
                                <div className="text-center text-[#555] mt-10">
                                    No notes found.
                                </div>
                            )}
                            {filtered?.map((note) => (
                                <div
                                    key={note.id}
                                    onClick={() => setSelectedId(note.id)}
                                    className={`px-3 py-2.5 mt-[1px] rounded-lg cursor-pointer mb-[2px] transition-all transform
                                            ${note.id === selectedId
                                            ? "bg-[#0d1521] border border-[#1e3a5f]"
                                            : "bg-transparent border border-transparent hover:scale-[1.01]  hover:border-[#0d2752]"
                                        }`}
                                >
                                    <div
                                        className="text-[13px] font-medium mb-0.5 truncate transition-colors"
                                        style={{
                                            letterSpacing: "-0.2px",
                                            color: note.id === selectedId ? "#efefef" : "#777",
                                        }}
                                    >
                                        {note.title || "Untitled"}
                                    </div>

                                    <div
                                        className="text-[11px] truncate leading-snug mb-2"
                                        style={{ color: note.id === selectedId ? "#555" : "#3a3a3a" }}
                                    >
                                        {note.content.slice(0, 60).replace(/\n/g, " ") || "No content"}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span
                                            className="text-[10px]"
                                            style={{ color: note.id === selectedId ? "#444" : "#2e2e2e" }}
                                        >
                                            {timeAgo(note.updatedAt)}
                                        </span>
                                        <div className="flex gap-1">
                                            {note.tags?.slice(0, 2).map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="text-[9px] px-1.5 py-0.5 rounded"
                                                    style={{
                                                        background: TAG_COLORS[tag]?.bg || "#222",
                                                        color: TAG_COLORS[tag]?.text || "#ccc",
                                                        letterSpacing: "0.03em",
                                                    }}
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </aside>
                )}
                {/* Main Full Note */}
                <main className='flex-1 flex flex-col h-screen overflow-hidden relative '>
                    {/* Tools */}

                    <div className={` items-center md:px-10 px-4 py-3 border-b border-[#1a1a1a] gap-1 relative flex  ${sidebarVisible? 'justify-end' : 'justify-between'} md:justify-between`}>
                        <button className={` ${sidebarVisible ? 'hidden' : 'md:flex'} text-[#444] p-1.5 rounded-md md:flex items-center justify-center hover:text-[#e0e0e0] hover:bg-[#1e1e1e] transition-colors cursor-pointer border-none bg-transparent `}
                            onClick={() => setSidebarVisible((prev) => !prev)}
                            title="Toggle sidebar">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="9" y1="3" x2="9" y2="21" />
                            </svg>
                        </button>
                        <div className='relative flex gap-4 '>
                            <button className='  text-[#444] p-1.5 rounded-md flex items-center justify-center hover:text-[#e0e0e0] hover:bg-[#1e1e1e] transition-colors cursor-pointer border-none bg-transparent'
                                onClick={() => setShowTagPicker((v) => !v)}
                                title="Manage tags"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                                    <line x1="7" y1="7" x2="7.01" y2="7" />
                                </svg>
                            </button>

                            {showTagPicker && (
                                <div className={`fade-in absolute top-[calc(100%+8px)] md:top-[calc(100%+8px)] md:right-0  bg-[#181818] border border-[#252525] rounded-xl py-2 w-30 md:w-50 z-50 shadow-[0_8px_30px_rgba(0,0,0,0.5)] ${sidebarVisible ? 'right-0' : 'left-[-45px]'}`}>
                                    <div>
                                        <div className='text-[9px] tracking-[0.12em] text-[#3a3a3a] px-3 pb-1.5'>
                                            Tags
                                        </div>
                                        {
                                            ALL_TAGS.map((tag) => (
                                                <div className='flex items-center gap-2 px-3 py-[7px] text-xs cursor-pointer transition-colors hover:bg-[#222] font-dm'
                                                    key={tag}
                                                    onClick={() => toggleTag(tag, selectedId)}
                                                    style={{
                                                        background: selectedNote?.tags?.includes(tag) ? TAG_COLORS[tag]?.bg : "transparent",
                                                    }}>
                                                    <span className='w-1.5 h-1.5 rounded-full flex-shrink-0'
                                                        style={{ background: TAG_COLORS[tag]?.dot }}
                                                    >
                                                    </span>
                                                    <span style={{ color: selectedNote?.tags.includes(tag) ? TAG_COLORS[tag]?.text : "#888" }}>
                                                        {tag}
                                                    </span>
                                                    {selectedNote?.tags.includes(tag) && (
                                                        <span className="ml-auto text-[11px]" style={{ color: TAG_COLORS[tag]?.text }}>✓</span>
                                                    )}
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            )}
                            <button
                                onClick={() => deleteNote(selectedId)}
                                title="Delete note"
                                className="text-[#555] p-1.5 rounded-md flex items-center justify-center hover:text-[#e0e0e0] hover:bg-[#1e1e1e] transition-colors cursor-pointer border-none bg-transparent">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    {/* Note content */}
                    {selectedNote && (
                        <div className='px-10 pt-4 flex flex-col h-full overflow-hidden'>
                            {/* //Title */}
                            <input type="text"
                                value={selectedNote?.title || ''}
                                onChange={(e) => changeTitle(e.target.value, selectedId)}
                                placeholder='Untitled Note'
                                className='bg-transparent border-none text-[#f0f0f0] w-full mb-3 font-serif text-[30px]  focus:outline-none leading-tight tracking-normal break-words w-full max-w-[600px] min-w-0'
                            />
                            {/* <div>
                                <span className='text-[11px] text-[#fff] cursor-pointer letter tracking-[0.02em] transition-colors hover:text-[#d6d6d6]'
                                onClick={()=>setShowTagPicker(prev=>!prev)}>
                                    + add tag
                                </span>
                            </div> */}

                            {selectedNote?.tags?.length > 0 && (
                                <div className='flex  gap-2'>
                                    {selectedNote.tags.map((tag) => (
                                        <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded cursor-pointer hover:opacity-80 transition-opacity text-[11px]'
                                            onClick={() => setShowTagPicker(true)}
                                            key={tag}
                                            style={{ background: TAG_COLORS[tag]?.bg || "#1F2937", color: TAG_COLORS[tag]?.text || "#FFFFFF", letterSpacing: "0.03em" }
                                            }>
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <span className=" mt-2 text-[11px] text-[#717070]">{timeAgo(selectedNote.updatedAt)}</span>


                            <div className="h-px bg-[#1a1a1a] mb-5 w-full" />
                            {/* Content */}
                            <textarea name="content" id=""
                                value={selectedNote?.content}
                                onChange={(e) => editContent(e, selectedId)}
                                placeholder="Start writing..."
                                className='flex-1 bg-transparent border-none text-[#b0b0b0] w-full overflow-y-auto font-dm text-[14px] leading-relaxed focus:outline-none tracking-[0.01em]'
                            >
                            </textarea>

                        </div>


                    )}

                </main>
                {showTagPicker && (
                    <div className="fixed inset-0 z-40" onClick={() => setShowTagPicker(false)} />
                )}
            </div>
        </>
    )
}

export default Home