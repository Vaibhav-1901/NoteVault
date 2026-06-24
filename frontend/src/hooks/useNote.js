import { useState, useEffect } from "react";
import { BASE_URL } from "../../constants";
import socket from "../socket/socket.js";
import { useUser } from "../context/UserContext.jsx";
import { fetchWithRefresh } from "../api/fetchWithRefresh";
import { useNavigate } from "react-router-dom";
function useNote(options = {}) {
    const [notes, setNotes] = useState([]);
    const { isCollaborative, sessionId } = options;
    const [error, setError] = useState();
    const { user, userLoading } = useUser();
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const fetchNotes = async () => {
        try {
            const data = await fetchWithRefresh(`${BASE_URL}/api/notes/user/${user._id}`);        
            setNotes(data.notes);

        } catch (err) {
            if (err.message === "Session expired") {
                navigate("/login");
                return;
            }
            setError(err.message);
        }
        finally {
            setLoading(false)
        }
    };
    const fetchSessionNotes = async () => {
        try {
            setLoading(true);
            const data = await fetchWithRefresh(`${BASE_URL}/api/notes/session/${sessionId}`);
            setNotes(data.notes);
        } catch (err) {
            if (err.message === "Session expired") {
                navigate("/login");
                return;
            }
            console.error("Error fetching session notes:", err.message);
            setError(err.message);
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
        try {
            const payload = {
                title: newNote.title,
                content: newNote.content,
                tags: newNote.tags,
                updatedAt: newNote.updatedAt
            }
            if (isCollaborative) {
                payload.sessionId = sessionId;
            }
            const data = await fetchWithRefresh(`${BASE_URL}/api/notes/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload),
            });
            setNotes((prev) => [data.note, ...prev]);
            if(isCollaborative && sessionId){
                socket.emit("note-added", { note: data.note, sessionId }); 
            }
            return data.note
        } catch (error) {
            console.log("Error:", error.message);
            setError(error.message);
        }
    }
    useEffect(() => {
        if (userLoading) return;
        if (!isCollaborative) {
            if (user?._id) {
                fetchNotes();
            }
        }
        else {
            if (sessionId) {
                fetchSessionNotes();
            }

        }

    }, [isCollaborative, sessionId, userLoading, user])
    const saveNote = async (newNote, options = {}) => {
        try {
            const { isCollaborative, sessionId } = options;
            if (!isCollaborative) {
                let data = await fetchWithRefresh(`${BASE_URL}/api/notes/edit/${newNote.id}`, {
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
            }
            else {
                socket.emit("note-updated", { note: newNote, sessionId }); 
            }
        } catch (error) {
            if (error.message === "Session expired") {
                navigate("/login");
                return;
            }
            setError(error.message);
        }
    }
    const deleteNote = async (id) => {
        try {
            const data = await fetchWithRefresh(`${BASE_URL}/api/notes/delete/${id}`, {
                method: "DELETE",
            });
            setNotes((prev) => {
                return prev.filter(note => note.id != id)
            });
            if (sessionId) {
                socket.emit("note-deleted", { id, sessionId })
            }

        } catch (error) {
            if (error.message === "Session expired") {
                navigate("/login");
                return;
            }
            console.log("Error:", error.message);
            setError(error.message);
        }
    }
    return { addNote, toggleTag, changeTitle, editContent, saveNote, deleteNote, notes, error, loading, setNotes };
}
export default useNote;