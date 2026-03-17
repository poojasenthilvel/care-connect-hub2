import type { NextFunction, Request, Response } from "express";
import { getEnv } from "../lib/env.js";
import { verifyAccessToken } from "../lib/auth.js";

export type AuthedRequest = Request & { auth?: { userId: string; role: "patient" | "doctor" | "admin" } };

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.toLowerCase().startsWith("bearer ")) {
    return res.status(401).json({ error: "Missing bearer token" });
  }
  const token = header.slice("bearer ".length).trim();
  try {
    const env = getEnv();
    const payload = verifyAccessToken(token, env.JWT_SECRET);
    req.auth = { userId: payload.sub, role: payload.role };
    return next();
  } catch (e: any) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

