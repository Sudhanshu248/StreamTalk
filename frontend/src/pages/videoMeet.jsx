import React, { useEffect, useRef, useState, useContext } from 'react'
import axios from 'axios';
import io from "socket.io-client";
import clientServer from '../axiosConfig';
import { Badge, IconButton, TextField } from '@mui/material';
import { Button } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import CallEndIcon from '@mui/icons-material/CallEnd'
import styles from "./videoMeet.module.css";
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
import Whiteboard from './whiteboard';
import DrawIcon from '@mui/icons-material/Draw';
import Recorder from './summary';
import { AuthContext } from '../contexts/AuthContext';
// import { get } from 'mongoose';

// import server from '../environment';

const server_url = "http://localhost:8080";

var connections = {};

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

export default function VideoMeetComponent() {

    var socketRef = useRef();
    let socketIdRef = useRef();
    let localVideoref = useRef();
    const videoRef = useRef([]);
    const isConnecting = useRef(false);

    let [videoAvailable, setVideoAvailable] = useState(true);
    let [audioAvailable, setAudioAvailable] = useState(true);
    let [video, setVideo] = useState([]);
    let [audio, setAudio] = useState();
    let [screen, setScreen] = useState();
    let [showModal, setModal] = useState(false);
    let [showDashboard, setShowDashboard] = useState(false);
    let [screenAvailable, setScreenAvailable] = useState();
    let [messages, setMessages] = useState([])
    let [message, setMessage] = useState("");
    let [newMessages, setNewMessages] = useState(0);
    let [messagesLoadedFromDB, setMessagesLoadedFromDB] = useState(false);
    let [currentMeetingCode, setCurrentMeetingCode] = useState(null);
    
    let [meetingCode, setMeetingCode] = useState("");
    // let [askForUsername, setAskForUsername] = useState(true);
    let [username, setUsername] = useState("");
    let [videos, setVideos] = useState([])

    const { getUsername, saveMessage, getHistoryOfUser} = useContext(AuthContext);
    // const {getMeetingNotes} = useContext(AuthContext);
    const [stream, setStream] = useState(null);
    const [selectedLang, setSelectedLang] = useState('en'); // default English
    const [isTranslating, setIsTranslating] = useState(false);
    const [cameraError, setCameraError] = useState(null);

    // TODO
    // if(isChrome() === false) {


    // }

    useEffect(() => {
        console.log("HELLO")
        getPermissions();
        getMedia();
        fetchMeetingCode();
        
        // Cleanup function
        return () => {
            isConnecting.current = false;
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []) // Empty dependency array - only run once on mount

    // Load messages from DB when meeting code and username are available
    useEffect(() => {
        let didCancel = false;
        console.log('Message loading useEffect triggered:', {
            showModal,
            meetingCode,
            username,
            currentMeetingCode,
            messagesLoadedFromDB
        });
        
        // Load messages when we have meeting code and username, regardless of modal state
        if (meetingCode && username && currentMeetingCode !== meetingCode) {
            console.log('Loading messages from database for meeting:', meetingCode);
            setCurrentMeetingCode(meetingCode);
            setMessagesLoadedFromDB(true);
            clientServer.get(`/get_messages/${meetingCode}`)
                .then(res => {
                    if (didCancel) return;
                    console.log('Messages loaded from database:', res.data);
                    
                    // Check if response is valid JSON array
                    if (Array.isArray(res.data)) {
                        // Mark messages as own if sender matches current user
                        const loadedMessages = res.data.map(msg => ({
                            _id: msg._id,
                            sender: msg.sender,
                            original: msg.message,
                            isOwn: msg.sender === username,
                            timestamp: msg.timestamp ? new Date(msg.timestamp).getTime() : Date.now()
                        }));
                        setMessages(loadedMessages);
                    } else {
                        console.warn('Invalid response format from API:', res.data);
                        setMessages([]);
                    }
                })
                .catch(error => {
                    console.error('Error loading messages from database:', error);
                    setMessagesLoadedFromDB(false); // Reset flag on error so it can retry
                    setCurrentMeetingCode(null); // Reset meeting code on error
                });
        }
        return () => { didCancel = true; };
    }, [meetingCode, username, currentMeetingCode]);


const fetchMeetingCode = async () => {
    try {
        console.log("Fetching meeting code...");
        const history = await getHistoryOfUser();
        console.log("User history:", history);
        
        if (history && history.length > 0) {
            const latestMeeting = history[history.length - 1];
            const newMeetingCode = latestMeeting.meetingCode;
            
            console.log("Latest meeting code:", newMeetingCode);
            console.log("Current meeting code:", currentMeetingCode);
            
            // Only reset if this is actually a different meeting
            if (currentMeetingCode && currentMeetingCode !== newMeetingCode) {
                console.log("Different meeting detected, resetting flags");
                setMessagesLoadedFromDB(false);
                setCurrentMeetingCode(null);
                setMessages([]); // Clear existing messages for new meeting
            }
            
            setMeetingCode(newMeetingCode);
            console.log("MEETING CODE SET TO:", newMeetingCode);
        } else {
            console.log("No meeting found for this user");
        }
    } catch (e) {
        console.error("Error fetching meeting code:", e);
    }
};


// Removed getMessages call - messages are handled through socket events


// Removed duplicate chat message handler - handled in connectToSocketServer



    useEffect(() => {
        const fetchUsername = async () => {
            try {
                console.log("Fetching username...");
                const name = await getUsername();
                console.log("Username fetched:", name);
                setUsername(name);
            } catch (error) {
                console.error("Error fetching username:", error);
                // IMPLEMENT SNACKBAR
            }
        }

        fetchUsername();
    }, [])

    // useEffect(() => {
    //     const fetchMeetingNotes = async () => {
    //         try {
    //             const notes = await getMeetingNotes();
    //             setMeetingNotes(notes);
    //         } catch {
    //             // IMPLEMENT SNACKBAR
    //         }
    //     }

    //     fetchMeetingNotes();
    // }, [])

    //check for screen sharing
    let getDislayMedia = () => {
        if (navigator.mediaDevices.getDisplayMedia) {
            navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })   //both audio and video will included in screen share
                .then(getDislayMediaSuccess)
                .then((stream) => { })
                .catch((e) => console.log(e))
        }
    }


    const getPermissions = async () => {
        try {
            let gotVideo = false;
            let gotAudio = false;

            // Check if we already have permissions to avoid duplicate requests
            if (window.localStream) {
                console.log('Stream already exists, skipping permission check');
                return;
            }

            try {
                const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true }); //This line requests permission to access the user's camera.
                setVideoAvailable(true);
                gotVideo = true;
                videoPermission.getTracks().forEach(track => track.stop()); // it prevents the camera's light from staying on
                console.log('Video permission granted');
            } catch (e) {
                console.log('Video permission denied:', e.message);
                if (e.name === 'NotReadableError') {
                    console.log('Camera is already in use by another application. Please close other applications using the camera and refresh the page.');
                    setCameraError('Camera is in use by another application. Please close other apps and retry.');
                } else if (e.name === 'NotAllowedError') {
                    console.log('Camera permission denied by user. Please allow camera access and refresh the page.');
                    setCameraError('Camera permission denied. Please allow camera access and retry.');
                }
                setVideoAvailable(false);
            }

            try {
                const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
                setAudioAvailable(true);
                gotAudio = true;
                audioPermission.getTracks().forEach(track => track.stop());
                console.log('Audio permission granted');
            } catch (e) {
                console.log('Audio permission denied:', e.message);
                setAudioAvailable(false);
            }

            if (navigator.mediaDevices.getDisplayMedia) {  //This checks for the browser's support for screen sharing
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }

            if (gotVideo || gotAudio) { 
            // This condition ensures that a media stream is only requested if either camera or microphone 
            // permission was granted
                try {
                    const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: gotVideo, audio: gotAudio });
                    window.localStream = userMediaStream; // The live stream is stored in a global variable (window.localStream), making it accessible to other parts of the application, such as for sending it over a peer connection
                    setStream(userMediaStream); // Update the stream state as well

                    // This code connects the obtained media stream to a video element in the DOM (Document Object Model), making the user's 
                    // camera feed visible on the screen.
                    //  localVideoref is likely a React ref object
                    if (localVideoref.current) {
                        localVideoref.current.srcObject = userMediaStream;
                    }
                    console.log('Media stream created successfully');
                } catch (error) {
                    console.error('Error creating media stream:', error);
                    if (error.name === 'NotReadableError') {
                        console.log('Camera is already in use by another application. Retrying in 3 seconds...');
                        // Retry after 3 seconds
                        setTimeout(() => {
                            if (!window.localStream) {
                                console.log('Retrying media stream creation...');
                                getPermissions();
                            }
                        }, 3000);
                    } else if (error.name === 'NotAllowedError') {
                        console.log('Camera permission denied. Please allow camera access in your browser settings.');
                    }
                }
            }
        } catch (error) {
            console.error('Error in getPermissions:', error);
        }
    };

    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
            console.log("SET STATE HAS ", video, audio);
        }       
    }, [video, audio])

    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    }

    let getUserMediaSuccess = (stream) => {
        try {
            if (window.localStream) {
                window.localStream.getTracks().forEach(track => track.stop())   //It ensures that if there's an existing window.localStream (from a previous call), all its active tracks (audio and video) are stopped
            }
        } catch (e) { 
            console.log(e) 
        }

        window.localStream = stream
        setStream(stream) // Update the stream state as well
        localVideoref.current.srcObject = stream

        //Sharing the Stream with Peers
        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                console.log(description)
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        //Event Listener for Stream End
        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);
            
            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { 
                console.log(e) 
            }
            
            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            for (let id in connections) {
                connections[id].addStream(window.localStream)

                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                        })
                        .catch(e => console.log(e))
                })
            }
        })
    }

    let getUserMedia = () => {  //The getUserMedia function is designed to request a user's camera and/or microphone access
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })   //If the condition is met, this WebRTC API call prompts the user for access to their camera and/or microphone
                .then(getUserMediaSuccess)
                .then((stream) => { })
                .catch((e) => console.log(e))
        } else {
            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { }
        }
    }
    
    let getDislayMediaSuccess = (stream) => {  //This function is a callback that executes after the user successfully selects a screen, window, or tab to share
        console.log("HERE");
        
        try {
            if (window.localStream) {
                window.localStream.getTracks().forEach(track => track.stop())
            }
        } catch (e) { 
            console.log(e) 
        }

        window.localStream = stream
        setStream(stream) // Update the stream state as well
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        //The onended event fires when the screen-sharing session is stopped
        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false)

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { 
                console.log(e) 
            }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            getUserMedia()
        })
    }
    
    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message)

        if (fromId !== socketIdRef.current && connections[fromId]) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
            }
        }
    }

    let connectToSocketServer = () => {
        // Prevent multiple connections
        if (socketRef.current && socketRef.current.connected) {
            console.log("Socket already connected, skipping...");
            return;
        }
        
        if (isConnecting.current) {
            console.log("Socket connection already in progress, skipping...");
            return;
        }
        
        isConnecting.current = true;
        console.log("Creating new socket connection...");
        socketRef.current = io.connect(server_url, { secure: false })
        server_url
        socketRef.current.on('signal', gotMessageFromServer)

        // Set up chat message handler once
        socketRef.current.on('chat-message', (data, sender, socketIdSender, msgId, msgTimestamp) => {
            // Always add the message, including own, and pass _id/timestamp if available
            addMessage(data, sender, socketIdSender, msgId, msgTimestamp);
        });

        socketRef.current.on('connect', () => {
            // Don't reset the loaded flag here - let the meeting code logic handle it
            setNewMessages(0);
            
            socketRef.current.emit('join-call', window.location.href)
            socketIdRef.current = socketRef.current.id

            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id))
            })

            socketRef.current.on('user-joined', (id, clients) => {
                clients.forEach((socketListId) => {

                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
                    // Wait for their ice candidate       
                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                        }
                    }

                    // Wait for their video stream
                    connections[socketListId].onaddstream = (event) => {
                        console.log("BEFORE:", videoRef.current);
                        console.log("FINDING ID: ", socketListId);
                        
                        let videoExists = videoRef.current.find(video => video.socketId === socketListId);

                        if (videoExists) {
                            console.log("FOUND EXISTING");

                            // Update the stream of the existing video
                            setVideos(videos => {
                                const updatedVideos = videos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream: event.stream } : video
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        } else {
                            // Create a new video
                            console.log("CREATING NEW");
                            let newVideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                autoplay: true,
                                playsinline: true
                            };
                            
                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        }
                    };

                    // Add the local video stream
                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream)
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                        window.localStream = blackSilence()
                        connections[socketListId].addStream(window.localStream)
                    }
                })

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue

                        try {
                            connections[id2].addStream(window.localStream)
                        } catch (e) { }

                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                                })
                                .catch(e => console.log(e))
                        })
                    }
                }
            })
        })
    }

    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }

    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }
    
    // functions are used to toggle the on/off state of the user's camera
    const handleVideo = () => {
        setVideo((prevVideo) => {
            const newVideoState = !prevVideo;
            try {
                if (window.localStream) {
                    const videoTracks = window.localStream.getVideoTracks();
                    if (videoTracks.length > 0) {
                        videoTracks[0].enabled = newVideoState;
                        console.log('Video track enabled:', newVideoState);
                    } else {
                        console.warn('No video tracks found');
                    }
                } else {
                    console.warn('No local stream available');
                }
            } catch (error) {
                console.error('Error toggling video:', error);
            }
            return newVideoState;
        });
    };

    //functions are used to toggle the on/off state of the user's microphone
    const handleAudio = () => {
        setAudio((prevAudio) => {
            const newAudioState = !prevAudio;
            try {
                if (window.localStream) {
                    const audioTracks = window.localStream.getAudioTracks();
                    if (audioTracks.length > 0) {
                        audioTracks[0].enabled = newAudioState;
                        console.log('Audio track enabled:', newAudioState);
                    } else {
                        console.warn('No audio tracks found');
                    }
                } else {
                    console.warn('No local stream available');
                }
            } catch (error) {
                console.error('Error toggling audio:', error);
            }
            return newAudioState;
        });
    };

    useEffect(() => {
        if (screen !== undefined) {
            getDislayMedia();
        }
    }, [screen]);

    let handleScreen = () => {
        setScreen(!screen);
    }

    let handleEndCall = () => {
        try {
            let tracks = localVideoref.current.srcObject.getTracks()
            tracks.forEach(track => track.stop())
        } catch (e) { }
            window.location.href = "/dashboard"
    }

    let openChat = () => {
        setModal(true);
        setNewMessages(0);
    }

    let closeChat = () => {
        setModal(false);
    }

    let handleMessage = (e) => {
        setMessage(e.target.value);
    }

    const addMessage = async (data, sender, socketIdSender, msgId = undefined, msgTimestamp = undefined) => {
        // Use _id for deduplication if available
        const isOwn = sender === username;
        if (msgId && messages.some(msg => msg._id === msgId)) {
            console.log('Duplicate message detected by _id:', msgId);
            return;
        }
        // Otherwise, deduplicate by sender/content/timestamp
        const now = msgTimestamp ? new Date(msgTimestamp).getTime() : Date.now();
        const isDuplicate = messages.some(msg =>
            msg.original === data &&
            msg.sender === sender &&
            (Math.abs((msg.timestamp || now) - now) < 10000) // Increased time window to 10 seconds
        );
        if (isDuplicate) {
            console.log('Duplicate message detected by content/timestamp:', data);
            return;
        }

        let translatedText = data;
        if (selectedLang !== 'en' && !isOwn) {
            setIsTranslating(true);
            translatedText = await translateText(data, selectedLang);
            setIsTranslating(false);
        }
        const newMessage = {
            _id: msgId,
            sender,
            original: data,
            translated: translatedText,
            isOwn,
            timestamp: now
        };
        setMessages(prevMessages => [...prevMessages, newMessage]);
        setNewMessages(prevNewMessages => prevNewMessages + 1);
    };

    const handleLanguageChange = async (newLang) => {
        console.log('Language changed to:', newLang);
        setSelectedLang(newLang);
        
        // If changing to a non-English language, translate existing messages
        if (newLang !== 'en' && messages.length > 0) {
            console.log('Translating existing messages to:', newLang);
            setIsTranslating(true);
            
            const updatedMessages = await Promise.all(
                messages.map(async (msg) => {
                    if (msg.original) {
                        console.log('Translating message:', msg.original);
                        const translated = await translateText(msg.original, newLang);
                        console.log('Translation result:', translated);
                        return { ...msg, translated };
                    }
                    return msg;
                })
            );
            
            console.log('Updated messages:', updatedMessages);
            setMessages(updatedMessages);
            setIsTranslating(false);
        }
    };


const sendMessage = async () => {
    if (!message.trim()) return;
    // Only emit to socket, do not add to messages array directly
    socketRef.current.emit('chat-message', message, username);
    setMessage("");
};

    // let connect = () => {
    //     setAskForUsername(false);
    //     getMedia();
    // }

    const translateText = async (text, toLang) => {
        try {
            console.log('Translating:', text, 'to:', toLang);
            const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${toLang}`);
            const data = await response.json();
            console.log('Translation API response:', data);
            
            // Check if translation was successful
            if (data.responseStatus === 200 && data.responseData) {
                console.log('Translation successful:', data.responseData.translatedText);
                return data.responseData.translatedText;
            } else {
                console.warn('Translation failed:', data.responseDetails);
                return text; // fallback to original text
            }
        } catch (error) {
            console.error('Translation error:', error);
            return text; // fallback to original text
        }
    };

    return (
        <div>
    
                    {/* <video ref={localVideoref} autoPlay muted></video> */}
                

                <div className={styles.meetVideoContainer}>
                           {/* <Recorder/>      */}

                     {showDashboard 
                            ? 
                            <div className={styles.whiteboard}>
                                <Whiteboard/>
                            </div>
                            :
                            <></>
                        }

                    {showModal 
                        ? 
                        <div className={styles.chatRoom}>
                            <div className={styles.chatContainer}>
                                <h1>Chat</h1>
                                <div style={{ marginBottom: '20px', padding: '0 10px' }}>
                                    <TextField
                                        select
                                        label="Language"
                                        value={selectedLang}
                                        onChange={(e) => handleLanguageChange(e.target.value)}
                                        SelectProps={{ native: true }}
                                        variant="outlined"
                                        size="small"
                                        style={{ width: '100%' }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '8px',
                                                backgroundColor: '#f8f9fa',
                                                '&:hover': {
                                                    backgroundColor: '#f1f3f4'
                                                }
                                            },
                                            '& .MuiInputLabel-root': {
                                                fontSize: '0.875rem',
                                                color: '#5f6368'
                                            }
                                        }}
                                    >
                                    <option value="en">English</option>
                                    <option value="es">Spanish</option>
                                    <option value="fr">French</option>
                                    <option value="de">German</option>
                                    <option value="ja">Japanese</option>
                                    <option value="ko">Korean</option>
                                    <option value="zh">Chinese</option>
                                    </TextField>
                                </div>

                                <div className={styles.chattingDisplay}>
                                    {console.log('Rendering messages:', messages)}
                                    {messages.length === 0 && (
                                        <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                                            No messages yet. Start the conversation!
                                        </div>
                                    )}
                                    {messages.map((msg, index) => (
                                        <div key={index} className={`${styles.messageItem} ${msg.isOwn ? styles.ownMessage : ''}`}>
                                            <div className={styles.messageAvatar}>
                                                {msg.sender ? msg.sender.charAt(0).toUpperCase() : 'U'}
                                            </div>


                                            <div className={styles.messageContent}>
                                                <div className={styles.messageHeader}>
                                                    <span className={styles.senderName}>{msg.sender ? msg.sender : "user"}</span>
                                                </div>

                                                <div className={styles.messageBubble}>
                                                    {msg.translated || msg.original }
                                                </div>
{/*                                                 
                                                {msg.original && msg.translated && msg.original !== msg.translated && !msg.isOwn && (
                                                    // <div className={styles.originalText}>
                                                    //     Original: {msg.original}
                                                    // </div>
                                                )} */}
                                            </div>
                                        </div>
                                    ))}
                                    {isTranslating && (
                                        <div className={styles.translatingIndicator}>
                                            Translating...
                                        </div>
                                    )}
                                </div>

                                <div className={styles.chattingArea}>
                                    <TextField 
                                        value={message} 
                                        onChange={(e) => setMessage(e.target.value)} 
                                        onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
                                        id="outlined-basic" 
                                        label="Enter Your chat" 
                                        variant="outlined" 
                                        fullWidth
                                    />
                                    <Button variant='contained' onClick={sendMessage}>Send</Button>
                                </div>
                            </div>
                        </div> 
                        :
                        <></>
                    }

             

                    <div className={styles.buttonContainers}>
                        <IconButton onClick={handleVideo} style={{ color: "white" }}>
                            {(video === true) ? <VideocamIcon /> : <VideocamOffIcon />}
                        </IconButton>



                        <IconButton onClick={handleAudio} style={{ color: "white" }}>
                            {audio === true ? <MicIcon /> : <MicOffIcon />}
                        </IconButton>/

                        <IconButton onClick={handleEndCall} style={{ color: "red" }}>
                            <CallEndIcon  />
                        </IconButton>

                        {screenAvailable === true 
                            ?
                            <IconButton onClick={handleScreen} style={{ color: "white" }}>
                                {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                            </IconButton> 
                            :
                            <></>
                        }

                        <Badge badgeContent={newMessages} max={999} color='secondary'>
                            <IconButton onClick={() => setModal(!showModal)} style={{ color: "white" }}>
                                <ChatIcon />                        
                            </IconButton>
                        </Badge>

                        <IconButton onClick={() => setShowDashboard(!showDashboard)} style={{ color: "white" }}>
                            <DrawIcon/>
                        </IconButton>
                    </div>
                    

                    <video className={styles.meetUserVideo} ref={localVideoref} autoPlay muted></video>

                    <div className={styles.conferenceView}>
                        {videos.map((video) => (
                            <div key={video.socketId}>
                                <video
                                    data-socket={video.socketId}
                                    ref={ref => {
                                        if (ref && video.stream) {
                                            ref.srcObject = video.stream;
                                        }
                                    }}
                                    autoPlay
                                >
                                </video>
                            </div>
                        ))}
                    </div>

                </div>
            
        </div>
    )
}
 
