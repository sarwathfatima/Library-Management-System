import express, { application } from "express";
import config from "config";

import "./dbConnect.js"


//Importing Controllers
import userRouter from "./controllers/users/index.js";


const port = config.get("PORT");
console.log(port);

const app = express();

//App Level Middlewares
//JSON Body parser

app.use(express.json());

app.use("/api/user",userRouter);

app.get("/", (req, res) => {
    res.send("Welcome to Scheduler backend")
})

app.listen(port,()=>{
    console.log("Server started at Port ",port);
})