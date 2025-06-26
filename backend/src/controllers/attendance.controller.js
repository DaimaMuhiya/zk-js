import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getAttendances = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const whereClause = {};

    if (startDate && endDate) {
      whereClause.timestamp = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const attendances = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            deviceUserId: true,
            name: true,
          },
        },
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    res.json(attendances);
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
