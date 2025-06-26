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
          14: "admin",
          999: "superadmin",
        };
        return {
          uid: String(u.uid),
          name: u.name || "Non renseigné",
          role: roleMap[u.role] || "invité",
          cardno: u.cardno?.toString() || "",
        };
      }),
      logs: logsResponse.data
        .filter((l) => {
          const year = l.recordTime.getFullYear();
          return year > 2000 && year < 2030; // Filtre strict
        })
        .map((l) => ({
          uid: String(l.userSn || "").padStart(6, "0"),
          timestamp: moment(l.recordTime).tz("Indian/Reunion").format(),
          status: l.state || 0,
          deviceSn: l.sn || "N/A",
          rawData: l,
        })),
    };
  } catch (error) {
    if (error.code === "EADDRINUSE") {
      console.error("Le port est déjà utilisé");
    }
    throw error;
  }
};
