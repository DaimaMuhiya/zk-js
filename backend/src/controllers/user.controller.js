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
        _count: {
          select: {
            attendances: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    res.json(users);
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
