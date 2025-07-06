const express = require('express');
const validator = require("validator");

const app = express();
const {connectDatabase} = require("./config/database");
const User = require("./models/user");

const { adminAuth } = require("./middleware/auth")


// Middleware to convert the JSON Request to JS Object and adding it to the request
app.use(express.json());


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
        // Creating an instance of User Model
        const user = new User(req.body);
        await user.save();
        res.send("User Added Successfully to the Database.");
    } catch (err) {
        res.status(400).send(err.message);
    }
});


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
            ALLOWED_UPDATES.includes(k);
        })
        if(!isUpdateAllowed){
            throw new Error("Update not allowed!");
        }
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
