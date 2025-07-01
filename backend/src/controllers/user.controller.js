import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        deviceUserId: true,
        name: true,
        role: true,
        cardno: true,
        attendances: {
          select: {
            timestamp: true,
            status: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    res.json(
      users.map((user) => ({
        ...user,
        lastAttendance: user.attendances[0]?.timestamp || null,
      }))
    );
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
