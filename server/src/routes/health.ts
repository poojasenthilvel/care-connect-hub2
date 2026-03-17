import type { Request, Response } from "express";
import { Router } from "express";
import mongoose from "mongoose";

export const healthRouter = Router();

healthRouter.get("/health", (_req: Request, res: Response) => {
  res.json({
    ok: true,
    service: "medflow-server",
    mongo: {
      readyState: mongoose.connection.readyState,
    },
    now: new Date().toISOString(),
  });
});

