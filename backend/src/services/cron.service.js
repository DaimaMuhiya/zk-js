const { getDeviceData } = require("./device.service");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const syncDeviceData = async () => {
  try {
    const { users, logs } = await getDeviceData();

    // Synchronisation utilisateurs
    await prisma.$transaction(
      users.map((user) =>
        prisma.user.upsert({
          where: { deviceUserId: user.uid },
          update: user,
          create: user,
        })
      )
    );

    // Synchronisation logs
    for (const log of logs) {
      const user = await prisma.user.findUnique({
        where: { deviceUserId: log.uid },
      });

      if (user) {
        await prisma.attendance.upsert({
          where: {
            userId_timestamp: {
              userId: user.id,
              timestamp: log.timestamp,
            },
          },
          update: log,
          create: {
            userId: user.id,
            ...log,
          },
        });
      }
    }

    console.log(`Synchronisé: ${users.length} users, ${logs.length} logs`);
  } catch (error) {
    console.error("Erreur synchronisation:", error);
  } finally {
    await prisma.$disconnect();
  }
};

module.exports = { syncDeviceData };
