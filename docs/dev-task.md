# Задание на разработку — Avatar AI Demo

**Для:** разработчика(-ов), кто будет реализовывать проект
**Дата:** 2026-04-23
**Тип:** одноразовая демо-версия (throwaway) для презентации клиенту

---

## 1. Что делаем

Веб-виджет AI-компаньона «Алекс» для букмекерской платформы. Виджет висит поверх сайта букмекера (мокового), общается с пользователем текстом и голосом, реагирует на триггерные события (выигрыши, проигрыши, бонусы). Показ клиенту ~10 минут на десктопе и мобильном.

**Ключевое:** все AI-компоненты работают реально (не заскриптовано). Алекс отвечает на произвольные вопросы клиента.

---

## 2. Обязательное чтение (в этом порядке)

1. **`docs/Avatar_AI_Demo_Scenario.docx.md`** — сценарий демо, 4 блока, реплики, триггеры. Это целевой UX-поток.
2. **`docs/superpowers/specs/2026-04-23-avatar-ai-demo-design.md`** — полная техническая спецификация: стек, архитектура, API, модель данных, prompt-стратегия, sequence сборки, критерии приёмки. **Главный источник истины.**
3. **`docs/design-brief.md`** — дизайн-бриф (для понимания намерений и тональности UI).
4. **`docs/design/iGaming-avatar/`** — интерактивный прототип от дизайнера. См. раздел 5 ниже про то, как его использовать.
5. **`docs/backlog.md`** — что сознательно отложено (видеоаватар, динамический стейт и пр.).

---

## 3. Финальный стек (детали в спеке §3)

| Слой | Выбор |
|---|---|
| Frontend | Next.js 15 (App Router, TypeScript, React 19) |
| Voice client (browser) | `@pipecat-ai/client-web` + `@pipecat-ai/client-react` |
| Backend | Python 3.12 + FastAPI + Pipecat |
| LLM | Claude Sonnet 4.6 (`claude-sonnet-4-6`) — `AnthropicLLMService` |
| STT | Google Chirp 3 (`chirp_3`, `ru-RU`) — `GoogleSTTService` |
| TTS | Gemini 3.1 Flash TTS (`gemini-3.1-flash-tts-preview`) — `GeminiTTSService`. Fallback: `gemini-2.5-pro-tts` |
| Image gen (9 портретов) | Gemini 3.1 Flash Image / Nano Banana 2 (`gemini-3.1-flash-image-preview`) — 1-shot скрипт, PNG-файлы в репо |
| Session state | In-memory Python dict, keyed by `session_id` (read. пары слов типа `bright-fox`) |
| Orchestration | docker-compose, 2 сервиса (`frontend`, `backend`) |
| Deploy | VPS через **Coolify** — он сам рулит reverse proxy, TLS, доменами. **Не добавляй nginx/Caddy в docker-compose.** |

API-ключи от заказчика: `ANTHROPIC_API_KEY`, Google Cloud service account JSON (GCP credentials для STT + TTS + Image). В Coolify прокидываются через env.

---

## 4. Архитектура в двух словах

- Один браузер = одна сессия. Без WebSocket-синхронизации между устройствами.
- Админ-панель — **тот же SPA**, переключается табами внутри виджета (`Chat | Admin`). Ведущий демо на презентации объясняет, что в продакшне триггеры приходят из CRM клиента.
- Два канала диалога:
  - **Voice WS** (Pipecat) — когда микрофон активен. STT → Claude → TTS, ответ голосом + текст.
  - **Text HTTP+SSE** — `POST /api/chat`, Claude напрямую через Anthropic SDK. Только текст.
- Оба канала пишут в единую `conversation` history.
- Триггерные события мутируют session state и отправляются в LLM-контекст как `<event ...>` — Claude реагирует проактивно, TTS озвучивает (если voice активен).
- Full data flow — **спека §4-§8**.

---

## 5. Как использовать дизайн-мокапы

В `docs/design/iGaming-avatar/` лежит **работающий React-прототип** (HTML + JSX через Babel-standalone). Открой `Avatar AI Demo.html` в браузере — увидишь все состояния: свёрнутый виджет, развёрнутый desktop sidebar, mobile fullscreen, admin tab, галерею, анимации (confetti, proactive bubble, RG warm-glow, balance flash, typing indicator, mic wave), переключение устройств и modes через Tweaks-панель.

**Как обращаться с прототипом:**

- **Это источник визуальных решений и design tokens**, а не продакшн-код. Перенеси в Next.js разумно:
  - CSS-переменные из `Avatar AI Demo.html` `:root{}` (палитра, цвета) — можно переиспользовать 1-в-1
  - Keyframe-анимации (`pulseRing`, `bubbleIn`, `typing`, `micWave`, `confettiFall`, `rgGlow`, `flashGold`, `slideInRight`, `slideUp`, `fadeIn`) — скопировать и использовать
  - Компоненты (`AlexAvatar`, `SpeechBubble`, `CollapsedWidget`, `ChatMessage`, `DesktopWidget`, `MobileWidget`, `AdminView`, `Gallery`, `Backdrop`) — использовать как структурный референс, но переписать как TypeScript-компоненты в правильной структуре (`frontend/components/...`) с подключением к реальному стейту и API вместо in-memory state.
  - Моковые данные (`INITIAL_CHAT`, `PROACTIVE`, матчи в `Backdrop.jsx`) — вытащить в `data/demo-state.yaml` (см. спек §5.1), оттуда кодогенерацией в `frontend/lib/demo-state.ts`.

- **Что в прототипе НЕ финально:**
  - Локальное in-memory state — заменяется на session state через backend
  - Моковый `bright-fox` session ID — приходит из backend
  - Hard-coded реплики Алекса — приходят реально от Claude
  - «Tweaks-панель» в левом верхнем углу — **это инструмент дизайнера, не часть продакшна**. Удалить из финальной версии.

- **Что в прототипе ЕСТЬ и нужно сохранить:**
  - Layout и позиционирование всех экранов (desktop sidebar, mobile fullscreen, collapsed avatar, gallery modal)
  - Все анимации и их timing
  - iOS-рамка на мобильном превью — только для превью, в продакшне не нужна
  - Color palette и typography (Manrope + JetBrains Mono)

**Бесплатный совет:** перед тем как писать код с нуля, запусти прототип, прокликай все состояния через Tweaks — так поймёшь, что именно нужно сделать.

---

## 6. Порядок работы (из спеки §11, укороченно)

1. **Docker-compose скелет.** Два сервиса поднимаются, отдают hello-world. Coolify подхватывает.
2. **Shared state layer.** `data/demo-state.yaml` (матчи, игрок, бонусы из сценария) + кодогенерация `frontend/lib/demo-state.ts` + `backend/app/demo_state_loader.py`.
3. **BookmakerPage.** Тёмный фон букмекера, матчи из state. Стили и структуру бери из `docs/design/.../components/Backdrop.jsx`.
4. **Backend text chat.** `POST /api/chat` (SSE), Claude Sonnet 4.6, system prompt Алекса (см. спек §7), in-memory conversation.
5. **Alex widget UI (collapsed + expanded chat).** Из `Widget.jsx` прототипа. Интеграция с `/api/chat`.
6. **Pipecat voice pipeline.** Backend WS, `@pipecat-ai/client-web` в UI, mic push-to-talk. Живой STT Chirp 3 → Claude → Gemini 3.1 Flash TTS.
7. **Admin tab.** Preset-триггеры, custom event, inject-message, mini-transcript (из прототипа + реальные API-ручки).
8. **Modes.** Переключение режимов в backend, mode-specific prompt addons, UI-эффекты (confetti, RG warm-glow — из прототипа).
9. **Character gallery.** `scripts/generate_portraits.py` — 9 PNG через Nano Banana 2 (один запуск, коммит в репо). UI из `Gallery.jsx`.
10. **End-to-end прогон сценария** (блоки 1-3), фикс мелочей.
11. **Deploy через Coolify.** Push в git, подключение в Coolify UI, env-vars, домены.

---

## 7. Definition of Done

Полный чеклист — в спеке §13. Ключевые пункты:

- [ ] Открывается по https-домену, выглядит как букмекер (dark style)
- [ ] Текстовый диалог: пишу — Алекс отвечает в характере, streaming токенов
- [ ] Голосовой диалог: зажал mic, сказал по-русски — Алекс ответил голосом в пределах ~2.5 сек end-to-end
- [ ] Все 4 preset-триггера работают: `big_win` (confetti + тикер баланса + celebration-реплика), `loss_streak` (RG warm-glow + эмпатичный ответ, без ставочных рекомендаций), `freebet_expiring` (badge в header + bonus_nudge-реплика), `first_visit` (reset)
- [ ] Custom event и inject-message работают
- [ ] Галерея 9 персонажей: 1 активен, 8 с «Coming soon»
- [ ] Mobile (iOS Safari + Android Chrome) и Desktop (Chrome) — всё работает
- [ ] Прогон всего сценария блоков 1-3 на device ведущего без сбоев

---

## 8. Риски, о которых знаем (спека §12)

- **Gemini 3.1 Flash TTS в preview-статусе.** Изолировать за интерфейсом, готов fallback на `gemini-2.5-pro-tts`.
- **WebSocket через Coolify/Traefik.** Проверить на шаге 6, что upgrade проходит. Обычно работает из коробки.
- **Latency голосовой цепочки.** Цель ≤ 2.5 сек. Показывать interim transcripts в UI («слушаю… распознал…»), чтобы не казалось подвисшим.
- **Pipecat + preview TTS-модель.** Первый тест — на шаге 6, если API несовместимо — fallback.

---

## 9. Чего НЕ делать

- Видеоаватар (Блок 4 демо) — отложено, в бэклоге
- Интеграцию с реальным CRM / платёжным шлюзом
- Live-обновление коэффициентов (всё из `demo-state.yaml` статично)
- Мультиязычность UI (только русский)
- Светлую тему
- nginx / Caddy / certbot в docker-compose (Coolify делает это сам)
- Базу данных, message queue, Redis и т.п. (session state в памяти процесса, при рестарте сбрасывается — ок для демо)

---

## 10. Вопросы и контакт

- Если что-то в спеке неясно или противоречит — сначала загляни в `docs/Avatar_AI_Demo_Scenario.docx.md`, он задаёт целевой UX. Дальше — спроси заказчика.
- Если прототип от дизайнера и спека расходятся в деталях (например, размеры, позиционирование) — спека задаёт архитектуру и поведение, прототип задаёт визуал. В спорных местах — спроси.
- Пишу план реализации отдельным документом после апрува этого task-brief'а.

**Удачи 🙌**
