import express from "express";
import bcrypt from "bcrypt";
import { randomStringGenerator } from "../../utils/randomstring.js";

const router = express.Router();
//Import User Model
import usersModel from "../../models/Users/index.js";

//Import validation Middlewares
import { errorMiddleware,registerValidations} from "../../middlewares/validations/index.js";

/*
User Signup 
API : /api/user/register
PUBLIC
Validations:
Firstname cannot be Empty and Max Length is 30
Email Cannot be Empty 
Result : User is Signed Up Successfully and Stored on our DB
*/

router.post("/register",registerValidations(), errorMiddleware, async (req,res)=>{
    try {
        console.log(req.body);
        //duplication users
        const userFound = await usersModel.findOne({email:req.body.email});
        if(userFound){
           return res.status(409).json({error:"User Already Exists"})
        }
        req.body.password = await bcrypt.hash(req.body.password,12);
        let user = new usersModel(req.body);
        user.userverifyToken.email = randomStringGenerator(20);
        user.userverifyToken.phone = randomStringGenerator(20);
        await user.save();
        res.status(200).json({Success:"User Signup is Successful"})
    } catch (error) {
        console.error(error);
        res.status(500).json({error:"Internal Server Error"})
    }
})
// router()

router.post("/login", loginValidations(), errorMiddleware, async (req, res) => {
    try {
        let userFound = await usersModel.findOne({email:req.body.email});
        if (!userFound) {
            return res.status(401).json({error: "Unauthorised Access"});
        }
        let matchPassword = bcrypt.compare(req.body.password, userFound.password);
        if(!matchPassword) {
            return res.status(401).json({error: "Unauthorised Access"});
        }
        let payload = {
            id: userFound._id,
            role: userFound.role
        }
        let token = generateToken(payload);
        return res.status(200).json({success: "Login is Successful", token});
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: "Internal Server Error"});
    }
})


export default router;
