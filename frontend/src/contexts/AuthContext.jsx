import axios from "axios";
import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import httpStatus from "http-status";

export const AuthContext = createContext({});

const client = axios.create({
    baseURL: "http://localhost:8080/"
})

export const AuthProvider = ({children}) => {

    const [userData, setUserData] = useState(null);
//     // Option 2: empty object
// const [userData, setUserData] = useState({});

// // Option 3: object with default values
// const [userData, setUserData] = useState({
//     isLoggedIn: false,
//     user: null
// });

    const router = useNavigate();

    const handleRegister = async (name, username, password) => {
        try {
            let request = await client.post("/register", {
                name: name,
                username: username,
                password: password
            })

            if(request.status === httpStatus.CREATED){
                return request.data.message;
            }
        } catch (error) {
            throw error;
        }
    }

    const handleLogin = async (username, password) => {
        try{
            let request = await client.post("/login", {
                username: username,
                password: password
            });

            if(request.status === httpStatus.OK){
                localStorage.setItem("token", request.data.token);
                router("/dashboard")
            }
        }catch(error){
            throw error;
        }
    }

    const getUsername = async () => {
        try {
            let request = await client.get("/get_username", {
                params: {
                    token: localStorage.getItem("token")
                }
            });
            return request.data.username
        }
        catch (err) {
            throw err;
        }
    }

    const getHistoryOfUser = async () => {
        try {
            let request = await client.get("/get_all_activity", {
                params: {
                    token: localStorage.getItem("token")
                }
            });
            return request.data
        } catch(err) {
            throw err;
        }
    }

    const addToUserHistory = async (meetingCode) => {
        try {
            let request = await client.post("/add_to_activity", {
                token: localStorage.getItem("token"),
                meeting_code: meetingCode
            });
            return request
        } catch (e) {
            throw e;
        }
    }

const saveMeetingNotes = async (meetingCode, notes) => {
  try {
    const res = await client.post("/save_meeting_notes", {
      meetingCode,
      notes
    });
    return res.data;
  } catch (err) {
    console.error("Error saving meeting notes:", err);
    throw err;
  }
};


    const getMeetingNotes = async (meetingCode) => {
        try {
            let request = await client.get(`/get_meeting_notes/${meetingCode}`);
            return request.data
        } catch (e) {
            throw e;    
        }
    }

    const saveMessage = async (meetingCode, sender, message) => {
  try {
    return await client.post("/save_message", { meetingCode, sender, message });
  } catch (err) {
    throw err;
  }
};

const getMessages = async (meetingCode) => {
  const res = await axios.get(`/get_messages/${meetingCode}`);
  return res.data; // This will be an array of messages
};

// Removed getMessages function - messages handled through socket events

    const data = {
        userData, setUserData, handleRegister, handleLogin, addToUserHistory, getHistoryOfUser, getUsername, getMeetingNotes, saveMeetingNotes, saveMessage, getMessages
    }

    return(
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    )
}