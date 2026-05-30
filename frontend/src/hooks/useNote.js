import { useState, useEffect } from "react";
import { BASE_URL } from "../../constants";
import socket from "../socket/socket.js";
import { useUser } from "../context/UserContext.jsx";
function useNote(options = {}) {
    const [notes, setNotes] = useState([]);
    const { isCollaborative, sessionId } = options;
    const [error, setError] = useState();
    const { user, userLoading } = useUser();
    const [loading, setLoading] = useState(true);
    // console.log("Session ID in useNote: ", sessionId);
    const fetchNotes = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/notes/user/${user._id}`)
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Failed to get notes')
            }
            // console.log(data.notes)
            setNotes(data.notes);

        } catch (error) {
            setError(error.message)
        }
        finally {
            setLoading(false)
        }
    };
    const fetchSessionNotes = async () => {
        try {
            setLoading(true);
            console.log("Inside for session ID: ", sessionId);
            const res = await fetch(`${BASE_URL}/api/notes/session/${sessionId}`);
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Failed to fetch session notes');
            }
             console.log("Session Notes:", data.notes);
            setNotes(data.notes);
        } catch (error) {
            console.error("Error fetching session notes:", error.message);
        }
        finally {
            setLoading(false)
        }
    }
    const toggleTag = (selectedtag, selectedId) => {
        setNotes(prev => prev.map(note => note.id === selectedId ? { ...note, tags: note.tags.includes(selectedtag) ? note.tags.filter(t => t !== selectedtag) : [...note.tags, selectedtag] } : note));
    }
    const changeTitle = (title, selectedId) => {
        setNotes(prev => prev.map(note => note.id === selectedId ? { ...note, title, updatedAt: new Date() } : note));
    }
    const editContent = (e, selectedId) => {
        setNotes(prev => prev.map(note => note.id === selectedId ? { ...note, content: e.target.value, updatedAt: new Date() } : note));
    }
    const addNote = async () => {
        const newNote = {
            title: "Untitled Note",
            content: "",
            tags: [],
            updatedAt: new Date(),
        }
        // setNotes((prev) => [newNote, ...prev]);
        try {
            const res = await fetch(`${BASE_URL}/api/notes/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: newNote.title,
                    content: newNote.content,
                    tags: newNote.tags,
                    updatedAt: newNote.updatedAt
                })
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || data.error);
            }
            setNotes((prev) => [data.note, ...prev]);
            return data.note
        } catch (error) {
            console.log("Error:", error.message);
            setError(error.message);
        }
    }
    useEffect(() => {
        console.log("useEffect in useNote called with sessionId: ", sessionId, " and isCollaborative: ", isCollaborative);
        if (userLoading) return;
        if (!isCollaborative) {
            if (user?._id) {
                fetchNotes();
            }
        }
        else {
            if (sessionId) {
                console.log("Fetching notes for session: ", sessionId);
                fetchSessionNotes();
            }

        }

    }, [isCollaborative, sessionId,userLoading,user])
    const saveNote = async (newNote, options = {}) => {
        try {
            const { isCollaborative, sessionId } = options;
            if (!isCollaborative) {
                const res = await fetch(`${BASE_URL}/api/notes/edit/${newNote.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        title: newNote.title,
                        content: newNote.content,
                        tags: newNote.tags,
                    })
                })
                const data = await res.json();
                // console.log(data)
                if (!res.ok) {
                    throw new Error(data.message || data.error);
                }
            }
            else {
                socket.emit("note-updated", { note: newNote, sessionId }); //emitting the updated note to the backend so that it can be broadcasted to other users in the session
            }
        } catch (error) {
            console.log("Error:", error.message);
            setError(error.message);
        }
    }
    const deleteNote = async (id) => {
        try {
            const res = await fetch(`${BASE_URL}/api/notes/delete/${id}`, {
                method: "DELETE"
            });
            const data = await res.json();
            if (!res.ok) {
                console.log(data.message)
                throw new Error(data.message || data.error);
            }
            setNotes((prev) => {
                return prev.filter(note => note.id != id)
            });
        } catch (error) {
            setError(error.message)
        }
    }
    return { addNote, toggleTag, changeTitle, editContent, saveNote, deleteNote, notes, error, loading }
}
export default useNote;