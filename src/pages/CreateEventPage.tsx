import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { eventsAPI } from "../lib/api";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import { Toast } from "../components/ui/Toast";
import { ArrowLeft } from "lucide-react";

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
    // Convierte del formato datetime-local (2026-06-15T14:00)
    // al formato ISO 8601 UTC (2026-06-15T14:00:00Z)
    const date = new Date(localDateTime);
    const isoString = date.toISOString();
    // Remover milisegundos: "2026-05-26T10:00:00.000Z" -> "2026-05-26T10:00:00Z"
    return isoString.replace('.000Z', 'Z');
  };

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
        message: "Evento creado y publicado exitosamente",
        type: "success",
      });
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al crear evento";
      setToast({ message, type: "error" });
    } finally {
      setLoading(false);
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
        <Card>
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Crear nuevo evento</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Nombre del evento"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Ej: Feria de emprendimiento"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe tu evento..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                required
              />
            </div>

            <Input
              label="Ubicación"
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Ej: Auditorio principal"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <Input
              label="Capacidad máxima"
              type="number"
              name="maxCapacity"
              value={formData.maxCapacity}
              onChange={handleInputChange}
              min="1"
              required
            />

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="hasParking"
                name="hasParking"
                checked={formData.hasParking}
                onChange={handleInputChange}
                className="w-4 h-4"
              />
              <label
                htmlFor="hasParking"
                className="text-gray-700 font-medium cursor-pointer"
              >
                Estacionamiento disponible
              </label>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="flex-1"
                isLoading={loading}
              >
                Crear evento
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="lg"
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
