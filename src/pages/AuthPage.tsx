import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import { Toast } from "../components/ui/Toast";
import { Calendar } from "lucide-react";

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
        setToast({ message: "Bienvenido", type: "success" });
        setTimeout(() => navigate("/"), 1500);
      } else {
        await register(
          formData.firstName,
          formData.lastName,
          formData.email,
          formData.password
        );
        setToast({ message: "Registro exitoso. Por favor inicia sesión.", type: "success" });
        setIsLogin(true);
        setFormData({ firstName: "", lastName: "", email: "", password: "" });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error desconocido";
      setToast({ message, type: "error" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      {toast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 text-2xl font-bold text-blue-600">
            <Calendar className="w-8 h-8" />
            EventManager
          </div>
        </div>

        <Card className="shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {isLogin ? "Iniciar sesión" : "Crear cuenta"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <Input
                  label="Nombre"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Apellido"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </>
            )}

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />

            <Input
              label="Contraseña"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={loading}
            >
              {isLogin ? "Iniciar sesión" : "Crear cuenta"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 mb-2">
              {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}
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
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {isLogin ? "Registrarse" : "Iniciar sesión"}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
