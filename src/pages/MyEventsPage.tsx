import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { registrationsAPI } from "../lib/api";
import { RegistrationDetail, EventStatus } from "../types";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Toast } from "../components/ui/Toast";
import QRCode from "qrcode.react";
import { ArrowLeft, Download } from "lucide-react";

export function MyEventsPage() {
  const [registrations, setRegistrations] = useState<RegistrationDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(
    null
  );
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      loadRegistrations();
    }
  }, [user?.id]);

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      const data = await registrationsAPI.getUserRegistrations(user!.id);
      setRegistrations(data || []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al cargar eventos";
      setToast({ message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const statusLabels: Record<EventStatus, string> = {
    [EventStatus.Draft]: "Borrador",
    [EventStatus.Published]: "Publicado",
    [EventStatus.Cancelled]: "Cancelado",
    [EventStatus.Finished]: "Finalizado",
  };

  const statusColors: Record<EventStatus, string> = {
    [EventStatus.Draft]: "bg-gray-100 text-gray-800",
    [EventStatus.Published]: "bg-green-100 text-green-800",
    [EventStatus.Cancelled]: "bg-red-100 text-red-800",
    [EventStatus.Finished]: "bg-blue-100 text-blue-800",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis eventos</h1>
        <p className="text-gray-600 mb-8">
          Eventos en los que estás registrado
        </p>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Cargando eventos...</p>
          </div>
        ) : registrations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              No estás registrado en ningún evento
            </p>
            <Button onClick={() => navigate("/")} variant="primary">
              Explorar eventos
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {registrations.map((reg) => (
              <Card key={reg.eventId} className="flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">
                      {reg.eventName}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {new Date(reg.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      statusColors[reg.status as EventStatus]
                    }`}
                  >
                    {statusLabels[reg.status as EventStatus]}
                  </span>
                </div>

                <p className="text-gray-700 text-sm mb-4">📍 {reg.location}</p>

                <div className="bg-gray-50 rounded-lg p-4 mb-4 flex items-center justify-center">
                  <QRCode
                    value={reg.eventId}
                    size={150}
                    level="H"
                    includeMargin={true}
                    id={`qr-${reg.eventId}`}
                  />
                </div>

                <p className="text-gray-600 text-xs mb-4">
                  Registrado: {new Date(reg.registeredAt).toLocaleDateString()}
                </p>

                <div className="flex gap-2 mt-auto">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1 flex items-center justify-center gap-2"
                    onClick={() => {
                      const qrElement = document.getElementById(
                        `qr-${reg.eventId}`
                      );
                      if (qrElement) {
                        const url = (qrElement.querySelector("canvas") as any)?.toDataURL();
                        if (url) {
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `qr-${reg.eventName}.png`;
                          a.click();
                        }
                      }
                    }}
                  >
                    <Download className="w-4 h-4" />
                    Descargar QR
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
