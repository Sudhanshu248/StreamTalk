import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv"
import { Server } from "socket.io";
import {createServer} from "node:http";
import {connectToSocket} from "./controllers/socketManager.js";
import userRoutes from "./routes/user.routes.js"
import fetch from 'node-fetch';

const app = express();
dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = createServer(app);
const io = connectToSocket(server);

app.set("port", (process.env.PORT || 8080));

app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const dblink = process.env.DB_CONNECT;
const connectDB = async () => {
    try {
        await mongoose.connect(dblink);
        console.log("SuccessFully Mongo DB Connected !")

    }
    catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
}

app.use('/users', userRoutes);
app.get("/", (req, res) => {
    res.send("Backend Server is properly working on 8080.");
});

const start = async () => {
    server.listen(app.get("port"), () => {
        console.log("Server is successfully running on 8080 port.")
    })
    connectDB();
}

start();