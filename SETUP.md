# 🎮 Loba Score - Setup Completo

## ✅ Lo que está implementado

### Core Features
- ✅ **Home**: Pantalla de inicio con input de nombre
- ✅ **Crear partida**: Genera código de 6 caracteres, link compartible
- ✅ **Unirse a partida**: Por código o URL directa
- ✅ **Lobby**: Sala de espera con lista de jugadores en tiempo real
- ✅ **Game**: Pantalla principal del juego con:
  - Tabla de puntajes ordenada (menor a mayor)
  - Selector visual de cartas (modo rápido)
  - Input directo de puntaje (modo directo)
  - Alertas de 80 y 90 puntos con vibración
  - Sistema de rondas
- ✅ **Game Over**: Pantalla final con ranking y medallas
- ✅ **Historial**: Guardado local de partidas anteriores

### Funcionalidades Técnicas
- ✅ **Realtime**: Supabase Realtime en jugadores, scores y partidas
- ✅ **Session management**: UUID en localStorage sin autenticación
- ✅ **PWA**: Manifest + Service Worker (instalable)
- ✅ **Vibración**: Feedback háptico en alertas y confirmaciones
- ✅ **Sonidos**: Beeps simples con Web Audio API
- ✅ **Mobile-first**: Diseño responsive optimizado para móviles
- ✅ **Compartir**: Web Share API con fallback a clipboard

## 🚀 Próximos pasos

### 1. Configurar Supabase (IMPORTANTE)

**Paso a paso:**

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto (elige región cercana)
3. Espera ~2 minutos a que se inicialice
4. Ve a **SQL Editor** (ícono de base de datos)
5. Crea una nueva query y pega este script:

```sql
-- Crear tablas
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(6) UNIQUE NOT NULL,
  host_id UUID NOT NULL,
  status VARCHAR(20) DEFAULT 'waiting',
  current_round INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  name VARCHAR(30) NOT NULL,
  session_id VARCHAR(64) NOT NULL,
  is_host BOOLEAN DEFAULT false,
  total_score INTEGER DEFAULT 0,
  is_eliminated BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  round_score INTEGER NOT NULL,
  cards_detail JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE games;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE scores;

-- RLS Policies
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read games" ON games FOR SELECT USING (true);
CREATE POLICY "Anyone can insert games" ON games FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update games" ON games FOR UPDATE USING (true);

CREATE POLICY "Anyone can read players" ON players FOR SELECT USING (true);
CREATE POLICY "Anyone can insert players" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update players" ON players FOR UPDATE USING (true);

CREATE POLICY "Anyone can read scores" ON scores FOR SELECT USING (true);
CREATE POLICY "Anyone can insert scores" ON scores FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update scores" ON scores FOR UPDATE USING (true);
```

6. Click **Run** (o F5)
7. Verifica que se crearon las tablas en **Table Editor**

### 2. Configurar credenciales

1. En Supabase, ve a **Settings** → **API**
2. Copia:
   - **Project URL** (ej: `https://abcdefgh.supabase.co`)
   - **anon public key** (empieza con `eyJ...`)

3. Crea el archivo `.env.local`:

```bash
cp .env.local.example .env.local
```

4. Edita `.env.local` y pega tus credenciales:

```env
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...tu-key-completa-aqui
```

5. **Reinicia el servidor** (Ctrl+C y `npm run dev` de nuevo)

### 3. Probar multijugador

1. Abre http://localhost:5173
2. Ingresa tu nombre y crea una partida
3. Copia el código
4. **Abre otra pestaña** (o navegador incógnito)
5. Ingresa otro nombre y únete con el código
6. Verifica que:
   - Los jugadores aparecen en tiempo real en el lobby
   - El host puede iniciar la partida
   - Los puntajes se actualizan para todos al instante

## 📱 Testing en móvil

### Opción 1: Usando tu IP local

1. Obtén tu IP local:
   - Windows: `ipconfig` → busca IPv4
   - Mac/Linux: `ifconfig` → busca inet

2. Inicia el servidor con:
   ```bash
   npm run dev -- --host
   ```

3. Desde tu celular (misma red WiFi), abre:
   ```
   http://TU-IP:5173
   ```

### Opción 2: Túnel con ngrok (recomendado para testing)

1. Instala ngrok: https://ngrok.com/download
2. Ejecuta:
   ```bash
   ngrok http 5173
   ```
3. Usa la URL que te da (ej: `https://abc123.ngrok.io`)

## 🎨 Personalización de íconos PWA

Los íconos actualmente son placeholders. Para crear íconos personalizados:

1. Diseña un ícono 512x512:
   - Fondo verde esmeralda (#10b981)
   - Símbolo de picas (♠) o cartas
   - Diseño simple y reconocible

2. Genera los tamaños necesarios:
   - `icon-192.png` (192x192)
   - `icon-512.png` (512x512)

3. Reemplaza los archivos `.md` en `public/`

4. Herramientas recomendadas:
   - [Favicon.io](https://favicon.io/)
   - [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
   - Canva / Figma

## 🐛 Troubleshooting

### La app carga pero no se conecta a Supabase

- Verifica que `.env.local` existe y tiene las credenciales correctas
- Reinicia el servidor después de crear `.env.local`
- Verifica que las credenciales no tienen espacios al inicio/final
- Revisa la consola del navegador (F12) para ver errores

### Los jugadores no aparecen en tiempo real

- Verifica que ejecutaste el script SQL completo (especialmente las líneas ALTER PUBLICATION)
- En Supabase, ve a **Database** → **Replication** y verifica que las 3 tablas estén habilitadas
- Revisa la consola para ver si hay errores de conexión

### Error "Failed to fetch" o CORS

- Verifica que la URL de Supabase en `.env.local` empieza con `https://`
- Verifica que no hay typos en la URL

## 📦 Deploy a producción

### Vercel (recomendado)

```bash
npm i -g vercel
vercel
```

Luego configura las variables de entorno en el dashboard.

### Netlify

1. Conecta tu repo de Git
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Variables de entorno: agrega `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`

## 📝 Notas importantes

- **Sin autenticación**: La app usa session IDs locales, cualquiera puede unirse
- **RLS básico**: Las políticas son permisivas para simplificar el setup
- **Límites**: Máximo 8 jugadores por partida
- **Historial**: Solo local (localStorage), no se sincroniza entre dispositivos
- **Seguridad**: Para producción, considera mejorar las RLS policies

## 🎯 Features opcionales para agregar

- [ ] Editar puntaje después de enviarlo
- [ ] Sistema de autenticación (opcional)
- [ ] Chat en vivo entre jugadores
- [ ] Diferentes modos de juego
- [ ] Estadísticas globales del jugador
- [ ] Modo oscuro/claro toggle
- [ ] Animaciones más elaboradas
- [ ] Sonidos personalizados (en vez de beeps)

---

¡La app está lista para jugar! 🎉
