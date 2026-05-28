import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => (
    <div className="w-full group">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 transition-colors group-focus-within:text-indigo-600">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full px-4 py-3 bg-white border rounded-xl text-slate-800 placeholder-slate-400/80 transition-all duration-200 outline-none ${
          error
            ? "border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
            : "border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-rose-500 text-xs font-medium mt-1.5 animate-slide-up flex items-center gap-1">
          <span>⚠️</span> {error}
        </p>
      )}
    </div>
  )
);

Input.displayName = "Input";
