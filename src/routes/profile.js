const express = require("express");

const profileRouter = express.Router();
const { userAuth } = require("../middleware/auth");
const {validProfileEdit} = require("../utils/utils");

// Profile View API
profileRouter.get("/profile/view", userAuth, async (req,res) => {

    try {
       const user = req.user;
       res.send(user);
    }catch (err) {
        res.status(500).send(err.message);
    }
})

// Edit Profile API

profileRouter.patch("/profile/edit", userAuth, async (req,res) => {
    try {
        if(!validProfileEdit(req)){
            res.status(400).send("Edit is not allowed!")
        }else {
            const loggedInUser = req.user;
            Object.keys(req.body).forEach((key) => {
                return loggedInUser[key] = req.body[key];
            });
            await loggedInUser.save();
            res.json({
                message: `${loggedInUser.firstName}, your profile is updated successfully`,
                data: loggedInUser
            })
        }
    }catch (err) {
        throw new Error(err.message);
    }
})


module.exports = profileRouter;
