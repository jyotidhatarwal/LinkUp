const mongoose = require("mongoose");

const {databaseCredentials} = require("./constant");

const connectDatabase = async () => {
    await mongoose.connect(databaseCredentials);
};

module.exports = {connectDatabase};


