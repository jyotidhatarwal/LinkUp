const express = require('express');

const app = express();

app.use("/TestUser",(req,res)=>{
    res.send("This is Testing User");
})

app.get("/User",(req,res)=>{
    console.log(req.query);
    res.send({firstName: "Jyoti", lastName: "Dhatarwal"})
});

app.post("/User",(req,res)=>{
    res.send("Data Successfully Added to the Database")
});

app.delete("/User",(req,res)=>{
    res.send("Data Successfully delted from the database")
});

app.listen(3000,()=>{
    console.log("Server is Successfully listning to port 3000.....")
});