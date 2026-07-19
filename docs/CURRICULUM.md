# Учебная программа «Академия Claude» (v1)

**Принцип №1:** каждый урок построен на официальном первоисточнике (см. `docs/SOURCES.md`) — пересказ на русском + ссылка «Читать оригинал» + практика.
**Принцип №2:** два входа — «уровень 0» (ни разу не открывал Claude) и «практикующий специалист» (экспресс-трек через испытания).

---

## 0. Входная навигация

### Онбординг (2 минуты)
Вопросы: «Пользовались ли Claude?», «Пишете ли код?», «Какая цель?» → выбор трека:

| Трек | Кому | Миры (обязательные) |
|---|---|---|
| 🌱 «С нуля» | никогда не пользовался ИИ | 1 → 2 → 3, дальше по желанию |
| 💬 «Пользователь» | пользуюсь чатом, хочу всё остальное | тест → 2 → 3 → 8 |
| 👨‍💻 «Разработчик» | пишу код | тест → 4 → 5 → 6 → 7 |
| 💼 «Бизнес» | автоматизация работы | тест → 2 → 3 → 8 (акцент на Slack/Excel/коннекторы) |

### Экспресс-трек для практиков
- **Входной тест** (15 вопросов по всем мирам) → автоматический зачёт уже освоенных миров.
- **Испытания миров:** любой мир можно «перепрыгнуть», сразу пройдя его босс-уровень без подсказок. Прошёл — мир зачтён, XP начислен.
- Так специалист за один вечер находит свои «слепые зоны» — альбом карточек покажет, какие функции он не знал.

---

## Мир 1. Первые шаги (уровень 0)

Цель: от «что это такое» до уверенного диалога. Источники: support.claude.com (Getting Started), anthropic.com/learn (AI Fluency), platform.claude.com (models).

| # | Урок | Что освоит | Первоисточники | Практика |
|---|---|---|---|---|
| 1.1 | Что такое Claude | ИИ-ассистент, семейство моделей, чем отличается от поисковика | anthropic.com/learn (AI Fluency); support: Getting Started | квиз |
| 1.2 | Регистрация и интерфейс | чаты, история, поиск по чатам, настройки | support: Getting Started | симулятор интерфейса |
| 1.3 | Первый промпт | контекст + задача + формат; почему «напиши текст» — плохой запрос | platform: prompting best practices | «собери промпт», симулятор чата |
| 1.4 | Диалог, а не запрос | уточнения, переформулировка, продолжение мысли | prompting best practices | симулятор чата |
| 1.5 | Модели и режимы | Fable/Opus/Sonnet/Haiku, extended thinking — когда что | platform: models overview | квиз + «подбери модель под задачу» |
| 1.6 | Файлы: PDF, фото, таблицы | что можно загрузить и что попросить | support: Claude Features; platform: vision, PDFs | миссия в реальном Claude |
| 1.7 | Доверяй, но проверяй | галлюцинации, дата знаний, проверка фактов | AI Fluency; support | «найди ошибку» в ответе ИИ |
| 1.8 | Мобильный Claude и голос | приложение, голосовой режим | support: Claude on Mobile | миссия |
| 1.9 | 🏆 БОСС: Личный помощник | полный цикл: сформулировать → уточнить → получить результат | все выше | сценарий-эскейпрум |

## Мир 2. Продвинутый claude.ai

Цель: Projects, Artifacts, коннекторы, Research — 80% функционала, о котором «многие не знают». Источники: support.claude.com (Claude Features), claude.com/connectors.

| # | Урок | Что освоит | Первоисточники | Практика |
|---|---|---|---|---|
| 2.1 | Projects | инструкции проекта, база знаний, проект vs чат | support: Projects | симулятор + миссия |
| 2.2 | Artifacts | интерактивные документы и приложения, публикация | support: Artifacts | миссия: свой артефакт |
| 2.3 | Память и инструкции | персонализация, как Claude помнит | support: memory/preferences | квиз + миссия |
| 2.4 | Web search и Research | обычный поиск vs глубокое исследование с источниками | support: Deep Research | миссия: исследование |
| 2.5 | Коннекторы — обзор | каталог (~439 шт.), verified vs community, безопасность | claude.com/connectors; support: Connectors FAQ | квиз |
| 2.6 | Коннекторы — практика | подключить Gmail/Drive/Calendar, сценарии | support: MCP connectors | миссия |
| 2.7 | Документы на выходе | docx/xlsx/pptx/pdf силами Claude | support: Skills & Extensions | миссия: отчёт |
| 2.8 | Анализ данных | загрузка таблиц, графики, вычисления | support: Claude Features | миссия: свой файл |
| 2.9 | Тарифы и лимиты | Free/Pro/Max, лимиты, как не упираться | support: Account & Plans | квиз |
| 2.10 | 🏆 БОСС: Рабочая неделя | связка Projects + коннекторы + Research + документ | все выше | комплексная миссия |

## Мир 3. Скиллы

Цель: главный «секретный» инструмент — от использования к созданию. Источники: support (Using/Creating skills), github.com/anthropics/skills, agentskills.io.

| # | Урок | Что освоит | Первоисточники | Практика |
|---|---|---|---|---|
| 3.1 | Что такое скилл | скилл vs промпт vs проект; когда что | support: Using skills | квиз |
| 3.2 | Библиотека Anthropic | 17 официальных скиллов, что делает каждый | github.com/anthropics/skills | «подбери скилл под задачу» |
| 3.3 | Анатомия SKILL.md | frontmatter (name, description), инструкции, ресурсы | anthropics/skills: spec/, template/ | «найди ошибку» в SKILL.md |
| 3.4 | Триггер-описание | почему description решает всё: когда скилл сработает | agentskills.io; spec | «собери description» |
| 3.5 | Первый свой скилл | из template/ до рабочего скилла | support: Creating custom skills | миссия: свой скилл |
| 3.6 | skill-creator | скилл, создающий скиллы; итерация и тест | anthropics/skills: skill-creator | миссия |
| 3.7 | 🏆 БОСС: Скилл для себя | скилл под свою реальную рабочую задачу | все выше | миссия + чек-лист |

## Мир 4. Claude Code — база

Цель: с нуля до уверенной работы в терминале/IDE. Источники: code.claude.com/docs.

| # | Урок | Что освоит | Первоисточники | Практика |
|---|---|---|---|---|
| 4.1 | Что такое Claude Code | агент в терминале; 7 поверхностей: CLI, web, desktop, VS Code, JetBrains, mobile, Slack | /en/overview | квиз |
| 4.2 | Установка и первая сессия | setup, первая задача, как ставить задачи | /en/quickstart, /en/setup | симулятор терминала |
| 4.3 | Permissions | режимы разрешений, что агент спрашивает и почему | /en/permissions | симулятор: «разреши/запрети» |
| 4.4 | CLAUDE.md | память проекта: команды, правила, конвенции | /en/memory | миссия: CLAUDE.md для своего проекта |
| 4.5 | Slash-команды | встроенные команды, /init, /help, CLI-флаги | /en/cli-reference | симулятор терминала |
| 4.6 | Workflows | фича / баг / тесты / рефакторинг — как формулировать | /en/common-workflows, /en/best-practices | сценарии в симуляторе |
| 4.7 | Git вместе с Claude | коммиты, ветки, PR, ревью | /en/common-workflows | симулятор + миссия |
| 4.8 | Контекстное окно | почему сессия «устаёт», компактизация, новая сессия | /en/context-window | квиз |
| 4.9 | 🏆 БОСС: Первый проект | полный цикл: init → CLAUDE.md → фича → коммит | все выше | большой сценарий терминала |

## Мир 5. Claude Code — продвинутый

Цель: автоматизация и масштабирование. Источники: code.claude.com/docs.

| # | Урок | Что освоит | Первоисточники | Практика |
|---|---|---|---|---|
| 5.1 | Скиллы в Claude Code | скиллы проекта, слэш-вызов | /en/skills | миссия |
| 5.2 | Hooks | PreToolUse/PostToolUse/Stop; автолинт, автотест, автосейв | /en/hooks-guide | «собери hook» + найди ошибку в settings.json |
| 5.3 | Субагенты | делегирование, параллельность, worktree | /en/sub-agents | сценарий |
| 5.4 | Команды агентов | agent teams, фоновые агенты | /en/agent-teams | квиз + сценарий |
| 5.5 | Расписания | scheduled tasks, routines, /loop | /en/scheduled-tasks, /en/routines | миссия |
| 5.6 | CI/CD | Claude Code в GitHub Actions / GitLab | /en/github-actions | миссия: авторевью PR |
| 5.7 | Настройки и безопасность | settings.json, sandbox, allowlist | /en/settings, /en/sandbox-environments, /en/security | «найди дыру» в конфиге |
| 5.8 | Другие поверхности | Slack-канал, Chrome-отладка, desktop | /en/slack, /en/chrome | квиз |
| 5.9 | 🏆 БОСС: Автопилот | hooks + субагенты + расписание в одном проекте | все выше | комплексная миссия |

## Мир 6. Плагины и MCP

Цель: интеграции — лестница «коннектор → скилл → плагин → свой MCP-сервер». Источники: modelcontextprotocol.io, code.claude.com/docs, anthropics/claude-plugins-official.

| # | Урок | Что освоит | Первоисточники | Практика |
|---|---|---|---|---|
| 6.1 | Что такое MCP | архитектура: клиент-сервер; Tools / Resources / Prompts | modelcontextprotocol.io/docs/learn/architecture | квиз + схема-сборка |
| 6.2 | Подключение MCP | mcp-quickstart, конфиг, реестр серверов | code: /en/mcp-quickstart; registry.modelcontextprotocol.io | симулятор + миссия |
| 6.3 | Эталонные серверы | Everything, Filesystem, Git, Memory, Fetch — что учат | github.com/modelcontextprotocol/servers | «подбери сервер под задачу» |
| 6.4 | Свой MCP-сервер (простой) | Python/TS SDK, первый tool | MCP SDKs; skill mcp-builder | миссия: сервер с 1 инструментом |
| 6.5 | Свой MCP-сервер (глубже) | resources, prompts, обработка ошибок | спецификация MCP | миссия |
| 6.6 | Плагины: устройство | plugin.json, commands/, agents/, hooks/, .mcp.json | code: /en/plugins | «найди ошибку» в манифесте |
| 6.7 | Маркетплейсы | official (~101), community, /plugin | /en/discover-plugins, /en/plugin-marketplaces | миссия: установить и изучить 3 плагина |
| 6.8 | 🏆 БОСС: Опубликуй | свой плагин со скиллом и MCP; путь к публикации | /en/plugins-reference; claude-plugins-community | финальный проект |

## Мир 7. API и Agent SDK

Цель: разработка на Claude. Источники: platform.claude.com/docs, cookbooks, quickstarts, Agent SDK.

| # | Урок | Что освоит | Первоисточники | Практика |
|---|---|---|---|---|
| 7.1 | Первый запрос | ключ, Messages API, roles | platform: quickstart | «собери запрос» + миссия |
| 7.2 | Messages глубже | system prompt, стриминг, multi-turn | working-with-messages | найди ошибку в коде |
| 7.3 | Промпт-инжиниринг системно | XML-теги, few-shot, chain-of-thought, роль | prompt-engineering guide | «собери промпт» продвинутый |
| 7.4 | Tool use | определение инструментов, агентный цикл | tool-use/overview + туториал | миссия: агент-калькулятор |
| 7.5 | Structured outputs | JSON schema, гарантированный JSON | structured-outputs | миссия |
| 7.6 | Vision и PDF | изображения и документы через API | vision, PDFs | миссия |
| 7.7 | Extended thinking | когда включать, как читать | extended-thinking | квиз |
| 7.8 | Экономика | токены, цены, prompt caching, батчи | pricing, token counting | «посчитай стоимость» задача |
| 7.9 | Cookbooks | RAG, sub-agents, evals — готовые рецепты | anthropic-cookbook | миссия: запустить ноутбук |
| 7.10 | Agent SDK | query(), ClaudeSDKClient, @tool, hooks | claude-agent-sdk-python/-typescript | миссия: свой агент |
| 7.11 | Managed Agents | облачные агенты, sessions | platform: managed-agents | квиз + миссия |
| 7.12 | 🏆 БОСС: Продукт | мини-приложение на API по образцу quickstarts | anthropic-quickstarts | финальный проект |

## Мир 8. Экосистема и профессиональная работа

Цель: Claude в рабочих инструментах + безопасность + как оставаться в курсе. Источники: support.claude.com, code.claude.com, anthropic.com/news.

| # | Урок | Что освоит | Первоисточники | Практика |
|---|---|---|---|---|
| 8.1 | Claude в Slack | Claude Tag, сценарии для команд | support: Claude Tag | миссия |
| 8.2 | Claude в Excel / M365 | таблицы и офис | support: Workspace | миссия |
| 8.3 | Claude в Chrome | агент в браузере, отладка | code: /en/chrome | миссия |
| 8.4 | Cowork | автономная работа над задачами | support / news | квиз |
| 8.5 | Безопасность | prompt injection, секреты, что не отправлять | code: /en/security; support: Compliance | «найди атаку» сценарии |
| 8.6 | Claude в организации | админ, роли, zero-data retention | code: /en/admin-setup | квиз |
| 8.7 | Как быть в курсе | changelog, release notes, news, Academy | SOURCES.md §8 | миссия: подписаться |
| 8.8 | 🏆 ЭКЗАМЕН ТРЕКА | комплексный экзамен → сертификат | всё | экзамен |

---

## Итого

- **8 миров, 72 урока** (63 обычных + 8 боссов + 1 экзамен)
- 6 типов заданий: квиз, «собери промпт», «найди ошибку», симулятор чата, симулятор терминала, реальная миссия
- Каждый урок: `sources[]` (обязателен), `verifiedAt`, кнопка «Читать оригинал»
- Дополнительно рекомендуем сертификации Anthropic Academy (бесплатные) — в уроке 8.7 и в профиле игрока

## Конвейер производства контента

1. Взять страницу первоисточника из SOURCES.md.
2. Сессией Claude Code сгенерировать черновик урока по шаблону JSON (теория-пересказ + 3–5 заданий).
3. Ручная редактура (точность, русский язык, сложность).
4. Проставить `sources[]` и `verifiedAt`.
5. Раз в месяц: сессия «сверь уроки с changelog/release notes → список правок».

## Порядок производства (что писать первым)

1. Мир 1 полностью (эталон качества, самая массовая аудитория).
2. Мир 4 (вторая точка входа — разработчики).
3. Миры 2–3 → 5–6 → 7 → 8.
