# Arquitectura de EventManager Frontend

## Descripción General

Aplicación React profesional para gestión de eventos integrada con la API EventManager. Soporta dos roles principales: **User** (organizadores/participantes) y **Admin** (administradores con acceso a reportes).

## Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── ui/             # Componentes básicos (Button, Input, Card, Toast)
│   └── ProtectedRoute.tsx  # Protección de rutas autenticadas
├── contexts/           # Context API para estado global
│   └── AuthContext.tsx # Manejo de autenticación
├── lib/                # Utilidades
│   └── api.ts         # Cliente API HTTP para comunicación con backend
├── pages/              # Pantallas principales
│   ├── AuthPage.tsx    # Login/Registro
│   ├── EventsPage.tsx  # Listado de eventos
│   ├── EventDetailPage.tsx  # Detalles y registro en evento
│   ├── MyEventsPage.tsx     # Mis eventos con QR
│   ├── CreateEventPage.tsx  # Crear nuevo evento
│   ├── CheckInPage.tsx      # Validar QR (check-in)
│   └── ReportsPage.tsx      # Reportes de asistencia (Admin)
├── types/              # Tipos TypeScript
│   └── index.ts       # Interfaces de datos
├── App.tsx             # Configuración de rutas y providers
└── main.tsx            # Punto de entrada

```

## Flujos Principales

### 1. Autenticación
- **Registro**: Crear cuenta con Email/Contraseña
- **Login**: Iniciar sesión y obtener JWT
- **Persistencia**: Token almacenado en localStorage
- **Estado**: Manejado con Context API

### 2. Flujo de Organizador
1. Registrarse/Loguearse
2. Crear evento (automáticamente se publica)
3. Participantes se registran
4. Monitorear asistencia

### 3. Flujo de Participante
1. Registrarse/Loguearse
2. Explorar eventos disponibles (status = Publicado)
3. Registrarse en evento (obtiene QR)
4. Descargar/guardar QR
5. Al llegar: mostrar QR para check-in

### 4. Check-in (Operador)
1. Acceder a pantalla de check-in
2. Escanear código QR o ingreso manual
3. Sistema valida y registra asistencia
4. Visual feedback (éxito/error/ya usado)

### 5. Reportes (Admin)
1. Ver lista de eventos publicados
2. Seleccionar evento
3. Visualizar:
   - Totales (inscritos, asistieron, porcentaje)
   - Tabla detallada de asistencia
4. Acciones:
   - Enviar recordatorios por email
   - Exportar datos

## Interfaces de Datos

### User (Autenticado)
```typescript
{
  id: UUID
  firstName: string
  lastName: string
  email: string
  role: "User" | "Admin"
}
```

### Event
```typescript
{
  id: UUID
  name: string
  description: string
  location: string
  startDate: ISO8601
  endDate: ISO8601
  maxCapacity: number
  hasParking: boolean
  status: 0 (Draft) | 1 (Published) | 2 (Cancelled) | 3 (Finished)
  organizerId: UUID
  organizerName: string
  createdAt: ISO8601
  updatedAt: ISO8601
}
```

### Registration
```typescript
{
  eventId: UUID
  eventName: string
  userId: UUID
  registeredAt: ISO8601
  checkInToken: UUID  // QR Token
}
```

## Componentes UI

### Button
- Variantes: primary (azul), secondary (gris), danger (rojo)
- Tamaños: sm, md, lg
- Estados: loading, disabled

### Input
- Label opcional
- Validación visual de errores
- Autocomplete controlable

### Card
- Contenedor con shadow y padding
- Fondo blanco con bordes redondeados

### Toast
- Notificaciones flotantes
- Tipos: success (verde), error (rojo), info (azul)
- Auto-cierre después de 4s

## Rutas

| Ruta | Rol | Descripción |
|------|-----|-------------|
| `/login` | Público | Autenticación |
| `/` | User | Listado de eventos |
| `/eventos/:id` | User | Detalle y registro |
| `/mis-eventos` | User | Mis registros con QR |
| `/crear-evento` | User | Crear nuevo evento |
| `/check-in` | User | Validar QR |
| `/reportes` | Admin | Dashboard de asistencia |

## API Integration

Cliente HTTP centralizado en `src/lib/api.ts` con métodos:

### Auth
- `register(firstName, lastName, email, password)`
- `login(email, password)`

### Events
- `list()` - Eventos disponibles
- `getById(id)` - Detalles
- `create(data)` - Crear evento
- `update(id, data)` - Actualizar
- `updateStatus(id, status)` - Cambiar estado
- `delete(id)` - Eliminar

### Registrations
- `create(eventId, userId)` - Inscribirse
- `getUserRegistrations(userId)` - Mis eventos

### Check-in
- `validate(token, eventId)` - Validar QR
- `getReport(eventId)` - Reporte de asistencia

### Notifications
- `sendReminders(eventId)` - Enviar recordatorios
- `sendCheckInConfirmation(eventId, userId)` - Confirmación

## Manejo de Errores

### Toast Notifications
- Errores de API mostrados al usuario
- Confirmaciones de acciones exitosas
- Auto-cierre después de tiempo

### Validación
- Input validation en cliente
- Manejo de errores HTTP (401, 403, 404, 409)
- Mensajes en español para mejor UX

## Estado Global

### AuthContext
- `user`: Usuario autenticado o null
- `token`: JWT token
- `loading`: Estado de carga
- `error`: Mensajes de error
- Métodos: `register()`, `login()`, `logout()`

## Estilos

- **Tailwind CSS** para utilidades
- Paleta de colores:
  - Primario: Azul (blue-600)
  - Neutral: Gris (gray-*)
  - Success: Verde (green-*)
  - Danger: Rojo (red-*)
  - Warning: Amarillo (yellow-*)

## Optimizaciones

- Lazy loading de rutas
- Caching de eventos con estado local
- Headers CORS configurados
- Manejo eficiente de JWT
- Re-renders minimizados con Context

## Próximas Mejoras Potenciales

- Búsqueda y filtros de eventos
- Paginación en listados
- Exportar reportes a CSV/PDF
- Notificaciones en tiempo real
- Galería de fotos en eventos
- Comentarios/reviews de eventos
- Integración con calendario
- Dark mode
