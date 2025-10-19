import mongoose, {Schema} from "mongoose";

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

    // messages: [{
    //     sender: { type: String, required: true }, // user name or ID
    //     message: { type: String, required: true },
    // }]
})

const Meeting = mongoose.model("Meeting", meetingSchema);

export { Meeting };