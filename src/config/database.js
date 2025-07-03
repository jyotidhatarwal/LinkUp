const mongoose = require("mongoose");

const connectDatabase = async () => {
    await mongoose.connect("mongodb+srv://jyotidhatarwal1999:3JIYOPh1aZVF5Bve@jyoti.qiaozgl.mongodb.net/linkUp");
};

module.exports = {connectDatabase};


