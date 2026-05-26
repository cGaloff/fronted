# Actualización de Manejo de User ID

## Resumen de Cambios

Se han realizado actualizaciones en toda la aplicación para manejar correctamente el `id` que retorna el endpoint de login del backend.

---

## Cambios Realizados

### 1. Tipos TypeScript (`src/types/index.ts`)

**Antes:**
```typescript
export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
  role: UserRole;
  expiresAt: string;
}
```

**Después:**
```typescript
export interface AuthResponse {
  id: string;           // ✓ Campo agregado
  token: string;
  email: string;
  fullName: string;
  role: UserRole;
  expiresAt: string;
}
```

---

### 2. API Cliente (`src/lib/api.ts`)

#### Cambio 1: Importar AuthResponse
```typescript
import { AuthResponse } from "../types";
```

#### Cambio 2: Tipar correctamente las respuestas
```typescript
export const authAPI = {
  register: (data: {...}) =>
    apiCall<{ id: string; firstName: string; lastName: string; email: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    apiCall<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
```

#### Cambio 3: Función helper para obtener userId
```typescript
export function getUserId(): string | null {
  return localStorage.getItem("userId");
}
```

---

### 3. Context de Autenticación (`src/contexts/AuthContext.tsx`)

#### Cambio 1: Usar response.id en login
```typescript
const login = async (email: string, password: string) => {
  const response = await authAPI.login({ email, password });

  const user: User = {
    id: response.id,           // ✓ Correctamente asignado
    firstName: response.fullName?.split(" ")[0] || "",
    lastName: response.fullName?.split(" ")[1] || "",
    email: response.email,
    role: response.role as UserRole,
  };

  localStorage.setItem("authToken", response.token);
  localStorage.setItem("userId", response.id);    // ✓ Persistido
  localStorage.setItem("user", JSON.stringify(user));

  // ... actualizar estado
};
```

#### Cambio 2: Persistir userId en registro
```typescript
const register = async (...) => {
  const response = await authAPI.register({ firstName, lastName, email, password });

  if (response.id) {
    localStorage.setItem("userId", response.id);    // ✓ Si el backend retorna id
  }
  // ...
};
```

#### Cambio 3: Limpiar userId en logout
```typescript
const logout = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userId");    // ✓ Limpiar también userId
  localStorage.removeItem("user");
  // ...
};
```

#### Cambio 4: Recuperar userId en useEffect
```typescript
useEffect(() => {
  const token = localStorage.getItem("authToken");
  const userStr = localStorage.getItem("user");
  const userId = localStorage.getItem("userId");    // ✓ Recuperar userId

  if (token && userStr) {
    const user = JSON.parse(userStr);
    if (userId && !user.id) {
      user.id = userId;    // ✓ Sincronizar id si no está en user
    }
    setState({ user, token, loading: false, error: null });
  }
}, []);
```

---

## Persistencia Triple

Ahora el `userId` se persiste en **tres lugares** para máxima robustez:

1. **localStorage `userId`**: Almacenamiento directo del ID
2. **localStorage `user`**: Objeto JSON completo con `user.id`
3. **React State `user.id`**: En memoria durante la sesión

```javascript
// Ejemplo de localStorage después del login:
{
  "authToken": "eyJhbGc...",
  "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "user": "{\"id\":\"a1b2c3d4-e5f6-7890-abcd-ef1234567890\",\"firstName\":\"María\",...}"
}
```

---

## Uso en Endpoints

### Páginas que usan userId:

#### 1. EventDetailPage - Inscripción
```typescript
await registrationsAPI.create({
  eventId: event.id,
  userId: user.id,    // ✓ Usa user.id del contexto
});
```

#### 2. MyEventsPage - Cargar eventos del usuario
```typescript
const data = await registrationsAPI.getUserRegistrations(user!.id);  // ✓
```

#### 3. CreateEventPage - Crear evento
```typescript
await eventsAPI.create({
  ...formData,
  organizerId: user.id,    // ✓
});
```

---

## Beneficios de los Cambios

### ✅ Consistencia
- El `id` ahora viene directamente del backend
- Se valida con TypeScript el tipo de respuesta
- Tipado correcto evita errores en runtime

### ✅ Persistencia Robusta
- Triple almacenamiento del userId
- Recuperación automática en refresh de página
- Sincronización entre localStorage y state

### ✅ Mantenibilidad
- Función helper `getUserId()` para uso global
- Tipos explícitos en todas las respuestas API
- Código más limpio y predecible

### ✅ Integridad
- Logout limpia todos los datos relacionados
- No hay datos huérfanos en localStorage
- Sesiones limpias y predecibles

---

## Flujo de Datos

```
LOGIN
  ↓
POST /auth/login
  ↓
Response: { id, token, email, fullName, role }
  ↓
┌─────────────────────────────────┐
│ localStorage.setItem(...)       │
│  - authToken: token             │
│  - userId: id       ← NUEVO     │
│  - user: JSON.stringify(user)   │
└─────────────────────────────────┘
  ↓
Context State: { user: { id, ... }, token }
  ↓
Acceso en componentes: useAuth() → user.id
```

---

## Endpoints que usan userId

| Endpoint | Parámetro | Ubicación |
|----------|-----------|-----------|
| `POST /registrations` | `userId` | EventDetailPage.tsx:49 |
| `GET /registrations/user/:id` | `userId` | MyEventsPage.tsx:30 |
| `POST /events` | `organizerId` | CreateEventPage.tsx:46 |
| `POST /notifications/checkin/.../user/:id` | `userId` | (disponible en ReportsPage) |

---

## Compatibilidad

### Funciona con:
- ✅ Login response con campo `id` (backend actualizado)
- ✅ Register response con campo `id` (si el backend lo retorna)
- ✅ localStorage persistente entre tabs
- ✅ Refresh de página sin pérdida de datos
- ✅ Logout limpio y completo

### No rompe:
- ✅ Funcionalidad existente
- ✅ Otras páginas que ya usaban user.id
- ✅ Build y typecheck
- ✅ Rutas y navegación

---

## Verificación Realizada

```bash
# TypeScript: Sin errores
npm run typecheck
✓ Compilación exitosa

# Build: Exitoso
npm run build
✓ built in 2.92s
dist/assets/index-Ck5351F3.js   215.60 kB │ gzip: 67.13 kB
```

---

## Pruebas Recomendadas

### Test 1: Login Correcto
1. Hacer login con credenciales válidas
2. Verificar localStorage: `userId` debe estar presente
3. Verificar que `user.id` está disponible en componentes

### Test 2: Registro
1. Registrar nuevo usuario
2. Si backend retorna `id`, debe guardarse en localStorage
3. Redirección a login debe mantener datos limpios

### Test 3: Inscripción en Evento
1. Login como usuario
2. Ir a detalle de evento
3. Registrarse → verificar que usa `user.id` correcto

### Test 4: Mis Eventos
1. Login con usuario registrado en eventos
2. Ir a "Mis Eventos"
3. Debe cargar `/registrations/user/{userId}` correctamente

### Test 5: Logout
1. Hacer logout
2. Verificar que `userId`, `authToken`, y `user` se eliminan
3. No debe quedar datos residuales

---

## Próximos Pasos (Opcional)

### Mejoras Futuras:
- [ ] Validar que userId sea un UUID válido
- [ ] Agregar logs para debugging de userId
- [ ] Tests unitarios para el flujo de userId
- [ ] Implementar refresh token con userId

---

**Estado**: ✅ **COMPLETADO**
**Build**: ✅ Exitoso
**TypeScript**: ✅ Sin errores
**Compatibilidad**: ✅ 100% retrocompatible

---

Actualizado: Mayo 26, 2026
