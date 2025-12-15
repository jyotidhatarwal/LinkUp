const socket = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");
const connectionRequestModel = require("../models/connectionRequest");

const getSecretRoomId = (userId, targetUserId) => {
   return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("_"))
    .digest("hex");
}

const initializeSocket = (server) => {

    const io = socket(server, {
        cors: {
            origin: 'http://localhost:5173',
        }
    });

    io.on("connection", (socket) => {
        //Handle events
        socket.on("joinChat", ({firstName, userId, targetUserId}) => {
            const roomId = getSecretRoomId(userId, targetUserId); // uniqueId
            console.log(firstName + " Joining Room ", roomId);
            socket.join(roomId);
        });

        socket.on("sendMessage", async ({
            firstName,
            lastName,
            userId,
            targetUserId,
            text
        }) => {
            try {
                const roomId = getSecretRoomId(userId, targetUserId);
                console.log(firstName + " Joining room " + roomId);
                console.log(firstName + " Received " + text);

                // Check if the userId and tragetUserId are friends
               await connectionRequestModel.findOne({
                    $or : [
                    {
                    fromUserId: userId,
                    toUserId: targetUserId,
                    status: "accepted"
                    },
                    {
                        fromUserId: targetUserId,
                        toUserId: userId,
                        status: "accepted"
                    }
                ]
            });
                 // save message to database
                let chat = await Chat.findOne({
                    participants: { $all : [userId, targetUserId]},
                });
                if(!chat){
                    chat = new Chat ({
                        participants: [userId, targetUserId],
                        messages: []
                    });
                }

                chat.messages.push({
                    senderId: userId,
                    text
                });
                await chat.save();
                io.to(roomId).emit("messageReceived", {firstName,lastName, text})
            }catch (err){
                console.log("Error saving chats to the database ", err.message);
            }
            
            
        });

        socket.on("disconnect", () => {

        })
    });
}

module.exports = initializeSocket;