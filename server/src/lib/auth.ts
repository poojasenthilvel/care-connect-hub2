import jwt from "jsonwebtoken";
import type { UserRole } from "../models/User.js";

export type JwtPayload = {
  sub: string;
  role: UserRole;
};

export function signAccessToken(payload: JwtPayload, secret: string) {
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export function verifyAccessToken(token: string, secret: string): JwtPayload {
  const decoded = jwt.verify(token, secret);
  if (typeof decoded !== "object" || decoded === null) throw new Error("Invalid token");
  const sub = (decoded as any).sub;
  const role = (decoded as any).role;
  if (typeof sub !== "string") throw new Error("Invalid token subject");
  if (role !== "patient" && role !== "doctor" && role !== "admin") throw new Error("Invalid token role");
  return { sub, role };
}

