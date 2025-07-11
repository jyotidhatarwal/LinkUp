const express = require("express");
const authRouter = express.Router();

const validator = require("validator");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const {SECRET_KEY_JWT} = require("../config/constant");

function validateSignup(req, res, next) {
    const { firstName, emailId, age, password, gender } = req.body;
    if (!firstName || firstName.length < 4) return res.status(400).send("First name must be at least 4 characters.");
    if (!emailId || !validator.isEmail(emailId)) return res.status(400).send("Invalid email.");
    if (!age || age < 18) return res.status(400).send("Age must be 18 or older.");
    if (!validator.isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
    })) {
        return res.status(400).send("Password must be at least 8 characters long and include lowercase, uppercase, number, and special character.");
    }
    if (gender && !["male", "female", "others"].includes(gender.toLowerCase())) {
        return res.status(400).send("Gender must be male, female, or others.");
    }
    next();
}

// SIGNUP API
authRouter.post("/signup", validateSignup, async (req, res) => {
    try {
        const {firstName, lastName, emailId, password,age,gender,about} = req.body;
        // Encrypting the password
        const passwordHash = await bcrypt.hash(password,10);

        // Creating an instance of User Model
        const user = new User({
            firstName,
            lastName,
            emailId,
            password: passwordHash,
            age,
            gender,
            about
        });
        await user.save();
        res.send("User Added Successfully to the Database.");
    } catch (err) {
        res.status(400).send(err.message);
    }
});

// LOGIN API

authRouter.post("/login", async (req,res) => {
    try {
        const {emailId, password} = req.body;
        const user = await User.findOne({emailId});
        if(!user){
            res.status(404).send("User is not Signed In");
        }
        const isCorrectPassword = await bcrypt.compare(password, user.password);
        if(isCorrectPassword) {
            // create a JWT Token
           const token = jwt.sign({_id: user._id}, SECRET_KEY_JWT, {expiresIn: "1h" });
           console.log("JWT Cookie", token);

            // Add the token to cookie and send the response back to user
            
            res.cookie("token", token);

            res.send("Login Successful");
        }else {
            res.send("Login Failed, Invalid Credentials!");
        }
    }catch(err){
        res.status(500).send(err.message);
    }
})

// LOGOUT API

authRouter.post("/logout", async (req,res) => {
    res.cookie("token", null, {
        expires: new Date (Date.now())
    });
    res.send("Logged Out Successfully");
})

module.exports = authRouter;