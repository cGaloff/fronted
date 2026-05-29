import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { checkInAPI } from "../lib/api";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import { Toast } from "../components/ui/Toast";
import { CheckCircle2, AlertTriangle, QrCode, Monitor, Sparkles, ChevronLeft, UserCheck, Camera, CameraOff } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";

export function CheckInPage() {
  const [searchParams] = useSearchParams();
  const queryToken = searchParams.get("token") || "";
  const queryEventId = searchParams.get("eventId") || "";

  const [token, setToken] = useState(queryToken);
  const [eventId, setEventId] = useState(queryEventId);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(
    null
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showScanner, setShowScanner] = useState(searchParams.get("scan") === "true");

  // Cámara Escáner QR en vivo
  useEffect(() => {
    let scanner: any = null;
    if (showScanner) {
      scanner = new Html5QrcodeScanner(
        "reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true
        },
        false
      );

      const onScanSuccess = async (decodedText: string) => {
        try {
          const url = new URL(decodedText);
          const tokenParam = url.searchParams.get("token");
          const eventIdParam = url.searchParams.get("eventId");

          if (tokenParam && eventIdParam) {
            setShowScanner(false);
            setToken(tokenParam);
            setEventId(eventIdParam);

            setLoading(true);
            const data = await checkInAPI.validate({ token: tokenParam, eventId: eventIdParam });
            setResult(data);
            setToken("");
            setEventId("");
          } else {
            setToast({ message: "El código QR decodificado no pertenece al sistema de accesos.", type: "error" });
          }
        } catch {
          if (decodedText.length > 20) {
            setToken(decodedText);
            setShowScanner(false);
            setToast({ message: "Se detectó token manual. Por favor ingresa el ID del evento.", type: "info" });
          } else {
            setToast({ message: "Formato de código QR no reconocido.", type: "error" });
          }
        }
      };

      const onScanFailure = () => {
        // Silencioso
      };

      scanner.render(onScanSuccess, onScanFailure);
    }

    return () => {
      if (scanner) {
        scanner.clear().catch((err: any) => console.error("Error al detener el escáner", err));
      }
    };
  }, [showScanner]);

  // Validación automática si se proveen ambos parámetros de consulta
  useEffect(() => {
    if (queryToken && queryEventId) {
      const autoValidate = async () => {
        try {
          setLoading(true);
          const data = await checkInAPI.validate({ token: queryToken, eventId: queryEventId });
          setResult(data);
          setToken("");
          setEventId("");
        } catch (error) {
          const message = error instanceof Error ? error.message : "Error en validación automática";
          setToast({ message, type: "error" });
        } finally {
          setLoading(false);
        }
      };
      autoValidate();
    }
  }, [queryToken, queryEventId]);

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !eventId) {
      setToast({
        message: "Por favor, completa todos los campos para validar.",
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

      {/* Navigation Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 font-semibold text-sm transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
            Volver al Panel
          </button>
          
          <div className="flex items-center gap-2">
            <Monitor className="w-4.5 h-4.5 text-indigo-500" />
            <span className="font-extrabold text-slate-800 text-sm">Escáner de Asistencia</span>
          </div>
        </div>
      </nav>

      {/* Content wrapper */}
      <div className="max-w-xl mx-auto px-4 py-10 animate-fade-in">
        
        {/* Tech Scanner Header Card */}
        <Card className="text-center p-8 mb-8 border-glass shadow-premium relative overflow-hidden bg-white/90">
          {/* Laser scanning laser line effect */}
          <div className="absolute left-0 right-0 h-[2px] bg-indigo-500/40 shadow-[0_0_10px_#6366f1] animate-scanner"></div>

          <div className="flex justify-center mb-5">
            <div className="relative w-18 h-18 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-glow border border-white/20">
              <QrCode className="w-9 h-9" />
              {/* Outer pulsing ring */}
              <div className="absolute -inset-1.5 rounded-3xl border-2 border-indigo-500/20 animate-ping" style={{ animationDuration: '3s' }}></div>
            </div>
          </div>
          
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center gap-1.5">
            Terminal de Registro
            <Sparkles className="w-5.5 h-5.5 text-indigo-500" />
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            Ingresa manualmente los tokens de las credenciales de los asistentes o escanea sus códigos QR.
          </p>
          <div className="mt-5.5 pt-4.5 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
            <UserCheck className="w-4 h-4 text-indigo-500" />
            <span>Operador actual: <strong className="text-slate-600 font-semibold">{user?.email}</strong></span>
          </div>
        </Card>

        {/* Input Validation Form */}
        {!result && (
          <Card className="mb-8 p-8 border-glass shadow-2xl bg-white/95">
            {/* Cámara Escáner de Código QR */}
            <div className="mb-6 pb-6 border-b border-slate-100">
              <Button
                type="button"
                variant={showScanner ? "danger" : "primary"}
                onClick={() => setShowScanner(!showScanner)}
                className="w-full py-3.5 font-bold flex items-center justify-center gap-2"
              >
                {showScanner ? (
                  <>
                    <CameraOff className="w-4.5 h-4.5" />
                    Cerrar Cámara Escáner
                  </>
                ) : (
                  <>
                    <Camera className="w-4.5 h-4.5" />
                    Abrir Cámara Escáner
                  </>
                )}
              </Button>

              {showScanner && (
                <div className="mt-5 rounded-2xl overflow-hidden shadow-inner border border-slate-200/50 bg-slate-950 p-3.5 animate-scale-up relative">
                  <div id="reader" className="w-full overflow-hidden rounded-xl"></div>
                  {/* Láser de barrido decorativo */}
                  <div className="absolute left-0 right-0 h-[2.5px] bg-emerald-500/50 shadow-[0_0_8px_#10b981] animate-scanner pointer-events-none"></div>
                </div>
              )}
            </div>

            <form onSubmit={handleValidate} className="space-y-6">
              <Input
                label="Token QR del Participante"
                type="text"
                ref={inputRef}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Pega o escanea el token del boleto"
                autoComplete="off"
                required
              />

              <Input
                label="ID único del Evento"
                type="text"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                placeholder="Ingresa el ID del evento de validación"
                autoComplete="off"
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full py-4 shadow-glow font-bold text-sm"
                isLoading={loading}
              >
                Validar e Ingresar
              </Button>
            </form>
          </Card>
        )}

        {/* High-Fidelity Validation Result Widget */}
        {result && (
          <Card
            className={`border-2 p-8 shadow-2xl bg-white/95 animate-scale-up ${
              result.success
                ? "border-emerald-500/20 shadow-glow-success"
                : "border-amber-500/20 shadow-glow-warning"
            }`}
          >
            <div className="text-center">
              {/* Animated ring & icon */}
              <div className="flex justify-center mb-6">
                {result.success ? (
                  <div className="relative w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100">
                    <CheckCircle2 className="w-11 h-11" />
                    <div className="absolute -inset-2 rounded-full border-4 border-emerald-500/10 animate-ping" style={{ animationDuration: '2s' }}></div>
                  </div>
                ) : (
                  <div className="relative w-20 h-20 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center border border-amber-100">
                    <AlertTriangle className="w-11 h-11" />
                    <div className="absolute -inset-2 rounded-full border-4 border-amber-500/10 animate-ping" style={{ animationDuration: '2s' }}></div>
                  </div>
                )}
              </div>

              {/* Title Result */}
              <h3
                className={`text-2xl font-extrabold tracking-tight mb-2 ${
                  result.success ? "text-emerald-900" : "text-amber-900"
                }`}
              >
                {result.success ? "Check-in Autorizado" : "Validación Denegada"}
              </h3>

              {/* Msg */}
              <p
                className={`text-sm font-medium leading-relaxed mb-6 px-4 ${
                  result.success ? "text-emerald-800" : "text-amber-800"
                }`}
              >
                {result.message}
              </p>

              {/* Detailed Grid card (only if participant details are returned) */}
              {result.userFullName && (
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-7 space-y-3.5 text-left text-sm animate-fade-in">
                  <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/50">
                    <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">Participante</span>
                    <span className="font-bold text-slate-800">{result.userFullName}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/50">
                    <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">Nombre del Evento</span>
                    <span className="font-bold text-slate-800 truncate max-w-[200px]">{result.eventName}</span>
                  </div>

                  {result.checkedInAt && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">Registro de Entrada</span>
                      <span className="font-mono text-xs font-bold text-slate-600">
                        {new Date(result.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Quick continuous actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="primary"
                  onClick={() => {
                    setResult(null);
                    setShowScanner(true);
                  }}
                  className="flex-1 py-3.5 font-bold text-sm flex items-center justify-center gap-2 shadow-glow bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0"
                >
                  <Camera className="w-4.5 h-4.5" />
                  Escanear con Cámara
                </Button>
                
                <Button
                  variant="secondary"
                  onClick={() => {
                    setResult(null);
                    setShowScanner(false);
                    setTimeout(() => {
                      if (inputRef.current) inputRef.current.focus();
                    }, 100);
                  }}
                  className="flex-1 py-3.5 font-bold text-sm border-slate-200 hover:bg-slate-50 text-slate-700"
                >
                  Registro Manual
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
