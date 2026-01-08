# Configuración del Cron Job de Sincronización Automática

## 📋 Descripción

Este sistema implementa un Cron Job en Vercel que ejecuta automáticamente la sincronización de datos cada día a las 7:00 AM (UTC).

### Datos Sincronizados

1. **Entornos de Business Central** - Todos los tenants configurados
2. **Aplicaciones Instaladas** - Todos los entornos activos
3. **Aplicaciones desde GitHub** - Todos los repositorios con `app.json`

---

## 🔧 Configuración

### 1. Variables de Entorno Necesarias

Debes configurar estas variables de entorno en tu proyecto de Vercel:

#### **CRON_SECRET**
Token secreto para proteger el endpoint de sincronización.

```bash
# Generar un token seguro
openssl rand -base64 32
```

**Configurar en Vercel:**
1. Ve a tu proyecto en Vercel Dashboard
2. Settings → Environment Variables
3. Agrega: `CRON_SECRET` = `tu-token-generado`
4. Aplica a: Production, Preview, Development

---

#### **GITHUB_ADMIN_TOKEN**
Personal Access Token de GitHub con acceso a todos los repositorios organizacionales.

**Crear el token:**
1. Ve a https://github.com/settings/tokens
2. Click en "Generate new token" → "Generate new token (classic)"
3. Configura:
   - **Note**: `Github-Manager Admin Token`
   - **Expiration**: Sin expiración o 1 año
   - **Scopes**:
     - ✅ `repo` (Full control of private repositories)
     - ✅ `read:org` (Read org and team membership)
4. Genera y copia el token (empieza con `ghp_`)

**Configurar en Vercel:**
1. Ve a tu proyecto en Vercel Dashboard
2. Settings → Environment Variables
3. Agrega: `GITHUB_ADMIN_TOKEN` = `ghp_tu_token_aqui`
4. Aplica a: Production, Preview, Development

---

### 2. Archivo vercel.json

El archivo `vercel.json` ya está configurado en la raíz del proyecto:

```json
{
  "crons": [
    {
      "path": "/api/cron/sync-all",
      "schedule": "0 7 * * *"
    }
  ]
}
```

**Formato del Schedule (Cron Expression):**
```
0 7 * * *
│ │ │ │ │
│ │ │ │ └─── Día de la semana (0-7, 0 y 7 = Domingo)
│ │ │ └───── Mes (1-12)
│ │ └─────── Día del mes (1-31)
│ └───────── Hora (0-23) - UTC
└─────────── Minuto (0-59)
```

**Ejemplos de configuración:**
- `0 7 * * *` - Todos los días a las 7:00 AM UTC
- `0 */6 * * *` - Cada 6 horas
- `0 9,18 * * *` - A las 9 AM y 6 PM UTC
- `0 8 * * 1` - Todos los lunes a las 8 AM UTC

---

### 3. Deploy a Vercel

```bash
# Instalar Vercel CLI (si no lo tienes)
npm i -g vercel

# Deploy
vercel --prod
```

Una vez desplegado:
1. Ve a tu proyecto en Vercel Dashboard
2. Settings → Crons
3. Verás el cron job configurado con su próxima ejecución

---

## 🔐 Seguridad

### Protección del Endpoint

El endpoint `/api/cron/sync-all` está protegido por:

1. **Token de Autorización**: Vercel envía automáticamente el header `Authorization: Bearer <CRON_SECRET>`
2. **Validación**: El endpoint verifica que el token coincida con `process.env.CRON_SECRET`

```typescript
const authHeader = request.headers.get("authorization");
const token = authHeader?.replace("Bearer ", "");

if (token !== process.env.CRON_SECRET) {
  return NextResponse.json({ error: "No autorizado" }, { status: 401 });
}
```

### ⚠️ Importante

- **NO expongas** `CRON_SECRET` en el código
- **NO compartas** `GITHUB_ADMIN_TOKEN` públicamente
- **Rota** el token de GitHub periódicamente
- Solo usuarios con **canAccessAdmin=true** pueden activar sincronizaciones manuales

---

## 🧪 Testing

### Probar el Endpoint Localmente

```bash
# 1. Asegúrate de tener las variables de entorno en .env.local
CRON_SECRET=test-secret-token
GITHUB_ADMIN_TOKEN=ghp_your_token

# 2. Ejecuta el servidor
npm run dev

# 3. Simula la llamada de Vercel
curl -X POST http://localhost:3000/api/cron/sync-all \
  -H "Authorization: Bearer test-secret-token"
```

### Probar en Vercel (Trigger Manual)

Una vez desplegado, puedes probar el cron manualmente:

1. Ve a Vercel Dashboard
2. Tu proyecto → Crons
3. Click en el botón "▶ Run" junto al cron job
4. Revisa los logs en la pestaña "Logs"

---

## 📊 Monitoreo

### Ver Logs de Ejecución

**En Vercel Dashboard:**
1. Tu proyecto → Logs
2. Filtra por: `/api/cron/sync-all`
3. Verás la salida detallada de cada ejecución

**Estructura de logs:**
```
🔄 Iniciando sincronización programada...

📦 [1/3] Sincronizando entornos de Business Central...
✅ Entornos: 5/5 sincronizados

📱 [2/3] Sincronizando aplicaciones instaladas...
✅ Apps instaladas: 12/12 sincronizadas

🐙 [3/3] Sincronizando aplicaciones desde GitHub...
✅ Apps GitHub: 8 actualizadas

==================================================
✅ Sincronización programada completada
==================================================
⏱️  Duración: 15.42s
📦 Entornos: 5/5
📱 Apps instaladas: 12/12
🐙 Apps GitHub: 8/10
==================================================
```

---

## 🚨 Troubleshooting

### El Cron Job No Se Ejecuta

**Verificar:**
1. ✅ `vercel.json` está en la raíz del proyecto
2. ✅ El proyecto está desplegado en producción
3. ✅ Vercel plan: Free tier tiene límites de cron jobs
4. ✅ Revisa Vercel Dashboard → Settings → Crons

### Error 401: No Autorizado

**Solución:**
1. Verifica que `CRON_SECRET` esté configurado en Vercel
2. Asegúrate de que el valor coincida exactamente
3. Redeploy después de cambiar variables de entorno

### Error 500: GITHUB_ADMIN_TOKEN No Configurado

**Solución:**
1. Ve a Settings → Environment Variables en Vercel
2. Agrega `GITHUB_ADMIN_TOKEN` con tu token de GitHub
3. Redeploy el proyecto

### Sincronización Parcial (Algunos Errores)

**Revisar:**
1. Los logs detallados en Vercel
2. Validar tokens de OAuth2 de tenants (Business Central)
3. Verificar conectividad con BC Admin API
4. Comprobar permisos del token de GitHub

---

## 📅 Limitaciones de Vercel

### Free Tier
- **Máximo 1 cron job** por proyecto
- Ejecución mínima cada **1 hora**

### Pro Tier
- **Múltiples cron jobs** por proyecto
- Ejecución mínima cada **1 minuto**
- Mayor tiempo de ejecución

---

## 🔄 Sincronización Manual

Los administradores también pueden ejecutar sincronizaciones manuales desde la UI:

1. **Entornos**: `/environments` → Botón "Sincronizar Todos"
2. **Apps Instaladas**: `/installed-apps` → Botón "Sincronizar Todos"
3. **Aplicaciones GitHub**: `/applications` → Botón "Sincronizar desde GitHub"

---

## 📖 Referencias

- [Vercel Cron Jobs Documentation](https://vercel.com/docs/cron-jobs)
- [Cron Expression Generator](https://crontab.guru/)
- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
