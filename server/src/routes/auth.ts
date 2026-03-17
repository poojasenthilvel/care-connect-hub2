import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { getEnv } from "../lib/env.js";
import { signAccessToken } from "../lib/auth.js";
import { UserModel } from "../models/User.js";
import { requireAuth, type AuthedRequest } from "../middleware/requireAuth.js";

export const authRouter = Router();

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
  role: z.enum(["patient", "doctor", "admin"]).default("patient"),
  specialization: z.string().optional(),
});

authRouter.post("/auth/register", async (req, res) => {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body", details: parsed.error.issues });

  const { email, password, fullName, role, specialization } = parsed.data;

  const existing = await UserModel.findOne({ email: email.toLowerCase() }).lean<any>();
  if (existing) return res.status(409).json({ error: "Email already registered" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await UserModel.create({
    email: email.toLowerCase(),
    passwordHash,
    fullName,
    role,
    specialization: specialization || "",
  });

  const env = getEnv();
  const token = signAccessToken({ sub: user._id.toString(), role: user.role }, env.JWT_SECRET);

  return res.status(201).json({
    token,
    user: {
      id: user._id.toString(),
      name: user.fullName,
      email: user.email,
      role: user.role,
      specialization: user.specialization || undefined,
      avatar: user.avatarUrl || undefined,
    },
  });
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post("/auth/login", async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body", details: parsed.error.issues });

  const { email, password } = parsed.data;
  const user = await UserModel.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const env = getEnv();
  const token = signAccessToken({ sub: user._id.toString(), role: user.role }, env.JWT_SECRET);

  return res.json({
    token,
    user: {
      id: user._id.toString(),
      name: user.fullName,
      email: user.email,
      role: user.role,
      specialization: user.specialization || undefined,
      avatar: user.avatarUrl || undefined,
    },
  });
});

authRouter.get("/auth/me", requireAuth, async (req: AuthedRequest, res) => {
  const user = await UserModel.findById(req.auth!.userId).lean<any>();
  if (!user) return res.status(404).json({ error: "User not found" });

  return res.json({
    user: {
      id: user._id.toString(),
      name: user.fullName,
      email: user.email,
      role: user.role,
      specialization: user.specialization || undefined,
      avatar: user.avatarUrl || undefined,
    },
  });
});

