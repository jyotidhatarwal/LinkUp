const express = require('express');

const app = express();

const { adminAuth } = require("./middleware/auth")

app.use("/admin/getAllData",adminAuth,(req,res) => {
   res.send("All Data is sent");
})

app.use("/admin/deleteUser",adminAuth,(req,res) => {
    res.send("Deleted the User");
})

app.listen(3000,()=>{
    console.log("Server is Successfully listning to port 3000.....")
});