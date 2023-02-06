import express from "express";
import fs from "fs/promises";
import { registerValidations, errorMiddleware,loginValidations} from "../middleware/validations/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {isAuthenticated} from "../middleware/auth/token.js";
import {randomStringGenerator} from "../utils/index.js";
// import { sendMail } from "../utils/mailer.js";

const router = express.Router();

router.post(
    "/register",
    registerValidations(),
    errorMiddleware,
    async (req, res) => {
        try {
            let { username, email, fullname, password } = req.body;

            let id = randomStringGenerator(12);

            let users = await fs.readFile("users.json");
            users = JSON.parse(users);
            let findEmail = users.find((item) => item.email == email);
            if (findEmail) {
                return res.status(409).json({ error: "User already exists" });
            }
            let hashedPassword = await bcrypt.hash(password, 12);
            let user = {
                user_id: id,
                fullname,
                username,
                email,
                password: hashedPassword,
                role: "user"
            };
            users.push(user);

            // sendMail(
            //     `Welcome to our Library!\nLogin details: \n${email} : ${password}`,
            //     email
            // )
                // .then((res) => console.log(res))
        //         .catch((err) => console.log(err));
        //     await fs.writeFile("users.json", JSON.stringify(users));

        //     return res.status(200).json({ success: "User registered successfully" });
         } catch (err) {
            console.log(err);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
);

router.post("/login", loginValidations(), errorMiddleware, async (req, res) => {
    try {
        let users = await fs.readFile("users.json");
        users = JSON.parse(users);
        let { email, password } = req.body;

        let findEmail = users.find((item) => item.email == email);
        // console.log(findEmail)
        if (!findEmail) {
            return res.status(403).json({ error: "Unauthorized access" });
        }
        console.log(password, findEmail.password)
        let match = await bcrypt.compare(password, findEmail.password);
        console.log(match);
        if (!match) {
            return res.status(403).json({ error: "Unauthorized access" });
        }

        let payload = { name: findEmail.name, email, role: findEmail.role };
        let key = "bookmanagement";
        let token = jwt.sign(payload, key, { expiresIn: "1h" });

        return res.status(200).json({ success: "Successfully logged in", token });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/auth", isAuthenticated, (req, res) => {
    try {
        return res.status(200).json(req.payload);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.delete("/delete", isAuthenticated, async (req, res) => {
    try {
        let payload = req.payload;
        let email = payload.email;
        let users = await fs.readFile("users.json");
        users = JSON.parse(users);
        let findEmail = users.find((item) => item.email == email);
        if (!findEmail) {
            return res.status(401).json({ error: "Unauthorized access" });
        }
        let index = users.indexOf(findEmail);
        users.splice(index, 1);
        await fs.writeFile("users.json", JSON.stringify(users));
        return res.status(200).json({ success: "User Deleted Successfully" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/books", async (req, res) => {
    try {
        // let email = req.payload.email;
        let books = await fs.readFile("books.json");
        books = JSON.parse(books);
        // let users = await fs.readFile("users.json");
        // users = JSON.parse(users);
        // let user = users.find((item) => item.email == email);
        // if (!user) {
        //   return res.status(401).json({ error: "Unauthorized" });
        // }

        return res.status(200).json(books);
    } catch (error) {
        console.log(error);
    }
});

router.post("/borrow/:book_id", isAuthenticated, async (req, res) => {
    try {
        let email = req.payload.email;
        let users = await fs.readFile("users.json");
        users = JSON.parse(users);
        let user = users.find((item) => item.email == email);
        if (!user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        let books = await fs.readFile("books.json");
        books = JSON.parse(books);
        let book = books.find((item) => item.book_id == req.params.book_id);
        if (!book) {
            return res.status(400).json({ error: "Book not found" });
        }

        user.books.push(book);
        await fs.writeFile("users.json", JSON.stringify(users));
        return res.status(200).json({ error: "book borrowed successfully" })
    } catch (error) {
        console.log(error)
    }
});

export default router;