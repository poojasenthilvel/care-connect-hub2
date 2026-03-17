import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { getEnv } from "../src/lib/env.js";
import { connectMongo } from "../src/lib/db.js";
import { UserModel } from "../src/models/User.js";
import { DepartmentModel } from "../src/models/Department.js";
import { AppointmentModel } from "../src/models/Appointment.js";
import { BillModel } from "../src/models/Bill.js";
import { VitalModel } from "../src/models/Vital.js";
import { TreatmentModel } from "../src/models/Treatment.js";
import { PrescriptionModel } from "../src/models/Prescription.js";
import { MedicalReportModel } from "../src/models/MedicalReport.js";
import { DoctorScheduleModel } from "../src/models/DoctorSchedule.js";
import { NotificationModel } from "../src/models/Notification.js";
import { AnnouncementModel } from "../src/models/Announcement.js";
import { ProfileModel } from "../src/models/Profile.js";

type SeedUser = { email: string; fullName: string; role: "patient" | "doctor" | "admin"; specialization?: string };

function daysAgo(n: number) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

function toDateString(d: Date) {
  return d.toISOString().slice(0, 10);
}

function toTimeString(h: number, m: number) {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

async function main() {
  const env = getEnv();
  await connectMongo(env.MONGODB_URI);

  const reset = (process.env.SEED_RESET || "true").toLowerCase() === "true";
  if (reset) {
    await Promise.all([
      UserModel.deleteMany({}),
      DepartmentModel.deleteMany({}),
      AppointmentModel.deleteMany({}),
      BillModel.deleteMany({}),
      VitalModel.deleteMany({}),
      TreatmentModel.deleteMany({}),
      PrescriptionModel.deleteMany({}),
      MedicalReportModel.deleteMany({}),
      DoctorScheduleModel.deleteMany({}),
      NotificationModel.deleteMany({}),
      AnnouncementModel.deleteMany({}),
      ProfileModel.deleteMany({}),
    ]);
  }

  const password = process.env.SEED_PASSWORD || "Password123!";
  const passwordHash = await bcrypt.hash(password, 10);

  const baseUsers: SeedUser[] = [
    { email: "admin@medflow.dev", fullName: "Admin User", role: "admin" },
    { email: "doctor1@medflow.dev", fullName: "Dr. Emily Carter", role: "doctor", specialization: "Cardiology" },
    { email: "doctor2@medflow.dev", fullName: "Dr. Arjun Nair", role: "doctor", specialization: "General Medicine" },
  ];

  const patients: SeedUser[] = Array.from({ length: 10 }).map((_, i) => ({
    email: `patient${i + 1}@medflow.dev`,
    fullName: `Patient ${i + 1}`,
    role: "patient",
  }));

  const createdUsers = await UserModel.insertMany(
    [...baseUsers, ...patients].map((u) => ({
      email: u.email.toLowerCase(),
      passwordHash,
      fullName: u.fullName,
      role: u.role,
      specialization: u.specialization || "",
      avatarUrl: "",
    })),
    { ordered: true }
  );

  const admin = createdUsers.find((u) => u.role === "admin")!;
  const doctors = createdUsers.filter((u) => u.role === "doctor");
  const patientDocs = createdUsers.filter((u) => u.role === "patient");

  // Basic profiles for all users
  await ProfileModel.insertMany(
    createdUsers.map((u, idx) => ({
      userId: u._id,
      phone: `+1-555-01${String(idx).padStart(2, "0")}`,
      dateOfBirth: u.role === "patient" ? "1998-01-01" : "",
      address: "123 Health St, Med City",
      bloodType: u.role === "patient" ? ["O+", "A+", "B+", "AB+"][idx % 4] : "",
      allergies: u.role === "patient" ? "None" : "",
      emergencyContactName: u.role === "patient" ? "Emergency Contact" : "",
      emergencyContactPhone: u.role === "patient" ? "+1-555-9999" : "",
    })),
    { ordered: false }
  ).catch(() => {});

  const departments = [
    "Cardiology",
    "Orthopedics",
    "General Medicine",
    "Neurology",
    "Pediatrics",
    "ENT",
    "Dermatology",
    "Radiology",
  ];
  await DepartmentModel.insertMany(departments.map((name) => ({ name })), { ordered: false }).catch(() => {});

  // Doctor schedules
  for (const d of doctors) {
    await DoctorScheduleModel.insertMany(
      [
        { doctorId: d._id, dayOfWeek: "Monday", timeSlots: ["09:00-11:00", "15:00-17:00"] },
        { doctorId: d._id, dayOfWeek: "Wednesday", timeSlots: ["10:00-13:00"] },
        { doctorId: d._id, dayOfWeek: "Friday", timeSlots: ["11:00-14:00"] },
      ],
      { ordered: false }
    ).catch(() => {});
  }

  // Announcements
  await AnnouncementModel.insertMany([
    { title: "Welcome to MedFlow", message: "Your digital health hub is ready.", createdBy: admin._id },
    { title: "Health Camp", message: "Free screening camp next week. Book your slot.", createdBy: admin._id },
    { title: "System Maintenance", message: "Scheduled maintenance Sunday 2 AM.", createdBy: admin._id },
  ]);

  // Appointments + related data for each patient
  const appointmentsToCreate: any[] = [];
  const billsToCreate: any[] = [];
  const vitalsToCreate: any[] = [];
  const treatmentsToCreate: any[] = [];
  const prescriptionsToCreate: any[] = [];
  const reportsToCreate: any[] = [];
  const notifsToCreate: any[] = [];

  for (let i = 0; i < patientDocs.length; i++) {
    const p = patientDocs[i];
    const doctor = doctors[i % doctors.length];
    const dept = doctor.specialization || "General Medicine";

    // 3 past + 2 future appointments
    for (let j = 1; j <= 3; j++) {
      appointmentsToCreate.push({
        patientId: p._id,
        doctorId: doctor._id,
        department: dept,
        appointmentDate: toDateString(daysAgo(7 * j)),
        appointmentTime: toTimeString(9 + (j % 4), j % 2 ? 0 : 30),
        reason: "Follow-up visit",
        type: j % 3 === 0 ? "telemedicine" : "in-person",
        status: "completed",
      });
    }
    for (let j = 1; j <= 2; j++) {
      appointmentsToCreate.push({
        patientId: p._id,
        doctorId: doctor._id,
        department: dept,
        appointmentDate: toDateString(new Date(Date.now() + 5 * j * 24 * 60 * 60 * 1000)),
        appointmentTime: toTimeString(10 + (j % 3), 15),
        reason: j % 2 === 0 ? "Routine checkup" : "New symptoms",
        type: "telemedicine",
        status: "pending",
      });
    }

    // Bills (mix of paid/unpaid)
    billsToCreate.push(
      { patientId: p._id, description: "Consultation Fee", amount: 500, status: "paid", paidAt: new Date().toISOString() },
      { patientId: p._id, description: "Blood Test Panel", amount: 300, status: "unpaid", dueDate: toDateString(new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)) }
    );

    // Vitals (30 entries for charts)
    for (let k = 0; k < 30; k++) {
      const recordedAt = new Date(Date.now() - (30 - k) * 24 * 60 * 60 * 1000).toISOString();
      vitalsToCreate.push({
        patientId: p._id,
        systolic: 115 + (k % 10),
        diastolic: 75 + (k % 8),
        sugarLevel: 95 + (k % 25),
        heartRate: 70 + (k % 10),
        temperature: 36.4 + ((k % 4) * 0.1),
        spo2: 96 + (k % 3),
        recordedAt,
      });
    }

    // Treatments
    treatmentsToCreate.push({
      patientId: p._id,
      doctorId: doctor._id,
      department: dept,
      diagnosis: "Hypertension",
      medicines: ["Low-salt diet", "Regular exercise"],
      startDate: toDateString(daysAgo(90)),
      status: "ongoing",
    });

    // Prescriptions
    prescriptionsToCreate.push({
      patientId: p._id,
      doctorId: doctor._id,
      diagnosis: "Hypertension",
      medicines: [
        { name: "Amlodipine 5mg", dosage: "1 tablet daily", duration: "30 days" },
        { name: "Aspirin 75mg", dosage: "1 tablet daily", duration: "30 days" },
      ],
    });

    // Reports (metadata)
    reportsToCreate.push({
      patientId: p._id,
      doctorId: doctor._id,
      name: "Blood Test - Sample",
      type: "Lab Report",
      fileUrl: "/uploads/sample_report.txt",
    });

    // Notifications
    notifsToCreate.push(
      { userId: p._id, type: "appointment", title: "Upcoming appointment", description: "You have an appointment scheduled soon.", read: false },
      { userId: p._id, type: "billing", title: "Bill due soon", description: "You have an unpaid bill due soon.", read: false }
    );
  }

  await AppointmentModel.insertMany(appointmentsToCreate);
  await BillModel.insertMany(billsToCreate);
  await VitalModel.insertMany(vitalsToCreate);
  await TreatmentModel.insertMany(treatmentsToCreate);
  await PrescriptionModel.insertMany(prescriptionsToCreate);
  await MedicalReportModel.insertMany(reportsToCreate);
  await NotificationModel.insertMany(notifsToCreate);

  // Summary
  // eslint-disable-next-line no-console
  console.log("\nSeed complete.");
  // eslint-disable-next-line no-console
  console.log(`MongoDB: ${env.MONGODB_URI}`);
  // eslint-disable-next-line no-console
  console.log(`Password for all demo users: ${password}`);
  // eslint-disable-next-line no-console
  console.log("Demo logins:");
  // eslint-disable-next-line no-console
  console.log("  admin:   admin@medflow.dev");
  // eslint-disable-next-line no-console
  console.log("  doctor:  doctor1@medflow.dev");
  // eslint-disable-next-line no-console
  console.log("  patient: patient1@medflow.dev");
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => {});
  });

