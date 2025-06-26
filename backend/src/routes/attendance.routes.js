import express from "express";
import { getAttendances } from "../controllers/attendance.controller.js";

const router = express.Router();

router.get("/", getAttendances);

export default router;
