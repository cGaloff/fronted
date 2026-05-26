# Pantallas de EventManager

## 1. Login/Registro (`/login`)

### Descripción
Pantalla de autenticación con dos modos: login y registro.

### Elementos
- Logo de EventManager (icono calendario)
- Titulo "Iniciar sesión" o "Crear cuenta"
- Formulario con campos:
  - Email (input text)
  - Contraseña (input password)
  - Nombre (solo en registro)
  - Apellido (solo en registro)
- Botón enviar (cambia texto según modo)
- Enlace para cambiar entre login/registro

### Flujo
1. Ingresar email y contraseña
2. Hacer clic en "Iniciar sesión" o "Crear cuenta"
3. Validación de campos
4. Llamada a API
5. Redirección a pantalla de eventos

### Roles Afectados
- Público (no autenticado)

---

## 2. Eventos (`/`)

### Descripción
Listado principal de eventos disponibles con filtros y acciones.

### Elementos
- **Navbar**:
  - Logo y nombre "EventManager"
  - Email del usuario actual
  - Botón "Salir"
  
- **Encabezado**:
  - Titulo "Eventos"
  - Descripción "Descubre y participa en eventos"
  - Botones de acción:
    - "Mis Eventos"
    - "Crear Evento" (si no es admin)
    - "Reportes" (si es admin)

- **Listado**:
  - Grid de tarjetas (3 columnas en desktop)
  - Por evento:
    - Nombre
    - Estado (badge con color)
    - Descripción (2 líneas máximo)
    - Fecha
    - Ubicación (con icono)
    - Capacidad
    - Indicador de estacionamiento
    - Botón "Ver detalles"

### Estados Visuales
- Borrador: Gris
- Publicado: Verde
- Cancelado: Rojo
- Finalizado: Azul

### Interacciones
- Clic en tarjeta → Ir a detalles
- Clic en botón "Ver detalles" → Ir a detalles
- Clic en "Mis Eventos" → Ir a mis eventos
- Clic en "Crear Evento" → Ir a crear evento
- Clic en "Reportes" → Ir a reportes (solo admin)

### Roles Afectados
- User: Puede ver crear evento
- Admin: Puede ver reportes

---

## 3. Detalle de Evento (`/eventos/:id`)

### Descripción
Pantalla con información completa del evento e opción para registrarse.

### Elementos
- **Navegación**:
  - Botón "Volver" (flecha izquierda)

- **Encabezado**:
  - Nombre del evento
  - Badge de estado
  - Organizador
  
- **Información Principal** (en grid 2 columnas):
  - Fecha y hora (icono reloj)
    - Inicio
    - Fin
  - Ubicación (icono ubicación)
  - Capacidad (icono usuarios)
  - Estacionamiento (icono aparcamiento)

- **Descripción completa** (párrafo)

- **Metadatos**:
  - Fecha de creación
  - Última actualización
  - ID del evento (copiable)

- **Botón de acción**:
  - "Registrarse al evento" (si puede registrarse)
  - Mensaje verde si ya está registrado
  - Mensaje amarillo si evento no está publicado

### Condiciones de Registro
- Solo si: `status === Published` (1)
- Solo si: usuario no está registrado
- Solo si: usuario tiene rol User

### Roles Afectados
- User: Puede registrarse
- Admin: Solo visualizar

---

## 4. Mis Eventos (`/mis-eventos`)

### Descripción
Listado de eventos registrados con códigos QR descargables.

### Elementos
- **Navegación**:
  - Botón "Volver"

- **Encabezado**:
  - Titulo "Mis eventos"
  - Descripción "Eventos en los que estás registrado"

- **Tarjetas de Evento**:
  - Nombre
  - Fecha
  - Ubicación
  - Estado (badge)
  - Fecha de registro
  - **Código QR**:
    - Canvas generado con qrcode.react
    - Tamaño: 150px
    - Nivel de corrección: Alto (H)
  - Botón "Descargar QR"

### Funcionalidades
- Descargar QR como imagen PNG
- Nombre del archivo: `qr-{nombre-evento}.png`

### Vacios
- Si no hay eventos: mensaje "No estás registrado en ningún evento"
- Botón para "Explorar eventos"

### Roles Afectados
- User: Acceso completo

---

## 5. Crear Evento (`/crear-evento`)

### Descripción
Formulario para crear un nuevo evento.

### Elementos
- **Navegación**:
  - Botón "Volver"

- **Formulario**:
  - Nombre del evento (input text)
  - Descripción (textarea, 4 filas)
  - Ubicación (input text)
  - Fecha/hora inicio (input datetime-local)
  - Fecha/hora fin (input datetime-local)
  - Capacidad máxima (input number, mín 1)
  - Checkbox "Estacionamiento disponible"

- **Botones**:
  - "Crear evento" (primary)
  - "Cancelar" (secondary)

### Validaciones
- Todos los campos requeridos
- Fechas válidas
- Capacidad >= 1

### Comportamiento
1. Al enviar:
   - Crear evento (status = Draft)
   - Publicar automáticamente (status = Published)
   - Mostrar confirmación
   - Redirigir a eventos

### Roles Afectados
- User: Acceso completo

---

## 6. Check-in (`/check-in`)

### Descripción
Pantalla para validar códigos QR y registrar asistencia.

### Elementos
- **Encabezado**:
  - Icono grande de QR
  - Titulo "Sistema de Check-in"
  - Descripción
  - Email del operador actual

- **Formulario**:
  - Token QR (input text, autofocus)
  - ID del evento (input text)
  - Botón "Validar check-in"

- **Resultado** (después de validar):
  - Icono grande (✓ verde o ⚠ amarillo)
  - Titulo de resultado
  - Mensaje personalizado
  - Card con detalles:
    - Nombre del participante
    - Nombre del evento
    - Hora del check-in
  - Botón "Siguiente registro"

### Valores de Respuesta
- **success: true**:
  - Icono: CheckCircle (verde)
  - Color fondo: Verde claro
  - Titulo: "Check-in exitoso"
  
- **success: false**:
  - Icono: XCircle (amarillo)
  - Color fondo: Amarillo claro
  - Titulo: "Aviso"

### Interacciones
- Escanear QR (se pega automáticamente)
- O ingresar token manualmente
- Ingresar ID evento
- Validar
- Ver resultado
- Clic en "Siguiente registro" para limpiar

### Roles Afectados
- User: Puede validar cualquier QR

---

## 7. Reportes (`/reportes`)

### Descripción
Dashboard administrativo con estadísticas y detalles de asistencia.

### Elementos
- **Navegación**:
  - Botón "Volver"

- **Encabezado**:
  - Titulo "Reportes de asistencia"
  - Descripción "Panel de control para administradores"

- **Layout** (Grid 4 columnas):
  
  **Columna 1 - Selector de Eventos**:
  - Card blanca
  - Titulo "Eventos"
  - Lista de eventos publicados
  - Cada evento es un botón clickeable
  - Estado actual: fondo azul, texto blanco
  - Otros: gris claro con hover

  **Columnas 2-4 - Contenido del Reporte**:
  
  **Resumen** (3 tarjetas en grid):
  1. Inscritos
     - Icono: Users (azul)
     - Numero grande
     
  2. Asistieron
     - Icono: CheckCircle (verde)
     - Numero grande
     
  3. Porcentaje asistencia
     - Icono: % (púrpura)
     - Porcentaje con 1 decimal

  **Acciones**:
  - Card con botón "Enviar recordatorios"
  - Icono: Mail
  - Ancho completo

  **Tabla de Asistencia**:
  - Columnas:
    - Nombre
    - Email
    - Estado (badge)
    - Hora check-in
  - Filas con hover effect (bg gris)
  - Scroll horizontal en móvil

### Estados Tabla
- Asistió: Badge verde
- No asistió: Badge rojo

### Interacciones
- Seleccionar evento → Cargar reporte
- Botón "Enviar recordatorios" → Encolar emails
- Toast de confirmación

### Roles Afectados
- Admin: Acceso completo
- User: Sin acceso (redirect a home)

---

## Flujos de Navegación

### Usuario No Autenticado
```
Login/Registro
    ↓
Completa forma
    ↓
Eventos (home)
```

### Participante
```
Eventos
    ├→ Ver evento → Registrarse → Mis Eventos (descarga QR)
    ├→ Mis Eventos
    ├→ Check-in (validar QR)
    └→ Crear Evento (también es organizador)
```

### Organizador
```
Eventos (home)
    ├→ Crear Evento
    ├→ Mis Eventos (si se registró en otros)
    ├→ Check-in
    └→ Ver evento
```

### Administrador
```
Eventos (home)
    ├→ Ver eventos
    ├→ Reportes ← Acceso exclusivo
    │    ├→ Seleccionar evento
    │    ├→ Ver estadísticas
    │    ├→ Ver tabla de asistencia
    │    └→ Enviar recordatorios
    └→ Check-in
```

---

## Componentes Reutilizables en Pantallas

### Button
Usado en: Todas las pantallas

### Input
Usado en: Login, Crear Evento, Check-in

### Card
Usado en: Todas las pantallas

### Toast
Usado en: Todas las pantallas (notificaciones)

---

## Diseño Responsivo

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Ajustes
- Grids se ajustan de 1 → 2 → 3 columnas
- Padding reducido en mobile
- Fonts más pequeñas en mobile
- Tablas con scroll horizontal

---

## Paleta de Colores en Pantallas

- **Primario (Azul)**: Botones, links, headers
- **Secundario (Gris)**: Backgrounds, textos neutrales
- **Success (Verde)**: Check-in exitoso, asistió
- **Danger (Rojo)**: No asistió, errores
- **Warning (Amarillo)**: Avisos, QR usado
- **Info (Azul claro)**: Información adicional
