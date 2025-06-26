import ZKLib from "node-zklib";
import moment from "moment-timezone";

export const getDeviceData = async () => {
  const zk = new ZKLib(
    process.env.DEVICE_IP,
    parseInt(process.env.DEVICE_PORT),
    30000, // Timeout augmenté à 30s
    4000 // inport
  );

  try {
    await zk.createSocket();

    const users = await zk.getUsers();

    // Vérification de la structure de réponse
    if (!users || typeof users !== "object" || !Array.isArray(users.data)) {
      console.error("Structure utilisateurs inattendue:", users);
      throw new Error(
        `Format utilisateurs invalide. Structure attendue: { data: Array }`
      );
    }

    // Ajout de logging pour le débogage
    console.log("Réponse brute des utilisateurs:", users);

    const logsResponse = await zk.getAttendances((percent, total) => {
      console.log(`Téléchargement ${total} logs...`);
    });

    // Debug complet des logs
    console.log("Réponse logs brute:", JSON.stringify(logsResponse, null, 2));

    if (!logsResponse?.data?.[0]?.recordTime) {
      throw new Error("Format de timestamp invalide");
    }

    if (logsResponse.data.some((l) => l.recordTime.getFullYear() < 2000)) {
      console.warn("⚠️ Logs avec dates invalides détectés");
      await zk.clearAttendanceLog(); // Nettoyage des logs corrompus
    }

    await zk.disconnect();

    return {
      users: users.data.map((u) => {
        const roleMap = {
          0: "user",
          1: "admin",
          2: "superadmin",
          14: "admin",
        };
        return {
          uid: String(u.uid || u.userId),
          name: u.name || u.employeeName || "Non renseigné",
          role: roleMap[u.role] || "invité",
          cardno: u.cardno?.toString() || u.cardNumber?.toString() || "",
        };
      }),
      logs: logsResponse.data
        .map((l) => {
          const timestamp = moment(l.recordTime).tz("Indian/Reunion");
          if (!timestamp.isValid()) {
            console.warn(`Date invalide pour le log ${l.userSn}`, l.recordTime);
            timestamp = moment().tz("Indian/Reunion"); // Date actuelle comme fallback
          }
          return {
            uid: String(l.userSn || l.deviceUserId || "").padStart(6, "0"),
            timestamp: timestamp.isValid()
              ? timestamp.format()
              : new Date().toISOString(), // Valeur par défaut si date invalide
            status: l.state || 0,
            deviceSn: l.ip.split(".").join(""),
            rawData: l,
          };
        })
        .filter((l) => {
          const year = moment(l.timestamp).year();
          return year >= 2000 && year <= 2040;
        }),
    };
  } catch (error) {
    if (error.code === "EADDRINUSE") {
      console.error("Le port est déjà utilisé");
    }
    throw error;
  }
};
