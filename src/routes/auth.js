const express = require("express");
const authRouter = express.Router();

const validator = require("validator");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

// Detect Production (Render) vs Local Development
const isProduction = process.env.NODE_ENV === "production";

// Dynamic Cookie Options
const cookieOptions = {
    httpOnly: true,
    secure: isProduction,                    // HTTPS only in Production
    sameSite: isProduction ? "None" : "Lax", // None for Netlify→Render, Lax for localhost
    maxAge: 60 * 60 * 1000                   // 1 hour
};

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
        return res.status(400).send("Weak password.");
    }
    if (gender && !["male", "female", "others"].includes(gender.toLowerCase())) {
        return res.status(400).send("Invalid gender.");
    }
    next();
}

// SIGNUP API
authRouter.post("/signup", validateSignup, async (req, res) => {
    try {
        const { firstName, lastName, emailId, password, age, gender, about } = req.body;

        const passwordHash = await bcrypt.hash(password, 10);

        const user = new User({
            firstName,
            lastName,
            emailId,
            password: passwordHash,
            age,
            gender,
            about
        });

        const savedUser = await user.save();

        const token = jwt.sign(
            { _id: user._id },
            process.env.SECRET_KEY_JWT,
            { expiresIn: "1h" }
        );

        res.cookie("token", token, cookieOptions);

        res.json({
            message: "User Added Successfully.",
            data: savedUser
        });

    } catch (err) {
        res.status(400).send(err.message);
    }
});

// LOGIN API
authRouter.post("/login", async (req, res) => {
    try {
        const { emailId, password } = req.body;

        const user = await User.findOne({ emailId });
        if (!user) return res.status(404).send("User not found.");

        const isCorrectPassword = await bcrypt.compare(password, user.password);
        if (!isCorrectPassword) return res.status(401).send("Invalid credentials!");

        const token = jwt.sign(
            { _id: user._id },
            process.env.SECRET_KEY_JWT,
            { expiresIn: "1h" }
        );

        res.cookie("token", token, cookieOptions);

        res.send(user);

    } catch (err) {
        res.status(500).send(err.message);
    }
});

// LOGOUT API
authRouter.post("/logout", async (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "None" : "Lax",
        expires: new Date(0)
    });

    res.send("Logged Out Successfully");
});

module.exports = authRouter;
