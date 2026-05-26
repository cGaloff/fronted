# Funcionalidades EventManager

## Para Todos

### Autenticación
- **Registro**: Crear cuenta con nombre, email y contraseña (mínimo 8 caracteres)
- **Login**: Acceso con email y contraseña
- **Seguridad**: JWT tokens, localStorage con opción de httpOnly cookies
- **Logout**: Cerrar sesión desde cualquier pantalla

## Para Usuarios (Organizadores/Participantes)

### Explorar Eventos
- **Listado**: Ver todos los eventos publicados
- **Filtros visuales**:
  - Estado del evento (Borrador, Publicado, Cancelado, Finalizado)
  - Ubicación
  - Capacidad máxima
  - Disponibilidad de estacionamiento
- **Búsqueda**: Por nombre de evento
- **Detalles**: Acceder a información completa
  - Descripción completa
  - Fecha y hora exactas
  - Ubicación con detalles
  - Nombre del organizador
  - Capacidad y estacionamiento

### Crear Evento
**Solo para usuarios con rol Organizador**

- Formulario con:
  - Nombre del evento
  - Descripción detallada
  - Ubicación
  - Fecha y hora de inicio
  - Fecha y hora de finalización
  - Capacidad máxima de participantes
  - Opción de estacionamiento
- **Publicación automática**: Se publica al crear para que participantes se registren inmediatamente
- **Validaciones**: Campos requeridos, formato de fechas

### Registrarse en Evento
- Botón disponible en detalles del evento
- **Solo si**:
  - Evento está Publicado
  - Usuario no está ya registrado
- **Al registrarse**:
  - Obtiene código QR único (checkInToken)
  - Confirmación visual
  - Redirección a "Mis Eventos"

### Mis Eventos
- **Vista de todos tus registros**:
  - Nombre del evento
  - Fecha
  - Ubicación
  - Estado actual
  - Fecha de registro
- **Código QR**:
  - Visualización en tarjeta
  - Descarga como PNG
  - Escaneable para check-in

### Check-in
**Cualquier usuario autenticado puede validar QRs**

- **Métodos de entrada**:
  - Escanear código QR con cámara/scanner
  - Ingresar token manualmente
  - Ingresar ID del evento
- **Feedback**:
  - ✓ Check-in exitoso (verde)
  - ⚠ QR ya usado (amarillo)
  - ✗ Datos inválidos (rojo)
- **Información mostrada**:
  - Nombre de participante
  - Nombre del evento
  - Hora exacta del check-in
  - Mensaje personalizado

## Para Administradores (Admin)

### Acceso Especial
- Menú "Reportes" visible solo para Admins
- Validación de rol en rutas protegidas

### Dashboard de Asistencia
- **Selector de eventos**: Lista de eventos publicados
- **Resumen visual**:
  - Total de inscritos
  - Total de asistentes
  - Porcentaje de asistencia (%)
  - Tarjetas con iconos para cada métrica

### Tabla Detallada
- **Columnas**:
  - Nombre completo del participante
  - Email
  - Estado (Asistió / No asistió)
  - Hora exacta del check-in (si aplica)
- **Ordenamiento**: Por nombre alfabético
- **Visualización**: Colores para estados

### Acciones desde Reportes
- **Enviar recordatorios**: 
  - Encola emails a todos los inscritos
  - Confirmación visual
  - Feedback de éxito
- **Futuro**: Exportar a CSV, gráficos avanzados

## Flujo Completo de Evento

### Paso 1: Crear Evento (Organizador)
1. Ir a "Crear Evento"
2. Llenar formulario
3. Hacer clic en "Crear evento"
4. Evento se publica automáticamente
5. Recibir confirmación

### Paso 2: Registrarse (Participante)
1. Ver lista de eventos
2. Hacer clic en evento de interés
3. Ver detalles
4. Clic en "Registrarse al evento"
5. Se genera QR

### Paso 3: Descargar QR (Participante)
1. Ir a "Mis Eventos"
2. Encontrar el evento
3. Clic en "Descargar QR"
4. Guardar imagen

### Paso 4: Check-in (Día del evento)
1. Usuario presenta QR
2. Operador accede a "Check-in"
3. Escanea QR
4. Sistema confirma asistencia
5. Participante registrado

### Paso 5: Ver Reportes (Admin)
1. Clic en "Reportes"
2. Seleccionar evento
3. Ver estadísticas y tabla
4. Opcionalmente enviar recordatorios

## Características de Seguridad

- **Autenticación JWT**: Token seguro con expiración
- **Rutas protegidas**: Solo usuarios autenticados
- **Control de rol**: Funciones exclusivas por rol
- **Validación de entrada**: En cliente y servidor
- **CORS configurado**: Para llamadas API seguras
- **localStorage**: Almacenamiento seguro del token

## Interfaz de Usuario

### Diseño Responsive
- Optimizado para mobile, tablet y desktop
- Grid layout adaptativo
- Navegación intuitiva

### Componentes Visuales
- Tarjetas (Cards) para eventos
- Formularios limpios con validación visual
- Toast notifications para feedback
- Iconos descriptivos (Lucide React)
- Colores accesibles

### Paleta de Colores
- **Azul primario**: Acciones principales
- **Verde**: Éxito y asistencia
- **Rojo**: Errores y peligro
- **Amarillo**: Advertencias
- **Gris**: Textos neutrales

## Estados de Evento

| Estado | Código | Descripción | Acción |
|--------|--------|-------------|--------|
| Borrador | 0 | En creación | No se puede registrar |
| Publicado | 1 | Abierto para inscripciones | Se puede registrar |
| Cancelado | 2 | Cancelado | No se puede hacer nada |
| Finalizado | 3 | Evento pasado | Disponible para histórico |

## Notificaciones

### Para Participantes
- Confirmación de registro
- Recordatorio antes del evento (vía email)
- Confirmación de check-in

### Para Organizadores
- Nuevo participante registrado
- Recordatorio del evento próximo

### Para Admins
- Reportes de asistencia
- Alertas de bajo asistimiento

## Limitaciones Actuales

- Máximo una inscripción por usuario/evento
- No hay historial de cambios
- No hay cancelación de inscripción
- Check-in no se puede deshacer
- Cupo máximo por evento (sin confirmación)

## Próximas Características Planeadas

- Búsqueda y filtros avanzados
- Exportación de reportes (CSV/PDF)
- Notificaciones push/email integradas
- Galería de fotos del evento
- Sistema de reviews/ratings
- Integración con calendario
- Modo oscuro
- Múltiples idiomas
