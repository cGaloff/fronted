import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { eventsAPI, registrationsAPI } from "../lib/api";
import { Event, EventStatus, UserRole } from "../types";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Toast } from "../components/ui/Toast";
import { ChevronLeft, MapPin, Clock, Users, ParkingCircle, Copy, Check, CalendarDays, Building2, Sparkles } from "lucide-react";

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [copied, setCopied] = useState(false);
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
      
      // Check if user is already registered in this event by pulling user registrations
      if (user?.id && data) {
        const userRegs = await registrationsAPI.getUserRegistrations(user.id);
        const registered = userRegs.some((reg: any) => reg.eventId === data.id);
        setIsRegistered(registered);
      }
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
        message: "¡Inscripción completada! Revisa tu entrada en 'Mis Eventos'",
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

  const handleCopyId = () => {
    if (!event) return;
    navigator.clipboard.writeText(event.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-mesh-gradient flex flex-col items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 animate-spin"></div>
        </div>
        <p className="text-slate-500 mt-4 font-semibold text-sm">Cargando detalles del evento...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-mesh-gradient flex items-center justify-center p-4">
        <Card className="text-center p-8 max-w-md w-full">
          <div className="flex justify-center mb-4 text-rose-500">
            <CalendarDays className="w-16 h-16 stroke-1" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Evento no encontrado</h2>
          <p className="text-slate-500 text-sm mt-2 mb-6">El evento al que intentas acceder no existe o fue eliminado.</p>
          <Button onClick={() => navigate("/")} variant="primary" className="w-full">
            Regresar al Inicio
          </Button>
        </Card>
      </div>
    );
  }

  const statusLabels: Record<EventStatus, string> = {
    [EventStatus.Draft]: "Borrador",
    [EventStatus.Published]: "Publicado",
    [EventStatus.Cancelled]: "Cancelado",
    [EventStatus.Finished]: "Finalizado",
  };

  const statusColors: Record<EventStatus, string> = {
    [EventStatus.Draft]: "bg-slate-100 text-slate-700 border-slate-200",
    [EventStatus.Published]: "bg-emerald-50 text-emerald-700 border-emerald-100",
    [EventStatus.Cancelled]: "bg-rose-50 text-rose-700 border-rose-100",
    [EventStatus.Finished]: "bg-indigo-50 text-indigo-700 border-indigo-100",
  };

  const canRegister =
    event.status === EventStatus.Published &&
    user?.role === UserRole.User &&
    !isRegistered;

  return (
    <div className="min-h-screen bg-mesh-gradient pb-16">
      {toast && (
        <div className="fixed top-6 right-6 z-50 max-w-sm w-full">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      {/* Nav backbar */}
      <nav className="bg-transparent absolute top-0 left-0 w-full z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-xl font-semibold text-sm backdrop-blur-md transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver
          </button>
        </div>
      </nav>

      {/* Grand Hero Gradient Banner */}
      <div className="h-64 sm:h-72 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        {/* Glowing visual overlay inside hero */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500/20 rounded-full blur-[100px]"></div>
      </div>

      {/* Overlapping Main Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20 animate-slide-up">
        {/* Main Details Card */}
        <Card className="p-8 sm:p-10 mb-8 border-glass shadow-2xl bg-white/95">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
            <div className="flex-1">
              <span
                className={`inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-xl border mb-3.5 ${
                  statusColors[event.status as EventStatus]
                }`}
              >
                {statusLabels[event.status as EventStatus]}
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {event.name}
              </h1>
              
              <div className="flex items-center gap-2 text-slate-500 font-medium text-sm mt-3">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>Organizado por <strong className="text-slate-800">{event.organizerName}</strong></span>
              </div>
            </div>
          </div>

          {/* Description Block */}
          <div className="mb-8">
            <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-2.5">Detalles del Evento</h3>
            <p className="text-slate-600 text-base leading-relaxed whitespace-pre-line bg-slate-50/50 p-4.5 rounded-2xl border border-slate-100/50">
              {event.description}
            </p>
          </div>

          {/* Grid Metadata Info Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 mb-8">
            {/* Tile 1: Date */}
            <div className="flex gap-4 p-4.5 bg-indigo-50/20 rounded-2xl border border-indigo-100/30">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Fecha y Hora</p>
                <p className="text-slate-800 text-sm font-bold mt-0.5">
                  {new Date(event.startDate).toLocaleDateString(undefined, {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </p>
                <p className="text-slate-500 text-xs mt-0.5 font-medium">
                  {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} a{" "}
                  {new Date(event.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            {/* Tile 2: Location */}
            <div className="flex gap-4 p-4.5 bg-indigo-50/20 rounded-2xl border border-indigo-100/30">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Ubicación</p>
                <p className="text-slate-800 text-sm font-bold mt-0.5 leading-relaxed">{event.location}</p>
              </div>
            </div>

            {/* Tile 3: Capacity */}
            <div className="flex gap-4 p-4.5 bg-indigo-50/20 rounded-2xl border border-indigo-100/30">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Capacidad Límite</p>
                <p className="text-slate-800 text-sm font-bold mt-0.5">{event.maxCapacity} Asistentes</p>
                <p className="text-slate-500 text-xs mt-0.5 font-medium">Cupo reservado por orden de registro</p>
              </div>
            </div>

            {/* Tile 4: Parking */}
            <div className="flex gap-4 p-4.5 bg-indigo-50/20 rounded-2xl border border-indigo-100/30">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                <ParkingCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Estacionamiento</p>
                <p className="text-slate-800 text-sm font-bold mt-0.5">
                  {event.hasParking ? "Disponible" : "No disponible"}
                </p>
                <p className="text-slate-500 text-xs mt-0.5 font-medium">
                  {event.hasParking ? "Sujeto a disponibilidad del espacio" : "Se sugiere usar transporte alternativo"}
                </p>
              </div>
            </div>
          </div>

          {/* Action Registration Panel */}
          <div className="pt-2 border-t border-slate-100">
            {canRegister && (
              <Button
                variant="primary"
                size="lg"
                className="w-full py-4 shadow-glow font-bold flex items-center justify-center gap-2"
                onClick={handleRegister}
                isLoading={registering}
              >
                Inscribirse al Evento
              </Button>
            )}

            {isRegistered && (
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl p-4.5 text-emerald-800 font-semibold text-sm animate-scale-up">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                  <Check className="w-4.5 h-4.5" />
                </div>
                <span>¡Ya estás registrado! Tu código de acceso QR está listo en la sección de Mis Eventos.</span>
              </div>
            )}

            {event.status !== EventStatus.Published && user?.role === UserRole.User && (
              <div className="bg-amber-50/60 border border-amber-100/80 rounded-2xl p-4.5 text-amber-800 font-medium text-sm">
                ⚠️ Este evento no está abierto para recibir inscripciones en este momento.
              </div>
            )}

            {user?.role === UserRole.Admin && (
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4.5 text-indigo-900 font-medium text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <span>Modo de visualización de administrador. Los registros están desactivados.</span>
              </div>
            )}
          </div>
        </Card>

        {/* Secondary Administrative metadata card */}
        <Card className="bg-white/60 p-6 border-glass">
          <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-4">Información del Sistema</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-sm text-slate-600">
            <div>
              <p className="text-xs text-slate-400 font-medium">Creado en el sistema</p>
              <p className="font-bold text-slate-700 mt-1">
                {new Date(event.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            
            <div>
              <p className="text-xs text-slate-400 font-medium">Última actualización</p>
              <p className="font-bold text-slate-700 mt-1">
                {new Date(event.updatedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>

            <div className="sm:col-span-2 md:col-span-1">
              <p className="text-xs text-slate-400 font-medium">Código Identificador</p>
              <div className="flex items-center gap-1.5 mt-1">
                <code className="bg-slate-100/80 border border-slate-200/50 px-2.5 py-1 rounded-lg text-xs font-mono text-slate-600 truncate max-w-[150px]">
                  {event.id}
                </code>
                
                <button
                  onClick={handleCopyId}
                  className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition-colors relative"
                  title="Copiar ID"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500 animate-scale-up" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copied && (
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 text-[9px] bg-slate-900 text-white font-bold px-2 py-0.5 rounded shadow-sm whitespace-nowrap animate-fade-in">
                      ¡Copiado!
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
