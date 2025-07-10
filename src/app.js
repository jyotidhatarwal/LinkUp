const express = require('express');
const validator = require("validator");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const app = express();
const {connectDatabase} = require("./config/database");
const User = require("./models/user");

const { userAuth } = require("./middleware/auth");
const {SECRET_KEY_JWT} = require("./config/constant");


// Middleware to convert the JSON Request to JS Object and adding it to the request
app.use(express.json());

// Middleware to  read the cookies
app.use(cookieParser());


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

app.post("/signup", validateSignup, async (req, res) => {
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

app.post("/login", async (req,res) => {
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

app.get("/profile", userAuth, async (req,res) => {

    try {
       const user = req.user;
       res.send(user);
    }catch (err) {
        res.status(500).send(err.message);
    }
})

// Get the user based on emailId from the database

app.get("/user", async (req,res) => {

    const userEmail = req.body.emailId;

    const users = await User.find({emailId: userEmail});

    try{
        if(users.length === 0){
            res.status(404).send("User Not Found");
        }else{
            res.send(users);
        }

    }catch(err) {
        res.status(500).send("Something went wrong!");
    }
})

// FEED API -> Get all the users from the database

app.get("/feed", async (req,res) => {

    const users = await User.find({});
    try {
        if(users.length === 0){
            res.status(404).send("Details not found");
        }else{
            res.send(users);
        }
       
    }catch (err) {
        res.status(500).send("Something went Wrong!");
    }
})

// Delete API -> Deleting a user based on the id
app.delete("/user", async (req,res) => {
    const userId = req.body.userId;

    try {
        const user = await User.findByIdAndDelete(userId);
        if(!user){
            res.status(404).send("User Not Found");
        }else{
            res.send("User Deleted Successfully");
        } 
    }catch(err) {
        res.status(500).send("Something went wrong!");
    }
})

//UPDATE API -> Updating the user details
app.patch("/user/:userId", async (req,res) => { 
    const userId = req.params?.userId;
    const data = req.body;
   
    try{
        const ALLOWED_UPDATES = ["password","about"];

        const isUpdateAllowed = Object.keys(data).every((k) => {
           return ALLOWED_UPDATES.includes(k);
        })
        if(!isUpdateAllowed){
            throw new Error("Update not allowed!");
        }
        // Encrypting the password
        if(data.password){
            const passwordHash = await bcrypt.hash(data.password,10);
            data.password = passwordHash;
        }
        // Finding the user
        const user = await User.findByIdAndUpdate(userId,data,{runValidators: true});
        if(!user){
            res.status(404).send("User Not Found");
        }else{
            res.send("Updated User details Successfully");
        }
    }catch(err) {
        res.status(500).send(err.message);
    }
})

// UPDATE API BASED ON EMAILID

// app.patch("/user", async (req,res) => {
//     const userEmail = req.body.emailId;
//     const data = req.body;
//     try {
//         const user = await User.findOneAndUpdate(
//             { emailId: userEmail },
//             { $set: data },
//             { new: true } // optional: returns updated doc
//         );
//         if(!user){
//             res.status(404).send("User Not Found");
//         }else{
//             res.send("User Updated Successfully");
//         } 
//     }catch(err) {
//         res.status(500).send("Something went wrong!");
//     }
// })

connectDatabase().then(() => {
    console.log("DataBase Connection is established");
    app.listen(3000, () => {
        console.log("Server is Successfully listening to port 3000 ....");
    })
}).catch((err) => {
    console.log("Database can not be connected");
})
