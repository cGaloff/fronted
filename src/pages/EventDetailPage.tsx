import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { eventsAPI, registrationsAPI } from "../lib/api";
import { Event, EventStatus, UserRole } from "../types";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Toast } from "../components/ui/Toast";
import { ArrowLeft, MapPin, Clock, Users, ParkingCircle } from "lucide-react";

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(
    null
  );
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadEvent();
    }
  }, [id]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      const data = await eventsAPI.getById(id!);
      setEvent(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al cargar evento";
      setToast({ message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!event || !user) return;

    try {
      setRegistering(true);
      await registrationsAPI.create({
        eventId: event.id,
        userId: user.id,
      });
      setIsRegistered(true);
      setToast({
        message: "Inscripción exitosa. Revisa tu QR en 'Mis Eventos'",
        type: "success",
      });
      setTimeout(() => navigate("/mis-eventos"), 1500);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al registrarse";
      setToast({ message, type: "error" });
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Cargando evento...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Evento no encontrado</p>
          <Button onClick={() => navigate("/")} variant="primary">
            Volver a eventos
          </Button>
        </div>
      </div>
    );
  }

  const statusLabels: Record<EventStatus, string> = {
    [EventStatus.Draft]: "Borrador",
    [EventStatus.Published]: "Publicado",
    [EventStatus.Cancelled]: "Cancelado",
    [EventStatus.Finished]: "Finalizado",
  };

  const canRegister =
    event.status === EventStatus.Published &&
    user?.role === UserRole.User &&
    !isRegistered;

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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {event.name}
              </h1>
              <p className="text-gray-600">
                Organizado por: {event.organizerName}
              </p>
            </div>
            <span className="text-sm font-semibold px-4 py-2 rounded-full bg-green-100 text-green-800">
              {statusLabels[event.status as EventStatus]}
            </span>
          </div>

          <p className="text-gray-700 text-lg mb-6">{event.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="flex items-start gap-3">
              <Clock className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">Fecha y hora</p>
                <p className="text-gray-700">
                  {new Date(event.startDate).toLocaleDateString()} -{" "}
                  {new Date(event.startDate).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="text-gray-600 text-sm">
                  Termina:{" "}
                  {new Date(event.endDate).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">Ubicación</p>
                <p className="text-gray-700">{event.location}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">Capacidad</p>
                <p className="text-gray-700">{event.maxCapacity} personas</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ParkingCircle className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">Estacionamiento</p>
                <p className="text-gray-700">
                  {event.hasParking ? "Disponible" : "No disponible"}
                </p>
              </div>
            </div>
          </div>

          {canRegister && (
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleRegister}
              isLoading={registering}
            >
              Registrarse al evento
            </Button>
          )}

          {isRegistered && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
              Ya estás registrado en este evento
            </div>
          )}

          {event.status !== EventStatus.Published &&
            user?.role === UserRole.User && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
                Este evento no está abierto para inscripciones
              </div>
            )}
        </Card>

        <Card>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Información adicional</h3>
          <div className="space-y-2 text-gray-700">
            <p>
              <strong>Creado:</strong>{" "}
              {new Date(event.createdAt).toLocaleDateString()}
            </p>
            <p>
              <strong>Actualizado:</strong>{" "}
              {new Date(event.updatedAt).toLocaleDateString()}
            </p>
            <p>
              <strong>ID del evento:</strong>{" "}
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                {event.id}
              </code>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
