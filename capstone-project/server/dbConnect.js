import mongoose from "mongoose";
import config from "config";
async function dbConnect(){
    try {
        await mongoose.connect(config.get("DB_URI"));
        console.log("Connection is Successful");
    } catch (error) {
        console.error(error);
    }
}

dbConnect();