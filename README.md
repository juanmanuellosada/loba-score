# 🃏 Loba Score

Contador de puntajes en tiempo real para el juego de cartas **La Loba**.

## 🚀 Setup

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Supabase

#### Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Espera a que termine de inicializarse (~2 minutos)

#### Ejecutar scripts SQL

1. En tu proyecto de Supabase, ve a **SQL Editor**
2. Copia y pega el siguiente script y ejecútalo:

```sql
-- Tabla de partidas
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(6) UNIQUE NOT NULL,
  host_id UUID NOT NULL,
  status VARCHAR(20) DEFAULT 'waiting',
  current_round INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de jugadores
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

-- Tabla de puntajes por ronda
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

-- RLS Policies (básicas pero funcionales)
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

#### Obtener credenciales

1. Ve a **Settings** > **API**
2. Copia la **Project URL** (algo como `https://xxx.supabase.co`)
3. Copia la **anon/public key** (un string largo que empieza con `eyJ...`)

#### Configurar variables de entorno

1. Copia el archivo de ejemplo:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edita `.env.local` y pega tus credenciales:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbG...tu-key-completa
   ```

### 3. Ejecutar el proyecto

```bash
npm run dev
```

La app estará disponible en [http://localhost:5173](http://localhost:5173)

## 📱 Testing Multijugador

Para probar la funcionalidad en tiempo real:

1. Abre la app en el navegador
2. Crea una partida y copia el código
3. Abre otra pestaña (o navegador en modo incógnito)
4. Únete con el código
5. Verifica que los jugadores aparezcan en tiempo real

## 🎮 Reglas del Juego

- Se juega **a 100 puntos**
- El primero que llega o supera 100 **pierde**
- Al final de cada ronda, cada jugador suma el valor de las cartas que le quedaron
- **Valores de las cartas:**
  - **A** (As): 11 puntos
  - **Joker**: 15 puntos
  - **J, Q, K** (Figuras): 10 puntos
  - **2-10**: Valor numérico

## 🏗️ Estructura del Proyecto

```
src/
├── components/      # Componentes reutilizables
├── pages/          # Páginas principales
├── hooks/          # Hooks personalizados
└── lib/            # Utilidades y lógica de negocio
```

## 🔧 Stack Tecnológico

- **React 18** + **Vite**
- **Tailwind CSS**
- **Supabase** (PostgreSQL + Realtime)
- **React Router**
- **Lucide React** (íconos)

## 📦 Deploy

### Vercel

1. Instala Vercel CLI: `npm i -g vercel`
2. Ejecuta: `vercel`
3. Configura las variables de entorno en el dashboard de Vercel

### Netlify

1. Conecta tu repositorio
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Configura las variables de entorno

---

Hecho con ❤️ para los amantes de La Loba
