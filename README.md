# Avatar AI Demo — Алекс

AI-компаньон для букмекерской платформы BETARENA. Throwaway-демо ~10 минут на презентацию клиенту.

См. `docs/dev-task.md` (задание) и `docs/superpowers/specs/2026-04-23-avatar-ai-demo-design.md` (спека).

## Стек

| Слой | Выбор |
|---|---|
| Frontend | Next.js 15 (App Router, React 19, TypeScript) |
| Voice client (browser) | `@pipecat-ai/client-js` + `@pipecat-ai/client-react` + `@pipecat-ai/websocket-transport` |
| Backend | Python 3.12 + FastAPI + Pipecat 1.0 |
| LLM | Claude Sonnet 4.6 (`claude-sonnet-4-6`) |
| STT | Deepgram Nova-3 (`nova-3-general`, ru) |
| TTS | Cartesia Sonic-2 (русский голос, env `CARTESIA_VOICE_ID`) |
| Image gen (одноразово, 9 портретов) | OpenAI `gpt-image-1` (или Gemini Image при наличии billing) |
| Session state | In-memory `dict[session_id, SessionState]` в backend |
| Orchestration | docker-compose, 2 сервиса (frontend, backend) |
| Deploy | VPS через Coolify |

## Локальный запуск

1. Скопировать env: `cp .env.example .env` и заполнить:
   - `ANTHROPIC_API_KEY` — обязательно для текста и голоса
   - `DEEPGRAM_API_KEY`, `CARTESIA_API_KEY` — обязательно для голоса
   - (опционально) `CARTESIA_VOICE_ID` — id голоса Алекса (default — мужской русский)
2. `docker compose up --build`
3. Frontend: <http://localhost:3000> · Backend health: <http://localhost:8000/health>

Для разработки без Docker:

```bash
# backend
cd backend
uv venv .venv --python 3.12
uv pip install --python .venv/bin/python -e ".[voice,dev]"
PYTHONPATH=. .venv/bin/uvicorn app.main:app --reload

# frontend (в другом терминале)
cd frontend
npm install
npm run dev
```

## Endpoints

- `POST /api/session` — create or resume session (passes session id from cookie)
- `GET /api/session/{id}` — current SessionState
- `POST /api/chat` — text path, **SSE** streaming Claude tokens
- `POST /api/trigger` — admin presets and custom event
- `POST /api/inject` — inject reply as user message
- `GET /api/events?sessionId=...` — **SSE** stream of proactive events (state, ui hints, Alex deltas)
- `WS /ws/voice?sessionId=...` — Pipecat voice pipeline

## Генерация портретов (один раз)

```bash
# нужен OPENAI_API_KEY в env, он умеет gpt-image-1
.venv/bin/python scripts/generate_portraits.py
# регенерация одного-двух — без --force нельзя, скрипт идемпотентный по hash промпта
.venv/bin/python scripts/generate_portraits.py --only alex,max --force
```

PNG складываются в `frontend/public/characters/` и коммитятся.

## Тесты

```bash
cd backend && PYTHONPATH=. .venv/bin/pytest tests/ -v
cd frontend && npm run typecheck
```

## Deploy через Coolify

1. Coolify → New Resource → Docker Compose → подключить репо.
2. В UI «Environment Variables» прокинуть всё из `.env` (минимум):
   - `ANTHROPIC_API_KEY`
   - `DEEPGRAM_API_KEY`, `DEEPGRAM_MODEL`
   - `CARTESIA_API_KEY`, `CARTESIA_MODEL`, `CARTESIA_VOICE_ID`
   - `FRONTEND_ORIGIN` = ваш домен
   - `BACKEND_URL` = `https://<ваш-домен>` (или backend-subdomain)
   - `BACKEND_WS_URL` = `wss://<ваш-домен>` (тот же домен с wss)
3. Coolify сам выдаёт TLS через Let's Encrypt, упомянутый Traefik пробрасывает WebSocket из коробки. Никаких nginx/Caddy.
4. После первого деплоя — проверить:
   - <https://домен/> → BookmakerPage отдаёт матчи
   - <https://домен/health> → 200
   - DevTools → Network → WS → `wss://домен/ws/voice?sessionId=xxx` → **101 Switching Protocols**
   - DevTools → Network → SSE → `/api/chat` и `/api/events` → `text/event-stream`, чанки приходят live

Если WS режется — проверить что Coolify не выставил жёсткий `proxy_buffering` (Traefik по умолчанию ОК).

## Структура

```
igaming-avatar/
├─ docker-compose.yml
├─ data/                       — единый источник истины
│  ├─ demo-state.yaml          (матчи, игрок, бонусы, payload триггеров)
│  └─ characters.yaml          (9 архетипов + image prompts)
├─ scripts/
│  └─ generate_portraits.py    (одноразовая генерация 9 PNG)
├─ frontend/
│  ├─ scripts/gen_state.mjs    (yaml → ts, prebuild hook)
│  ├─ app/                     (Next App Router)
│  ├─ components/
│  │  ├─ BookmakerPage/
│  │  ├─ AlexWidget/
│  │  ├─ ChatView/
│  │  ├─ AdminView/
│  │  └─ CharacterGallery/
│  ├─ hooks/                   (useSession, useChat, useEvents, useAdmin, useVoice, useIsMobile)
│  ├─ lib/                     (api-client, sse, voice-client, types, generated demo-state.ts/characters.ts)
│  └─ public/characters/       (9 PNG портретов)
└─ backend/
   └─ app/
      ├─ main.py               (FastAPI, CORS, routers)
      ├─ config.py             (env)
      ├─ state.py              (SessionStore, SessionState)
      ├─ session_naming.py     (bright-fox)
      ├─ demo_state_loader.py  (yaml → pydantic)
      ├─ modes.py              (auto-shift)
      ├─ events.py             (handlers triggers/inject)
      ├─ proactive_bus.py      (per-session SSE queue)
      ├─ prompts/              (alex.py + persona/global_state/session_state/mode_addons)
      ├─ chat_api.py           (POST /api/chat SSE)
      ├─ session_api.py
      ├─ trigger_api.py        (/api/trigger /api/inject /api/events)
      ├─ voice_transport.py    (WS /ws/voice)
      ├─ pipeline.py           (Pipecat: Deepgram→Claude→Cartesia)
      └─ llm.py                (Anthropic SDK для text path)
```
