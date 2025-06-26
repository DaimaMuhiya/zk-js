import { Router } from "express";
import { getUsers } from "../controllers/user.controller.js";

const usersAttendanceRoutes = Router();

usersAttendanceRoutes.get("/", getUsers);

export default usersAttendanceRoutes;
