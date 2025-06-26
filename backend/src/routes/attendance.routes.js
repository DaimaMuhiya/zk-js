import { Router } from "express";
import { getAttendances } from "../controllers/attendance.controller.js";

const attendanceRoutes = Router();

attendanceRoutes.get("/", getAttendances);

export default attendanceRoutes;
