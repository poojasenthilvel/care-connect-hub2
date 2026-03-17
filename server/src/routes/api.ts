import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import multer from "multer";
import path from "node:path";

import { requireAuth, type AuthedRequest } from "../middleware/requireAuth.js";
import { DepartmentModel } from "../models/Department.js";
import { AppointmentModel } from "../models/Appointment.js";
import { MedicalReportModel } from "../models/MedicalReport.js";
import { BillModel } from "../models/Bill.js";
import { PrescriptionModel } from "../models/Prescription.js";
import { TreatmentModel } from "../models/Treatment.js";
import { VitalModel } from "../models/Vital.js";
import { DoctorScheduleModel } from "../models/DoctorSchedule.js";
import { NotificationModel } from "../models/Notification.js";
import { AnnouncementModel } from "../models/Announcement.js";
import { UserModel } from "../models/User.js";
import { ProfileModel } from "../models/Profile.js";

export const apiRouter = Router();

apiRouter.use(requireAuth);

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, path.join(process.cwd(), "uploads")),
    filename: (req, file, cb) => {
      const uid = (req as AuthedRequest).auth?.userId || "user";
      const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
      cb(null, `${uid}_${Date.now()}_${safe}`);
    },
  }),
  limits: { fileSize: 15 * 1024 * 1024 },
});

function isAdmin(req: AuthedRequest) {
  return req.auth?.role === "admin";
}
function isDoctor(req: AuthedRequest) {
  return req.auth?.role === "doctor";
}

// -------------------- Departments --------------------
apiRouter.get("/api/departments", async (_req, res) => {
  const depts = await DepartmentModel.find().sort({ name: 1 }).lean<any>();
  res.json(depts.map((d: any) => ({ id: d._id.toString(), name: d.name, created_at: d.createdAt.toISOString() })));
});

apiRouter.post("/api/departments", async (req: AuthedRequest, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden" });
  const parsed = z.object({ name: z.string().min(2) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });
  const d = await DepartmentModel.create({ name: parsed.data.name });
  res.status(201).json({ id: d._id.toString(), name: d.name, created_at: d.createdAt.toISOString() });
});

// -------------------- Profiles --------------------
apiRouter.get("/api/profiles/me", async (req: AuthedRequest, res) => {
  const u = await UserModel.findById(req.auth!.userId).lean<any>();
  if (!u) return res.status(404).json({ error: "Not found" });
  const p = await ProfileModel.findOne({ userId: u._id }).lean<any>();
  res.json({
    id: u._id.toString(),
    user_id: u._id.toString(),
    full_name: u.fullName,
    email: u.email,
    phone: p?.phone || "",
    date_of_birth: p?.dateOfBirth || "",
    address: p?.address || "",
    blood_type: p?.bloodType || "",
    allergies: p?.allergies || "",
    emergency_contact_name: p?.emergencyContactName || "",
    emergency_contact_phone: p?.emergencyContactPhone || "",
    specialization: u.specialization || "",
    avatar_url: u.avatarUrl || "",
    role: u.role,
  });
});

apiRouter.patch("/api/profiles/me", async (req: AuthedRequest, res) => {
  const parsed = z
    .object({
      full_name: z.string().min(1).optional(),
      phone: z.string().optional(),
      date_of_birth: z.string().optional(),
      specialization: z.string().optional(),
      avatar_url: z.string().url().optional(),
      address: z.string().optional(),
      blood_type: z.string().optional(),
      allergies: z.string().optional(),
      emergency_contact_name: z.string().optional(),
      emergency_contact_phone: z.string().optional(),
    })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });

  const updates: any = {};
  if (parsed.data.full_name !== undefined) updates.fullName = parsed.data.full_name;
  if (parsed.data.specialization !== undefined) updates.specialization = parsed.data.specialization;
  if (parsed.data.avatar_url !== undefined) updates.avatarUrl = parsed.data.avatar_url;

  const u = await UserModel.findByIdAndUpdate(req.auth!.userId, updates, { new: true }).lean<any>();
  if (!u) return res.status(404).json({ error: "Not found" });

  const profileUpdates: any = {};
  if (parsed.data.phone !== undefined) profileUpdates.phone = parsed.data.phone;
  if (parsed.data.date_of_birth !== undefined) profileUpdates.dateOfBirth = parsed.data.date_of_birth;
  if (parsed.data.address !== undefined) profileUpdates.address = parsed.data.address;
  if (parsed.data.blood_type !== undefined) profileUpdates.bloodType = parsed.data.blood_type;
  if (parsed.data.allergies !== undefined) profileUpdates.allergies = parsed.data.allergies;
  if (parsed.data.emergency_contact_name !== undefined) profileUpdates.emergencyContactName = parsed.data.emergency_contact_name;
  if (parsed.data.emergency_contact_phone !== undefined) profileUpdates.emergencyContactPhone = parsed.data.emergency_contact_phone;

  const p = Object.keys(profileUpdates).length
    ? await ProfileModel.findOneAndUpdate(
        { userId: u._id },
        { $set: profileUpdates, $setOnInsert: { userId: u._id } },
        { upsert: true, new: true }
      ).lean<any>()
    : await ProfileModel.findOne({ userId: u._id }).lean<any>();

  res.json({
    id: u._id.toString(),
    user_id: u._id.toString(),
    full_name: u.fullName,
    email: u.email,
    phone: p?.phone || "",
    date_of_birth: p?.dateOfBirth || "",
    address: p?.address || "",
    blood_type: p?.bloodType || "",
    allergies: p?.allergies || "",
    emergency_contact_name: p?.emergencyContactName || "",
    emergency_contact_phone: p?.emergencyContactPhone || "",
    specialization: u.specialization || "",
    avatar_url: u.avatarUrl || "",
    role: u.role,
  });
});

apiRouter.get("/api/profiles", async (req: AuthedRequest, res) => {
  if (!isAdmin(req) && !isDoctor(req)) return res.status(403).json({ error: "Forbidden" });
  const role = typeof req.query.role === "string" ? req.query.role : undefined;
  const q: any = {};
  if (role) q.role = role;
  const users = await UserModel.find(q).sort({ createdAt: -1 }).lean<any>();
  const profiles = await ProfileModel.find({ userId: { $in: users.map((u: any) => u._id) } }).lean<any>();
  const profileByUserId = new Map<string, any>(profiles.map((p: any) => [p.userId.toString(), p]));
  res.json(
    users.map((u: any) => ({
      id: u._id.toString(),
      user_id: u._id.toString(),
      full_name: u.fullName,
      email: u.email,
      specialization: u.specialization || "",
      avatar_url: u.avatarUrl || "",
      user_roles: [{ role: u.role }],
      phone: profileByUserId.get(u._id.toString())?.phone || "",
      blood_type: profileByUserId.get(u._id.toString())?.bloodType || "",
      created_at: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
    }))
  );
});

// -------------------- Appointments --------------------
apiRouter.get("/api/appointments", async (req: AuthedRequest, res) => {
  const uid = new mongoose.Types.ObjectId(req.auth!.userId);
  const role = req.auth!.role;
  const query: any =
    role === "admin" ? {} : role === "doctor" ? { doctorId: uid } : { patientId: uid };

  const appts = await AppointmentModel.find(query)
    .sort({ appointmentDate: 1, appointmentTime: 1 })
    .populate([{ path: "doctorId", select: "fullName specialization" }, { path: "patientId", select: "fullName" }])
    .lean<any>();

  res.json(
    appts.map((a: any) => ({
      id: a._id.toString(),
      patient_id: a.patientId?._id?.toString?.() || a.patientId?.toString?.(),
      doctor_id: a.doctorId?._id?.toString?.() || a.doctorId?.toString?.() || null,
      department: a.department,
      appointment_date: a.appointmentDate,
      appointment_time: a.appointmentTime,
      reason: a.reason || "",
      type: a.type,
      status: a.status,
      created_at: a.createdAt?.toISOString?.() || new Date().toISOString(),
      updated_at: a.updatedAt?.toISOString?.() || new Date().toISOString(),
      doctor: a.doctorId ? { full_name: a.doctorId.fullName, specialization: a.doctorId.specialization || "" } : null,
      patient: a.patientId ? { full_name: a.patientId.fullName } : null,
    }))
  );
});

const CreateAppointmentSchema = z.object({
  department: z.string().min(1),
  appointment_date: z.string().min(8),
  appointment_time: z.string().min(3),
  reason: z.string().optional(),
  type: z.enum(["in-person", "telemedicine"]).default("in-person"),
  doctor_id: z.string().optional(),
});

apiRouter.post("/api/appointments", async (req: AuthedRequest, res) => {
  if (req.auth!.role !== "patient") return res.status(403).json({ error: "Only patients can book" });
  const parsed = CreateAppointmentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });
  const uid = new mongoose.Types.ObjectId(req.auth!.userId);
  const doctorId = parsed.data.doctor_id ? new mongoose.Types.ObjectId(parsed.data.doctor_id) : null;

  const created = await AppointmentModel.create({
    patientId: uid,
    doctorId,
    department: parsed.data.department,
    appointmentDate: parsed.data.appointment_date,
    appointmentTime: parsed.data.appointment_time,
    reason: parsed.data.reason || "",
    type: parsed.data.type,
    status: "pending",
  });
  res.status(201).json({ id: created._id.toString() });
});

apiRouter.patch("/api/appointments/:id", async (req: AuthedRequest, res) => {
  const parsed = z
    .object({
      status: z.enum(["pending", "waiting", "completed", "cancelled"]).optional(),
      appointment_date: z.string().optional(),
      appointment_time: z.string().optional(),
    })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });

  const appt = await AppointmentModel.findById(req.params.id);
  if (!appt) return res.status(404).json({ error: "Not found" });

  const uid = req.auth!.userId;
  const can =
    req.auth!.role === "admin" ||
    (req.auth!.role === "patient" && appt.patientId.toString() === uid) ||
    (req.auth!.role === "doctor" && appt.doctorId?.toString?.() === uid);
  if (!can) return res.status(403).json({ error: "Forbidden" });

  if (parsed.data.status) appt.status = parsed.data.status;
  if (parsed.data.appointment_date) appt.appointmentDate = parsed.data.appointment_date;
  if (parsed.data.appointment_time) appt.appointmentTime = parsed.data.appointment_time;

  await appt.save();
  res.json({ ok: true });
});

// -------------------- Medical Reports (metadata only for now) --------------------
apiRouter.get("/api/medical_reports", async (req: AuthedRequest, res) => {
  const uid = new mongoose.Types.ObjectId(req.auth!.userId);
  const role = req.auth!.role;
  const query: any =
    role === "admin" ? {} : role === "doctor" ? { doctorId: uid } : { patientId: uid };

  const reports = await MedicalReportModel.find(query)
    .sort({ createdAt: -1 })
    .populate([{ path: "doctorId", select: "fullName" }])
    .lean<any>();

  res.json(
    reports.map((r: any) => ({
      id: r._id.toString(),
      patient_id: r.patientId.toString(),
      doctor_id: r.doctorId?._id?.toString?.() || r.doctorId?.toString?.() || null,
      name: r.name,
      type: r.type,
      file_url: r.fileUrl || "",
      created_at: r.createdAt?.toISOString?.() || new Date().toISOString(),
      doctor: r.doctorId ? { full_name: r.doctorId.fullName } : null,
    }))
  );
});

apiRouter.post("/api/medical_reports", async (req: AuthedRequest, res) => {
  const parsed = z
    .object({
      name: z.string().min(1),
      type: z.string().min(1),
      file_url: z.string().optional(),
      doctor_id: z.string().optional(),
      patient_id: z.string().optional(),
    })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });

  const role = req.auth!.role;
  const patientId =
    role === "doctor" && parsed.data.patient_id
      ? new mongoose.Types.ObjectId(parsed.data.patient_id)
      : new mongoose.Types.ObjectId(req.auth!.userId);

  if (role === "patient" && parsed.data.patient_id) return res.status(403).json({ error: "Forbidden" });

  const doctorId =
    parsed.data.doctor_id ? new mongoose.Types.ObjectId(parsed.data.doctor_id) : role === "doctor" ? new mongoose.Types.ObjectId(req.auth!.userId) : null;

  const created = await MedicalReportModel.create({
    patientId,
    doctorId,
    name: parsed.data.name,
    type: parsed.data.type,
    fileUrl: parsed.data.file_url || "",
  });
  res.status(201).json({ id: created._id.toString() });
});

apiRouter.post("/api/medical_reports/upload", upload.single("file"), async (req: AuthedRequest, res) => {
  if (!req.file) return res.status(400).json({ error: "Missing file" });

  const parsed = z
    .object({
      type: z.string().min(1).default("Lab Report"),
      name: z.string().min(1).optional(),
    })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });

  const name = parsed.data.name || req.file.originalname;
  const fileUrl = `/uploads/${req.file.filename}`;

  const created = await MedicalReportModel.create({
    patientId: new mongoose.Types.ObjectId(req.auth!.userId),
    doctorId: req.auth!.role === "doctor" ? new mongoose.Types.ObjectId(req.auth!.userId) : null,
    name,
    type: parsed.data.type,
    fileUrl,
  });

  res.status(201).json({
    id: created._id.toString(),
    file_url: fileUrl,
  });
});

// -------------------- Bills --------------------
apiRouter.get("/api/bills", async (req: AuthedRequest, res) => {
  const uid = new mongoose.Types.ObjectId(req.auth!.userId);
  const role = req.auth!.role;
  const query: any = role === "admin" ? {} : { patientId: uid };
  const bills = await BillModel.find(query).sort({ createdAt: -1 }).lean<any>();
  res.json(
    bills.map((b: any) => ({
      id: b._id.toString(),
      patient_id: b.patientId.toString(),
      description: b.description,
      amount: b.amount,
      status: b.status,
      due_date: b.dueDate || null,
      paid_at: b.paidAt || null,
      created_at: b.createdAt?.toISOString?.() || new Date().toISOString(),
    }))
  );
});

apiRouter.patch("/api/bills/:id/pay", async (req: AuthedRequest, res) => {
  const bill = await BillModel.findById(req.params.id);
  if (!bill) return res.status(404).json({ error: "Not found" });
  if (req.auth!.role !== "admin" && bill.patientId.toString() !== req.auth!.userId) return res.status(403).json({ error: "Forbidden" });

  bill.status = "paid";
  bill.paidAt = new Date().toISOString();
  await bill.save();
  res.json({ ok: true });
});

// -------------------- Prescriptions --------------------
apiRouter.get("/api/prescriptions", async (req: AuthedRequest, res) => {
  const uid = new mongoose.Types.ObjectId(req.auth!.userId);
  const role = req.auth!.role;
  const query: any =
    role === "admin" ? {} : role === "doctor" ? { doctorId: uid } : { patientId: uid };

  const rxs = await PrescriptionModel.find(query)
    .sort({ createdAt: -1 })
    .populate([{ path: "doctorId", select: "fullName" }, { path: "patientId", select: "fullName" }])
    .lean<any>();

  res.json(
    rxs.map((rx: any) => ({
      id: rx._id.toString(),
      patient_id: rx.patientId?._id?.toString?.() || rx.patientId.toString(),
      doctor_id: rx.doctorId?._id?.toString?.() || rx.doctorId.toString(),
      diagnosis: rx.diagnosis,
      medicines: rx.medicines || [],
      created_at: rx.createdAt?.toISOString?.() || new Date().toISOString(),
      doctor: rx.doctorId ? { full_name: rx.doctorId.fullName } : null,
      patient: rx.patientId ? { full_name: rx.patientId.fullName } : null,
    }))
  );
});

apiRouter.post("/api/prescriptions", async (req: AuthedRequest, res) => {
  if (req.auth!.role !== "doctor") return res.status(403).json({ error: "Only doctors can create" });
  const parsed = z
    .object({
      patient_id: z.string().min(1),
      diagnosis: z.string().min(1),
      medicines: z.array(z.any()).default([]),
    })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });

  const created = await PrescriptionModel.create({
    patientId: new mongoose.Types.ObjectId(parsed.data.patient_id),
    doctorId: new mongoose.Types.ObjectId(req.auth!.userId),
    diagnosis: parsed.data.diagnosis,
    medicines: parsed.data.medicines,
  });
  res.status(201).json({ id: created._id.toString() });
});

// -------------------- Treatments --------------------
apiRouter.get("/api/treatments", async (req: AuthedRequest, res) => {
  const uid = new mongoose.Types.ObjectId(req.auth!.userId);
  const role = req.auth!.role;
  const query: any = role === "admin" ? {} : { patientId: uid };
  const treatments = await TreatmentModel.find(query).sort({ startDate: -1 }).lean<any>();
  res.json(
    treatments.map((t: any) => ({
      id: t._id.toString(),
      patient_id: t.patientId.toString(),
      doctor_id: t.doctorId?.toString?.() || null,
      department: t.department || "",
      diagnosis: t.diagnosis,
      medicines: t.medicines || [],
      start_date: t.startDate,
      end_date: t.endDate || null,
      status: t.status,
      created_at: t.createdAt?.toISOString?.() || new Date().toISOString(),
    }))
  );
});

// -------------------- Vitals --------------------
apiRouter.get("/api/vitals", async (req: AuthedRequest, res) => {
  const patientId = typeof req.query.patientId === "string" ? req.query.patientId : req.auth!.userId;
  if (req.auth!.role === "patient" && patientId !== req.auth!.userId) return res.status(403).json({ error: "Forbidden" });
  const uid = new mongoose.Types.ObjectId(patientId);
  const vitals = await VitalModel.find({ patientId: uid }).sort({ recordedAt: 1 }).lean<any>();
  res.json(
    vitals.map((v: any) => ({
      id: v._id.toString(),
      patient_id: v.patientId.toString(),
      systolic: v.systolic ?? null,
      diastolic: v.diastolic ?? null,
      sugar_level: v.sugarLevel ?? null,
      heart_rate: v.heartRate ?? null,
      temperature: v.temperature ?? null,
      spo2: v.spo2 ?? null,
      recorded_at: v.recordedAt,
    }))
  );
});

apiRouter.post("/api/vitals", async (req: AuthedRequest, res) => {
  if (req.auth!.role !== "patient") return res.status(403).json({ error: "Only patients can add vitals" });
  const parsed = z
    .object({
      systolic: z.number().optional(),
      diastolic: z.number().optional(),
      sugar_level: z.number().optional(),
      heart_rate: z.number().optional(),
      temperature: z.number().optional(),
      spo2: z.number().optional(),
    })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });

  const created = await VitalModel.create({
    patientId: new mongoose.Types.ObjectId(req.auth!.userId),
    systolic: parsed.data.systolic,
    diastolic: parsed.data.diastolic,
    sugarLevel: parsed.data.sugar_level,
    heartRate: parsed.data.heart_rate,
    temperature: parsed.data.temperature,
    spo2: parsed.data.spo2,
    recordedAt: new Date().toISOString(),
  });
  res.status(201).json({ id: created._id.toString() });
});

// -------------------- Doctor schedules --------------------
apiRouter.get("/api/doctor_schedules", async (req: AuthedRequest, res) => {
  const doctorId = typeof req.query.doctorId === "string" ? req.query.doctorId : req.auth!.userId;
  const uid = new mongoose.Types.ObjectId(doctorId);
  const schedules = await DoctorScheduleModel.find({ doctorId: uid }).sort({ dayOfWeek: 1 }).lean<any>();
  res.json(
    schedules.map((s: any) => ({
      id: s._id.toString(),
      doctor_id: s.doctorId.toString(),
      day_of_week: s.dayOfWeek,
      time_slots: s.timeSlots,
    }))
  );
});

apiRouter.post("/api/doctor_schedules/upsert", async (req: AuthedRequest, res) => {
  if (req.auth!.role !== "doctor" && req.auth!.role !== "admin") return res.status(403).json({ error: "Forbidden" });
  const parsed = z
    .object({
      schedules: z.array(z.object({ day_of_week: z.string().min(1), time_slots: z.array(z.string()).default([]) })),
    })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });

  const uid = new mongoose.Types.ObjectId(req.auth!.userId);
  for (const s of parsed.data.schedules) {
    await DoctorScheduleModel.findOneAndUpdate(
      { doctorId: uid, dayOfWeek: s.day_of_week },
      { $set: { timeSlots: s.time_slots } },
      { upsert: true, new: true }
    );
  }
  res.json({ ok: true });
});

// -------------------- Notifications --------------------
apiRouter.get("/api/notifications", async (req: AuthedRequest, res) => {
  const uid = new mongoose.Types.ObjectId(req.auth!.userId);
  const notifs = await NotificationModel.find({ userId: uid }).sort({ createdAt: -1 }).lean<any>();
  res.json(
    notifs.map((n: any) => ({
      id: n._id.toString(),
      user_id: n.userId.toString(),
      type: n.type,
      title: n.title,
      description: n.description || "",
      read: n.read,
      created_at: n.createdAt?.toISOString?.() || new Date().toISOString(),
    }))
  );
});

apiRouter.patch("/api/notifications/:id/read", async (req: AuthedRequest, res) => {
  const n = await NotificationModel.findById(req.params.id);
  if (!n) return res.status(404).json({ error: "Not found" });
  if (n.userId.toString() !== req.auth!.userId) return res.status(403).json({ error: "Forbidden" });
  n.read = true;
  await n.save();
  res.json({ ok: true });
});

// -------------------- Announcements --------------------
apiRouter.get("/api/announcements", async (_req, res) => {
  const anns = await AnnouncementModel.find().sort({ createdAt: -1 }).lean<any>();
  res.json(
    anns.map((a: any) => ({
      id: a._id.toString(),
      title: a.title,
      message: a.message,
      created_by: a.createdBy?.toString?.() || null,
      created_at: a.createdAt?.toISOString?.() || new Date().toISOString(),
    }))
  );
});

apiRouter.post("/api/announcements", async (req: AuthedRequest, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden" });
  const parsed = z.object({ title: z.string().min(1), message: z.string().min(1) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });
  const a = await AnnouncementModel.create({
    title: parsed.data.title,
    message: parsed.data.message,
    createdBy: new mongoose.Types.ObjectId(req.auth!.userId),
  });
  res.status(201).json({ id: a._id.toString() });
});

// -------------------- Admin stats --------------------
apiRouter.get("/api/admin/stats", async (req: AuthedRequest, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden" });
  const [patients, doctors, appts, paidBills] = await Promise.all([
    UserModel.countDocuments({ role: "patient" }),
    UserModel.countDocuments({ role: "doctor" }),
    AppointmentModel.countDocuments({}),
    BillModel.find({ status: "paid" }).select("amount").lean<any>(),
  ]);
  const totalRevenue = (paidBills || []).reduce((sum: number, b: any) => sum + Number(b.amount || 0), 0);
  res.json({ totalPatients: patients, totalDoctors: doctors, totalAppointments: appts, totalRevenue });
});

