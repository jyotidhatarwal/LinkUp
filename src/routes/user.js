const express = require('express');
const { userAuth } = require('../middleware/auth');
const connectionRequest = require('../models/connectionRequest');
const connectionRequestModel = require('../models/connectionRequest');
const User = require('../models/user');

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


userRouter.get("/feed", userAuth, async (req,res) => {
    try{
        const loggedInUser = req.user;
        // to apply pagination we use query parameters of page and limit /feed?page=1&limit=10
        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        limit = limit > 50 ? 50 : limit;
        const skip = (page-1) * limit;
        /* User should see all other user cards except
            1. His own card
            2.His already exisitng connections
            3. Ignored Users
            4. Already sent the connection request 
        */

        // Find all the connection request which either the loggedIn user has sent or received
        const connectionRequests = await connectionRequestModel.find({
            $or:[
                {toUserId: loggedInUser._id},
                {fromUserId: loggedInUser._id}
            ]
        }).select("fromUserId toUserId");

        const hideUsersFromFeed = new Set();
        connectionRequests.forEach(req => {
            hideUsersFromFeed.add(req.fromUserId.toString());
            hideUsersFromFeed.add(req.toUserId.toString());
        });

        // Finding all the users other than the hidden users and the logged in user
        // ne -> not equals
        // nin -> not in array
        const users = await User.find({
            $and : [
                {_id: {$nin: Array.from(hideUsersFromFeed)}},
                {_id: {$ne : loggedInUser._id}}
            ]
        }).select(USER_SAFE_DATA).skip(skip).limit(limit);
    
        res.json({message: "Successfully fetching the feed", data : users});
    }catch(err){
        res.status(400).json({message: err.message});
    }
})

module.exports = userRouter;