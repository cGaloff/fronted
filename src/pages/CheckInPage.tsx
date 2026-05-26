import { useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { checkInAPI } from "../lib/api";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import { Toast } from "../components/ui/Toast";
import { CheckCircle, XCircle, QrCode } from "lucide-react";

export function CheckInPage() {
  const [token, setToken] = useState("");
  const [eventId, setEventId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(
    null
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !eventId) {
      setToast({
        message: "Completa todos los campos",
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);
      const data = await checkInAPI.validate({ token, eventId });
      setResult(data);
      setToken("");
      setEventId("");
      if (inputRef.current) inputRef.current.focus();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error en check-in";
      setToast({ message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {toast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 text-white p-4 rounded-full">
              <QrCode className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sistema de Check-in
          </h1>
          <p className="text-gray-600">
            Escanea el código QR o ingresa manualmente los datos
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Operador: {user?.email}
          </p>
        </Card>

        <Card className="mb-8">
          <form onSubmit={handleValidate} className="space-y-4">
            <Input
              label="Token QR"
              type="text"
              ref={inputRef}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Escanea o pega el código QR"
              autoComplete="off"
            />

            <Input
              label="ID del evento"
              type="text"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              placeholder="Ingresa el ID del evento"
              autoComplete="off"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={loading}
            >
              Validar check-in
            </Button>
          </form>
        </Card>

        {result && (
          <Card
            className={`${
              result.success
                ? "border-2 border-green-500 bg-green-50"
                : "border-2 border-yellow-500 bg-yellow-50"
            }`}
          >
            <div className="text-center">
              <div className="flex justify-center mb-4">
                {result.success ? (
                  <CheckCircle className="w-16 h-16 text-green-600" />
                ) : (
                  <XCircle className="w-16 h-16 text-yellow-600" />
                )}
              </div>

              <h3
                className={`text-xl font-bold mb-2 ${
                  result.success ? "text-green-900" : "text-yellow-900"
                }`}
              >
                {result.success ? "Check-in exitoso" : "Aviso"}
              </h3>

              <p
                className={`${
                  result.success ? "text-green-800" : "text-yellow-800"
                } mb-4`}
              >
                {result.message}
              </p>

              <div className="space-y-2 text-left bg-white rounded-lg p-4 mb-4">
                <p className="text-gray-700">
                  <strong>Nombre:</strong> {result.userFullName}
                </p>
                <p className="text-gray-700">
                  <strong>Evento:</strong> {result.eventName}
                </p>
                <p className="text-gray-700">
                  <strong>Hora:</strong>{" "}
                  {new Date(result.checkedInAt).toLocaleTimeString()}
                </p>
              </div>

              <Button
                variant="secondary"
                onClick={() => {
                  setResult(null);
                  if (inputRef.current) inputRef.current.focus();
                }}
              >
                Siguiente registro
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
