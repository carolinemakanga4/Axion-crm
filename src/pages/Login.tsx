import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../contexts/AuthContext";
import { LogIn } from "lucide-react";
import { AuthShell } from "../components/auth/AuthShell";
import { AuthField } from "../components/auth/AuthField";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setSubmitError(null);
    try {
      await signIn(data.email, data.password);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setSubmitError("Unable to sign in. Check your credentials and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      icon={<LogIn className="h-6 w-6" />}
      title="Sign in to your account"
      description="Access your sales pipeline, clients, projects, and invoicing workspace."
      alternateText="New to Axion CRM?"
      alternateLinkLabel="Create an account"
      alternateLinkTo="/register"
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <AuthField
          {...register("email")}
          id="email"
          type="email"
          autoComplete="email"
          label="Email address"
          placeholder="you@company.com"
          error={errors.email?.message}
        />

        <AuthField
          {...register("password")}
          id="password"
          type="password"
          autoComplete="current-password"
          label="Password"
          placeholder="Enter your password"
          helperText="Use the password associated with your organization account."
          error={errors.password?.message}
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
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
};
