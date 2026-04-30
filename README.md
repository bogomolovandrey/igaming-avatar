# Avatar AI Demo — Алекс

AI-компаньон для букмекерской платформы **BETARENA**. Throwaway-демо ~10 минут на презентацию клиенту: живой Claude отвечает в характере, голосовой режим (Whisper STT → Claude → Gemini TTS), админ-триггеры (выигрыш / серия проигрышей / фрибет / галерея), Markdown в чате, мужской русский голос.

См. также:
- [`docs/dev-task.md`](docs/dev-task.md) — задание заказчика.
- [`docs/Avatar_AI_Demo_Scenario.docx.md`](docs/Avatar_AI_Demo_Scenario.docx.md) — целевой UX-сценарий, реплики Алекса дословно.
- [`docs/superpowers/specs/2026-04-23-avatar-ai-demo-design.md`](docs/superpowers/specs/2026-04-23-avatar-ai-demo-design.md) — исходная техническая спека.
- [`docs/backlog.md`](docs/backlog.md) — что сознательно отложено.

---

## Содержание

1. [Стек](#стек)
2. [Архитектура и data flow](#архитектура-и-data-flow)
3. [Локальный запуск](#локальный-запуск)
4. [Конфигурация (.env)](#конфигурация-env)
5. [Endpoints](#endpoints)
6. [Триггеры и режимы](#триггеры-и-режимы)
7. [System prompt](#system-prompt)
8. [Голосовой путь](#голосовой-путь)
9. [Источник данных (`demo-state.yaml`)](#источник-данных-demo-stateyaml)
10. [Галерея персонажей и генерация портретов](#галерея-персонажей-и-генерация-портретов)
11. [Структура репо](#структура-репо)
12. [Тесты](#тесты)
13. [Деплой через Coolify](#деплой-через-coolify)
14. [Известные ограничения](#известные-ограничения)

---

## Стек

| Слой | Выбор | Зачем именно так |
|---|---|---|
| Frontend framework | Next.js 15 (App Router, React 19, TS) | SSR, быстрая разработка, стандарт |
| LLM | **Claude Sonnet 4.6** (Anthropic SDK, SSE streaming) | Лучший русский, попадает в роль, держит mode-аддоны |
| STT | **OpenAI Whisper** (`whisper-1`, MediaRecorder в браузере → `/api/voice/stt`) | Качественный русский, без GCP service account |
| TTS | **Gemini Flash TTS** (`gemini-2.5-flash-preview-tts`, voice `Puck`) — primary; **Cartesia Sonic-2** (voice `Dmitri`) — fallback | Gemini даёт natural-language voice direction; Cartesia стабильна когда квота Gemini кончается |
| Image gen (одноразово, 9 портретов) | OpenAI `gpt-image-1` | На free-tier Gemini Image закрыт |
| Backend framework | Python 3.12 + FastAPI | Простота, async SSE/Streaming |
| Markdown в чате | `react-markdown` + `remark-gfm` | Чтобы `**жирный**` не показывался со звёздочками |
| Session state | In-memory `dict[session_id, SessionState]` в backend | Throwaway — restart на деплое норм |
| Транспорт | HTTPS · SSE · multipart upload (для STT) | Без WebSocket — Web Speech API не понадобился, MediaRecorder достаточен |
| Orchestration | docker-compose, 2 сервиса (`frontend`, `backend`) | Минимум |
| Deploy | VPS · Coolify (Caddy reverse proxy, TLS) | Coolify сам выдаёт сертификаты и роутит |

> Pipecat / Deepgram / WebSocket-pipeline были в первой итерации, потом удалены — текущая реализация лёгче (без torch, без service account JSON, backend image ~1.4 ГБ вместо 3 ГБ, startup мгновенный). Спека (§3) разрешала такой пивот.

---

## Архитектура и data flow

```
                            ┌──────────────────────────────────────┐
                            │  Browser (Next.js SPA)               │
                            │                                      │
                            │  · BookmakerPage (BETARENA backdrop) │
                            │  · AlexWidget (collapsed/expanded)   │
                            │  · ChatView · AdminView · Gallery    │
                            │  · MediaRecorder (push-to-talk)      │
                            └───┬─────────────────────────────┬────┘
                                │                             │
                       HTTPS    │                             │  HTTPS
            POST/SSE   ▼                                       ▼  multipart
        ┌───────────────────┐                       ┌───────────────────┐
        │ POST /api/chat    │                       │ POST /api/voice/  │
        │ POST /api/trigger │                       │      stt          │
        │ POST /api/inject  │                       │ POST /api/voice/  │
        │ GET  /api/events  │                       │      tts          │
        │ POST /api/session │                       │                   │
        └─────────┬─────────┘                       └─────────┬─────────┘
                  │                                           │
                  ▼                                           │
       ┌──────────────────────────────────────────────────────┴────────┐
       │  Backend (FastAPI)                                            │
       │                                                                │
       │  SessionStore  ──>  SessionState (mode, player, conversation,  │
       │                                   lastEvent)                   │
       │                                                                │
       │  build_alex_prompt()  ──>  Claude Sonnet 4.6 (SSE streaming)   │
       │                                                                │
       │  events.py  ──>  trigger handlers (мутируют state, шлют        │
       │                  proactive деltas в proactive_bus)             │
       │                                                                │
       │  proactive_bus  ──>  /api/events SSE                           │
       │                                                                │
       │  voice_api  ──>  Whisper (STT) | Gemini→Cartesia fallback (TTS)│
       └────────────────────────────────────────────────────────────────┘
                  │              │              │
                  ▼              ▼              ▼
            Anthropic       OpenAI         Gemini AI Studio
            (Claude)        (Whisper)      (TTS) — Cartesia
                                            (TTS fallback)
```

**Один браузер = одна сессия.** Admin — таб того же SPA, оперирует той же сессией. Никакой межустройственной синхронизации.

**Два пути диалога:**
- **Text path** — `POST /api/chat` (SSE). Юзер пишет → backend стримит токены → frontend рисует typing→message.
- **Voice path** — MediaRecorder в браузере записывает WebM → `POST /api/voice/stt` (Whisper) → текст → тот же `/api/chat` → ответ Claude → чанковый TTS по предложениям через `/api/voice/tts`.

**Proactive (триггеры/инжект):**
- Админ жмёт кнопку → `POST /api/trigger` → backend мутирует state, ставит `lastEvent`, переключает mode → asyncio запускает фоновый стрим Claude → деltas пушит в `proactive_bus` → каждый клиент держит открытый `GET /api/events?sessionId=...` SSE и получает их в чат.

---

## Локальный запуск

```bash
git clone https://github.com/bogomolovandrey/igaming-avatar.git
cd igaming-avatar
cp .env.example .env
# заполнить ANTHROPIC_API_KEY, OPENAI_API_KEY, GOOGLE_API_KEY, CARTESIA_API_KEY (см. ниже)
docker compose up --build
```

После старта:
- Frontend: http://localhost:${FRONTEND_PORT}
- Backend health: http://localhost:${BACKEND_PORT}/health

### Без Docker

```bash
# backend
cd backend
uv venv .venv --python 3.12
uv pip install --python .venv/bin/python -e ".[dev]"
PYTHONPATH=. .venv/bin/uvicorn app.main:app --reload

# frontend (в другом терминале)
cd frontend
npm install
npm run dev
```

---

## Конфигурация (`.env`)

```env
# ─── Порты (контейнерные = host-side, чтобы Coolify Caddy попадал) ───
FRONTEND_PORT=3000
BACKEND_PORT=8000

# ─── URLs (запекаются в JS-bundle на этапе build) ────────────────────
BACKEND_URL=http://localhost:8000          # для прода — https://<домен>
BACKEND_WS_URL=ws://localhost:8000         # сейчас не используется (WS убран),
                                            # оставлено на будущее
FRONTEND_ORIGIN=http://localhost:3000      # CORS allowlist на backend

# ─── Обязательные ключи ──────────────────────────────────────────────
ANTHROPIC_API_KEY=sk-ant-...               # Claude Sonnet 4.6, SSE streaming
OPENAI_API_KEY=sk-proj-...                 # Whisper STT + (одноразово) gpt-image-1
GOOGLE_API_KEY=AIza...                     # Gemini TTS (через AI Studio key)
CARTESIA_API_KEY=sk_car_...                # TTS fallback

# ─── Опциональные поведенческие настройки ────────────────────────────
GEMINI_VOICE=Puck                          # мужской: Puck/Charon/Fenrir/Orus/Iapetus
CARTESIA_VOICE_ID=888b7df4-...             # Dmitri (мужской русский) by default
TTS_MODEL=...                              # legacy
DEEPGRAM_API_KEY=...                       # не используется в текущей версии
```

Дефолты для голосов / моделей зашиты в [`backend/app/config.py`](backend/app/config.py) и [`backend/app/voice_api.py`](backend/app/voice_api.py); env'ом перезаписываются.

**Critical для прод-деплоя**: `BACKEND_URL` должен быть **публичным URL** backend'а (не `localhost`), потому что он запекается в `process.env.NEXT_PUBLIC_BACKEND_URL` на этапе `npm run build`.

---

## Endpoints

| Метод | Путь | Назначение |
|---|---|---|
| `POST` | `/api/session` | Create-or-resume сессии. Body: `{ sessionId? }` (из cookie). Возвращает `SessionState`. |
| `GET` | `/api/session/{id}` | Текущий `SessionState`. 404 если нет. |
| `POST` | `/api/chat` | Text path. SSE-стрим. Body: `{ sessionId, text }`. События: `delta` `{text}` → `done` `{mode}` или `error` `{message}`. |
| `POST` | `/api/trigger` | Admin trigger. Body: `{ sessionId, type, payload? }`. Возвращает 202 сразу; реакция Алекса прилетает по `/api/events`. |
| `POST` | `/api/inject` | Inject как user message. Body: `{ sessionId, text }`. То же поведение, что и user написал в чат, но через админку. |
| `GET` | `/api/events?sessionId=...` | Long-lived SSE для proactive событий. События: `state`, `ui`, `message-start`/`message-delta`/`message-done`, `user-message`, `message-error`. Heartbeat каждые 25с. |
| `POST` | `/api/voice/stt` | multipart upload (`file=...webm`). Прокси в OpenAI Whisper. Возвращает `{ text }`. |
| `POST` | `/api/voice/tts` | Body: `{ text }`. Primary — Gemini Flash TTS, fallback — Cartesia Sonic-2. Возвращает `audio/wav`. Header `X-TTS-Provider: gemini|cartesia` для отладки. |
| `GET` | `/health` | Liveness probe. |

---

## Триггеры и режимы

5 preset-триггеров + custom event + inject-message (см. [`backend/app/events.py`](backend/app/events.py)):

| Type | Mode после | Эффект на state | UI hint |
|---|---|---|---|
| `first_visit` | `onboarding` | full reset (`SessionStore.reset()`) | `reset` (фронт чистит messages, закрывает bubble) |
| `big_win` | `celebration` | `+payout` к balance, won-Bet | `celebration` (confetti, balance flash) |
| `loss_streak` | `rg_care` (sticky) | append N lost-Bets | `rg_care_enter` (RG warm-glow вокруг виджета) |
| `freebet_expiring` | `bonus_nudge` | bonus в `activeBonuses` | `freebet_nudge` (FREEBET-badge в header) |
| `show_gallery` | без изменений | без мутаций | `open_gallery` (модалка с 9 персонажами) |
| `custom` | по выбору админа | без мутаций | — |

**Auto-shift** (см. [`backend/app/modes.py`](backend/app/modes.py), правила из спеки §6.5):
- `onboarding` → `normal` после 1 user-turn
- `celebration` → `normal` после 2 user-turn
- `bonus_nudge` → `normal` после 1 user-turn
- `rg_care` — **sticky**, сбрасывается только явным `first_visit`

Backend — единственный источник истины по mode (LLM его не переключает); счёт user-turn'ов идёт от `session.modeEnteredAt`.

---

## System prompt

Сборка через [`build_alex_prompt(session)`](backend/app/prompts/alex.py) — 5 слоёв в одном string'е, передаётся как `system=...` параметр Anthropic API. Conversation history идёт отдельно как `messages=[...]`, последние 20 user+assistant пар.

```
# PERSONA              persona.py    — кто такой Алекс, тон, hard-guardrails,
                                       обработка [trigger]-маркеров
# GLOBAL STATE         global_state  — <matches/> со всех yaml-матчей и <offers/>
# SESSION STATE        session_state — <player .../> + <mode>
# MODE                 mode_addons   — addon под текущий mode
                                       (onboarding/normal/celebration/rg_care/bonus_nudge)
                                       с few-shot примерами из сценария
# LAST EVENT           session_state — <event type=... at=.../> если есть
                                       + явная инструкция «реагируй как на сейчас»
```

**Защита от ложного срабатывания на технические user-сообщения:** для proactive (трригерных) вызовов в `messages` добавляется `[trigger]` как user message. В `persona.py` явно сказано игнорировать такие маркеры и реагировать на `LAST_EVENT`. Это исправление пришло после того, как Алекс на триггер отвечал «это не системная команда, так не работает 😄».

---

## Голосовой путь

```
mousedown ── getUserMedia ── MediaRecorder.start() ─┐
                                                    │ chunks
mouseup ── MediaRecorder.stop() ─── Blob (webm) ────┤
                                                    ▼
                              POST /api/voice/stt (multipart)
                                                    │
                              OpenAI Whisper (`whisper-1`, ru)
                                                    │
                                                  text
                                                    │
                                                  chat.send(text)
                                                    │
                              POST /api/chat (SSE)
                                                    │
                                          delta → buffer → SentenceStreamer
                                                    │
                                          on each sentence:
                                          POST /api/voice/tts ──> Gemini → wav blob
                                                    │
                                          AudioQueue.enqueue(blob)
                                                    │
                                          new Audio(url).play()
```

Ключевое — **чанковый TTS**: фронт делит ответ Claude на предложения (см. [`frontend/lib/sentence-streamer.ts`](frontend/lib/sentence-streamer.ts)) и по мере прихода кидает их в `/api/voice/tts`. Каждый аудио-blob кладётся в очередь; пока играет один, следующий уже фечится. Из-за этого первая фраза начинает звучать через ~0.5–1с после начала генерации, а не после её конца. Markdown (`**`, `*`, `#`, эмодзи, backticks) чистится перед отправкой в TTS — иначе озвучивается буквально.

**Push-to-talk vs send button:** в input-поле, как только юзер пишет хоть один символ, mic-кнопка превращается в paper-plane (отправить). Mic виден только когда поле пустое.

---

## Источник данных (`demo-state.yaml`)

Один YAML-файл [`data/demo-state.yaml`](data/demo-state.yaml) — единственный источник истины. Парсится:
- backend'ом → [`demo_state_loader.py`](backend/app/demo_state_loader.py) (pydantic)
- frontend'ом → [`frontend/scripts/gen_state.mjs`](frontend/scripts/gen_state.mjs) генерит `frontend/lib/demo-state.ts` (`predev`/`prebuild` хук в `package.json`)

Содержит: `matches[]` (12 матчей по 7 лигам с extendedLines и analystNote), `leagues[]` (sidebar), `player_template` (Дима, $840, loginCount=1), `bonus_catalog` (freebet $10), `trigger_presets` (дефолтные payload'ы для admin-кнопок).

Поменять матчи — отредактировать YAML, перезапустить — стейт меняется и в LLM-контексте, и на BookmakerPage.

---

## Галерея персонажей и генерация портретов

[`data/characters.yaml`](data/characters.yaml) — 9 архетипов (Алекс активен, остальные «Coming soon»), каждый с `imagePrompt` для генерации.

```bash
# Сгенерить все портреты (запускается один раз, PNG коммитятся)
GOOGLE_API_KEY=… OPENAI_API_KEY=… python3 scripts/generate_portraits.py

# Регенерация одного-двух
python3 scripts/generate_portraits.py --only alex,max --force
```

Скрипт идемпотентный: пишет hash промпта в `frontend/public/characters/.generated-lock`, перегенерирует только если промпт сменился (или `--force`). По умолчанию провайдер — OpenAI `gpt-image-1`; Gemini Image API можно использовать только с включённым billing на Google Cloud project.

---

## Структура репо

```
igaming-avatar/
├─ docker-compose.yml          — 2 сервиса, порты строго из .env
├─ .env.example
├─ data/                       — единый источник истины
│  ├─ demo-state.yaml          (матчи, игрок, бонусы, payload'ы триггеров)
│  └─ characters.yaml          (9 архетипов + image prompts)
├─ scripts/
│  └─ generate_portraits.py    (одноразовая генерация 9 PNG: OpenAI/Gemini)
├─ frontend/
│  ├─ Dockerfile               — multi-stage Node 22-alpine
│  ├─ scripts/gen_state.mjs    — yaml → ts (predev/prebuild hook)
│  ├─ app/                     — Next App Router (page.tsx, layout.tsx, globals.css)
│  ├─ components/
│  │  ├─ BookmakerPage/        — Header, LeagueSidebar, Feed, MatchCard, RightRail,
│  │  │                          BackdropMobile, SessionChip
│  │  ├─ AlexWidget/           — AlexAvatar, CollapsedWidget, SpeechBubble,
│  │  │                          DesktopWidget, MobileWidget, WidgetHeader,
│  │  │                          WidgetTabs, InputBar, index.tsx (AppShell)
│  │  ├─ ChatView/             — ChatView, ChatMessage (Markdown), TypingIndicator,
│  │  │                          MarkdownText
│  │  ├─ AdminView/            — AdminView, AdminBlock, TriggerIcon
│  │  ├─ CharacterGallery/     — Gallery, CharCard
│  │  ├─ Confetti.tsx
│  │  └─ effects/
│  ├─ hooks/
│  │  ├─ useSession.ts         — POST /api/session, cookie-persist
│  │  ├─ useChat.ts            — POST /api/chat (SSE)
│  │  ├─ useEvents.ts          — GET /api/events (SSE) для proactive
│  │  ├─ useAdmin.ts           — POST /api/trigger, /api/inject
│  │  ├─ useVoice.ts           — MediaRecorder + Whisper STT + TTS audio queue
│  │  └─ useIsMobile.ts
│  ├─ lib/
│  │  ├─ api-client.ts         — BACKEND_URL, fetch helpers
│  │  ├─ sse.ts                — поточный парсер SSE (CRLF-safe)
│  │  ├─ sentence-streamer.ts  — режет LLM-ответ на чанки для TTS
│  │  ├─ format.ts             — sportTag, timeOfDay, formatBalance
│  │  ├─ cookies.ts            — read/write SameSite=Lax
│  │  ├─ types.ts              — TS-типы зеркало backend pydantic
│  │  ├─ demo-state.ts         — generated, gitignored
│  │  └─ characters.ts         — generated, gitignored
│  └─ public/characters/       — 9 PNG портретов (committed)
└─ backend/
   ├─ Dockerfile               — python:3.12-slim, без Pipecat/torch
   ├─ pyproject.toml
   └─ app/
      ├─ main.py               — FastAPI, CORS, routers
      ├─ config.py             — Settings (env)
      ├─ session_naming.py     — bright-fox генератор
      ├─ state.py              — SessionStore, SessionState, set_mode
      ├─ demo_state_loader.py  — yaml → pydantic
      ├─ modes.py              — auto-shift по §6.5
      ├─ events.py             — handlers: big_win, loss_streak, freebet_expiring,
      │                          first_visit, show_gallery, custom; inject; proactive stream
      ├─ proactive_bus.py      — per-session asyncio.Queue с heartbeat
      ├─ prompts/
      │  ├─ alex.py            — build_alex_prompt(session)
      │  ├─ persona.py         — BASE_PERSONA + hard guardrails
      │  ├─ global_state.py    — <matches/> + <offers/> render
      │  ├─ session_state.py   — <player/> + <mode> + <event/>
      │  └─ mode_addons.py     — 5 mode addon с few-shot из сценария
      ├─ chat_api.py           — POST /api/chat SSE
      ├─ session_api.py        — POST/GET /api/session
      ├─ trigger_api.py        — POST /api/trigger, /api/inject; GET /api/events
      ├─ voice_api.py          — POST /api/voice/tts (Gemini→Cartesia), /api/voice/stt (Whisper)
      ├─ llm.py                — Anthropic AsyncAnthropic stream wrapper
      └─ tests/                — pytest (test_prompts, test_modes, test_session_store, test_state_loader)
```

---

## Тесты

```bash
# Backend (pydantic-валидация yaml + промпты + auto-shift mode + session store)
cd backend
PYTHONPATH=. .venv/bin/pytest tests/ -v

# Frontend (TS strict)
cd frontend
npm run typecheck
```

15 backend-тестов на момент initial commit. Тесты не вызывают внешние API (Anthropic / OpenAI / Gemini / Cartesia) — только локальная логика.

---

## Деплой через Coolify

1. Coolify → New Resource → Docker Compose → подключить репо.
2. **Environment Variables** в Coolify UI:
   ```
   FRONTEND_PORT=3000
   BACKEND_PORT=8000

   # Публичные URL — bake'ятся в JS bundle при build
   BACKEND_URL=https://<твой-backend-домен>
   BACKEND_WS_URL=wss://<твой-backend-домен>
   FRONTEND_ORIGIN=https://<твой-frontend-домен>

   # Ключи
   ANTHROPIC_API_KEY=sk-ant-...
   OPENAI_API_KEY=sk-proj-...
   GOOGLE_API_KEY=AIza...
   CARTESIA_API_KEY=sk_car_...
   GEMINI_VOICE=Puck
   ```
3. Coolify сам выдаст TLS через Let's Encrypt; за proxy у него Caddy. Никаких nginx/Caddy в `docker-compose.yml`.
4. **Force rebuild** при изменении `BACKEND_URL` — иначе старый URL остаётся запечён.
5. Smoke после деплоя:
   - `https://домен/` → BookmakerPage с матчами
   - `https://backend-домен/health` → `{"status":"ok"}`
   - DevTools → Network → `/api/chat` → `text/event-stream`, чанки идут live
   - DevTools → Network → `/api/voice/tts` → `audio/wav` ~3-5с

**Известный gotcha:** docker-compose `ports:` в формате `"HOST:CONTAINER"` Coolify читает как **target port для своего Caddy upstream**. Поэтому в этом репо `ports: ["${FRONTEND_PORT}:${FRONTEND_PORT}"]` — внутри контейнера и снаружи **одно и то же** значение, иначе Caddy шлёт трафик не туда (получишь 502).

---

## Известные ограничения

- **Throwaway-демо** — in-memory сессии (рестарт backend = всё забыто). DB/Redis намеренно не подключали.
- **Один процесс backend** — горизонтально не масштабируется (proactive_bus в памяти процесса). Для прода — Redis pub/sub или похожее.
- **Видеоаватар (Блок 4 сценария) не реализован** — отложен в [`docs/backlog.md`](docs/backlog.md).
- **Нет Pipecat/WebSocket** — был на ранней итерации, удалён в пользу REST + Whisper. Если понадобятся interim transcripts на лету или sub-секундная latency на голос — возвращаем Pipecat обратно.
- **Mobile Safari** — Whisper-путь работает (MediaRecorder поддержан с iOS 14+), но `audio/play()` на странице может потребовать первого user gesture; первое нажатие mic как раз даёт.
- **Бесплатные tier'ы лимитированы**: Gemini Flash TTS preview имеет дневную квоту — при 429 авто-переключение на Cartesia.

---

## Лицензия

Throwaway internal project. Без лицензии.
