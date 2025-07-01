import { Router } from "express";
import attendanceRoutes from "./attendance.routes.js";
import usersAttendanceRoutes from "./users.attendance.js";
import { getUsers } from "../controllers/user.controller.js";
import { PrismaClient } from "@prisma/client";

const appRoutes = Router();
const prisma = new PrismaClient();

appRoutes.use("/attendances", attendanceRoutes);
appRoutes.use("/users", usersAttendanceRoutes);

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

export default appRoutes;
