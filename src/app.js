const express = require('express');

const app = express();
const {connectDatabase} = require("./config/database");
const User = require("./models/user");

const { adminAuth } = require("./middleware/auth")

app.post("/signup", async (req,res) => {
    const userObj = {
        firstName: "Nitin",
        lastName: "Dhatarwal",
        emailId: "nitin.dhatarwal@lowes.com",
        age: "23",
        password: "Nitin123",
        gender: "Male"
    }

    // Creating an instance of User Model
    const user = new User(userObj);

    // Error Handling
    try {
        await user.save();
        res.send("User Added Successfully to the Database.");
    }catch(err) {
        res.status(400).send("Error saving the user: ", err.message);
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
