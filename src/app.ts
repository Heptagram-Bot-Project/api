import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import health from "express-ping";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import ipinfo from "ipinfo-express";
import { ipinfoOptions } from "./utils/ipinfoOptions";
import { v4 as uuidv4 } from "uuid";
import "dotenv/config";

import errorLogger from "./logger";
import { hasLockedAccess } from "./middleware/hasLockedAccess";
// import { isAdmin } from "./middleware/isAdmin";
import { authToken } from "./middleware/middleware";
import { rateLimiterMiddleware } from "./middleware/rateLimitController";
import apiRoute from "./routes/api";
import authRoutes from "./routes/auth";
import lockedRoutes from "./routes/locked";
import { apiSpecs } from "./utils/apiSpecs";

const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(helmet());
app.use(health.ping());
app.use(cors());
app.use(ipinfo(ipinfoOptions));

app.get("/", (req, res) => {
  res.redirect("/docs");
});

app.use("/auth", authRoutes);
app.use("/v4", rateLimiterMiddleware, authToken, apiRoute);
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
