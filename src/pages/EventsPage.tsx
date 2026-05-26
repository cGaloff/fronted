import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { eventsAPI } from "../lib/api";
import { Event, EventStatus, UserRole } from "../types";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Toast } from "../components/ui/Toast";
import { Plus, MapPin, Clock } from "lucide-react";

export function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(
    null
  );
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await eventsAPI.list();
      setEvents(data || []);
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

      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">EventManager</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">{user?.email}</span>
            <Button variant="secondary" size="sm" onClick={logout}>
              Salir
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Eventos</h2>
            <p className="text-gray-600 mt-1">Descubre y participa en eventos</p>
          </div>
          <div className="flex gap-4">
            <Button
              variant="primary"
              onClick={() => navigate("/mis-eventos")}
              size="md"
            >
              Mis Eventos
            </Button>
            {user?.role === UserRole.User && (
              <Button
                variant="primary"
                onClick={() => navigate("/crear-evento")}
                size="md"
              >
                <Plus className="w-5 h-5 mr-2" />
                Crear Evento
              </Button>
            )}
            {user?.role === UserRole.Admin && (
              <Button
                variant="primary"
                onClick={() => navigate("/reportes")}
                size="md"
              >
                Reportes
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Cargando eventos...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No hay eventos disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card
                key={event.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/eventos/${event.id}`)}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-gray-900 flex-1">
                    {event.name}
                  </h3>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      statusColors[event.status as EventStatus]
                    }`}
                  >
                    {statusLabels[event.status as EventStatus]}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {event.description}
                </p>

                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>{new Date(event.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span>{event.location}</span>
                  </div>
                  <div className="text-gray-600">
                    Capacidad: {event.maxCapacity}
                  </div>
                  {event.hasParking && (
                    <div className="text-green-600 text-xs font-medium">
                      ✓ Estacionamiento disponible
                    </div>
                  )}
                </div>

                <Button
                  variant="primary"
                  className="w-full mt-4"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/eventos/${event.id}`);
                  }}
                >
                  Ver detalles
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
