import { forwardRef, type InputHTMLAttributes } from "react";

type AuthFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string;
  helperText?: string;
};

export const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(
  ({ id, label, error, helperText, className, ...props }, ref) => {
    return (
      <div>
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-200">
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          className={`h-11 w-full rounded-xl border bg-slate-950/80 px-3.5 text-sm text-slate-100 placeholder:text-slate-500 transition focus:outline-none focus:ring-2 ${
            error
              ? "border-red-400/60 focus:border-red-300 focus:ring-red-400/30"
              : "border-white/15 focus:border-cyan-300/60 focus:ring-cyan-300/30"
          } ${className ?? ""}`}
          {...props}
        />
        {error ? (
          <p className="mt-1.5 text-sm text-red-300" role="alert">
            {error}
          </p>
        ) : helperText ? (
          <p className="mt-1.5 text-xs text-slate-400">{helperText}</p>
        ) : null}
      </div>
    );
  },
);

AuthField.displayName = "AuthField";
