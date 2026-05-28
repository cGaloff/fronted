import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  children,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles =
    "relative font-semibold rounded-xl transition-all duration-300 ease-out " +
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500/40 " +
    "active:scale-[0.97] hover:scale-[1.01] " +
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100";

  const variants = {
    primary: "bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 text-white shadow-premium hover:shadow-indigo-500/25 border border-indigo-500/10",
    secondary: "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80 shadow-sm",
    danger: "bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-sm hover:shadow-rose-500/25 border border-rose-500/10",
  };

  const sizes = {
    sm: "px-3.5 py-2 text-xs rounded-lg",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3.5 text-base rounded-2xl",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      <span className={`flex items-center justify-center gap-2 ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}>
        {children}
      </span>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="animate-spin h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      )}
    </button>
  );
}
