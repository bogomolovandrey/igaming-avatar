# Avatar AI Demo — Design Document

**Дата:** 2026-04-23
**Статус:** утверждён брейнстормом, готов к имплементации
**Сценарий показа:** `docs/Avatar_AI_Demo_Scenario.docx.md`
**Отложенное:** `docs/backlog.md`

---

## 1. Цель и scope

Throwaway демо-версия AI-компаньона Алекса для букмекерской платформы. Показывается потенциальному клиенту (~10-минутная демонстрация) с четырьмя блоками по сценарию: онбординг, аналитика ставок, триггерные события + RG, видеоаватар.

**В scope MVP:**
- Живой текстовый и голосовой диалог с Claude Sonnet 4.6
- Речь распознаётся реально (Google Chirp 3), аватар говорит реально (Gemini 3.1 Flash TTS)
- Ответы на произвольные вопросы клиента — не on-rails
- Статичная букмекерская «фоновая страница» с матчами и коэффициентами из сценария
- Админ-панель в той же вкладке для ручного запуска триггерных событий
- 9 персонажей (Алекс активен, 8 — «Coming soon»)
- Responsive UI: работает на мобильном и десктопе
- Deploy docker-compose на VPS через Coolify

**Out of scope (в `docs/backlog.md`):**
- Видеоаватар (Блок 4 демо) — текст + аудио только
- Динамическое обновление коэффициентов / live-scoring — статичный стейт
- Реальная интеграция с CRM / платёжным бэкендом букмекера
- Межустройственная синхронизация сессий — один браузер = одна сессия, admin в той же вкладке
- gpt-image-2 через API (портреты генерятся 1 раз вручную через веб-интерфейс или Nano Banana 2)
- Prompt caching для Claude (добавим если латенси потребует)

## 2. Судьба кодовой базы

Одноразовая демка. Код служит цели убедительной презентации и после успешного показа, скорее всего, переписывается с нуля под продакшн. Архитектурные shortcut'ы (in-memory стейт, два сервиса без message queue, без БД) — сознательные.

## 3. Финальный стек

| Слой | Выбор | Обоснование |
|---|---|---|
| Frontend framework | Next.js 15 (App Router, TypeScript, React 19) | Стандарт, быстрая разработка, SSR для главной |
| Frontend voice client | `@pipecat-ai/client-web` + `@pipecat-ai/client-react` | Нативный клиент Pipecat, обёртки над WebSocket/WebRTC |
| Backend framework | Python 3.12 + FastAPI | Требование Pipecat (Python-only) |
| Voice orchestration | Pipecat | Out-of-the-box: VAD, chunking, interruption, streaming |
| LLM | Claude Sonnet 4.6 (`claude-sonnet-4-6`) через `AnthropicLLMService` | Лучший персонаж на русском, нюанс эмпатии в RG |
| STT | Google Chirp 3 (`chirp_3`, `ru-RU`, streaming) через `GoogleSTTService` | State-of-art на русском, GA, диаризация и denoiser |
| TTS | Gemini 3.1 Flash TTS (`gemini-3.1-flash-tts-preview`) через `GeminiTTSService` | Audio tags, natural language voice direction |
| Image generation | Gemini 3.1 Flash Image / Nano Banana 2 (`gemini-3.1-flash-image-preview`) | Один раз для 9 портретов, статические файлы |
| Session state | In-memory `dict[session_id, SessionState]` в backend | Throwaway, restart на деплое — допустимо |
| Frontend-backend transport | HTTPS + WebSocket (для voice pipeline) | Стандарт Pipecat |
| Orchestration | docker-compose, 2 сервиса (frontend, backend) | Минимум |
| Deploy | VPS через Coolify | Coolify самостоятельно рулит reverse proxy, HTTPS, доменами |
| Frontend design | `frontend-design:frontend-design` skill на этапе имплементации | Требование пользователя |

## 4. Архитектура

### 4.1 Сервисы

```
┌─────────────────────┐         ┌──────────────────────┐
│      Browser        │──WS────▶│  backend:8000        │
│                     │         │  FastAPI + Pipecat   │
│   Next.js SPA       │◀─HTTP──│                      │
└──────────┬──────────┘         └──────────┬───────────┘
           │                                │
           │                                ├─▶ Anthropic API (Claude)
           │    ┌──────────────────┐        ├─▶ Google STT (Chirp 3)
           └───▶│  frontend:3000   │        └─▶ Google TTS (Gemini 3.1 Flash TTS)
                │  Next.js SSR     │
                └──────────────────┘

     Coolify управляет доменами, TLS, роутингом извне
```

### 4.2 docker-compose

```yaml
services:
  frontend:
    build: ./frontend
    environment:
      - NEXT_PUBLIC_BACKEND_URL=${BACKEND_URL}
      - NEXT_PUBLIC_WS_URL=${BACKEND_WS_URL}
    ports:
      - "3000"
    restart: unless-stopped

  backend:
    build: ./backend
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - GOOGLE_APPLICATION_CREDENTIALS=/secrets/gcp.json
      - FRONTEND_ORIGIN=${FRONTEND_ORIGIN}
    volumes:
      - ./secrets/gcp.json:/secrets/gcp.json:ro
    ports:
      - "8000"
    restart: unless-stopped
```

Секреты Anthropic и GCP — через env / bind-mounted файл. В Coolify прокидываются через его UI.

### 4.3 Сессии

- Сессия создаётся backend'ом по первому заходу на главную. ID — читаемая пара слов (`bright-fox`, генерим из встроенного словаря прилагательных и животных).
- Session ID сохраняется в cookie браузера на 24 часа. При возврате — та же сессия, если жива в памяти.
- Session ID видно в UI как мелкий чип в углу страницы — для ведущего на демо.
- Один браузер = одна сессия. Admin-панель — отдельный tab-view внутри того же SPA, оперирует той же сессией. Никаких WebSocket-sync между устройствами.

### 4.4 Два пути взаимодействия

**Voice path:**
- Браузер → Pipecat client (WebSocket) → backend
- Backend при открытии WS конструирует Pipeline для этой сессии (STT → LLM → TTS).
- Ввод: mic audio frames. Вывод: TTS audio frames + текстовые события (transcripts, assistant messages).
- Админ-триггеры во время voice — инжектятся как system-frames, LLM реагирует, TTS озвучивает.

**Text path:**
- Браузер → `POST /api/chat` (SSE ответ)
- Backend напрямую вызывает Anthropic SDK (не через Pipecat), тот же system prompt, та же session state, тот же conversation history.
- Стриминг токенов через Server-Sent Events.

Оба пути пишут в один `conversation: list[Message]` в SessionState — history унифицирована.

**Взаимодействие двух путей:**
- Когда у пользователя открыт voice WebSocket — активен voice-канал, все реплики Алекса идут через TTS + текст в чате.
- Когда voice WS закрыт (отключён микрофон / fallback / пользователь просто печатает) — только текст.
- Voice WS открывается автоматически при первом long-press mic-кнопки и держится до закрытия виджета; текстовые сообщения при открытом voice отправляются через тот же WS (как текст-frame) и так же озвучиваются.
- Proactive реплики при открытом voice — голос + текст. При закрытом — только текст.

## 5. Модель данных

### 5.1 Источник истины для матчей / игрока

Файл `data/demo-state.yaml` — единственный источник. При build'е:
- `frontend/lib/demo-state.ts` генерится автоматически (TS-типы + данные)
- `backend/app/demo_state_loader.py` парсит тот же yaml

### 5.2 Типы

```typescript
type Match = {
  id: string;
  sport: 'football' | 'basketball';
  league: string;
  home: string;
  away: string;
  startsAt: string;       // ISO
  odds: { home: number; draw?: number; away: number };
  extendedLines?: { name: string; price: number }[];  // "Обе забьют — 1.65"
  analystNote?: string;   // контекст для LLM
}

type Player = {
  name: string;
  balance: number;
  currency: 'USD';
  recentBets: Bet[];
  activeBonuses: Bonus[];
  loginCount: number;     // 1 = первый визит
}

type Bet = {
  matchId: string;
  stake: number;
  odds: number;
  line: string;           // "Обе забьют + ТБ 2.5"
  status: 'open' | 'won' | 'lost';
  payout?: number;
  settledAt?: string;
}

type Bonus = {
  type: 'freebet' | 'deposit_bonus';
  amount: number;
  currency: 'USD';
  expiresAt: string;
  used: boolean;
}

type Mode = 'onboarding' | 'normal' | 'celebration' | 'rg_care' | 'bonus_nudge';

type DemoEventType = 'first_visit' | 'big_win' | 'loss_streak' | 'freebet_expiring' | 'show_gallery' | 'custom';

type DemoEvent = {
  type: DemoEventType;
  payload: Record<string, unknown>;
  at: string;
}

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  at: string;
  source: 'voice' | 'text' | 'inject' | 'trigger';
}

type SessionState = {
  id: string;                  // "bright-fox"
  player: Player;              // начальный стейт из demo-state.yaml
  mode: Mode;
  conversation: Message[];
  lastEvent?: DemoEvent;
  createdAt: string;
}
```

Матчи и каталог бонусов — глобальные, общие для всех сессий. Player state и conversation — per-session, мутируются.

## 6. Триггеры

### 6.1 Preset-события

| Событие | Mode после | Эффект на state | Что говорит Алекс (режиссируется промптом) |
|---|---|---|---|
| `first_visit` | `onboarding` | reset к стартовому стейту | Знакомится, спрашивает имя |
| `big_win` | `celebration` | +amount к балансу, добавить won-Bet | Радуется, разделяет эмоцию, 1 лёгкая future-reco |
| `loss_streak` | `rg_care` | добавить lost-Bets (кол-во = count) | Эмпатия, предложение паузы, без морали |
| `freebet_expiring` | `bonus_nudge` | добавить Bonus с expiresAt | Напоминает дружески, предлагает вариант |
| `show_gallery` | не меняется | не мутирует state | UI открывает character gallery |

### 6.2 Custom event

Админ печатает свободный текст, отправляет через `POST /api/trigger` с `type='custom'` и `description` в payload. Backend инжектит в LLM-контекст как `<event type="custom">{description}</event>`. Режим не меняется автоматически (админ может явно выставить из dropdown).

### 6.3 Inject user message

Админ печатает реплику, отправляет через `POST /api/inject`. Backend добавляет в conversation как `role='user'`, дёргает LLM на ответ. Для клиента визуально выглядит как будто «пользователь спросил» — красиво отвечать на вопросы клиента демо не набирая в shared-экране. Ответ Алекса идёт через активный канал (голос + текст если voice WS открыт; только текст если закрыт).

### 6.4 Механика reactive vs proactive реплик

- **Reactive** — стандартный user → assistant pipeline. Нормальный диалог.
- **Proactive** — trigger event без user-сообщения. Backend добавляет в контекст system-event и вызывает LLM без ожидания user input. Ответ приходит в чат как proactive Alex message и (в voice path) озвучивается TTS автоматически. Режиссёрский ход — в base prompt указано, что «если есть `<event>` в последнем системном сообщении, реагируй естественно на него как на только что случившееся».

### 6.5 Переключение режимов

Контролируется backend-кодом (в `events.py`), не LLM.

- Trigger event → backend выставляет соответствующий mode.
- Автоматический возврат:
  - `onboarding` → `normal` после первой пары user-turn.
  - `celebration` → `normal` после 2 user-turn в celebration-режиме.
  - `bonus_nudge` → `normal` после 1 user-turn.
  - `rg_care` — sticky до явного сброса (например, `first_visit`) или до истечения времени (30 мин).

LLM видит текущий mode в каждом запросе — в system-prompt подставляется mode-specific addon.

## 7. Персона Алекса и prompt-стратегия

### 7.1 Структура system prompt

```
[BASE PERSONA]         (~500 токенов)
  Ты Алекс, AI-компаньон... [persona, tone, rules, guardrails]

[GLOBAL STATE]         (~800 токенов, матчи + бонусы)
  <matches>...</matches>
  <offers>...</offers>

[SESSION STATE]        (~50 токенов)
  <player name="..." balance="..." loginCount="..." />
  <mode>...</mode>

[MODE ADDON]           (~80-150 токенов, по mode)
  [Для celebration]: Пользователь только что выиграл. Разделяй радость искренне...

[LAST EVENT]           (~50-100 токенов, если есть)
  <event type="big_win" .../>

[CONVERSATION]         (trimmed last 20 turns)
```

Base + global state — потенциально кэшируемые блоки (если включим prompt caching позже, это даст экономию).

### 7.2 Персона

- Молодой парень ~25 лет, разбирается в европейском футболе и NBA
- Тон: дружеский, на «ты», самоирония, эмодзи метко но не каждой репликой
- Может иметь «спорные мнения», не боится disagree
- Не морализирует
- В `rg_care` — эмпатия первична, ставки не обсуждаются

### 7.3 Guardrails

- Не даёт гарантий выигрыша
- Не давит после отказа пользователя
- Не обсуждает конкурентов / других букмекеров
- В `rg_care` не делает никаких ставочных рекомендаций
- На прямой вопрос «ты AI?» — признаёт честно, но остаётся в роли («да, я AI, но для тебя — Алекс»)

## 8. Голосовой пайплайн

### 8.1 Pipecat pipeline (backend/app/pipeline.py)

```python
def build_pipeline(session: SessionState, transport):
    stt = GoogleSTTService(
        model="chirp_3",
        language="ru-RU",
        params=GoogleSTTService.InputParams(
            enable_automatic_punctuation=True,
        ),
    )

    llm = AnthropicLLMService(
        api_key=ANTHROPIC_API_KEY,
        model="claude-sonnet-4-6",
        system_prompt=build_alex_prompt(session),
    )

    tts = GeminiTTSService(
        model="gemini-3.1-flash-tts-preview",
        voice_id="Kore",  # финальный выбор голоса — при реализации
        params=GeminiTTSService.InputParams(
            language="ru-RU",
            prompt="Speak in a warm, friendly tone with light humor. Use natural Russian.",
        ),
    )

    context = AnthropicLLMContext()
    aggregator = llm.create_context_aggregator(context)

    return Pipeline([
        transport.input(),
        stt,
        aggregator.user(),
        llm,
        tts,
        transport.output(),
        aggregator.assistant(),
    ])
```

### 8.2 UX голосового ввода

- **Push-to-talk:** зажать mic-кнопку в input-field → запись → отпустил → отправка.
- Визуальная обратная связь: анимированная волна, живой транскрипт по мере распознавания.
- **Interruption:** клик по текущему TTS-ответу Алекса = прервать (встроено в Pipecat).
- **Fallback:** если mic permission отказано или WS упал — UI переключается на текстовый ввод без потери темпа.

### 8.3 Инжект триггеров в активный pipeline

Admin trigger во время voice:
1. Backend мутирует SessionState.
2. Pipeline получает system-frame с event-описанием через `frame_processor.push_frame()`.
3. LLM стримит реакцию; TTS озвучивает.
4. Если в этот момент говорит пользователь — Pipecat прерывает текущий TTS (через `UserStartedSpeaking`), обрабатывает user input, затем возвращается к event.

## 9. Frontend UX

Детальная вёрстка, стили, microinteractions — через `frontend-design:frontend-design` skill на шаге имплементации. Здесь — компонентная раскладка.

### 9.1 Desktop (>= 1024px)

- Букмекерская страница на весь экран: тёмный стиль, хедер с логотипом `BETARENA`, балансом, кнопкой `⚙ Panel`, левый sidebar с лигами, центральный feed матчей с коэффициентами, правый sidebar пустой или «промо-баннер».
- Свёрнутый виджет: floating avatar Alex ~72px в правом нижнем углу, над ним всплывают speech bubble при proactive-репликах, лёгкий pulse-индикатор при новом сообщении.
- Клик по avatar → выдвигается right-sidebar ~400px с chat-view, bookmaker страница остаётся видимой слева.
- Admin — та же sidebar, но с admin-контентом; переключение табами сверху: `Chat | Admin`.

### 9.2 Mobile (< 768px)

- Bookmaker-страница в одну колонку, компактный хедер.
- Свёрнутый виджет такой же — floating avatar в правом нижнем.
- Клик → fullscreen takeover, кнопка свернуть (↓) сверху.
- Admin в fullscreen то же самое, переключение табами.

### 9.3 Компоненты

```
<BookmakerPage>
  <Header>
    <Logo />
    <Balance />
    <AdminToggle />
    <SessionChip />
  </Header>
  <Sidebar>
    <LeagueList />
  </Sidebar>
  <Feed>
    <MatchCard /> x N (из demo-state)
  </Feed>
</BookmakerPage>

<AlexWidget>
  <CollapsedAvatar>
    <SpeechBubble />       // proactive нотификации
  </CollapsedAvatar>

  <ExpandedPanel>          // sidebar или fullscreen в зависимости от viewport
    <Tabs>Chat | Admin</Tabs>
    <ChatView>
      <AvatarHeader />
      <MessageList />
      <InputBar>
        <TextInput />
        <MicButton />      // push-to-talk
      </InputBar>
    </ChatView>
    <AdminView>
      <SessionInfo />
      <Triggers>
        <PresetButton>big_win</PresetButton>
        <PresetButton>loss_streak</PresetButton>
        <PresetButton>freebet_expiring</PresetButton>
        <PresetButton>first_visit (reset)</PresetButton>
        <PresetButton>show_gallery</PresetButton>
      </Triggers>
      <CustomEventForm />
      <InjectMessageForm />
      <Transcript />       // мини-стрипт последних 10 реплик
    </AdminView>
  </ExpandedPanel>
</AlexWidget>

<CharacterGallery>         // модальное окно или отдельный view
  <CharacterCard />  x 9   // 1 активный, 8 Coming soon
</CharacterGallery>
```

### 9.4 Ключевые анимации

- Proactive реплика (от триггера) — speech bubble появляется над свёрнутой аватаркой с fade-in + subtle bounce.
- Big win → confetti + balance-тикер до нового значения.
- RG care → мягкий dim / warm-glow вокруг виджета для смены настроения.

## 10. Структура репозитория

```
igaming-avatar/
├─ docker-compose.yml
├─ .env.example
├─ README.md
├─ docs/
│  ├─ Avatar_AI_Demo_Scenario.docx.md
│  ├─ backlog.md
│  └─ superpowers/
│     ├─ specs/
│     │  └─ 2026-04-23-avatar-ai-demo-design.md
│     └─ plans/
│        └─ 2026-04-23-avatar-ai-demo-plan.md  (создастся writing-plans)
├─ data/
│  ├─ demo-state.yaml
│  └─ characters.yaml
├─ frontend/
│  ├─ Dockerfile
│  ├─ package.json
│  ├─ next.config.js
│  ├─ tsconfig.json
│  ├─ app/
│  │  ├─ page.tsx
│  │  ├─ layout.tsx
│  │  └─ globals.css
│  ├─ components/
│  │  ├─ BookmakerPage/
│  │  ├─ AlexWidget/
│  │  ├─ ChatView/
│  │  ├─ AdminView/
│  │  ├─ CharacterGallery/
│  │  └─ SessionChip.tsx
│  ├─ lib/
│  │  ├─ demo-state.ts          (генерится из yaml)
│  │  ├─ api-client.ts
│  │  └─ voice-client.ts
│  └─ public/
│     └─ characters/             (9 PNG-портретов, коммитятся в репо)
├─ backend/
│  ├─ Dockerfile
│  ├─ pyproject.toml
│  ├─ app/
│  │  ├─ main.py
│  │  ├─ pipeline.py
│  │  ├─ state.py
│  │  ├─ modes.py
│  │  ├─ events.py
│  │  ├─ prompts/
│  │  │  ├─ alex.py
│  │  │  └─ mode_addons.py
│  │  ├─ demo_state_loader.py
│  │  └─ session_naming.py       (генератор bright-fox)
│  └─ tests/
└─ scripts/
   ├─ generate_portraits.py      (одноразовая генерация 9 PNG через Nano Banana 2)
   └─ gen_frontend_state.py      (yaml → ts, запускается при build frontend)
```

## 11. Sequence сборки

1. Скелет docker-compose, два сервиса запускаются, Hello World на обоих путях.
2. `data/demo-state.yaml` + генератор TS-типов + Python loader. Стейт доступен с обеих сторон.
3. `BookmakerPage` — тёмная визуалка, рендер матчей из state. Через `frontend-design` skill.
4. Backend text chat path (`POST /api/chat`, SSE): Claude Sonnet 4.6, базовый system prompt с персонажем Алекса, in-memory conversation.
5. `AlexWidget` collapsed + ExpandedPanel + ChatView (без admin пока), интеграция с text chat. Через `frontend-design` skill.
6. Pipecat voice pipeline: backend WS, `@pipecat-ai/client-web` в UI, mic push-to-talk. Живой STT → Claude → TTS.
7. Admin-tab: preset-триггеры, custom event, inject-message, переключение tabs в widget.
8. Режимы: логика переключения в backend, mode-specific prompt addons, UI-эффекты (confetti, RG dim).
9. Character gallery: `scripts/generate_portraits.py` → 9 PNG, UI с 1 активным и 8 coming-soon.
10. End-to-end прогон по всем блокам сценария демо, фиксы мелочей.
11. Deploy через Coolify: push в git, Coolify подхватывает, прописываем env-vars и secrets.

## 12. Риски и mitigations

- **Gemini 3.1 Flash TTS в preview** — возможны API-изменения, квоты, или временное падение. Mitigation: изолируем TTS за интерфейсом, fallback на `gemini-2.5-pro-tts`.
- **Latency STT→LLM→TTS** — цель end-to-end ≤ 2.5с. Mitigation: interim transcripts в UI (user видит «слушаю… распознал…»), streaming LLM-токенов, streaming TTS.
- **WebSocket через Coolify** — надо проверить WS upgrade в Traefik (под капотом Coolify). Mitigation: тест на шаге 6, в крайнем случае — SSE для proactive сообщений и HTTP для команд.
- **Pipecat `GeminiTTSService` с preview-моделью** — возможная несовместимость. Mitigation: первый тест на шаге 6, fallback `gemini-2.5-pro-tts` подготовлен.
- **Claude Sonnet 4.6 + Google services под одним Pipecat** — heterogenous стек, API-ключи двух провайдеров. Mitigation: оба поддержаны Pipecat из коробки, проверено.

## 13. Критерии приёмки демо

Минимальный чеклист, что демо готово к показу:

- [ ] Главная страница открывается по https-домену, выглядит как букмекер (dark style)
- [ ] Свёрнутая аватарка Алекса видна в углу
- [ ] Клик по аватарке открывает чат, можно написать текстом — Алекс отвечает в характере
- [ ] Зажать mic → говорить по-русски → Алекс отвечает голосом в пределах 2.5с
- [ ] Admin-панель открывается через кнопку в хедере
- [ ] Кнопка `big_win` в админке вызывает proactive реплику Алекса в режиме celebration + изменение баланса
- [ ] Кнопка `loss_streak` активирует `rg_care` mode, Алекс эмпатично реагирует и не предлагает ставок
- [ ] Кнопка `freebet_expiring` вызывает напоминание в стиле «кстати, у тебя...»
- [ ] Галерея персонажей открывается через кнопку или триггер
- [ ] Работает на мобильном (iOS Safari + Android Chrome) и desktop (Chrome)
- [ ] Inject-message работает: реплика от админа появляется в чате как user message, Алекс отвечает
- [ ] Custom event работает: произвольный текст в админке → Алекс реагирует в контексте
- [ ] Прогон всех трёх блоков сценария (1-3) без сбоев на тестовом устройстве ведущего
