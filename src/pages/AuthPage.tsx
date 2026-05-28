import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import { Toast } from "../components/ui/Toast";
import { Calendar, Sparkles } from "lucide-react";

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(
    null
  );
  const { login, register, loading } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        setToast({ message: "¡Bienvenido de nuevo!", type: "success" });
        setTimeout(() => navigate("/"), 1200);
      } else {
        await register(
          formData.firstName,
          formData.lastName,
          formData.email,
          formData.password
        );
        setToast({ message: "Registro exitoso. Inicia sesión con tus credenciales.", type: "success" });
        setIsLogin(true);
        setFormData({ firstName: "", lastName: "", email: "", password: "" });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error desconocido";
      setToast({ message, type: "error" });
    }
  };

  return (
    <div className="min-h-screen bg-mesh-gradient flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Blur Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full bg-indigo-300/10 blur-3xl animate-pulse-subtle"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full bg-purple-300/10 blur-3xl animate-pulse-subtle" style={{ animationDelay: '1s' }}></div>

      {toast && (
        <div className="fixed top-6 right-6 z-50 max-w-sm w-full">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      <div className="w-full max-w-md relative z-10 animate-scale-up">
        {/* Brand Logo Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 text-white shadow-glow mb-4 animate-bounce-slow">
            <Calendar className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
            EventManager
            <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-2">
            La plataforma definitiva para tus eventos
          </p>
        </div>

        {/* Auth Card */}
        <Card glass={true} className="border-glass p-8 shadow-2xl relative">
          <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">
            {isLogin ? "Iniciar Sesión" : "Crear una Cuenta"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <Input
                    label="Nombre"
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="John"
                    required
                  />
                </div>
                <div>
                  <Input
                    label="Apellido"
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <Input
                label="Correo Electrónico"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="ejemplo@correo.com"
                required
              />
            </div>

            <div>
              <Input
                label="Contraseña"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2 py-3.5"
              isLoading={loading}
            >
              {isLogin ? "Iniciar sesión" : "Comenzar registro"}
            </Button>
          </form>

          {/* Footer switch state */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500 mb-3">
              {isLogin ? "¿Aún no tienes una cuenta?" : "¿Ya eres miembro de la plataforma?"}
            </p>
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setFormData({
                  firstName: "",
                  lastName: "",
                  email: "",
                  password: "",
                });
              }}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors inline-flex items-center gap-1 hover:underline"
            >
              {isLogin ? "Regístrate ahora" : "Inicia sesión aquí"}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
