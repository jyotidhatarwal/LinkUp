const express = require('express');

const app = express();

app.use("/User",(req,res)=>{
    res.send("Hello User");
})

app.use("/TestUser",(req,res)=>{
    res.send("This is Testing User");
})

app.listen(3000);