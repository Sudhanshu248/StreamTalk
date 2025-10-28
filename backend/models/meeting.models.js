import mongoose, {Schema} from "mongoose";

const messageSchema = new Schema({
    sender: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const meetingSchema = new Schema({
    user_id: {
        type: String
    },

    meetingCode: {
        type: String, 
        required: true
    },
    
    notes: {
        name: String,
        contentType: { type: String, default: "text/plain" },
        data: String,
        uploadedAt: { type: Date, default: Date.now }
    },

    date: {
        type: Date,
        default: Date.now,
        required: true
    },

    messages: [messageSchema]  // Array of messages for each meeting
})

const Meeting = mongoose.model("Meeting", meetingSchema);

export { Meeting };