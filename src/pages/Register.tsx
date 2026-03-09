import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../contexts/AuthContext";
import { UserPlus } from "lucide-react";
import { AuthShell } from "../components/auth/AuthShell";
import { AuthField } from "../components/auth/AuthField";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  orgName: z.string().min(2, "Organization name must be at least 2 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const Register = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setSubmitError(null);
    try {
      await signUp(data.email, data.password, data.fullName, data.orgName);
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
      setSubmitError("Unable to create account. Please check your details and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      icon={<UserPlus className="h-6 w-6" />}
      title="Create your account"
      description="Set up your workspace to manage clients, sales activity, and invoicing."
      alternateText="Already have an account?"
      alternateLinkLabel="Sign in"
      alternateLinkTo="/login"
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <AuthField
          {...register("fullName")}
          id="fullName"
          type="text"
          autoComplete="name"
          label="Full name"
          placeholder="Jane Doe"
          error={errors.fullName?.message}
        />

        <AuthField
          {...register("orgName")}
          id="orgName"
          type="text"
          autoComplete="organization"
          label="Organization name"
          placeholder="Acme Corporation"
          error={errors.orgName?.message}
        />

        <AuthField
          {...register("email")}
          id="email"
          type="email"
          autoComplete="email"
          label="Work email"
          placeholder="you@company.com"
          error={errors.email?.message}
        />

        <AuthField
          {...register("password")}
          id="password"
          type="password"
          autoComplete="new-password"
          label="Password"
          placeholder="Create a secure password"
          helperText="Use at least 6 characters."
          error={errors.password?.message}
        />

        <AuthField
          {...register("confirmPassword")}
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          label="Confirm password"
          placeholder="Re-enter your password"
          error={errors.confirmPassword?.message}
        />

        {submitError ? (
          <p className="rounded-xl border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {submitError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:from-cyan-300 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-cyan-300/40 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Creating account..." : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
};
