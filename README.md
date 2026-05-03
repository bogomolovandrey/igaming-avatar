# Avatar AI Demo — Алекс

> Веб-виджет AI-компаньона «Алекс» поверх букмекерской платформы. Throwaway-демо для презентации B2B-клиенту: ~10 минут живого диалога с реальным Claude (текстом и голосом), нативные триггерные события (выигрыш, серия проигрышей, фрибеты), Responsible Gambling-режим. **Не очередной чат-бот поддержки** — персонаж с характером, тоном и мнениями.

---

## О чём проект и зачем

**Продукт:** Avatar AI — AI-компаньон, который операторы iGaming-платформ встраивают как виджет поверх своего сайта. Демо показывает одного готового персонажа (Алекса) на буровой страничке вымышленного букмекера BETARENA — этого достаточно, чтобы потенциальный клиент понял, как продукт встроится в его собственный фронт.

**Кому показываем:** продуктовым / маркетинговым лидам букмекерских и казино-операторов, которые ищут способ повысить retention и одновременно закрыть требования регуляторов по Responsible Gambling.

**Какую бизнес-ценность демонстрирует демо:**

| Блок сценария | Бизнес-задача | Что видит клиент |
|---|---|---|
| **1. Онбординг и знакомство** | Конверсия в первое взаимодействие | Живой персонаж с характером, не FAQ-бот: «О, привет 👋 Наконец-то кто-то новенький». Знакомится по имени, рассказывает кто он. |
| **2. Аналитика ставок** | Retention через утилитарность | Алекс не просто выдаёт коэффициенты на Эль-Класико — добавляет логику («обе забьют — в 5 из 6 встреч») и своё мнение. |
| **3. Триггерные события + RG-психолог** | Retention + compliance + нативная монетизация | На крупном выигрыше — разделяет радость; на серии проигрышей — переключается в режим заботы (никаких рекомендаций ставок, эмпатия, «давай завтра на свежую голову»); на фрибете — мягко напоминает в контексте. RG-логи можно предъявить UKGC/MGA. |
| **4. Видеоаватар + smalltalk** | Wow-эффект и дифференциация | Anam live-видеоаватар озвучивает ответы Алекса лицом и голосом, а чат параллельно дублирует реплики текстом. |

**Главное продуктовое отличие** — три уровня одной интеракции в одном виджете:
1. **Персонаж** (эмоциональная связь, тон друга) —
2. **Эксперт** (аналитика и нативные рекомендации) —
3. **Compliance-инструмент** (RG-режим как факт ответственного отношения к игроку, который оператор показывает регулятору).

## Требования и принципы

Из [`docs/dev-task.md`](docs/dev-task.md) и [спеки](docs/superpowers/specs/2026-04-23-avatar-ai-demo-design.md) — то, что **обязательно** в демо:

- **Всё работает реально, не заскриптовано.** Алекс отвечает на произвольные вопросы клиента живой LLM, не выученными ответами.
- **Текст, голос и видео.** Текстовый чат — стриминг токенов; голосовой — push-to-talk fallback; видеоаватар — Anam WebRTC video + voice rendering с текстовым дублем в чате.
- **Триггеры запускаются вручную** через скрытую панель админа (имитация интеграции с CRM оператора).
- **Один виджет, один сценарий, две платформы:** desktop (sidebar 400px) + mobile (fullscreen). iOS Safari + Android Chrome обязательны.
- **Длительность демо 8–10 минут**, ~2.5с end-to-end задержка на голос как цель.
- **Алекс держит характер** даже на провокациях («ты AI?» — «Да, AI, но для тебя — Алекс»), но не врёт. В RG-режиме никаких ставочных рекомендаций.
- **Throwaway-кодовая база.** Архитектурные shortcut'ы (in-memory state, без DB/MQ/Redis) — сознательные. После показа продакшн-версия пишется заново.

**Out of scope** (см. [`docs/backlog.md`](docs/backlog.md)):
- Реальная интеграция с CRM, кассой, live-коэффициентами оператора.
- Multi-user / межустройственная синхронизация — один браузер = одна сессия.
- Светлая тема, мультиязычность.

## Где какая информация

| Файл | Что там |
|---|---|
| [`docs/dev-task.md`](docs/dev-task.md) | Задание заказчика разработчику: что делаем, в каком стеке, в каком порядке. |
| [`docs/Avatar_AI_Demo_Scenario.docx.md`](docs/Avatar_AI_Demo_Scenario.docx.md) | **Главный продуктовый артефакт** — пошаговый сценарий 10-минутной демонстрации с дословными репликами Алекса по всем 4 блокам. Используется как референс для калибровки промптов. |
| [`docs/design-brief.md`](docs/design-brief.md) | Дизайн-бриф: палитра (dark + gold), типографика (Manrope + JetBrains Mono), layout (desktop 400px sidebar / mobile fullscreen), список 9 архетипов компаньонов. |
| [`docs/superpowers/specs/2026-04-23-avatar-ai-demo-design.md`](docs/superpowers/specs/2026-04-23-avatar-ai-demo-design.md) | Исходная техническая спека (стек, API, модель данных, prompt-стратегия, sequence сборки, DoD). Точный стек со временем менялся — текущее состояние ниже в этом README. |
| [`docs/backlog.md`](docs/backlog.md) | Что сознательно отложили (live-коэффициенты, продовая CRM-интеграция, и т.д.). |
| [`docs/design/iGaming-avatar/`](docs/design/iGaming-avatar/) | Интерактивный React-прототип от дизайнера (HTML + Babel-standalone). Источник CSS-токенов и keyframe-анимаций; компоненты переписаны в TS в `frontend/components/`. |
| Этот README | Технические детали: стек, архитектура, endpoints, как запускать, как деплоить. |

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
9. [Видеоаватарный путь](#видеоаватарный-путь)
10. [Источник данных (`demo-state.yaml`)](#источник-данных-demo-stateyaml)
11. [Галерея персонажей и генерация портретов](#галерея-персонажей-и-генерация-портретов)
12. [Структура репо](#структура-репо)
13. [Тесты](#тесты)
14. [Деплой через Coolify](#деплой-через-coolify)
15. [Известные ограничения](#известные-ограничения)

---

## Стек

| Слой | Выбор | Зачем именно так |
|---|---|---|
| Frontend framework | Next.js 15 (App Router, React 19, TS) | SSR, быстрая разработка, стандарт |
| LLM | **Claude Sonnet 4.6** (Anthropic SDK, SSE streaming) | Лучший русский, попадает в роль, держит mode-аддоны |
| STT | **OpenAI Whisper** (`whisper-1`, MediaRecorder в браузере → `/api/voice/stt`) | Качественный русский, без GCP service account |
| TTS | **Gemini Flash TTS** (`gemini-2.5-flash-preview-tts`, voice `Puck`) — primary; **Cartesia Sonic-2** (voice `Dmitri`) — fallback | Gemini даёт natural-language voice direction; Cartesia стабильна когда квота Gemini кончается |
| Video avatar | **Anam AI JS SDK** (`CUSTOMER_CLIENT_V1`, WebRTC, `createTalkMessageStream`) | Сохраняем текущий Claude/prompt/триггеры, а Anam отвечает за live video + voice rendering |
| Image gen (одноразово, 9 портретов) | OpenAI `gpt-image-1` | На free-tier Gemini Image закрыт |
| Backend framework | Python 3.12 + FastAPI | Простота, async SSE/Streaming |
| Markdown в чате | `react-markdown` + `remark-gfm` | Чтобы `**жирный**` не показывался со звёздочками |
| Session state | In-memory `dict[session_id, SessionState]` в backend | Throwaway — restart на деплое норм |
| Транспорт | HTTPS · SSE · multipart upload (для classic voice) · Anam WebRTC | Триггеры и LLM-текст идут через backend SSE, live-видео и озвучка — через Anam SDK |
| Orchestration | docker-compose, 2 сервиса (`frontend`, `backend`) | Минимум |
| Deploy | VPS · Coolify (Caddy reverse proxy, TLS) | Coolify сам выдаёт сертификаты и роутит |

> Pipecat / Daily / WebSocket-pipeline были в ранних итерациях, потом удалены — текущая реализация легче: classic voice идёт через REST, видеоаватар через Anam SDK.

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
- **Video path** — `POST /api/anam/session-token` выдаёт короткий Anam token, frontend стартует Anam SDK с `disableInputAudio: true`, показывает только наш `<video>` и стримит Claude-delta в `createTalkMessageStream()`.

**Proactive (триггеры/инжект):**
- Админ жмёт кнопку → `POST /api/trigger` → backend мутирует state, ставит `lastEvent`, переключает mode.
- Backend запускает фоновый стрим Claude → deltas пушит в `proactive_bus` → frontend получает их по `GET /api/events?sessionId=...`.
- Если Anam подключён, frontend прерывает текущую речь через `interruptPersona()` и параллельно стримит те же deltas в Anam talk stream; classic TTS при этом не запускается.

---

## Локальный запуск

```bash
git clone https://github.com/bogomolovandrey/igaming-avatar.git
cd igaming-avatar
cp .env.example .env
# заполнить ANTHROPIC_API_KEY, OPENAI_API_KEY, GOOGLE_API_KEY, CARTESIA_API_KEY
# для видеоаватара также ANAM_API_KEY, ANAM_AVATAR_ID, ANAM_VOICE_ID
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

# ─── Anam live video avatar ────────────────────────────────────────
ANAM_API_KEY=...                           # backend proxy; в браузер не попадает
ANAM_AVATAR_ID=...                         # avatar из Anam Lab
ANAM_VOICE_ID=...                          # русский voice из Anam Lab
ANAM_LANGUAGE_CODE=ru                      # STT language для non-English sessions
ANAM_LLM_ID=CUSTOMER_CLIENT_V1             # Anam только озвучивает наш LLM stream
ANAM_MAX_SESSION_SECONDS=600

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
| `POST` | `/api/trigger` | Admin trigger. Body: `{ sessionId, type, payload?, delivery? }`, где `delivery=classic|video|both`; legacy `tavus` принимается как alias. Возвращает 202 сразу; реакция Алекса прилетает по `/api/events`. |
| `POST` | `/api/inject` | Inject как user message. Body: `{ sessionId, text }`. То же поведение, что и user написал в чат, но через админку. |
| `GET` | `/api/events?sessionId=...` | Long-lived SSE для proactive событий. События: `state`, `ui`, `message-start`/`message-delta`/`message-done`, `user-message`, `message-error`. Heartbeat каждые 25с. |
| `POST` | `/api/voice/stt` | multipart upload (`file=...webm`). Прокси в OpenAI Whisper. Возвращает `{ text }`. |
| `POST` | `/api/voice/tts` | Body: `{ text }`. Primary — Gemini Flash TTS, fallback — Cartesia Sonic-2. Возвращает `audio/wav`. Header `X-TTS-Provider: gemini|cartesia` для отладки. |
| `POST` | `/api/anam/session-token` | Создаёт short-lived Anam session token для текущей сессии. Body: `{ sessionId }`. Требует `ANAM_API_KEY`, `ANAM_AVATAR_ID`, `ANAM_VOICE_ID`. |
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

Когда видеоаватар подключён, frontend отправляет `delivery=video`: state/UI hint остаются на backend, Claude-ответ стримится обычными SSE-событиями, а frontend параллельно отдаёт эти же deltas в Anam `TalkMessageStream`.

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

## Видеоаватарный путь

Latency-first v1 использует Anam как video/voice rendering layer, а не как отдельный мозг:

1. При открытии chat tab frontend автоматически вызывает `POST /api/anam/session-token`.
2. Backend создаёт Anam session token с `llmId=CUSTOMER_CLIENT_V1` и `languageCode=ru`.
3. Frontend создаёт Anam client с `disableInputAudio: true` и запускает `streamToVideoElement()` в наш `<video>`.
4. Пользователь пишет текст; `/api/chat` стримит Claude deltas; frontend одновременно показывает текст и отправляет чанки в `createTalkMessageStream()`.
5. Admin trigger идёт через `/api/trigger` и `/api/events`; если Anam онлайн, frontend вызывает `interruptPersona()` и озвучивает новый proactive stream.

Classic text/voice path не удалён: если Anam не подключён или ключи не заданы, виджет работает как раньше через Claude + Whisper + TTS.

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
│  │  │                          WidgetTabs, InputBar, AnamAvatarPanel,
│  │  │                          index.tsx (AppShell)
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
│  │  ├─ useAnamAvatar.ts      — Anam SDK session + talk stream queue
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
      ├─ anam_api.py           — backend proxy for Anam session-token
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
npm run build
```

Backend-тесты не вызывают внешние API (Anthropic / OpenAI / Gemini / Cartesia / Anam) — только локальная логика и mocked HTTP-клиенты.

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

   # Anam video avatar
   ANAM_API_KEY=...
   ANAM_AVATAR_ID=...
   ANAM_VOICE_ID=...              # русский voice id из Anam Lab
   ANAM_LANGUAGE_CODE=ru
   ANAM_LLM_ID=CUSTOMER_CLIENT_V1
   ANAM_MAX_SESSION_SECONDS=600
   ```
3. Coolify сам выдаст TLS через Let's Encrypt; за proxy у него Caddy. Никаких nginx/Caddy в `docker-compose.yml`.
4. **Force rebuild** при изменении `BACKEND_URL` — иначе старый URL остаётся запечён.
5. Smoke после деплоя:
   - `https://домен/` → BookmakerPage с матчами
   - `https://backend-домен/health` → `{"status":"ok"}`
   - DevTools → Network → `/api/chat` → `text/event-stream`, чанки идут live
   - DevTools → Network → `/api/voice/tts` → `audio/wav` ~3-5с
   - В виджете → открыть чат → Anam `<video>` подключается через `/api/anam/session-token`, admin trigger звучит через Anam и появляется текстом в чате

**Известный gotcha:** docker-compose `ports:` в формате `"HOST:CONTAINER"` Coolify читает как **target port для своего Caddy upstream**. Поэтому в этом репо `ports: ["${FRONTEND_PORT}:${FRONTEND_PORT}"]` — внутри контейнера и снаружи **одно и то же** значение, иначе Caddy шлёт трафик не туда (получишь 502).

---

## Известные ограничения

- **Throwaway-демо** — in-memory сессии (рестарт backend = всё забыто). DB/Redis намеренно не подключали.
- **Один процесс backend** — горизонтально не масштабируется (proactive_bus в памяти процесса). Для прода — Redis pub/sub или похожее.
- **Anam-сессия расходует usage после старта stream** — при закрытии/размонтаже виджета frontend вызывает `stopStreaming()`.
- **Русский голос выбирается в Anam Lab** — без `ANAM_VOICE_ID` backend вернёт 503, чтобы не стартовать демо с неподходящим голосом.
- **Нет Pipecat/WebSocket для classic voice** — был на ранней итерации, удалён в пользу REST + Whisper. Низкая latency видео закрывается Anam talk streaming; classic voice остаётся fallback.
- **Mobile Safari** — Whisper-путь работает (MediaRecorder поддержан с iOS 14+), но `audio/play()` на странице может потребовать первого user gesture; первое нажатие mic как раз даёт.
- **Бесплатные tier'ы лимитированы**: Gemini Flash TTS preview имеет дневную квоту — при 429 авто-переключение на Cartesia.

---

## Лицензия

Throwaway internal project. Без лицензии.
