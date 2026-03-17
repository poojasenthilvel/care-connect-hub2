
-- ============================================
-- MEDFLOW HOSPITAL - Full Database Schema
-- ============================================

-- 1. Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 2. App role enum
CREATE TYPE public.app_role AS ENUM ('patient', 'doctor', 'admin');

-- 3. User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 4. Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  date_of_birth DATE,
  address TEXT DEFAULT '',
  blood_type TEXT DEFAULT '',
  allergies TEXT DEFAULT '',
  emergency_contact_name TEXT DEFAULT '',
  emergency_contact_phone TEXT DEFAULT '',
  specialization TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by authenticated users" ON public.profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, '')
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'patient'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Departments table
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Departments viewable by all authenticated" ON public.departments
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage departments" ON public.departments
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.departments (name) VALUES
  ('Cardiology'), ('Orthopedics'), ('General Medicine'), ('Neurology'),
  ('Pediatrics'), ('ENT'), ('Dermatology'), ('Radiology');

-- 6. Appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  department TEXT NOT NULL DEFAULT '',
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  reason TEXT DEFAULT '',
  type TEXT NOT NULL DEFAULT 'in-person',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own appointments" ON public.appointments
  FOR SELECT TO authenticated USING (auth.uid() = patient_id);
CREATE POLICY "Doctors can view their appointments" ON public.appointments
  FOR SELECT TO authenticated USING (auth.uid() = doctor_id);
CREATE POLICY "Admins can view all appointments" ON public.appointments
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Patients can create appointments" ON public.appointments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Patients can update own appointments" ON public.appointments
  FOR UPDATE TO authenticated USING (auth.uid() = patient_id);
CREATE POLICY "Doctors can update their appointments" ON public.appointments
  FOR UPDATE TO authenticated USING (auth.uid() = doctor_id);
CREATE POLICY "Admins can manage all appointments" ON public.appointments
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Medical reports table
CREATE TABLE public.medical_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Lab Report',
  file_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.medical_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own reports" ON public.medical_reports
  FOR SELECT TO authenticated USING (auth.uid() = patient_id);
CREATE POLICY "Doctors can view patient reports" ON public.medical_reports
  FOR SELECT TO authenticated USING (auth.uid() = doctor_id OR public.has_role(auth.uid(), 'doctor'));
CREATE POLICY "Admins can view all reports" ON public.medical_reports
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Patients can upload reports" ON public.medical_reports
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Doctors can create reports" ON public.medical_reports
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'doctor'));

-- 8. Bills table
CREATE TABLE public.bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'unpaid',
  due_date DATE,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own bills" ON public.bills
  FOR SELECT TO authenticated USING (auth.uid() = patient_id);
CREATE POLICY "Admins can manage all bills" ON public.bills
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Patients can update own bills" ON public.bills
  FOR UPDATE TO authenticated USING (auth.uid() = patient_id);

-- 9. Prescriptions table
CREATE TABLE public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  diagnosis TEXT NOT NULL DEFAULT '',
  medicines JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own prescriptions" ON public.prescriptions
  FOR SELECT TO authenticated USING (auth.uid() = patient_id);
CREATE POLICY "Doctors can view their prescriptions" ON public.prescriptions
  FOR SELECT TO authenticated USING (auth.uid() = doctor_id);
CREATE POLICY "Doctors can create prescriptions" ON public.prescriptions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = doctor_id);
CREATE POLICY "Admins can view all prescriptions" ON public.prescriptions
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 10. Treatments table
CREATE TABLE public.treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  department TEXT DEFAULT '',
  diagnosis TEXT NOT NULL,
  medicines TEXT[] NOT NULL DEFAULT '{}',
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'ongoing',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own treatments" ON public.treatments
  FOR SELECT TO authenticated USING (auth.uid() = patient_id);
CREATE POLICY "Doctors can view treatments" ON public.treatments
  FOR SELECT TO authenticated USING (auth.uid() = doctor_id OR public.has_role(auth.uid(), 'doctor'));
CREATE POLICY "Doctors can create treatments" ON public.treatments
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'doctor'));
CREATE POLICY "Doctors can update treatments" ON public.treatments
  FOR UPDATE TO authenticated USING (auth.uid() = doctor_id);
CREATE POLICY "Admins can view all treatments" ON public.treatments
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 11. Vitals table
CREATE TABLE public.vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  systolic INTEGER,
  diastolic INTEGER,
  sugar_level INTEGER,
  heart_rate INTEGER,
  temperature NUMERIC(4,1),
  spo2 INTEGER,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.vitals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own vitals" ON public.vitals
  FOR SELECT TO authenticated USING (auth.uid() = patient_id);
CREATE POLICY "Patients can insert own vitals" ON public.vitals
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Doctors can view patient vitals" ON public.vitals
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'doctor'));
CREATE POLICY "Admins can view all vitals" ON public.vitals
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 12. Doctor schedules table
CREATE TABLE public.doctor_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL,
  time_slots TEXT[] NOT NULL DEFAULT '{}',
  UNIQUE (doctor_id, day_of_week)
);
ALTER TABLE public.doctor_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Schedules viewable by all authenticated" ON public.doctor_schedules
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Doctors can manage own schedule" ON public.doctor_schedules
  FOR ALL TO authenticated USING (auth.uid() = doctor_id);
CREATE POLICY "Admins can manage all schedules" ON public.doctor_schedules
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 13. Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 14. Announcements table
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Announcements viewable by all authenticated" ON public.announcements
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage announcements" ON public.announcements
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 15. Storage bucket for medical reports
INSERT INTO storage.buckets (id, name, public) VALUES ('medical-reports', 'medical-reports', false);

CREATE POLICY "Patients can upload own reports" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'medical-reports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Patients can view own report files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'medical-reports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Doctors can view report files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'medical-reports' AND public.has_role(auth.uid(), 'doctor'));

CREATE POLICY "Admins can view all report files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'medical-reports' AND public.has_role(auth.uid(), 'admin'));

-- 16. Indexes
CREATE INDEX idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON public.appointments(doctor_id);
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_vitals_patient ON public.vitals(patient_id);
CREATE INDEX idx_vitals_recorded ON public.vitals(recorded_at);
CREATE INDEX idx_bills_patient ON public.bills(patient_id);
CREATE INDEX idx_treatments_patient ON public.treatments(patient_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_prescriptions_patient ON public.prescriptions(patient_id);
CREATE INDEX idx_medical_reports_patient ON public.medical_reports(patient_id);
