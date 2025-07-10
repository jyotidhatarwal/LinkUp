const jwt = require("jsonwebtoken");
const { SECRET_KEY_JWT } = require("../config/constant");
const User = require("../models/user");


const adminAuth = (req,res,next) => {
    console.log("Inside adminAuth");
    const token = "abc";
    const isAuthenticated = token === "abc";
    if(!isAuthenticated){
        res.status(401).send("UnAuthorized User");
    }else{
        next();
    }
}

const userAuth = async (req,res,next) => {
    try {
        // Read the token from the req cookies
        const {token} = req.cookies;
        if(!token) {
            throw new Error("Invalid Token!");
        }
        // Validate the token
        const decodedMessage = jwt.verify(token,SECRET_KEY_JWT);
        const {_id} = decodedMessage;
        // Find the user
        const user = await User.findById(_id);
        if(!user){
            throw new Error("User not found");
        }
        req.user = user;
        next();
    }catch (err) {
        res.status(500).send(err.message);
    }
    
}

module.exports= {
    adminAuth,
    userAuth
}