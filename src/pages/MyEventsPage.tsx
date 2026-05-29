import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { registrationsAPI } from "../lib/api";
import { RegistrationDetail, EventStatus } from "../types";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Toast } from "../components/ui/Toast";
import QRCode from "qrcode.react";
import { ChevronLeft, Download, Ticket, MapPin, CalendarDays, Sparkles, Inbox } from "lucide-react";

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
    [EventStatus.Draft]: "bg-slate-100 text-slate-700 border-slate-200",
    [EventStatus.Published]: "bg-emerald-50 text-emerald-700 border-emerald-100",
    [EventStatus.Cancelled]: "bg-rose-50 text-rose-700 border-rose-100",
    [EventStatus.Finished]: "bg-indigo-50 text-indigo-700 border-indigo-100",
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 font-semibold text-sm transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
            Volver al Inicio
          </button>
          
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-indigo-500" />
            <span className="font-extrabold text-slate-800 text-sm">Mis Accesos</span>
          </div>
        </div>
      </nav>

      {/* Content wrapper */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center sm:justify-start gap-2">
            Mis Entradas
            <Sparkles className="w-5.5 h-5.5 text-indigo-500 animate-pulse" />
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Aquí están los códigos QR de los eventos en los que estás registrado. Presenta este QR al ingresar.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 animate-spin"></div>
            </div>
            <p className="text-slate-500 mt-4 font-semibold text-sm">Cargando tus accesos...</p>
          </div>
        ) : registrations.length === 0 ? (
          /* High-Fidelity Empty State Card */
          <Card glass={true} className="text-center py-16 border-dashed border-2 border-slate-200 bg-slate-50/20 max-w-xl mx-auto">
            <div className="flex justify-center mb-4 text-slate-300">
              <Inbox className="w-16 h-16 stroke-1 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Aún no estás registrado en ningún evento</h3>
            <p className="text-slate-500 text-sm mt-2 mb-8 max-w-sm mx-auto leading-relaxed">
              Descubre las ferias, conferencias e integraciones disponibles en la página principal e inscríbete para obtener tu pase.
            </p>
            <Button onClick={() => navigate("/")} variant="primary" className="px-8 shadow-glow py-3">
              Explorar eventos disponibles
            </Button>
          </Card>
        ) : (
          /* Tickets container */
          <div className="grid grid-cols-1 gap-8">
            {registrations.map((reg) => (
              <div 
                key={reg.eventId} 
                className="relative bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-premium hover:shadow-premium-hover transition-all duration-300 flex flex-col md:flex-row"
              >
                {/* Visual Circle notches for modern ticket design */}
                <div className="hidden md:block absolute top-[calc(50%-12px)] left-[-12px] w-6 h-6 bg-slate-50 rounded-full border border-slate-200/80 z-10"></div>
                <div className="hidden md:block absolute top-[calc(50%-12px)] right-[-12px] w-6 h-6 bg-slate-50 rounded-full border border-slate-200/80 z-10"></div>

                {/* Ticket Left Side (Primary Detail Stub) */}
                <div className="flex-1 p-8 sm:p-10 flex flex-col justify-between">
                  <div>
                    {/* Header Info */}
                    <div className="flex flex-wrap gap-2 items-center justify-between mb-4">
                      <span className="text-[10px] uppercase font-extrabold text-indigo-600 tracking-widest bg-indigo-50 px-2.5 py-1 rounded-lg">
                        Pase de Acceso
                      </span>
                      <span
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
                          statusColors[reg.status as EventStatus]
                        }`}
                      >
                        {statusLabels[reg.status as EventStatus]}
                      </span>
                    </div>

                    {/* Event Name */}
                    <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-snug mb-3">
                      {reg.eventName}
                    </h3>

                    {/* Quick Metadata list */}
                    <div className="space-y-3.5 mt-5">
                      <div className="flex items-center gap-3 text-slate-600">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                          <CalendarDays className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-slate-700">
                          {new Date(reg.startDate).toLocaleDateString(undefined, {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-slate-600">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-slate-600">
                          {reg.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Registered Timestamp */}
                  <div className="border-t border-slate-100 pt-5 mt-8 text-xs text-slate-400 flex items-center justify-between font-medium">
                    <span>Inscrito el {new Date(reg.registeredAt).toLocaleDateString()}</span>
                    <span>ID: {reg.eventId.substring(0, 8)}</span>
                  </div>
                </div>

                {/* Perforated dashed separator vertical line */}
                <div className="hidden md:flex flex-col items-center justify-center px-2">
                  <div className="h-[90%] border-l-2 border-dashed border-slate-200"></div>
                </div>

                {/* Ticket Right Side (QR and Download) */}
                <div className="bg-slate-50/50 p-8 sm:p-10 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-slate-100 w-full md:w-80 flex-shrink-0">
                  {/* Styled QR Frame */}
                  <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm relative group mb-6 hover:shadow-md transition-shadow">
                    <QRCode
                      value={`${window.location.origin}/check-in?token=${reg.checkInToken}&eventId=${reg.eventId}`}
                      size={140}
                      level="H"
                      includeMargin={false}
                      id={`qr-${reg.eventId}`}
                      className="rounded-lg"
                    />
                    <div className="absolute -inset-0.5 rounded-2xl border-2 border-indigo-500/10 pointer-events-none group-hover:border-indigo-500/30 transition-all duration-300"></div>
                  </div>

                  {/* Download Action */}
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full flex items-center justify-center gap-2 py-3 bg-white font-bold border-slate-200 shadow-sm hover:border-indigo-500 hover:text-indigo-600"
                    onClick={() => {
                      const qrElement = document.getElementById(`qr-${reg.eventId}`);
                      if (qrElement) {
                        const url = (qrElement.querySelector("canvas") as any)?.toDataURL();
                        if (url) {
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `qr-${reg.eventName.replace(/\s+/g, "_").toLowerCase()}.png`;
                          a.click();
                          setToast({ message: "Código QR descargado con éxito.", type: "success" });
                        }
                      }
                    }}
                  >
                    <Download className="w-4 h-4 text-indigo-500" />
                    Descargar Ticket QR
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
