import { Server } from 'socket.io';
import { nanoid } from 'nanoid';
import { Session } from '../models/session.model.js';
import { Note } from '../models/note.model.js';
import {useCollab} from '../hooks/useCollaboration.js';

const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true
        }
    })

    io.on("connection", (socket) => {
        console.log("New client connected: ", socket.id);
        //create session
        socket.on("createSession", async ({ userId }) => {
            try {
                const sessionId = nanoid(8);
                const newsession = await Session.create({
                    sessionId,
                    members: [userId],
                    createdBy: userId
                })
                socket.join(sessionId);//joining a room with sessionId by the one who created the session
                socket.data = {
                    sessionId: newsession.sessionId,
                    userId,
                }
                socket.emit("sessionCreated", { sessionId });
                console.log("session created with id: ", sessionId);
            } catch (error) {
                socket.emit("error", { message: error.message });
                console.error("Error creating session:", error);
            }
        });

        //join session
        socket.on("joinSession", async ({ sessionId, userId }) => {
            try {
                const session = await Session.findOne({ sessionId });
                if (!session) {
                    socket.emit("error", { message: "Room not found" });
                    return;
                }
                if (!session.members.includes(userId)) {
                    session.members.push(userId);
                    await session.save();
                }
                socket.data = {
                    sessionId,
                    userId,
                }
                socket.join(sessionId);
                socket.emit("sessionMembers", { members: session.members });//sending the current members of the session to the user who just joined
                socket.emit("sessionJoined", { sessionId });// telling the user that they have joined the session
                console.log("User joined session: ", sessionId);
                console.log("Broadcasting userJoined to room:", sessionId);
                socket.to(sessionId).emit("userJoined", { userId });// telling other users in the session that a new user has joined
            } catch (error) {
                socket.emit("error", { message: error.message });
                console.error("Error joining session:", error);
            }
        })
        //NOTE ADDED TO SESSION
        socket.on("note-updated", async ({ note, sessionId }) => {
            try {
                console.log("backend has received the updated note: ", note);
                const session = await Session.findOne({ sessionId });
                if (!session) {
                    socket.emit("error", { message: "Session not found" });
                    return;
                }
                const newNote = await Note.findByIdAndUpdate(
                    note._id,
                    {
                        title: note.title,
                        content: note.content,
                        tags: note.tags
                    },
                    { returnDocument: "after" }
                )
                //emit to everyone else in the session that a note has been added
                socket.to(sessionId).emit("user-updated-note", { note: newNote, updatedBy: socket.data.userId });
            } catch (error) {
                socket.emit("error", { message: error.message });
                console.log("Error updating note:", error);
            }
        })
        //leave session 
        socket.on("leaveSession", async ({ sessionId, userId }) => {
            await handleLeave(socket, sessionId, userId);
        })

        //disconnect unexpectedly
        socket.on("disconnect", async () => {
            const { sessionId, userId } = socket.data;
            if (sessionId && userId) {
                await handleLeave(socket, sessionId, userId);
            }
        })


        async function handleLeave(socket, sessionId, userId) {
            try {
                await Session.findOneAndUpdate(
                    { sessionId },
                    { $pull: { members: userId } }
                );
                socket.leave(sessionId);
                socket.to(sessionId).emit("userLeft", { userId });
            } catch (error) {
                socket.emit("error", { message: error.message });
                console.error("Error leaving session:", error);
            }
        }
    });



}


export { initializeSocket }
