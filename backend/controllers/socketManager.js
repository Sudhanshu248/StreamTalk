import { Server } from "socket.io";
import fs from 'fs';
import { Message } from '../models/message.models.js';
import { Meeting } from '../models/meeting.models.js';
import path from 'path';

let connections = {}
let timeOnline = {}

export const connectToSocket  = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {

        console.log("Someone Connected")

socket.on("join-call", (path) => {
    // Create room if it doesn't exist
    if (!connections[path]) {
        connections[path] = [];
    }

    // Add user to room array only if not already present
    if (!connections[path].includes(socket.id)) {
        connections[path].push(socket.id);
        console.log(`Added socket ${socket.id} to room ${path}. Total connections:`, connections[path].length);
    } else {
        console.log(`Socket ${socket.id} already in room ${path}`);
    }

    // Save user join time
    timeOnline[socket.id] = new Date();

    // **Join the room in socket.io**
    socket.join(path);  // <---- This is crucial!

    // Notify existing users in the room about the new user
    io.to(path).emit("user-joined", socket.id, connections[path]);

    // Send previous messages from MongoDB to the user who joined
    (async () => {
        // Extract meetingCode from path
        const meetingCode = extractMeetingCodeFromPath(path);
        if (meetingCode) {
            try {
                const chatMessages = await Message.find({ meetingCode }).sort({ timestamp: 1 });
                chatMessages.forEach(msg => {
                    io.to(socket.id).emit("chat-message", msg.message, msg.sender, socket.id, msg._id?.toString(), msg.timestamp);
                });
            } catch (e) {
                console.error("Error loading chat messages from DB:", e);
            }
        }
    })();
});


        socket.on('whiteboard-draw', (data) => {
            socket.broadcast.emit('whiteboard-draw', data);
        });

        socket.on('whiteboard-clear', () => {
            socket.broadcast.emit('whiteboard-clear');
        });

        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.io, message);
        })


        
socket.on("chat-message", async (data, sender) => {
    try {
        // Find which room this socket is in
        const [matchingRoom, found] = Object.entries(connections)
            .reduce(([room, isFound], [roomKey, roomValue]) => {
                if (!isFound && roomValue.includes(socket.id)) {
                    return [roomKey, true];
                }
                return [room, isFound];
            }, ['', false]);

        if (!found) {
            console.error("Socket not found in any room");
            return;
        }

        const meetingCode = extractMeetingCodeFromPath(matchingRoom);
        if (!meetingCode) {
            console.error("Could not extract meeting code from path:", matchingRoom);
            return;
        }

        // Find all meeting documents for this meetingCode
        const allMeetings = await Meeting.find({ meetingCode });
        const participantUserIds = allMeetings.map(m => m.user_id);

        // If sender's meeting document does not exist, create it
        if (!participantUserIds.includes(sender)) {
            const newMeeting = new Meeting({
                meetingCode,
                user_id: sender,
                messages: []
            });
            await newMeeting.save();
            allMeetings.push(newMeeting);
        }

        // Add the new message to every participant's meeting document
        for (const meeting of allMeetings) {
            meeting.messages.push({
                sender,
                message: data,
                timestamp: new Date()
            });
            await meeting.save();
        }

        // Emit to all users in the room
        io.to(matchingRoom).emit(
            "chat-message",
            data,
            sender,
            socket.id,
            undefined,
            new Date()
        );

    } catch (error) {
        console.error("Error handling chat message:", error);
        socket.emit("chat-error", "Failed to save message");
    }
});

function extractMeetingCodeFromPath(path) {
    // Example: if path is a URL, extract the code from it
    // Adjust this logic to match how you use meeting codes in your URLs
    const match = path.match(/([A-Za-z0-9]+)$/);
    return match ? match[1] : null;
}



        socket.on("disconnect", () => {
            var diffTime = Math.abs(timeOnline[socket.id] - new Date())

            var key;
            //Key- Means room name ya room id   
            //value- Means room mai koon koon hai  (an array of socket IDs)

            for (const [k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))){

                for(let a = 0; a < v.length; ++a){
                    if(v[a] === socket.id){
                        key = k

                        for(let a = 0; a < connections[key].length; ++a){
                            io.to(connections[key][a]).emit('user-left', socket.id)
                        }

                        var index = connections[key].indexOf(socket.id)

                        connections[key].splice(index, 1)

                        if(connections[key].length === 0){
                            delete connections[key]
                            // Optionally clear messages for this room after some time
                            // For now, we'll keep messages persistent
                        }
                    }
                }
            }
        })
    })

    return io;
}