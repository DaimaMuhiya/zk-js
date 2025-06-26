import { Router } from "express";
import attendanceRoutes from "./attendance.routes.js";
import usersAttendanceRoutes from "./users.attendance.js";

const appRoutes = Router();

appRoutes.use("/attendances", attendanceRoutes);
appRoutes.use("/users", usersAttendanceRoutes);

export default appRoutes;
