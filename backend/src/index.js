const express = require("express");
const winston = require("winston");
const expressWinston = require("express-winston");

// Création de l'application Express
const app = express();

// Configuration du logger Winston
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: "error.log",
      level: "error",
    }),
    new winston.transports.File({
      filename: "combined.log",
    }),
  ],
});

// Middleware pour les logs de requêtes
app.use(
  expressWinston.logger({
    winstonInstance: logger,
    meta: true,
    msg: "HTTP {{req.method}} {{req.url}}",
    expressFormat: true,
    colorize: false,
  })
);

// Middlewares de base
app.use(express.json());

// Exemple de route avec erreur
app.get("/error-test", (req, res, next) => {
  next(new Error("Erreur de test intentionnelle !"));
});

// Middleware de gestion des erreurs
app.use(
  expressWinston.errorLogger({
    winstonInstance: logger,
  })
);

// Gestionnaire d'erreurs final
app.use((err, req, res, next) => {
  res.status(500).json({
    error: "Erreur interne du serveur",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Gestion des erreurs globales
process.on("uncaughtException", (error) => {
  logger.error("Exception non capturée :", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Rejet de promesse non géré :", reason);
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Serveur démarré sur le port ${PORT}`);
});
