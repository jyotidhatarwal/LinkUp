const express = require('express');
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const {connectDatabase} = require("./config/database");
const PORT = process.env.PORT || 3000;
const http = require("http");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const cors = require("cors");
const allowedOrigins = [
    "http://localhost:5173",
    "https://linkup-ui.netlify.app"
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow server-to-server requests and tools (like Postman)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));
// Middleware to convert the JSON Request to JS Object and adding it to the request
app.use(express.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
  });

// Middleware to  read the cookies
app.use(cookieParser());
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const connectionRequestRouter = require("./routes/request");
const userRouter = require('./routes/user');
const initializeSocket = require('./utils/socket');

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", connectionRequestRouter);
app.use("/", userRouter);

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


const server = http.createServer(app);
initializeSocket(server);

connectDatabase().then(() => {
    console.log("DataBase Connection is established");
    server.listen(3000, () => {
        console.log(`Server is Successfully listening to port 3000 ....`);
    })
}).catch((err) => {
    console.log("Database can not be connected",err.message);
})
