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

module.exports= {
    adminAuth
}