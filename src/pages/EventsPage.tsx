import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { eventsAPI } from "../lib/api";
import { Event, EventStatus, UserRole } from "../types";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Toast } from "../components/ui/Toast";
import { Plus, MapPin, Clock, Search, LogOut, Ticket, BarChart3, Sparkles, CalendarDays } from "lucide-react";

export function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
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
    [EventStatus.Draft]: "bg-slate-100 text-slate-700 border-slate-200",
    [EventStatus.Published]: "bg-emerald-50 text-emerald-700 border-emerald-100",
    [EventStatus.Cancelled]: "bg-rose-50 text-rose-700 border-rose-100",
    [EventStatus.Finished]: "bg-indigo-50 text-indigo-700 border-indigo-100",
  };

  // Generate deterministic gradient background for cards based on event id/name
  const getCardPattern = (id: string) => {
    const gradients = [
      "from-indigo-500 to-purple-500",
      "from-violet-500 to-fuchsia-500",
      "from-blue-500 to-indigo-600",
      "from-purple-500 to-pink-500",
      "from-indigo-500 to-cyan-500",
    ];
    const index = id.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  // Filter events based on search term and selected tab
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && event.status === EventStatus.Published) ||
      (statusFilter === "cancelled" && event.status === EventStatus.Cancelled) ||
      (statusFilter === "finished" && event.status === EventStatus.Finished) ||
      (statusFilter === "draft" && event.status === EventStatus.Draft);

    return matchesSearch && matchesStatus;
  });

  const userInitials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || user.email[0].toUpperCase()
    : "U";

  return (
    <div className="min-h-screen bg-mesh-gradient">
      {toast && (
        <div className="fixed top-6 right-6 z-50 max-w-sm w-full">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      {/* Header Glass Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-glow">
              <CalendarDays className="w-5.5 h-5.5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1">
              EventManager
              <Sparkles className="w-4 h-4 text-indigo-500" />
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-bold text-slate-800">{user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email}</span>
              <span className="text-xs font-medium text-slate-400 capitalize">{user?.role}</span>
            </div>
            
            {/* Avatar block */}
            <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm shadow-sm">
              {userInitials}
            </div>

            <button 
              onClick={logout}
              className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-xl transition-all duration-200"
              title="Salir"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Descubre Eventos Increíbles</h2>
            <p className="text-slate-500 mt-1 font-medium">Explora, regístrate y asiste a los mejores encuentros corporativos y sociales.</p>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => navigate("/mis-eventos")}
              className="flex items-center gap-2 px-5 py-3 border-slate-200"
            >
              <Ticket className="w-4 h-4 text-indigo-500" />
              Mis Eventos
            </Button>
            {user?.role === UserRole.User && (
              <Button
                variant="primary"
                onClick={() => navigate("/crear-evento")}
                className="flex items-center gap-2 px-5 py-3"
              >
                <Plus className="w-4.5 h-4.5" />
                Crear Evento
              </Button>
            )}
            {user?.role === UserRole.Admin && (
              <Button
                variant="primary"
                onClick={() => navigate("/reportes")}
                className="flex items-center gap-2 px-5 py-3"
              >
                <BarChart3 className="w-4.5 h-4.5" />
                Panel Admin
              </Button>
            )}
          </div>
        </div>

        {/* Search and Filters Segment */}
        <Card className="p-4 mb-8 bg-white/70 border-glass shadow-sm flex flex-col md:flex-row gap-4 items-center">
          {/* Search bar */}
          <div className="relative w-full md:flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre, ubicación o detalles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
            />
          </div>

          {/* Filters Pills Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === "all"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setStatusFilter("published")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === "published"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
              }`}
            >
              Publicados
            </button>
            <button
              onClick={() => setStatusFilter("finished")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === "finished"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
              }`}
            >
              Finalizados
            </button>
            <button
              onClick={() => setStatusFilter("cancelled")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === "cancelled"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
              }`}
            >
              Cancelados
            </button>
          </div>
        </Card>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 animate-spin"></div>
            </div>
            <p className="text-slate-500 mt-4 font-semibold text-sm">Cargando eventos...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <Card glass={true} className="text-center py-20 border-dashed border-2 border-slate-200/80 bg-slate-50/30">
            <div className="flex justify-center mb-4 text-slate-300">
              <CalendarDays className="w-16 h-16 stroke-1" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No se encontraron eventos</h3>
            <p className="text-slate-500 text-sm mt-1.5 max-w-md mx-auto">
              Prueba modificando la búsqueda o los filtros seleccionados, o regresa más tarde.
            </p>
          </Card>
        ) : (
          /* Events Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event, idx) => (
              <Card
                key={event.id}
                className="overflow-hidden flex flex-col group card-glow cursor-pointer p-0 relative border border-slate-100 hover:border-indigo-100 animate-slide-up"
                style={{ animationDelay: `${idx * 0.05}s` }}
                onClick={() => navigate(`/eventos/${event.id}`)}
              >
                {/* Visual Banner Header */}
                <div className={`h-28 bg-gradient-to-br ${getCardPattern(event.id)} relative flex items-end p-4`}>
                  <div className="absolute inset-0 bg-black/10 opacity-70 group-hover:opacity-40 transition-opacity duration-300"></div>
                  {/* Status Badge */}
                  <span
                    className={`absolute top-4 right-4 text-xs font-bold px-3 py-1.5 rounded-xl border backdrop-blur-md shadow-sm ${
                      statusColors[event.status as EventStatus]
                    }`}
                  >
                    {statusLabels[event.status as EventStatus]}
                  </span>
                  
                  {/* Miniature decorative icon overlay */}
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white absolute bottom-[-16px] left-5 border border-white/20 shadow-sm transition-transform duration-300 group-hover:scale-110">
                    <CalendarDays className="w-6 h-6" />
                  </div>
                </div>

                {/* Card Content body */}
                <div className="p-6 pt-7 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-slate-800 tracking-tight line-clamp-1 mb-2 group-hover:text-indigo-600 transition-colors">
                    {event.name}
                  </h3>

                  <p className="text-slate-500 text-sm mb-5 leading-relaxed line-clamp-2">
                    {event.description}
                  </p>

                  <div className="space-y-3.5 text-slate-600 text-sm mt-auto mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50/50 flex items-center justify-center text-indigo-500">
                        <Clock className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-xs text-slate-700">
                        {new Date(event.startDate).toLocaleDateString(undefined, {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50/50 flex items-center justify-center text-indigo-500">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-xs text-slate-600 truncate max-w-[200px]">
                        {event.location}
                      </span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-slate-100 pt-4 mt-auto flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Capacidad</span>
                      <span className="text-xs font-extrabold text-slate-700">{event.maxCapacity} Asistentes</span>
                    </div>

                    {event.hasParking && (
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-md border border-emerald-100">
                        ✓ Parking
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom button with overlay fill transition */}
                <div className="px-6 pb-6 pt-0">
                  <Button
                    variant="secondary"
                    className="w-full py-2.5 font-bold text-xs bg-slate-50 border-slate-100 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 shadow-none transition-all duration-300"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/eventos/${event.id}`);
                    }}
                  >
                    Ver detalles
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
