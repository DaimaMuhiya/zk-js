import { getDeviceData } from "./device.service.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const syncDeviceData = async () => {
  try {
    // Vérification connexion DB
    await prisma.$queryRaw`SELECT 1`;

    const { users, logs } = await getDeviceData();

    // Synchronisation utilisateurs
    await prisma.$transaction(
      users.map((user) =>
        prisma.user.upsert({
          where: { deviceUserId: String(user.uid) },
          update: {
            name: user.name,
            role: user.role,
            cardno: user.cardno,
          },
          create: {
            deviceUserId: String(user.uid),
            name: user.name,
            role: user.role,
            cardno: user.cardno,
          },
        })
      )
    );

    // Synchronisation logs
    const validLogs = logs.filter((l) => {
      const logDate = new Date(l.timestamp);
      return logDate instanceof Date && !isNaN(logDate);
    });

    console.log("Logs validés :", validLogs);
    console.log(
      "Logs rejetés :",
      logs.filter((l) => !validLogs.includes(l))
    );

    for (const log of validLogs) {
      try {
        const user = await prisma.user.findUnique({
          where: { deviceUserId: String(log.uid) },
        });

        if (user) {
          await prisma.attendance.upsert({
            where: {
              userId_timestamp: {
                userId: user.id,
                timestamp: new Date(log.timestamp),
              },
            },
            update: log,
            create: {
              userId: user.id,
              timestamp: new Date(log.timestamp),
              status: log.status,
              deviceSn: log.deviceSn,
              rawData: log.rawData,
            },
          });
        }
      } catch (logError) {
        console.error(`Erreur log ${log.uid}:`, logError);
      }
    }

    console.log(
      `Synchronisé: ${users.length} users, ${validLogs.length}/${logs.length} logs valides`
    );
  } catch (error) {
    console.error("Erreur synchronisation:", error);
  } finally {
    await prisma.$disconnect();
  }
};

// Déclenchement immédiat pour le test manuel
(async () => {
  await syncDeviceData();
})();
