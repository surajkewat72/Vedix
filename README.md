# 🔮 Vedix — AI Vedic Astrology Platform

A full-stack AI astrology platform powered entirely by free, open-source tools. Get precise Vedic birth charts, chat with an AI astrologer, and use voice interaction — all running locally on your device.

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 + Vite + Tailwind CSS v4 |
| **Backend** | FastAPI (Python) |
| **Database / Auth** | Supabase (free tier) |
| **AI / LLM** | Ollama + llama3 (local) |
| **Astrology** | Kerykeion (Swiss Ephemeris) |
| **Voice** | Browser Web Speech API |
| **Geocoding** | Nominatim (OpenStreetMap) |

## Prerequisites

- **Node.js** 18+
- **Python** 3.10+
- **Ollama** installed with `llama3` pulled: `ollama pull llama3`
- A free **Supabase** project

---

## Getting Started

### 1. Clone & Setup

```bash
git clone <your-repo>
cd Vedix
```

### 2. Supabase Setup

1. Create a free project at https://supabase.com
2. Go to **SQL Editor** and run this schema:

```sql
-- profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- birth_details table
CREATE TABLE birth_details (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  birth_date DATE NOT NULL,
  birth_time TIME,
  birth_city TEXT NOT NULL,
  birth_lat FLOAT,
  birth_lng FLOAT,
  chart_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- chat_messages table
CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  role TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE birth_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage own birth details" ON birth_details FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own messages" ON chat_messages FOR ALL USING (auth.uid() = user_id);
```

3. Copy your **Project URL** and **API Keys** from Settings → API.

### 3. Backend Setup

```bash
cd backend

# Copy env file and fill in your Supabase credentials
cp .env.example .env
# Edit .env with your SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

# Create virtualenv and install deps
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Start backend
uvicorn app.main:app --reload --port 8000
```

### 4. Frontend Setup

```bash
cd frontend

# Copy env and fill in Supabase credentials
cp .env.example .env
# Edit .env with your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# Install deps (if not already done)
npm install

# Start dev server
npm run dev
```

### 5. Start Ollama (if not running)

```bash
ollama serve       # in one terminal
ollama run llama3  # in another, or leave existing session
```

---

## Running the App

Open 3 terminals:

| Terminal | Command | Port |
|---|---|---|
| 1 - Ollama | `ollama serve` | 11434 |
| 2 - Backend | `cd backend && uvicorn app.main:app --reload` | 8000 |
| 3 - Frontend | `cd frontend && npm run dev` | 5173 |

Then open **http://localhost:5173** in your browser (Chrome or Edge recommended for full voice support).

---

## Features

- 🔐 **Auth** — Supabase email/password signup & login
- 🌌 **Birth Chart** — Full Vedic (Sidereal/Lahiri) chart with all 10 planets + 12 houses
- 🎨 **Zodiac Wheel** — SVG natal wheel with element-colored sectors and planet positions
- 💬 **AI Chat** — Streaming responses from local llama3 via Ollama, with full chart context
- 🎙️ **Voice** — Speak your questions (SpeechRecognition) and hear answers (SpeechSynthesis)
- 🌍 **Geocoding** — Automatic lat/lng + timezone from Nominatim (OpenStreetMap)

## Project Structure

```
Vedix/
├── frontend/src/
│   ├── components/   CosmicBackground, Navbar, ChatInterface, BirthForm, etc.
│   ├── pages/        LandingPage, AuthPage, DashboardPage, ChartPage, ChatPage
│   ├── stores/       authStore, chartStore, chatStore (Zustand)
│   └── lib/          supabase.js, api.js
├── backend/app/
│   ├── routers/      chart.py, chat.py, auth.py
│   └── services/     astrology.py (Kerykeion), ollama.py, geocoding.py
└── README.md
```
