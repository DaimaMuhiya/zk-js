import { Router } from "express";
import attendanceRoutes from "./attendance.routes.js";
import usersAttendanceRoutes from "./users.attendance.js";
import realtimeRoutes from "./realtime.routes.js";
import { PrismaClient } from "@prisma/client";
import { getRealtimeUsers } from "../controllers/user.controller.js";

const appRoutes = Router();
const prisma = new PrismaClient();

appRoutes.use("/attendances", attendanceRoutes);
appRoutes.use("/users", usersAttendanceRoutes);
appRoutes.use("/realtime", realtimeRoutes);
appRoutes.get("/sync-status", async (req, res) => {
  const lastSync = await prisma.user.findFirst({
    orderBy: { updatedAt: "desc" },
    select: { updatedAt: true },
  });

  res.json({
    lastSync: lastSync?.updatedAt || null,
    deviceIP: process.env.DEVICE_IP,
  });
});

appRoutes.get("/zkteco/users/realtime", getRealtimeUsers);

export default appRoutes;
