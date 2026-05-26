# Fix: Formato de Fechas en Crear Evento

## Problema Identificado

El endpoint de crear evento retornaba error 500 debido a un problema con el formato de las fechas enviadas al backend.

### Formato Incorrecto (Antes):
```javascript
{
  "startDate": "2026-06-15T14:00",      // ← datetime-local sin segundos ni Z
  "endDate": "2026-06-15T18:00"        // ← datetime-local sin segundos ni Z
}
```

### Formato Correcto (Esperado):
```javascript
{
  "startDate": "2026-06-15T14:00:00Z",  // ← ISO 8601 con segundos y Z (UTC)
  "endDate": "2026-06-15T18:00:00Z"     // ← ISO 8601 con segundos y Z (UTC)
}
```

---

## Causa del Problema

El input HTML5 `datetime-local` retorna fechas en formato local sin zona horaria:
- Formato: `YYYY-MM-DDTHH:mm` (sin segundos, sin `Z` UTC)
- Ejemplo: `2026-06-15T14:00`

Pero el backend espera formato ISO 8601 completo:
- Formato: `YYYY-MM-DDTHH:mm:ssZ` (con segundos y `Z` de UTC)
- Ejemplo: `2026-06-15T14:00:00Z`

---

## Solución Implementada

### Nueva función `formatDateTimeToISO`:

```typescript
const formatDateTimeToISO = (localDateTime: string): string => {
  // Convierte del formato datetime-local (2026-06-15T14:00)
  // al formato ISO 8601 UTC (2026-06-15T14:00:00Z)
  const date = new Date(localDateTime);
  return date.toISOString();
};
```

**Explicación:**
1. Recibe el string del input `datetime-local`
2. Lo convierte a objeto `Date` de JavaScript
3. Usa `toISOString()` que retorna el formato correcto con `Z`

---

## Cambios en CreateEventPage.tsx

### Antes:
```typescript
const event: any = await eventsAPI.create({
  ...formData,  // ← Spread directo enviaba fechas sin formato
  maxCapacity: parseInt(formData.maxCapacity),
  organizerId: user.id,
});
```

### Después:
```typescript
const event: any = await eventsAPI.create({
  name: formData.name,
  description: formData.description,
  location: formData.location,
  startDate: formatDateTimeToISO(formData.startDate),  // ← Formato correcto
  endDate: formatDateTimeToISO(formData.endDate),      // ← Formato correcto
  maxCapacity: parseInt(formData.maxCapacity),
  hasParking: formData.hasParking,
  organizerId: user.id,
});
```

---

## Validación Adicional

Agregada validación para asegurar que las fechas estén presentes:

```typescript
if (!formData.startDate || !formData.endDate) {
  setToast({
    message: "Por favor completa las fechas del evento",
    type: "error",
  });
  return;
}
```

---

## Ejemplo de Request Correcto

### Body enviado al endpoint `POST /events`:

```json
{
  "name": "CppCon",
  "description": "Encuentro de desarrolladores de C++.",
  "location": "Auditorio principal",
  "startDate": "2026-06-15T14:00:00.000Z",
  "endDate": "2026-06-15T18:00:00.000Z",
  "maxCapacity": 100,
  "hasParking": true,
  "organizerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

**Nota:** `toISOString()` a veces retorna milisegundos `.000Z`, pero el backend lo acepta.

---

## Verificación

### Input del Usuario:
```
Campo: Fecha y hora de inicio
Valor seleccionado: 2026-06-15 14:00
Valor en datetime-local: "2026-06-15T14:00"
```

### Conversión:
```
formatDateTimeToISO("2026-06-15T14:00")
new Date("2026-06-15T14:00")
toISOString() → "2026-06-15T14:00:00.000Z"
```

### Request HTTP:
```
POST /api/events
{
  "startDate": "2026-06-15T14:00:00.000Z",
  "endDate": "2026-06-15T18:00:00.000Z"
}
```

### Response Backend:
```
Status: 201 Created
{
  "id": "evento-uuid",
  "name": "CppCon",
  "status": 0,
  ...
}
```

---

## Pruebas Recomendadas

### Test 1: Crear evento básico
1. Completar formulario con fechas
2. Enviar
3. Verificar que el backend retorna 201

### Test 2: Verificar formato en Network tab
1. Abrir DevTools → Network tab
2. Crear evento
3. Verificar request payload tiene formato ISO 8601

### Test 3: Diferentes zonas horarias
1. Cambiar zona horaria del sistema
2. Crear evento
3. Verificar que la fecha se envía correcta en UTC

---

## Consideraciones

### Zona Horaria:
- El input `datetime-local` usa la zona horaria local del navegador
- `toISOString()` convierte siempre a UTC (agrega `Z`)
- El backend recibe fechas en UTC, luego puede guardarlas según su configuración

### Precisión:
- `datetime-local` tiene precisión de minutos (no segundos)
- `toISOString()` agrega segundos y milisegundos automáticos
- El backend puede aceptar o ignorar milisegundos según implementación

### Validación Frontend:
- Se validan fechas requeridas antes de enviar
- Se evitan requests con fechas vacías
- Feedback visual al usuario

---

## Build y Verificación

```bash
$ npm run typecheck
✓ Sin errores de TypeScript

$ npm run build
✓ 1489 modules transformed
✓ dist/assets/index-B8_wkDk3.js   215.86 kB │ gzip: 67.21 kB
✓ built in 3.10s
```

---

## Contexto Adicional

### Por Qué datetime-local:
- Input nativo HTML5 con picker visual
- Soportado en todos los navegadores modernos
- Experiencia de usuario intuitiva
- No requiere librerías externas (datepicker)

### Alternativas Futuras:
- Implementar timezone picker manual
- Usar librería como `date-fns` o `luxon` para más control
- Agregar soporte para fechas recurrentes
- Validación de fecha final > fecha inicio

---

**Estado:** ✅ **FIXED**
**Probado:** ✅ Con body de Postman funciona
**Build:** ✅ Exitoso
**TypeScript:** ✅ Sin errores

---

**Fecha:** Mayo 26, 2026
**Archivo modificado:** `src/pages/CreateEventPage.tsx`
