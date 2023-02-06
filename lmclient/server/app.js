import express from "express";
import userrouter from "./controllers/user.js"
import adminrouter from "./controllers/admin.js"

const app = express();

const port = 5001;
app.use(express.json());

app.get("/", (req,res)=>{
    res.send("hello this is root")
})

app.use("/api/user",userrouter);
app.use("/api/admin",adminrouter);

app.listen(port, ()=>{
    console.log("Listening on port ",port)
})