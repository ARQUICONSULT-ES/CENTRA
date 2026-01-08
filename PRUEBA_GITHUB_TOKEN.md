# Guía de Prueba - Modal de GitHub Token

## 🎯 Objetivo
Verificar que el sistema de GitHub Token basado en usuarios funciona correctamente.

## 📋 Pasos para Probar

### 1. Preparación
- Asegúrate de estar autenticado en la aplicación
- El servidor debe estar corriendo en `http://localhost:3000`

### 2. Acceder a la Página de Repositorios
1. Navega a `http://localhost:3000/repos`
2. **Resultado Esperado**: 
   - Si NO tienes un GitHub token configurado, deberías ver:
     - Un ícono de llave azul
     - Mensaje "Token de GitHub requerido"
     - Botón "Configurar Token de GitHub"

### 3. Abrir el Modal
1. Haz clic en el botón "Configurar Token de GitHub"
2. **Resultado Esperado**:
   - Se abre un modal bonito con instrucciones
   - El modal tiene:
     - Título: "Configurar GitHub Token"
     - Sección de instrucciones en azul con pasos numerados
     - Campo de entrada para el token (tipo password)
     - Botón para mostrar/ocultar el token
     - Botones "Cancelar" y "Guardar Token"

### 4. Crear un Token de GitHub (si no tienes uno)
1. Abre https://github.com/settings/tokens en una nueva pestaña
2. Haz clic en "Generate new token" → "Generate new token (classic)"
3. Dale un nombre descriptivo, por ejemplo: "CENTRA App"
4. Selecciona los scopes necesarios:
   - ✅ `repo` - Full control of private repositories
   - ✅ `workflow` - Update GitHub Action workflows
5. Haz clic en "Generate token"
6. **IMPORTANTE**: Copia el token inmediatamente (solo se muestra una vez)

### 5. Guardar el Token
1. Pega el token en el campo del modal
2. Haz clic en "Guardar Token"
3. **Resultado Esperado**:
   - El modal se cierra
   - La página recarga automáticamente
   - Ahora deberías ver tus repositorios de GitHub

### 6. Verificación
- Los repositorios se cargan correctamente
- Puedes interactuar con las funcionalidades de GitHub
- El token se guardó en la base de datos (asociado a tu usuario)

## ✅ Comportamiento Esperado

### Primera Vez (Sin Token)
```
┌─────────────────────────────────────┐
│  Administración de repositorios     │
│  Configura tu token de GitHub...    │
├─────────────────────────────────────┤
│                                     │
│         🔑 (Ícono de llave)         │
│                                     │
│   Token de GitHub requerido         │
│   Para acceder a tus repositorios   │
│   de GitHub, necesitas configurar   │
│   un token personal de acceso.      │
│                                     │
│   [+ Configurar Token de GitHub]    │
│                                     │
└─────────────────────────────────────┘
```

### Con Token Configurado
```
┌─────────────────────────────────────┐
│  Administración de repositorios     │
│  125 repositorios                   │
├─────────────────────────────────────┤
│  🔍 Buscar...         [Ordenar ▼]   │
├─────────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐        │
│  │ Repo │ │ Repo │ │ Repo │  ...   │
│  └──────┘ └──────┘ └──────┘        │
└─────────────────────────────────────┘
```

## 🔍 Puntos de Verificación

- [ ] El modal aparece automáticamente al entrar a `/repos` sin token
- [ ] El modal tiene instrucciones claras y detalladas
- [ ] El campo de token funciona como password (oculto por defecto)
- [ ] El botón de mostrar/ocultar funciona correctamente
- [ ] El botón "Cancelar" cierra el modal
- [ ] El botón "Guardar Token" guarda correctamente
- [ ] Después de guardar, se recargan los repositorios automáticamente
- [ ] El token se persiste (al recargar la página, no vuelve a pedir el token)

## 🐛 Problemas Comunes

### El modal no aparece
- Verifica que estés en la página `/repos`
- Asegúrate de que NO tienes un token guardado en tu usuario
- Revisa la consola del navegador para errores

### Error al guardar el token
- Verifica que el token sea válido (empieza con `ghp_`)
- Asegúrate de tener los permisos correctos en el token
- Revisa que estés autenticado en la aplicación

### Los repositorios no cargan después de guardar
- Verifica que el token tenga el permiso `repo`
- Revisa la consola para ver el error específico
- Intenta generar un nuevo token con todos los permisos

## 📝 Notas Técnicas

### Endpoints Involucrados
- `GET /api/users/me/github-token` - Verifica si el usuario tiene token
- `PUT /api/users/me/github-token` - Guarda el token del usuario
- `GET /api/github/repos` - Obtiene los repositorios (requiere token)

### Flujo de Datos
1. Usuario accede a `/repos`
2. `useRepos` hook hace fetch a `/api/github/repos`
3. Si retorna 401 con mensaje de token → `needsToken = true`
4. `ReposPage` detecta `needsToken` y muestra la pantalla del modal
5. Usuario ingresa token y guarda
6. Token se guarda en DB via `/api/users/me/github-token`
7. Se recargan los repos automáticamente con el token guardado

## 🎉 Éxito
Si todos los pasos funcionan correctamente, el sistema de tokens está funcionando perfectamente. El usuario ahora puede:
- Acceder a sus repositorios privados
- Ejecutar workflows de GitHub Actions
- Todas las operaciones de GitHub usan su token personal
