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

module.exports = connectionRequestRouter;