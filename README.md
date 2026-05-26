# EventManager - Plataforma de Gestión de Eventos

Aplicación web profesional para crear, gestionar y registrar asistencia en eventos. Construida con React, TypeScript y Tailwind CSS.

## Características Principales

✓ **Autenticación segura** con JWT  
✓ **Crear y publicar eventos** con detalles completos  
✓ **Registro de participantes** con generación de QR  
✓ **Sistema de check-in** con validación de códigos QR  
✓ **Dashboard de reportes** para administradores  
✓ **Notificaciones por email** a participantes  
✓ **Interfaz responsiva** para todos los dispositivos  

## Instalación

### Requisitos
- Node.js 18+
- npm o yarn

### Pasos

```bash
# 1. Clonar o descargar el proyecto
cd event-manager

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
# Crear archivo .env.local si es necesario
# (Ver API_URL en src/lib/api.ts)

# 4. Iniciar servidor de desarrollo
npm run dev

# 5. Abrir en navegador
# http://localhost:5173
```

## Build Producción

```bash
npm run build
npm run preview
```

## Estructura de Carpetas

```
src/
├── components/       # Componentes reutilizables (Button, Input, Card, Toast)
├── contexts/        # Context API para autenticación global
├── pages/           # Pantallas principales de la aplicación
├── lib/             # Utilidades (cliente API)
├── types/           # Tipos TypeScript
├── index.css        # Estilos globales (Tailwind)
├── App.tsx          # Configuración de rutas
└── main.tsx         # Punto de entrada
```

## Pantallas Disponibles

### Públicas
- **Login/Registro** (`/login`) - Autenticación de usuarios

### Para Usuarios Autenticados
- **Eventos** (`/`) - Listado de eventos disponibles
- **Detalle de Evento** (`/eventos/:id`) - Información completa y registro
- **Mis Eventos** (`/mis-eventos`) - Eventos registrados con QR
- **Crear Evento** (`/crear-evento`) - Formulario para crear evento
- **Check-in** (`/check-in`) - Validación de códigos QR

### Para Administradores
- **Reportes** (`/reportes`) - Dashboard de asistencia y estadísticas

## Roles de Usuario

### User (Predeterminado)
- Ver eventos disponibles
- Crear eventos (se publican automáticamente)
- Registrarse en eventos
- Descargar y usar códigos QR
- Validar check-in de otros participantes

### Admin
- Acceder a dashboard de reportes
- Ver estadísticas de asistencia
- Enviar recordatorios por email
- Ver tabla detallada de participantes

## Tipos de Datos

### Evento
```typescript
{
  id: UUID
  name: string                    // Nombre del evento
  description: string             // Descripción
  location: string                // Ubicación
  startDate: ISO8601             // Fecha/hora inicio
  endDate: ISO8601               // Fecha/hora final
  maxCapacity: number            // Aforo máximo
  hasParking: boolean            // Tiene estacionamiento
  status: 0-3                    // 0:Borrador, 1:Publicado, 2:Cancelado, 3:Finalizado
  organizerId: UUID              // ID del organizador
  organizerName: string          // Nombre del organizador
  createdAt: ISO8601             // Fecha de creación
  updatedAt: ISO8601             // Última actualización
}
```

### Registro
```typescript
{
  eventId: UUID
  eventName: string
  userId: UUID
  registeredAt: ISO8601
  checkInToken: UUID             // Código QR
}
```

## API Conectada

La aplicación se conecta a la API de EventManager:
```
https://gestion-eventos-backend-g5-dae9gcbgggerhgb8.brazilsouth-01.azurewebsites.net/api
```

### Endpoints Utilizados
- `POST /auth/register` - Registro de usuario
- `POST /auth/login` - Login con JWT
- `GET /events` - Listar eventos
- `GET /events/:id` - Detalle de evento
- `POST /events` - Crear evento
- `PATCH /events/:id/status` - Cambiar estado
- `POST /registrations` - Registrarse en evento
- `GET /registrations/user/:id` - Mis eventos
- `POST /checkin/validate` - Validar QR
- `GET /checkin/report/:id` - Reporte de asistencia
- `POST /notifications/reminders/event/:id` - Enviar recordatorios

## Tecnologías

- **Frontend**: React 18 + TypeScript
- **Routing**: React Router v6
- **Estilos**: Tailwind CSS + PostCSS
- **Iconos**: Lucide React
- **QR**: QRCode.React
- **Build**: Vite
- **Empaquetado**: Rollup

## Convenciones de Código

- **Componentes**: PascalCase (Button, EventCard)
- **Variables**: camelCase (userName, eventList)
- **Archivos**: 
  - Componentes: PascalCase (Button.tsx)
  - Páginas: PascalCase (EventsPage.tsx)
  - Utilidades: camelCase (api.ts)
- **Imports**: Ruta absoluta en tsconfig

## Gestión de Estado

### Context API (AuthContext)
Maneja autenticación global:
- Usuario actual
- Token JWT
- Estado de carga
- Errores

```typescript
const { user, token, login, logout, register } = useAuth();
```

### State Local (useState)
Cada componente gestiona su estado local:
- Datos del formulario
- Carga de datos
- Errores específicos de página

## Manejo de Errores

### Toast Notifications
Feedback visual para acciones:
- ✓ Verde (éxito)
- ✗ Rojo (error)
- ⓘ Azul (información)

### Validación
- Cliente: Validación de inputs en formularios
- Servidor: Mensajes de error en español

## Seguridad

- JWT tokens almacenados en localStorage
- Headers Authorization en todas las llamadas API
- Rutas protegidas con ProtectedRoute
- Validación de roles en navegación
- CORS configurado en servidor

## Desarrollo

### Scripts disponibles
```bash
npm run dev        # Iniciar servidor de desarrollo
npm run build      # Build para producción
npm run preview    # Preview del build
npm run lint       # Linting de código
npm run typecheck  # Verificación de tipos
```

### Debugging
- React DevTools
- Network tab en DevTools
- Console logs con prefijo

## Documentación Adicional

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Arquitectura técnica detallada
- **[FEATURES.md](./FEATURES.md)** - Guía completa de funcionalidades
- **[Colección Postman](./EventManager-API.postman_collection.json)** - API endpoints

## Soporte

Para problemas o sugerencias:
1. Verificar logs en consola del navegador
2. Revisar estado del servidor API
3. Verificar credenciales y permisos

## Licencia

Proyecto privado - EventManager 2026

## Notas de Desarrollo

- La aplicación se desarrolló siguiendo el flujo de la colección Postman
- Todas las pantallas están integradas con la API real
- Los estilos utilizan Tailwind CSS para responsividad
- La autenticación usa JWT con almacenamiento en localStorage
