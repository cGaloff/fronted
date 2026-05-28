import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { eventsAPI } from "../lib/api";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import { Toast } from "../components/ui/Toast";
import { ChevronLeft, CalendarPlus, Info, CalendarDays, Users, ParkingSquare, Sparkles } from "lucide-react";

export function CreateEventPage() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    startDate: "",
    endDate: "",
    maxCapacity: "100",
    hasParking: false,
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(
    null
  );
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, type } = e.target;
    const value =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const formatDateTimeToISO = (localDateTime: string): string => {
    const date = new Date(localDateTime);
    const isoString = date.toISOString();
    return isoString.replace('.000Z', 'Z');
  };

  const isDateInvalid = formData.startDate && formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.startDate || !formData.endDate) {
      setToast({
        message: "Por favor completa las fechas del evento",
        type: "error",
      });
      return;
    }

    if (isDateInvalid) {
      setToast({
        message: "La fecha de finalización debe ser posterior a la de inicio",
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);
      const event: any = await eventsAPI.create({
        name: formData.name,
        description: formData.description,
        location: formData.location,
        startDate: formatDateTimeToISO(formData.startDate),
        endDate: formatDateTimeToISO(formData.endDate),
        maxCapacity: parseInt(formData.maxCapacity),
        hasParking: formData.hasParking,
        organizerId: user.id,
      });

      // Publicar evento automáticamente
      await eventsAPI.updateStatus(event.id, 1);

      setToast({
        message: "¡Evento creado y publicado exitosamente!",
        type: "success",
      });
      setTimeout(() => navigate("/"), 1200);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al crear evento";
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

      {/* Glass Back Header Bar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 font-semibold text-sm transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
            Cancelar y Volver
          </button>
        </div>
      </nav>

      {/* Form Container */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
        {/* Title Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <CalendarPlus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
              Organizar Evento
              <Sparkles className="w-5 h-5 text-indigo-500" />
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-0.5">Introduce los detalles del nuevo evento corporativo o social.</p>
          </div>
        </div>

        {/* Card Form */}
        <Card className="p-8 sm:p-10 border-glass shadow-2xl bg-white/95">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Section 1: Basic Info */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Info className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider">Información Básica</h3>
              </div>

              <Input
                label="Nombre del evento"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Feria de Emprendedores, Lanzamiento de Producto..."
                required
              />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Descripción
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe de qué tratará tu evento, agenda, conferencistas, etc..."
                  className="w-full px-4 py-3 bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-slate-800 placeholder-slate-400/80 transition-all duration-200 outline-none"
                  rows={4}
                  required
                />
              </div>
            </div>

            {/* Section 2: Dates and Times */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <CalendarDays className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider">Programación</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="Fecha y hora de inicio"
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />

                <Input
                  label="Fecha y hora de finalización"
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              {isDateInvalid && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold p-4 rounded-xl flex items-center gap-2 animate-scale-up">
                  <span>⚠️</span>
                  <span>La fecha de finalización debe ser estrictamente posterior a la fecha de inicio del evento.</span>
                </div>
              )}
            </div>

            {/* Section 3: Logistics & Capacity */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Users className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider">Logística & Aforo</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-end">
                <Input
                  label="Capacidad máxima"
                  type="number"
                  name="maxCapacity"
                  value={formData.maxCapacity}
                  onChange={handleInputChange}
                  min="1"
                  placeholder="100"
                  required
                />

                <Input
                  label="Ubicación"
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Auditorio Principal, Sala VIP, Virtual..."
                  required
                />
              </div>

              {/* Toggle Switch instead of Checkbox */}
              <div className="flex items-center justify-between p-4.5 bg-slate-50 rounded-2xl border border-slate-100 mt-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                    <ParkingSquare className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <label htmlFor="hasParking" className="text-sm font-bold text-slate-800 cursor-pointer">
                      Estacionamiento disponible
                    </label>
                    <p className="text-xs text-slate-400 font-medium">Habilitar si el recinto cuenta con parqueaderos para los invitados.</p>
                  </div>
                </div>
                
                {/* Switch switch element */}
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    id="hasParking"
                    name="hasParking"
                    checked={formData.hasParking}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>

            {/* Actions Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-100">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="flex-1 py-4 shadow-glow font-bold text-sm"
                isLoading={loading}
              >
                Crear y Publicar Evento
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="py-4 font-bold border-slate-200 hover:bg-slate-50 text-sm"
                onClick={() => navigate("/")}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
