import ZKLib from "node-zklib";
import moment from "moment-timezone";

export const getDeviceData = async (realTime = false) => {
  const zk = new ZKLib(
    process.env.DEVICE_IP,
    parseInt(process.env.DEVICE_PORT),
    30000, // Timeout augmenté à 30s
    4000 // inport
  );

  try {
    // Connexion rapide pour les requêtes temps réel
    await zk.createSocket(realTime ? 5000 : 30000);

    const [usersResponse, logsResponse] = await Promise.all([
      zk.getUsers(),
      realTime ? null : zk.getAttendances(), // Skip logs si temps réel
    ]);

    // Vérification de la structure de réponse
    if (
      !usersResponse ||
      typeof usersResponse !== "object" ||
      !Array.isArray(usersResponse.data)
    ) {
      console.error("Structure utilisateurs inattendue:", usersResponse);
      throw new Error(
        `Format utilisateurs invalide. Structure attendue: { data: Array }`
      );
    }

    // Ajout de logging pour le débogage
    console.log("Réponse brute des utilisateurs:", usersResponse);

    if (!logsResponse?.data?.[0]?.recordTime) {
      throw new Error("Format de timestamp invalide");
    }

    if (logsResponse.data.some((l) => l.recordTime.getFullYear() < 2000)) {
      console.warn("⚠️ Logs avec dates invalides détectés");
      await zk.clearAttendanceLog(); // Nettoyage des logs corrompus
    }

    const processedUsers = usersResponse.data.map((u) => {
      const roleMap = {
        0: "user",
        1: "admin",
        2: "superadmin",
        14: "admin",
      };
      const uid = String(u.uid || u.userId).replace(/^0+/, "");
      return {
        uid: uid,
        name: u.name || "Non renseigné",
        role: roleMap[u.role] || "user",
        cardno: u.cardno?.toString() || "",
      };
    });

    const processedLogs = logsResponse.data
      .map((l) => {
        const uid = String(l.userSn || l.deviceUserId).replace(/^0+/, "");
        const timestamp = moment.utc(l.recordTime);
        if (!timestamp.isValid()) {
          console.warn(`Date invalide pour le log ${uid}`, l.recordTime);
          timestamp = moment.utc();
        }
        return {
          uid: uid,
          timestamp: timestamp.toISOString(),
          status: l.state || 0,
          deviceSn: l.ip.split(".").join(""),
          rawData: l,
        };
      })
      .filter((l) => {
        const year = moment(l.timestamp).year();
        return year >= 2000 && year <= 2040;
      });

    return {
      users: processedUsers,
      logs: realTime ? [] : processedLogs,
    };
  } catch (error) {
    if (error.code === "EADDRINUSE") {
      console.error("Le port est déjà utilisé");
    }
    throw error;
  } finally {
    zk.disconnect();
  }
};
