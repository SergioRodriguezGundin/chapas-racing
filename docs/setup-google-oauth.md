# Configurar Google OAuth con Supabase

Guía para habilitar «Continuar con Google» en Chapas Racing. El error `Unsupported provider: missing OAuth secret` indica que el provider está activo en Supabase pero **falta el Client Secret** (o el Client ID).

**Proyecto Supabase:** `tiwagdlcxnzfjnncqsrf`  
**Dashboard:** https://supabase.com/dashboard/project/tiwagdlcxnzfjnncqsrf

> Google OAuth se configura en el **Supabase Dashboard**, no en variables de entorno del repo. Las credenciales de Google (Client ID / Secret) viven en Supabase Auth, no en `.env.local`.

---

## 1. Google Cloud Console

1. Abre [Google Cloud Console](https://console.cloud.google.com/) y selecciona (o crea) un proyecto.
2. **APIs & Services → OAuth consent screen** — configura la pantalla de consentimiento (tipo External para pruebas con usuarios de prueba).
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
4. Tipo de aplicación: **Web application**.
5. En **Authorized redirect URIs**, añade exactamente:

   ```
   https://tiwagdlcxnzfjnncqsrf.supabase.co/auth/v1/callback
   ```

6. Guarda y copia el **Client ID** y el **Client Secret**.

---

## 2. Supabase Dashboard — Provider Google

1. Ve a **Authentication → Providers → Google**.
2. Activa **Enable Sign in with Google**.
3. Pega el **Client ID** y el **Client Secret** de Google Cloud (ambos son obligatorios).
4. Pulsa **Save**.

Ruta directa: https://supabase.com/dashboard/project/tiwagdlcxnzfjnncqsrf/auth/providers?provider=Google

---

## 3. Supabase Dashboard — URL Configuration

1. Ve a **Authentication → URL Configuration**.
2. **Site URL** (desarrollo local):

   ```
   http://localhost:3000
   ```

3. En **Redirect URLs**, añade:

   ```
   http://localhost:3000/auth/callback
   ```

4. Para producción, añade también la URL de tu despliegue, por ejemplo:

   ```
   https://tu-dominio.com/auth/callback
   ```

5. Guarda los cambios.

---

## 4. Variables de entorno locales (`.env.local`)

El flujo OAuth no requiere credenciales de Google en el cliente Next.js. Solo necesitas las variables de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tiwagdlcxnzfjnncqsrf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu-anon-key>
```

Copia la plantilla desde `.env.local.example`.

---

## 5. Verificación

1. Reinicia el servidor de desarrollo (`pnpm dev`) si estaba en marcha.
2. Abre `/login` y pulsa **Continuar con Google**.
3. Deberías ser redirigido a la cuenta de Google, no ver un error 400 de Supabase.

---

## Troubleshooting

### `Unsupported provider: missing OAuth secret`

| Causa | Solución |
|-------|----------|
| Provider Google activado sin Client Secret | Authentication → Providers → Google → pega Client Secret → Save |
| Solo Client ID, sin Secret | Genera un OAuth client en Google Cloud y copia ambos valores |
| Cambios no guardados | Pulsa **Save** en el provider y espera unos segundos |

### `redirect_uri_mismatch` (error de Google)

La URI en Google Cloud debe coincidir **exactamente** con:

```
https://tiwagdlcxnzfjnncqsrf.supabase.co/auth/v1/callback
```

No uses `http://localhost:3000/auth/callback` en Google Cloud; esa URL va en Supabase **Redirect URLs**, no en Google.

### Vuelve a `/login` sin sesión tras elegir cuenta

Revisa **Redirect URLs** en Supabase (sección 3). Debe incluir `http://localhost:3000/auth/callback`.

### El botón de Google no hace nada / error en consola

1. Comprueba `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en `.env.local`.
2. Confirma que el provider Google está **Enabled** con ID y Secret completos.

---

## Referencias

- [Supabase — Login with Google](https://supabase.com/docs/guides/auth/social-login/auth-google)
- Guía en la app: `/docs/setup-google-oauth`
