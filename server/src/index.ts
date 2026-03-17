import "dotenv/config";
import cors from "cors";
import express from "express";
import path from "node:path";
import fs from "node:fs";
import http from "node:http";

import { connectMongo } from "./lib/db.js";
import { getEnv } from "./lib/env.js";
import { authRouter } from "./routes/auth.js";
import { apiRouter } from "./routes/api.js";
import { healthRouter } from "./routes/health.js";
import { attachSocketServer } from "./realtime/socket.js";

const env = getEnv();

await connectMongo(env.MONGODB_URI);

const app = express();
app.disable("x-powered-by");
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "2mb" }));

const uploadsDir = path.join(process.cwd(), "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static(uploadsDir));

app.use(authRouter);
app.use(apiRouter);
app.use(healthRouter);

const server = http.createServer(app);
attachSocketServer(server);

server.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[server] listening on http://localhost:${env.PORT}`);
});

