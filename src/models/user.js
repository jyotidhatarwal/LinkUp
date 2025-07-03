const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    emailId: {
        type: String
    },
    age: {
        type: String
    },
    password: {
        type: String
    },
    gender: {
        type: String
    }
});

// User Model
const User = mongoose.model("User", userSchema);

module.exports = User;