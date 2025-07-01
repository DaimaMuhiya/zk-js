import { Router } from "express";
import { getRealtimeUsers } from "../controllers/user.controller.js";

const realtimeRoutes = Router();

realtimeRoutes.get("/", getRealtimeUsers);

export default realtimeRoutes;
