import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        attendances: {
          select: {
            id: true,
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
