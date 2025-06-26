import dotenv from "dotenv";
import { getDeviceData } from "../services/device.service.js";

dotenv.config();

(async () => {
  try {
    const data = await getDeviceData();
    console.log("✅ Connecté avec succès!");
    console.log("Exemple utilisateur:", data.users[0]);
    console.log("Exemple log:", data.logs[0]);
  } catch (error) {
    console.error("❌ Échec connexion:", error);
  }
})();
