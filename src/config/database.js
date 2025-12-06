const mongoose = require("mongoose");

const connectDatabase = async () => {
    await mongoose.connect(process.env.DATABASE_CREDENTIALS);
};

module.exports = {connectDatabase};


