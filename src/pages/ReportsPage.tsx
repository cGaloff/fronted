import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { eventsAPI, checkInAPI, notificationsAPI } from "../lib/api";
import { Event, EventStatus, AttendanceReport } from "../types";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Toast } from "../components/ui/Toast";
import { ArrowLeft, Mail, Users, CheckCircle } from "lucide-react";

export function ReportsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [report, setReport] = useState<AttendanceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [sendingNotifications, setSendingNotifications] = useState(false);
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
        message: "Recordatorios enviados exitosamente",
        type: "success",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al enviar recordatorios";
      setToast({ message, type: "error" });
    } finally {
      setSendingNotifications(false);
    }
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reportes de asistencia</h1>
        <p className="text-gray-600 mb-8">
          Panel de control para administradores
        </p>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Cargando eventos...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Selector de eventos */}
            <Card>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Eventos</h3>
              {events.length === 0 ? (
                <p className="text-gray-600 text-sm">No hay eventos disponibles</p>
              ) : (
                <div className="space-y-2">
                  {events.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => handleSelectEvent(event.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                        selectedEventId === event.id
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                      }`}
                    >
                      <p className="font-medium text-sm truncate">{event.name}</p>
                      <p className="text-xs opacity-70">
                        {new Date(event.startDate).toLocaleDateString()}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* Reporte */}
            <div className="lg:col-span-3 space-y-6">
              {reportLoading ? (
                <Card>
                  <p className="text-gray-600">Cargando reporte...</p>
                </Card>
              ) : report ? (
                <>
                  {/* Resumen */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
                          <Users className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Inscritos</p>
                          <p className="text-3xl font-bold text-gray-900">
                            {report.totalRegistered}
                          </p>
                        </div>
                      </div>
                    </Card>

                    <Card>
                      <div className="flex items-center gap-4">
                        <div className="bg-green-100 text-green-600 p-3 rounded-lg">
                          <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Asistieron</p>
                          <p className="text-3xl font-bold text-gray-900">
                            {report.totalCheckedIn}
                          </p>
                        </div>
                      </div>
                    </Card>

                    <Card>
                      <div className="flex items-center gap-4">
                        <div className="bg-purple-100 text-purple-600 p-3 rounded-lg">
                          <span className="text-2xl font-bold">%</span>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Asistencia</p>
                          <p className="text-3xl font-bold text-gray-900">
                            {report.attendancePercentage.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Notificaciones */}
                  <Card>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Acciones
                    </h3>
                    <Button
                      variant="primary"
                      className="w-full flex items-center justify-center gap-2"
                      onClick={handleSendReminders}
                      isLoading={sendingNotifications}
                    >
                      <Mail className="w-5 h-5" />
                      Enviar recordatorios
                    </Button>
                  </Card>

                  {/* Tabla de asistencia */}
                  <Card>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Detalles de asistencia
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-semibold text-gray-900">
                              Nombre
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-900">
                              Email
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-900">
                              Estado
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-900">
                              Hora check-in
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {report.attendees.map((attendee, idx) => (
                            <tr
                              key={idx}
                              className="border-b border-gray-200 hover:bg-gray-50"
                            >
                              <td className="py-3 px-4 text-gray-900">
                                {attendee.fullName}
                              </td>
                              <td className="py-3 px-4 text-gray-600 text-sm">
                                {attendee.email}
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                    attendee.checkedIn
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {attendee.checkedIn
                                    ? "Asistió"
                                    : "No asistió"}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-gray-600 text-sm">
                                {attendee.checkedInAt
                                  ? new Date(
                                      attendee.checkedInAt
                                    ).toLocaleTimeString()
                                  : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </>
              ) : (
                <Card>
                  <p className="text-gray-600 text-center py-12">
                    Selecciona un evento para ver el reporte
                  </p>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
