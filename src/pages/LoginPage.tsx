import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Heart, User, Stethoscope, ShieldCheck, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const roles: { id: UserRole; icon: typeof User; label: string; desc: string }[] = [
  { id: "patient", icon: User, label: "Patient", desc: "Access health records & appointments" },
  { id: "doctor", icon: Stethoscope, label: "Doctor", desc: "Manage patients & prescriptions" },
  { id: "admin", icon: ShieldCheck, label: "Admin", desc: "System management & analytics" },
];

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (isRegister) {
      const result = await register(email, password, fullName, selectedRole);
      if (result.success) {
        toast.success("Account created! Check your email to confirm, then sign in.");
        setIsRegister(false);
      } else {
        toast.error(result.error || "Registration failed");
      }
    } else {
      const result = await login(email, password, selectedRole);
      if (result.success) {
        navigate("/", { replace: true });
      } else {
        toast.error(result.error || "Login failed");
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden flex-col justify-between p-12">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <Heart size={20} className="text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-primary-foreground tracking-tight">MedFlow</span>
          </div>
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-primary-foreground leading-tight mb-4">
            Your Clinical<br />Operating System
          </h1>
          <p className="text-primary-foreground/70 text-lg max-w-md">
            Unified healthcare management for patients, doctors, and administrators.
          </p>
        </div>
        <div className="relative z-10 text-primary-foreground/50 text-sm">
          © 2024 MedFlow OS
        </div>
        <div className="absolute -right-32 -top-32 w-96 h-96 rounded-full bg-primary-foreground/5" />
        <div className="absolute -right-16 bottom-32 w-64 h-64 rounded-full bg-primary-foreground/5" />
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="w-full max-w-md"
        >
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Heart size={16} className="text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">MedFlow</span>
          </div>

          <h2 className="text-2xl font-semibold text-foreground mb-1">
            {isRegister ? "Create account" : "Welcome back"}
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            {isRegister ? "Register a new account" : "Sign in to your account"}
          </p>

          {/* Role selector */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {roles.map((role) => {
              const Icon = role.icon;
              const active = selectedRole === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-lg text-xs font-medium transition-all duration-150 ${
                    active
                      ? "bg-primary/10 text-primary shadow-card"
                      : "bg-card text-muted-foreground hover:bg-accent shadow-card"
                  }`}
                >
                  <Icon size={20} />
                  {role.label}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Full Name</label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="h-11"
                  required
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-11"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-11 gap-2" disabled={submitting}>
              {submitting ? "Please wait..." : isRegister ? "Create Account" : "Sign In"}
              {!submitting && <ArrowRight size={16} />}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {isRegister ? "Already have an account?" : "New here?"}{" "}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-primary font-medium hover:underline"
            >
              {isRegister ? "Sign in" : "Register here"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
