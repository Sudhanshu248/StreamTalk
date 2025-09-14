import { Router } from "express";
import { getUserHistory, addToHistory, getMeetingNotes, saveMeetingNotes, saveMessage, getMessages } from "../controllers/meeting.controller.js";

const router = Router();

router.route("/add_to_activity").post(addToHistory);
router.route("/get_all_activity").get(getUserHistory);
router.route("/get_meeting_notes/:meetingCode").get(getMeetingNotes);
router.route("/save_meeting_notes").post(saveMeetingNotes);
router.route("/save_message").post(saveMessage);
router.route("/get_messages/:meetingCode").get(getMessages);

export default router;