import { User } from "../models/user.models.js";
import { Meeting } from "../models/meeting.models.js";
import bcrypt, {hash} from "bcrypt";
import httpStatus from "http-status";
import crypto from "crypto";
import jwt from 'jsonwebtoken';

const register  = async (req, res) => {
    const { name, username, password } = req.body;

    if (!name || !username || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }
    
    try{
        const existingUser = await User.findOne({username});
        if(existingUser){
            return res.status(httpStatus.FOUND).json({message: "User already exists"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name: name,
            username: username,
            password: hashedPassword
        });

        await newUser.save();

        res.status(httpStatus.CREATED).json({message: "User Successfully Registered"});

    }catch(err){
        res.json({message: `Something went wrong ${err}`});
    }
}

const login = async (req, res) => {
    const {username, password} = req.body;

    if(!username || !password){
        return res.status(400).json({message: "Please provide username and password"})
    }

    try{
        const user = await User.findOne({username});
        if(!user){
            return res.status(httpStatus.NOT_FOUND).json({message: "User Not Found"});
        }

        let isPassword = await bcrypt.compare(password, user.password);
 
        if(isPassword){
            let token = crypto.randomBytes(20).toString("hex");
            user.token = token;
            await user.save();
            return res.status(httpStatus.OK).json({ token: token});
        }else{
            return res.status(httpStatus.UNAUTHORIZED).json({message: "Invalid Username or password"})
        }

    }catch(err){
        return res.status(500).json({message: `Something went wrong ${err}`});
    }
}

const getUsername = async (req, res) => {
    const { token } = req.query;

    try {
        const user = await User.findOne({ token: token });
        res.json({ username: user.username }) ;
    } catch (e) {
        res.json({ message: `Something went wrong ${e}` })
    }   
}

export { register,login, getUsername  }