const ZKLib = require("node-zklib");

const getDeviceData = async () => {
  const zk = new ZKLib({
    ip: process.env.DEVICE_IP,
    port: parseInt(process.env.DEVICE_PORT),
    timeout: 10000,
    inport: 0,
  });

  try {
    await zk.connect();

    const users = await zk.getUsers();
    const logs = await zk.getAttendances();

    await zk.disconnect();

    return {
      users: users.map((u) => ({
        uid: u.uid,
        name: u.name,
        role: u.role,
        cardno: u.cardno,
      })),
      logs: logs.map((l) => ({
        uid: l.uid,
        timestamp: l.timestamp,
        status: l.state,
      })),
    };
  } catch (error) {
    console.error("Erreur de connexion:", error);
    if (zk._socket) zk._socket.destroy();
    throw error;
  }
};

module.exports = { getDeviceData };
