import React, { useState, useRef } from "react";
import { BASE_URL } from "../axiosConfig";

export default function Recorder() {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);

    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      audioChunksRef.current = [];

      // Send audio to backend for transcription
      const formData = new FormData();
      formData.append("file", audioBlob, "meeting.webm");

      const response = await fetch(`${BASE_URL}/transcribe`, {
        method: "POST",
        body: formData
      });

      const data = await response.json();
      console.log("Transcript:", data.transcript);
      alert("Transcript saved: " + data.transcript);
    };

    mediaRecorderRef.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const handleStop = async (audioBlob) => {
  const formData = new FormData();
  formData.append("file", audioBlob, "meeting.wav");

  const res = await fetch(`${BASE_URL}/transcribe`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (data.success) {
    console.log("Transcript:", data.transcript);
    console.log("Summary:", data.summary);
    setTranscript(data.transcript);
    setSummary(data.summary);
  } else {
    console.error("Error:", data.message);
  }
};


  return (
    <div>
      {!recording ? (
        <button onClick={startRecording}>Start Recording</button>
      ) : (
        <button onClick={stopRecording}>Stop Recording</button>
      )}
    </div>
  );
}