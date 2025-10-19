import { Router } from "express";
import { saveChatMessage, getChatMessages } from "../controllers/message.controller.js";

const router = Router();

router.route("/save_message").post(saveChatMessage);
router.route("/get_messages/:meetingCode").get(getChatMessages);

export default router;