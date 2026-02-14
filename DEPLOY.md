# 🚀 Deploy a GitHub Pages

## ✅ Estado actual

- ✅ Código subido a GitHub
- ✅ Primera versión deployada a GitHub Pages
- ⚠️ **Falta configurar las variables de entorno de Supabase**

## 🔐 Configurar Secrets de GitHub

Para que la app funcione en producción, necesitas agregar las credenciales de Supabase como secrets en GitHub:

### Paso a paso:

1. **Andá al repositorio en GitHub**
   👉 https://github.com/juanmanuellosada/loba-score

2. **Click en "Settings"** (⚙️ en el menú superior)

3. **En el menú lateral**, andá a:
   - **"Secrets and variables"** → **"Actions"**

4. **Click en "New repository secret"**

5. **Agregá el primer secret:**
   - **Name**: `VITE_SUPABASE_URL`
   - **Value**: `https://gtkvaxkvtkaguypcszlc.supabase.co`
   - Click **"Add secret"**

6. **Click en "New repository secret"** de nuevo

7. **Agregá el segundo secret:**
   - **Name**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0a3ZheGt2dGthZ3V5cGNzemxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwOTIxODIsImV4cCI6MjA4NjY2ODE4Mn0.Hg5ohLf4L1nhPshVi8m0TKG8HthKPA0fQ1qd6qUTBn8`
   - Click **"Add secret"**

## 🔄 Re-deployar con las credenciales

Una vez que agregues los secrets, necesitas hacer un nuevo deploy:

### Opción 1: GitHub Actions (automático)
El workflow ya está configurado. Cada vez que hagas push a `main`, se va a deployar automáticamente.

Para forzar un re-deploy ahora:
```bash
git commit --allow-empty -m "Trigger deploy with Supabase credentials"
git push
```

### Opción 2: Deploy manual desde tu máquina
```bash
npm run deploy
```
(Esto usa tus credenciales locales del .env.local)

## 🌐 URL de la app

Una vez deployada, la app estará disponible en:

👉 **https://juanmanuellosada.github.io/loba-score/**

## ✅ Verificar que funciona

1. Abrí la URL en tu navegador
2. Abrí la consola (F12)
3. No deberías ver errores de Supabase
4. Creá una partida de prueba
5. Si ves "Error al crear la partida", las secrets no están configuradas correctamente

## 📱 Compartir la app

Ahora podés compartir la URL con quien quieras:
- **QR Code**: Usa un generador de QR con la URL
- **Link directo**: https://juanmanuellosada.github.io/loba-score/
- **WhatsApp**: Pegá el link directamente

## 🔧 Troubleshooting

### Error: "Partida no encontrada" o "Error al crear partida"
- Verifica que los secrets estén configurados en GitHub
- Revisa que los nombres sean exactamente `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
- Esperá ~30 segundos después del deploy para que los cambios se propaguen

### La app no carga
- Verifica que GitHub Pages esté habilitado en Settings > Pages
- La fuente debe ser: "Deploy from a branch" → Branch: "gh-pages" → Root

### Los puntajes no se actualizan en tiempo real
- Verifica que Realtime esté habilitado en Supabase
- Revisa la consola del navegador (F12) para ver errores

---

## 🎮 ¡Listo para jugar!

Una vez configurado todo, la app estará disponible 24/7 en GitHub Pages, completamente gratis.
