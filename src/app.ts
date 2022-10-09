import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import health from "express-ping";
import * as expressPublicIp from "express-public-ip";
import helmet from "helmet";
import ipinfo, { defaultIpSelector } from "ipinfo-express";
import swaggerUi from "swagger-ui-express";
import { v4 as uuidv4 } from "uuid";
import "dotenv/config";

import errorLogger from "./logger";
import { hasLockedAccess } from "./middleware/hasLockedAccess";
// import { isAdmin } from "./middleware/isAdmin";
import { authToken } from "./middleware/middleware";
import { rateLimiterMiddleware } from "./middleware/rateLimitController";
import { saveUserMetrics } from "./middleware/saveUserMetric";
import apiRoute from "./routes/api";
import authRoutes from "./routes/auth";
import lockedRoutes from "./routes/locked";
import metricsRoutes from "./routes/metrics/metrics";
import { apiSpecs } from "./utils/apiSpecs";

const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(helmet());
app.use(health.ping());
app.use(cors());
app.use(
  ipinfo({
    token: process.env.IP_INFO_BEARER_TOKEN,
    cache: null, // TOOD: Set caching mechanism
    timeout: 5000,
    ipSelector: defaultIpSelector,
  })
);
app.enable("trust proxy");
app.use(expressPublicIp());

app.get("/test", (req, res) => {
  res.send(req.ip);
});

app.get("/", (req, res) => {
  res.redirect("/docs");
});

app.use("/auth", authRoutes);
app.use("/metrics", rateLimiterMiddleware, authToken, metricsRoutes);
app.use(
  "/v4",
  rateLimiterMiddleware,
  authToken,
  /**saveUserMetrics,**/ apiRoute
);
app.use("/locked/all", rateLimiterMiddleware, hasLockedAccess, lockedRoutes);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(apiSpecs));

// catch all errors
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, req, res, next) => {
  const errorID = uuidv4();
  errorLogger(err, errorID, req);
  res.status(500).json({
    message:
      "Please contact a developer in our discord support server, and provide the information below.",
    error: err.message,
    errorID,
  });
});

export default app;
