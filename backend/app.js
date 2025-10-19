import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv"
import { Server } from "socket.io";
import {createServer} from "node:http";
import {connectToSocket} from "./controllers/socketManager.js";
import userRoutes from "./routes/user.routes.js"
import meetingRoutes from "./routes/meeting.routes.js"
import messageRoutes from "./routes/message.routes.js"
import fetch from 'node-fetch';
import multer from "multer";
import { GridFsStorage } from 'multer-gridfs-storage';
import Grid from 'gridfs-stream';

const app = express();
dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = createServer(app);
const io = connectToSocket(server);

const dblink = process.env.DB_CONNECT;

let gfs;
let conn;

// Initialize GridFS after MongoDB connection
const initGridFS = () => {
  conn = mongoose.connection;
  conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
  });
};

// Storage engine
const storage = new GridFsStorage({
  url: dblink,
  file: (req, file) => {
    return { filename: file.originalname };
  }
});
const upload = multer({ storage });

// Upload file
app.post('/upload', upload.single('file'), (req, res) => {
  res.send('File uploaded successfully!');
});

// Retrieve file
app.get('/file/:filename', (req, res) => {
  if (!gfs) {
    return res.status(503).send('GridFS not initialized yet');
  }
  
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (!file) return res.status(404).send('File not found');

    const readStream = gfs.createReadStream(file.filename);
    readStream.pipe(res);
  });
});

app.set("port", (process.env.PORT || 8080));

app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const connectDB = async () => {
    try {
        await mongoose.connect(dblink);
        console.log("SuccessFully Mongo DB Connected !")
        
        // Initialize GridFS after successful connection
        initGridFS();
    }
    catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
}

app.use('/', userRoutes);
app.use('/', meetingRoutes);
app.use('/', messageRoutes);

// Debug middleware to log all requests
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.path}`);
    next();
});

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