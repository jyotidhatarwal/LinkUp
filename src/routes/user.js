const express = require('express');
const { userAuth } = require('../middleware/auth');
const connectionRequest = require('../models/connectionRequest');
const connectionRequestModel = require('../models/connectionRequest');

const userRouter = express.Router();

const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills";

// get all the pending connection request for the loggedIn user
userRouter.get("/user/requests/received",userAuth, async (req,res) => {
    try{
        const loggedInUser = req.user;
        const connectionRequests = await connectionRequest.find({
            toUserId: loggedInUser._id,
            status: "interested"
        }).populate("fromUserId", ["firstName", "lastName"]);
        console.log("Inside user Router: ", connectionRequests);
        console.log("Logged in user ID:", loggedInUser._id);
        res.json({message: "Data fetched successfully",
                  data: connectionRequests
                })
    }catch(err){
        res.statusCode(400).send("ERROR: "+ err.message);
    }
});


userRouter.get("/user/connections", userAuth, async (req,res) => {
    try{
        const loggedInUser = req.user;

        const connectionRequests = await connectionRequestModel.find({
            $or:[
                {toUserId: loggedInUser._id, status: "accepted"},
                {fromUserId: loggedInUser._id, status: "accepted"}
            ]
        }).populate("fromUserId", USER_SAFE_DATA).populate("toUserId", USER_SAFE_DATA);

        const data = connectionRequests.map(row => {
            if(row.fromUserId._id.toString() === loggedInUser._id){
                return row.toUserId;
            }
            return row.fromUserId;
        });
        res.json({message: "Connection fetched successfully",
                  data: data
            })
    }catch(err){
        res.statusCode(400).send({message: err.message});
    }
});

module.exports = userRouter;