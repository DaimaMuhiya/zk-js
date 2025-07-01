import { PrismaClient } from "@prisma/client";
import { getDeviceData } from "../services/device.service.js";

const prisma = new PrismaClient();

export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { synced: true },
      include: {
        attendances: {
          select: {
            timestamp: true,
            status: true,
            deviceSn: true,
          },
          orderBy: {
            timestamp: "desc",
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    res.json({
      data: users.map((user) => ({
        id: user.id,
        deviceUserId: user.deviceUserId,
        name: user.name,
        role: user.role,
        cardno: user.cardno,
        lastSync: user.updatedAt,
        attendances: user.attendances,
      })),
      meta: {
        total: users.length,
        lastSync: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const getRealtimeUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const { users } = await getDeviceData();

    const filteredUsers = users.filter(
      (u) => !role || u.role.toLowerCase() === role.toLowerCase()
    );

    res.json({
      data: filteredUsers,
      meta: {
        total: filteredUsers.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Erreur temps réel:", error);
    res.status(500).json({
      error: "Impossible de contacter le dispositif",
      details: error.message,
    });
  }
};
