const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required:true,
        minLength: 4,
        maxLength: 50
    },
    lastName: {
        type: String,
        minLength: 4,
        maxLength: 50
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if(!validator.isEmail(value)){
                throw new Error("Invalid Email Address")
            }
        }
    },
    age: {
        type: Number,
        min: 18
    },
    password: {
        type: String,
        required: true,
        validate(value) {
            if(!validator.isStrongPassword(value)){
                throw new Error("Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one special character.");
            }
        }
    },
    gender: {
        type: String,
        lowercase:true,
        validate(value) {
            if(!["male", "female", "others"].includes(value)){
                throw new Error("Gender must be male, female, or others.");
            }
        }
    },
    about: {
        type: String,
        default: "Hey ! There",
        maxLength: 250
    },
    photoUrl : {
        type: String,
        default: "https://geographyandyou.com/images/user-profile.png",
        validate(value) {
            if(!validator.isURL(value)){
                throw new Error ("Invalid photo url: "+ value)
            }
        }
    },
    skills : {
        type: [String]
    }
},{timestamps: true});

// User Model
const User = mongoose.model("User", userSchema);

module.exports = User;