# Quick Start - EventManager

## 🚀 Inicio Rápido

### 1. Instalación
```bash
npm install
```

### 2. Desarrollo
```bash
npm run dev
```
Abre http://localhost:5173

### 3. Build
```bash
npm run build
```

---

## 📋 Usuarios de Prueba

### Usuario Organizador/Participante
```
Email: demo.usuario@example.com
Password: Password123
```

### Usuario Admin
```
Email: admin@example.com
Password: Password123
```

**Nota:** Registrate con cualquier email para crear tu cuenta

---

## 🎯 Flujos Principales

### Para Participante
1. Registrarse → Login
2. Ver eventos disponibles
3. Hacer clic en evento
4. Clic en "Registrarse al evento"
5. Ir a "Mis Eventos"
6. Descargar QR

### Para Organizador
1. Registrarse → Login
2. Clic en "Crear Evento"
3. Llenar formulario
4. Evento se publica automáticamente
5. Esperar inscripciones

### Para Check-in
1. Ir a "Check-in"
2. Escanear QR o ingresar token
3. Ver confirmación

### Para Admin
1. Login con rol Admin
2. Clic en "Reportes"
3. Seleccionar evento
4. Ver estadísticas
5. Opcional: Enviar recordatorios

---

## 📁 Estructura Rápida

```
src/
├── pages/           ← Pantallas principales
├── components/      ← UI components
├── contexts/        ← Auth global
├── lib/api.ts      ← Llamadas API
└── types/          ← Interfaces
```

---

## 🔌 API

**Base URL:**
```
https://gestion-eventos-backend-g5-dae9gcbgggerhgb8.brazilsouth-01.azurewebsites.net/api
```

**Status Evento:**
- 0 = Borrador
- 1 = Publicado
- 2 = Cancelado
- 3 = Finalizado

---

## 🎨 Pantallas

| Ruta | Descripción |
|------|-------------|
| `/login` | Autenticación |
| `/` | Listado de eventos |
| `/eventos/:id` | Detalle y registro |
| `/mis-eventos` | Mis eventos + QR |
| `/crear-evento` | Crear evento |
| `/check-in` | Validar QR |
| `/reportes` | Dashboard (Admin) |

---

## 🔐 Autenticación

- Email y contraseña
- JWT token en localStorage
- Session persistent
- Logout limpia datos

---

## 🎯 Características Clave

✅ Crear eventos (auto-publicado)  
✅ Registrarse en eventos  
✅ Generar/descargar QR  
✅ Validar asistencia con QR  
✅ Reportes de asistencia  
✅ Enviar recordatorios  
✅ Responsive design  
✅ Control de roles  

---

## 🛠 Comandos Útiles

```bash
npm run dev         # Desarrollo
npm run build       # Build producción
npm run preview     # Ver build
npm run typecheck   # Verificar TypeScript
npm run lint        # Linting
```

---

## 📝 Documentación Completa

- **README.md** - Instalación y uso
- **ARCHITECTURE.md** - Arquitectura técnica
- **FEATURES.md** - Funcionalidades detalladas
- **SCREENS.md** - Especificación de pantallas
- **IMPLEMENTATION_SUMMARY.md** - Resumen técnico

---

## 🐛 Troubleshooting

### "Cannot find module"
```bash
npm install
```

### TypeScript errors
```bash
npm run typecheck
```

### Build fails
```bash
npm run build
```

### API no responde
- Verificar URL API en `src/lib/api.ts`
- Verificar conexión a internet
- Verificar que servidor API está activo

---

## 💡 Tips

- Usar email diferente para cada registro
- Guardar el token mostrado después de login
- Descargar QR antes del evento
- En check-in, tener acceso a cámara/scanner

---

## 📞 Soporte

Para problemas:
1. Ver console en DevTools (F12)
2. Verificar Network tab
3. Revisar documentación correspondiente
4. Limpiar localStorage y reintentar

---

## ✨ Próximas Mejoras

- [ ] Búsqueda y filtros
- [ ] Exportar reportes
- [ ] Notificaciones push
- [ ] Dark mode
- [ ] Múltiples idiomas

---

**Proyecto Completado ✓**
Listo para desarrollo y despliegue en producción
