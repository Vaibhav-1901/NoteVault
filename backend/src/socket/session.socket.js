import { Server } from 'socket.io';
import { nanoid } from 'nanoid';
import { Session } from '../models/session.model.js';
import { Note } from '../models/note.model.js';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

const activeUsers = new Map();

const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: ["http://localhost:5173", "https://usecowrite.vercel.app"],
            credentials: true
        }
    })
   
    io.use(async (socket, next) => {
   
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error("Unauthorized"));
        }
        try {
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            const user = await User.findById(decoded._id).select("-password");
            if (!user) {
                return next(new Error("User not found"));
            }
            socket.data.user = user;
            next();
        } catch (error) {
            next(new Error("Unauthorized"));
        }
    })
    io.on("connection", (socket) => {
        socket.on("createSession", async () => {
            try {
                const userId = socket.data.user._id.toString();
                const username = socket.data.user.username;
                const sessionId = nanoid(8);
                const newsession = await Session.create({
                    sessionId,
                    members: [userId],
                    createdBy: userId
                })
                socket.emit("sessionCreated", { sessionId });
            } catch (error) {
                socket.emit("error", { message: error.message });
                console.error("Error creating session:", error);
            }
        });

        socket.on("joinSession", async ({ sessionId }) => {
            try {
                socket.data.sessionId = sessionId
                const userId = socket.data.user._id.toString();
                const username = socket.data.user.username;
                const session = await Session.findOne({ sessionId });
                if (!session) {
                    socket.emit("error", { message: "Session not found" });
                    return;
                }
                const alreadyMember = session.members.some(
                    memberId => memberId.toString() === userId.toString()
                );

                if (!alreadyMember) {
                    session.members.push(userId);
                    await session.save();
                }
                const updatedSession = await Session.findOne({ sessionId }).populate("members", "username");
                if (!activeUsers.has(sessionId)) {
                    activeUsers.set(sessionId, new Set());
                }
                activeUsers.get(sessionId).add(userId);
                socket.join(sessionId);
                io.to(sessionId).emit("onlineMembers", [...activeUsers.get(sessionId)])
                io.to(sessionId).emit("sessionMembers", { members: updatedSession.members });
                socket.emit("sessionJoined", { sessionId });
                socket.to(sessionId).emit("userJoined", { userId, username });
            } catch (error) {
                socket.emit("error", { message: error.message });
                console.error("Error joining session:", error);
            }
        })
        socket.on("note-updated", async ({ note, sessionId }) => {
            try {
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
                socket.to(sessionId).emit("user-updated-note", { note: newNote, updatedBy: socket.data.user._id.toString() });
            } catch (error) {
                socket.emit("error", { message: error.message });
            }
        })
        socket.on("note-added", ({ note, sessionId }) => {
            socket.to(sessionId).emit("user-added-note", { note, username: socket.data.user.username });
        })
        socket.on("note-deleted", ({ id, sessionId }) => {
            socket.to(sessionId).emit("user-deleted-note", { id, username: socket.data.user.username });
        })
        socket.on("leaveSession", async ({ sessionId }) => {
            const userId = socket.data.user._id.toString();
            await handleLeave(socket, sessionId, userId);
        })

        socket.on("disconnect", async () => {
            const sessionId = socket.data.sessionId;
            const user = socket.data.user;
            if (!user) {
                return;
            }
            const userId = user._id.toString();
            if (sessionId && userId) {
                await handleLeave(socket, sessionId, userId);
            }
        })
        async function handleLeave(socket, sessionId, userId) {
            try {

                socket.leave(sessionId);
                if (activeUsers.has(sessionId)) {
                    activeUsers.get(sessionId).delete(userId);
                }
                socket.to(sessionId).emit("userLeft", { userId, username: socket.data.user.username });
                socket.emit("sessionLeft");
                socket.data = {};

            } catch (error) {
                socket.emit("error", { message: error.message });
                console.error("Error leaving session:", error);
            }
        }
    });
}


export { initializeSocket }
