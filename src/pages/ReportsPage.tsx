import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { eventsAPI, checkInAPI, notificationsAPI } from "../lib/api";
import { Event, EventStatus, AttendanceReport } from "../types";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Toast } from "../components/ui/Toast";
import { ChevronLeft, Mail, Users, CheckCircle2, Search, Sparkles, CalendarDays, Percent, ArrowRight } from "lucide-react";

export function ReportsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [report, setReport] = useState<AttendanceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [sendingNotifications, setSendingNotifications] = useState(false);
  const [attendeeSearch, setAttendeeSearch] = useState("");
  const [attendeeFilter, setAttendeeFilter] = useState<"all" | "present" | "absent">("all");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(
    null
  );
  const navigate = useNavigate();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await eventsAPI.list();
      const publishedEvents = (data || []).filter(
        (e) => e.status === EventStatus.Published
      );
      setEvents(publishedEvents);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al cargar eventos";
      setToast({ message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const loadReport = async (eventId: string) => {
    try {
      setReportLoading(true);
      const data = await checkInAPI.getReport(eventId);
      setReport(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al cargar reporte";
      setToast({ message, type: "error" });
    } finally {
      setReportLoading(false);
    }
  };

  const handleSelectEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    loadReport(eventId);
  };

  const handleSendReminders = async () => {
    if (!selectedEventId) return;

    try {
      setSendingNotifications(true);
      await notificationsAPI.sendReminders(selectedEventId);
      setToast({
        message: "¡Recordatorios enviados exitosamente por correo electrónico!",
        type: "success",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al enviar recordatorios";
      setToast({ message, type: "error" });
    } finally {
      setSendingNotifications(false);
    }
  };

  // Generate initials for avatar inside table rows
  const getAvatarInitials = (fullName: string) => {
    const parts = fullName.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  // Deterministic soft color for table avatars based on full name hash
  const getAvatarBg = (name: string) => {
    const colors = [
      "bg-indigo-50 text-indigo-600 border-indigo-100",
      "bg-emerald-50 text-emerald-600 border-emerald-100",
      "bg-rose-50 text-rose-600 border-rose-100",
      "bg-amber-50 text-amber-600 border-amber-100",
      "bg-purple-50 text-purple-600 border-purple-100",
      "bg-sky-50 text-sky-600 border-sky-100",
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }
    return colors[sum % colors.length];
  };

  // Filter attendees list based on internal table search bar and status tab pills
  const getFilteredAttendees = () => {
    if (!report) return [];
    return report.attendees.filter((attendee) => {
      const matchesSearch =
        attendee.fullName.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
        attendee.email.toLowerCase().includes(attendeeSearch.toLowerCase());

      const matchesStatus =
        attendeeFilter === "all" ||
        (attendeeFilter === "present" && attendee.checkedIn) ||
        (attendeeFilter === "absent" && !attendee.checkedIn);

      return matchesSearch && matchesStatus;
    });
  };

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

      {/* Glass navigation header bar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 font-semibold text-sm transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
            Volver al Panel Principal
          </button>
        </div>
      </nav>

      {/* Dashboard container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
        <div className="mb-8 flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
              Estadísticas & Asistencias
              <Sparkles className="w-5.5 h-5.5 text-indigo-500" />
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-0.5">Monitorea el porcentaje de asistencia, aforo y registros del evento.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 animate-spin"></div>
            </div>
            <p className="text-slate-500 mt-4 font-semibold text-sm">Cargando reporte corporativo...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar list selection card */}
            <div className="lg:col-span-1">
              <Card className="p-5 border-glass bg-white/95">
                <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-widest mb-4">
                  Seleccionar Evento
                </h3>
                {events.length === 0 ? (
                  <p className="text-slate-500 text-xs font-semibold py-4 text-center">No hay eventos publicados disponibles.</p>
                ) : (
                  <div className="space-y-2.5">
                    {events.map((event) => (
                      <button
                        key={event.id}
                        onClick={() => handleSelectEvent(event.id)}
                        className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-300 flex flex-col relative overflow-hidden group ${
                          selectedEventId === event.id
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-glow"
                            : "bg-slate-50/50 hover:bg-slate-50 border-slate-100 text-slate-700 hover:border-slate-200"
                        }`}
                      >
                        {/* Selected vertical glow indicator dot */}
                        {selectedEventId === event.id && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-white"></div>
                        )}
                        <p className="font-bold text-sm leading-tight truncate w-full group-hover:translate-x-0.5 transition-transform duration-200">{event.name}</p>
                        
                        <div className="flex items-center gap-1.5 mt-2.5 opacity-85 text-[10px] font-semibold">
                          <CalendarDays className="w-3 h-3 flex-shrink-0" />
                          <span>
                            {new Date(event.startDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Reports dashboards panel */}
            <div className="lg:col-span-3 space-y-8">
              {reportLoading ? (
                <Card className="p-12 text-center flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-100 border-t-indigo-600 mb-4"></div>
                  <p className="text-slate-500 font-semibold text-sm">Procesando registros de check-in...</p>
                </Card>
              ) : report ? (
                <div className="space-y-8 animate-scale-up">
                  {/* Grid metrics KPI */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* KPI 1 */}
                    <Card className="p-6 relative overflow-hidden bg-gradient-to-br from-white to-indigo-50/10">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm border border-indigo-100/30">
                          <Users className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Inscritos Totales</p>
                          <p className="text-3xl font-black text-slate-900 mt-1">
                            {report.totalRegistered}
                          </p>
                        </div>
                      </div>
                    </Card>

                    {/* KPI 2 */}
                    <Card className="p-6 relative overflow-hidden bg-gradient-to-br from-white to-emerald-50/10">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 shadow-sm border border-emerald-100/30">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Asistieron</p>
                          <p className="text-3xl font-black text-slate-900 mt-1">
                            {report.totalCheckedIn}
                          </p>
                        </div>
                      </div>
                    </Card>

                    {/* KPI 3 */}
                    <Card className="p-6 relative overflow-hidden bg-gradient-to-br from-white to-purple-50/10">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm border border-purple-100/30">
                          <Percent className="w-5.5 h-5.5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Porcentaje de Aforos</p>
                          <p className="text-3xl font-black text-slate-900 mt-1">
                            {report.attendancePercentage.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      
                      {/* Attendance track visual indicator bar */}
                      <div className="w-full h-1.5 bg-slate-100 rounded-full mt-4 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                          style={{ width: `${report.attendancePercentage}%` }}
                        ></div>
                      </div>
                    </Card>
                  </div>

                  {/* Operational Utilities Card */}
                  <Card className="p-6 border-glass shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/90">
                    <div className="text-center sm:text-left">
                      <h4 className="text-sm font-bold text-slate-800">Recordatorios de Asistencia</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Envía correos electrónicos a los registrados pendientes con el pase de entrada QR.</p>
                    </div>
                    
                    <Button
                      variant="primary"
                      className="w-full sm:w-auto px-6 py-3 font-semibold text-xs flex items-center justify-center gap-2 shadow-glow"
                      onClick={handleSendReminders}
                      isLoading={sendingNotifications}
                    >
                      <Mail className="w-4 h-4" />
                      Enviar Recordatorios por Email
                    </Button>
                  </Card>

                  {/* Attendance detail table list Card */}
                  <Card className="p-6 sm:p-8 border-glass shadow-premium bg-white/95">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                          Listado de Participantes
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">Visualiza el historial detallado de aforo e ingresos en tiempo real.</p>
                      </div>

                      {/* Internal Attendance Status Tabs Filters */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setAttendeeFilter("all")}
                          className={`px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-extrabold transition-all ${
                            attendeeFilter === "all"
                              ? "bg-slate-800 text-white"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200/65"
                          }`}
                        >
                          Todos
                        </button>
                        <button
                          onClick={() => setAttendeeFilter("present")}
                          className={`px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-extrabold transition-all ${
                            attendeeFilter === "present"
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200/65"
                          }`}
                        >
                          Presentes
                        </button>
                        <button
                          onClick={() => setAttendeeFilter("absent")}
                          className={`px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-extrabold transition-all ${
                            attendeeFilter === "absent"
                              ? "bg-rose-600 text-white"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200/65"
                          }`}
                        >
                          Ausentes
                        </button>
                      </div>
                    </div>

                    {/* Table search bar */}
                    <div className="relative mb-6">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Buscar participante por nombre o email..."
                        value={attendeeSearch}
                        onChange={(e) => setAttendeeSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
                      />
                    </div>

                    {/* Attende table markup */}
                    <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] uppercase font-extrabold tracking-wider text-slate-400">
                            <th className="py-4 px-5">Asistente</th>
                            <th className="py-4 px-5">Correo Electrónico</th>
                            <th className="py-4 px-5 text-center">Estado</th>
                            <th className="py-4 px-5 text-right">Hora Check-in</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {getFilteredAttendees().length === 0 ? (
                            <tr>
                              <td colSpan={4} className="py-8 text-center text-xs text-slate-400 font-medium">
                                No se encontraron registros de asistentes que coincidan.
                              </td>
                            </tr>
                          ) : (
                            getFilteredAttendees().map((attendee, idx) => (
                              <tr
                                key={idx}
                                className="group hover:bg-slate-50/50 transition-colors"
                              >
                                {/* Name column with visual circular avatar */}
                                <td className="py-4.5 px-5 flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs ${getAvatarBg(attendee.fullName)} flex-shrink-0`}>
                                    {getAvatarInitials(attendee.fullName)}
                                  </div>
                                  <span className="font-bold text-xs text-slate-800 group-hover:text-indigo-600 transition-colors">
                                    {attendee.fullName}
                                  </span>
                                </td>
                                
                                <td className="py-4.5 px-5 text-slate-500 text-xs font-medium">
                                  {attendee.email}
                                </td>

                                <td className="py-4.5 px-5 text-center">
                                  <span
                                    className={`inline-flex items-center text-[10px] font-extrabold px-2.5 py-1 rounded-lg border ${
                                      attendee.checkedIn
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                        : "bg-rose-50 text-rose-700 border-rose-100"
                                    }`}
                                  >
                                    {attendee.checkedIn ? "Asistió" : "No asistió"}
                                  </span>
                                </td>

                                <td className="py-4.5 px-5 text-right font-mono text-xs font-bold text-slate-500">
                                  {attendee.checkedInAt
                                    ? new Date(attendee.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                    : "—"}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              ) : (
                /* Select Placeholder state */
                <Card glass={true} className="text-center py-24 border-dashed border-2 border-slate-200 bg-slate-50/20">
                  <div className="flex justify-center mb-4 text-slate-300">
                    <CalendarDays className="w-16 h-16 stroke-1" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Panel Administrativo</h3>
                  <p className="text-slate-500 text-sm mt-1.5 max-w-sm mx-auto leading-relaxed">
                    Selecciona uno de los eventos publicados en el listado de la izquierda para desplegar sus métricas de asistencia y aforo.
                  </p>
                  
                  {events.length > 0 && (
                    <div className="mt-6 flex justify-center items-center gap-1.5 text-xs text-indigo-500 font-extrabold animate-pulse">
                      <span>Seleccionar un evento para empezar</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
