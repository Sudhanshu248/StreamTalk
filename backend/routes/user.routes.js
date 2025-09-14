import {Router} from "express";
import { register , login, getUsername  } from "../controllers/user.controller.js"

const router = Router();

router.route("/login").post(login);
router.route("/register").post(register);
router.route("/get_username").get(getUsername);

export default router;