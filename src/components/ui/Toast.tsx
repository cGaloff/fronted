import { useEffect } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}

export function Toast({
  message,
  type = "info",
  onClose,
  duration = 4000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const borderColors = {
    success: "border-l-emerald-500 text-emerald-600 bg-emerald-50/10",
    error: "border-l-rose-500 text-rose-600 bg-rose-50/10",
    info: "border-l-indigo-500 text-indigo-600 bg-indigo-50/10",
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-500" />,
    error: <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />,
    info: <Info className="w-5 h-5 flex-shrink-0 text-indigo-500" />,
  };

  return (
    <div
      className={`flex items-center gap-3 bg-white/90 backdrop-blur-md border border-slate-100 border-l-4 rounded-xl shadow-2xl p-4 pr-5 transition-all duration-300 animate-slide-in-right ${borderColors[type]} max-w-sm w-full`}
      style={{ boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1)' }}
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <div className="flex-1 font-medium text-slate-800 text-sm leading-relaxed pr-2">
        {message}
      </div>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-slate-600 hover:bg-slate-100/80 p-1.5 rounded-lg transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
