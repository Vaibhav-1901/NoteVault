import { Server } from 'socket.io';
import { nanoid } from 'nanoid';
import { Session } from '../models/session.model.js';
import { Note } from '../models/note.model.js';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

const activeUsers = new Map(); //whgere does this exist in theserver 

const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true
        }
    })
    // socket auth middleware
    io.use(async (socket, next) => {
        console.log("Received token:", socket.handshake.auth.token);
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error("Unauthorized"));
        }
        try {
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            // console.log("Decoded token:", decoded);
            const user = await User.findById(decoded._id).select("-password");
            if (!user) {
                return next(new Error("User not found"));
            }
            socket.data.user = user;
            console.log("User authenticated:", user);
            next();
        } catch (error) {
            console.log(error);
            next(new Error("Unauthorized"));
        }
    })
    io.on("connection", (socket) => {
        console.log("New client connected: ", socket.id);
        //create session
        socket.on("createSession", async () => {
            try {
                const userId = socket.data.user._id.toString();
                const username = socket.data.user.username;
                //create a new session in the database
                const sessionId = nanoid(8);
                const newsession = await Session.create({
                    sessionId,
                    members: [userId],
                    createdBy: userId
                })
                socket.emit("sessionCreated", { sessionId });
                console.log("session created with id: ", sessionId);
            } catch (error) {
                socket.emit("error", { message: error.message });
                console.error("Error creating session:", error);
            }
        });

        //join session
        socket.on("joinSession", async ({ sessionId }) => {
            try {
                socket.data.sessionId = sessionId
                const userId = socket.data.user._id.toString();
                const username = socket.data.user.username;
                const session = await Session.findOne({ sessionId });
                if (!session) {
                    socket.emit("error", { message: "Session not found" });
                    console.log("Session not found with id: ", sessionId);
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
                // const userJoined = updatedSession.members.find(member => member._id.toString() === userId.toString());
                // const username = userJoined.username;
                if (!activeUsers.has(sessionId)) {
                    activeUsers.set(sessionId, new Set());
                }
                activeUsers.get(sessionId).add(userId);
                console.log("Active users in session ", sessionId, ": ", activeUsers.get(sessionId));
                socket.join(sessionId);
                // console.log("EMITTING SESSIOn")
                io.to(sessionId).emit("onlineMembers", [...activeUsers.get(sessionId)])
                io.to(sessionId).emit("sessionMembers", { members: updatedSession.members });//sending the current members of the session to the user who just joined
                // console.log("EMITTED SESSIOn")
                socket.emit("sessionJoined", { sessionId });// telling the user that they have joined the session
                // console.log("User joined session: ", sessionId);
                // console.log("Broadcasting userJoined to room:", sessionId);
                socket.to(sessionId).emit("userJoined", { userId, username });// telling other users in the session that a new user has joined
            } catch (error) {
                socket.emit("error", { message: error.message });
                console.error("Error joining session:", error);
            }
        })
        //NOTE ADDED TO SESSION
        socket.on("note-updated", async ({ note, sessionId }) => {
            try {
                // console.log("backend has received the updated note: ", note);
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
                socket.to(sessionId).emit("user-updated-note", { note: newNote, updatedBy: socket.data.user._id.toString() });
            } catch (error) {
                socket.emit("error", { message: error.message });
                console.log("Error updating note:", error);
            }
        })
        socket.on("note-added", ({ note, sessionId }) => {
            socket.to(sessionId).emit("user-added-note", { note, username: socket.data.user.username });
        })
        socket.on("note-deleted", ({ id, sessionId }) => {
            socket.to(sessionId).emit("user-deleted-note", { id, username: socket.data.user.username });
        })
        //leave session 
        socket.on("leaveSession", async ({ sessionId }) => {
            const userId = socket.data.user._id.toString();
            await handleLeave(socket, sessionId, userId);
        })

        //disconnect unexpectedly
        socket.on("disconnect", async () => {
            const sessionId = socket.data.sessionId;
            const user = socket.data.user;
            if (!user) {
                console.log("Disconnect before authentication completed.");
                return;
            }
            const userId = user._id.toString();
            if (sessionId && userId) { //very imp if to prevent infinite loop
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
