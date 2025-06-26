import ZKLib from "node-zklib";

export const getDeviceData = async () => {
  const zk = new ZKLib(
    process.env.DEVICE_IP,
    parseInt(process.env.DEVICE_PORT),
    10000, // timeout
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
      console.log(`Progression: ${percent}% (${total} logs)`);
    });

    // Vérification structure des logs
    if (!logsResponse?.data || !Array.isArray(logsResponse.data)) {
      console.error("Structure logs inattendue:", logsResponse);
      throw new Error("Format logs invalide");
    }

    await zk.disconnect();

    return {
      users: users.data.map((u) => ({
        uid: u.userId || u.uid,
        name: u.name || "",
        role: u.role || 0,
        cardno: u.cardno || "",
      })),
      logs: logsResponse.data.map((l) => ({
        uid: l.uid,
        timestamp: l.timestamp,
        status: l.state,
        deviceSn: l.sn || null,
      })),
    };
  } catch (error) {
    if (error.code === "EADDRINUSE") {
      console.error("Le port est déjà utilisé");
    }
    throw error;
  }
};
