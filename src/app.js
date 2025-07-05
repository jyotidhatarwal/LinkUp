const express = require('express');

const app = express();
const {connectDatabase} = require("./config/database");
const User = require("./models/user");

const { adminAuth } = require("./middleware/auth")


// Middleware to convert the JSON Request to JS Object and adding it to the request
app.use(express.json());

app.post("/signup", async (req,res) => {
    console.log(req.body);

    // Creating an instance of User Model
   const user = new User(req.body);

    // Error Handling
    try {
        await user.save();
        res.send("User Added Successfully to the Database.");
    }catch(err) {
        res.status(400).send("Error saving the user: ", err.message);
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

connectDatabase().then(() => {
    console.log("DataBase Connection is established");
    app.listen(3000, () => {
        console.log("Server is Successfully listening to port 3000 ....");
    })
}).catch((err) => {
    console.log("Database can not be connected");
})
