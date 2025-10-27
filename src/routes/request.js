const express = require("express");
const { userAuth } = require("../middleware/auth");
const ConnectionRequestModel = require("../models/connectionRequest");
const User = require("../models/user");

const connectionRequestRouter = express.Router();

connectionRequestRouter.post("/request/send/:status/:toUserId", userAuth, async (req,res) => {
    try {
        const fromUserId = req.user._id;
        const toUserId = req.params?.toUserId;
        const status = req.params?.status;

        const allowedStatus = ["ignored", "interested"];
        if(!allowedStatus.includes(status)){
            return res.status(400).json({
                message: "Invalid status type: " + status
            })
        }

        // Request to be only sent if the user is present in database
        const toUser = await User.findById(toUserId);
        if(!toUser){
            return res.status(400).json({message: "User not found"});
        }

        if(fromUserId.equals(toUserId)){
            throw new Error("Can not send connection request to yourself!")
        }

        // If there is an existing connection request
        const existingConnectionRequest = await ConnectionRequestModel.findOne({
            $or: [
                {fromUserId, toUserId}, // check if there are duplicates for the same request
                {fromUserId: toUserId, toUserId: fromUserId} // check if the other person has also sent the request
            ]
        })
        console.log("Inside the Connection request routes");

        if(existingConnectionRequest) {
            return res.status(400).send("Connection Request Already exists");
        }
    
        const connectionRequest = new ConnectionRequestModel({
            fromUserId, toUserId, status
        });
        const data = await connectionRequest.save();
    
        res.json({
            message: req.user?.firstName + req.user?.lastName + " is " + status + " in " + toUser?.firstName + toUser?.lastName,
            data
        })
    } catch (err) {
        res.status(400).send(err.message);
    }
   
});


connectionRequestRouter.post("/request/review/:status/:requestId", userAuth,async (req,res) => {
    try{
        const loggedInUser = req.user;
        const {status, requestId} = req.params
        // validation scenarios
        /* 
            User 1 sent the request to user 2
            loggedInUser == toUserId (user 2)
            status = interested
            requestId should be valid ( means requestId should be present in our Database)
        */
       const allowedStatus = ["accepted", "rejected"];
       if(!allowedStatus.includes(status)){
        return res.status(400).json({message: "Status is not allowed"})
       }
       // Now check If the requestId is present in the database or not
       const connectionRequest = await ConnectionRequestModel.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested"
       })
       console.log("Connection request", connectionRequest);

       // Suppose if their is no such connection request then I will just tell the user not found
       if(!connectionRequest){
        return res.status(404).json({message: "Connection request not found"});
       }

       /* Suppose if we found the request where requestId is matching, status is interested 
       and the toUserId is same as the loggedIn user than we are safe to change the status    */

       connectionRequest.status = status;
       const data = await connectionRequest.save();
       res.json({message: "Connection request is " + status, data});


    }catch(err){
        res.status(400).send("ERROR: " + err.message);
    }
});

module.exports = connectionRequestRouter;