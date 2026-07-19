# Схема контента уроков (v1)

Контент живёт в `content/`. Движок (`src/engine`) читает эти JSON и не содержит текстов уроков.
TypeScript-типы в `src/engine/types.ts` должны точно соответствовать этой схеме.

## content/worlds.json

```json
{
  "worlds": [
    {
      "id": "world-1-basics",
      "order": 1,
      "title": "Первые шаги",
      "subtitle": "От «что такое Claude» до уверенного диалога",
      "icon": "rocket",
      "color": "violet",
      "lessons": ["basics-what-is-claude", "basics-interface", "..."]
    }
  ]
}
```

## content/<world-id>/<lesson-id>.json

```json
{
  "id": "basics-what-is-claude",
  "world": "world-1-basics",
  "order": 1,
  "title": "Что такое Claude",
  "subtitle": "Знакомимся с ИИ-ассистентом и его семейством моделей",
  "xp": 50,
  "durationMin": 7,
  "isBoss": false,
  "sources": [
    { "title": "Getting Started — Claude Help Center", "url": "https://support.claude.com/en/" }
  ],
  "verifiedAt": "2026-07-19",
  "theory": [ TheoryBlock, ... ],
  "tasks": [ Task, ... ],
  "reward": { "cardId": "card-models", "badgeId": null }
}
```

### TheoryBlock (типы блоков теории)

```jsonc
{ "type": "text", "md": "Markdown-текст. Заголовки внутри блока — h3 (###)." }
{ "type": "heading", "text": "Подзаголовок раздела теории" }
{ "type": "code", "lang": "text|markdown|bash|json|python|typescript", "title": "необязательная подпись", "code": "..." }
{ "type": "callout", "kind": "tip|warning|docs", "md": "Совет / предупреждение / цитата из документации" }
{ "type": "table", "headers": ["..."], "rows": [["...", "..."]] }
{ "type": "example", "bad": "плохой пример (промпт/код)", "good": "хороший пример", "explanation": "почему good лучше" }
```

**Требование к детальности:** урок содержит 5–10 блоков теории, суммарно 600–1200 слов.
Каждое понятие объясняется с нуля + минимум один конкретный пример. Никаких «двух строчек».

### Task (типы заданий)

```jsonc
// 1. Квиз
{
  "type": "quiz",
  "question": "...",
  "options": ["...", "...", "...", "..."],
  "correct": [0],            // индексы; >1 = мультивыбор
  "explanation": "Почему так — показывается после ответа",
  "hint": "Подсказка (доступна после 1 ошибки)"
}

// 2. Собери промпт (drag-and-drop порядка блоков)
{
  "type": "build-prompt",
  "instruction": "Собери промпт для ...",
  "blocks": ["Роль: ...", "Контекст: ...", "Задача: ...", "Формат: ..."],
  "correctOrder": [0, 1, 2, 3],
  "distractors": ["лишний блок — не входит в ответ"],
  "explanation": "..."
}

// 3. Найди ошибку (клик по строке)
{
  "type": "find-bug",
  "instruction": "Найди ошибку в ...",
  "lang": "markdown",
  "lines": ["строка 1", "строка 2", "..."],
  "bugLineIndex": 2,
  "explanation": "..."
}

// 4. Чат-симулятор (сценарий)
{
  "type": "chat-sim",
  "instruction": "Попроси Claude ...",
  "steps": [
    {
      "expect": ["ключевое слово 1", "ключевое слово 2"],  // ввод засчитан, если содержит хотя бы N
      "minMatches": 1,
      "claudeReply": "Ответ «Claude» (markdown)",
      "failHint": "Подсказка, если ввод не подошёл"
    }
  ],
  "successMessage": "..."
}

// 5. Терминал-симулятор
{
  "type": "terminal-sim",
  "instruction": "Выполни ...",
  "steps": [
    {
      "expectPattern": "^claude$",       // regex для ввода
      "output": "текст ответа терминала",
      "failHint": "..."
    }
  ],
  "successMessage": "..."
}

// 6. Реальная миссия (в настоящем Claude)
{
  "type": "real-mission",
  "instruction": "Открой claude.ai и ... (пошагово, markdown)",
  "checklist": ["пункт самопроверки 1", "пункт 2"],
  "xpBonus": 50
}
```

### Прогресс (localStorage, ключ `academy_progress_v1`)

```json
{
  "xp": 0,
  "completedLessons": { "lesson-id": { "completedAt": "ISO", "mistakes": 0 } },
  "streak": { "current": 0, "best": 0, "lastActiveDate": "YYYY-MM-DD" },
  "badges": ["badge-id"],
  "cards": ["card-id"],
  "track": "novice|user|developer|business"
}
```

## content/cards.json и content/badges.json

```json
{ "cards": [ { "id": "card-models", "title": "Семейство моделей", "rarity": "common|rare|epic|legendary", "description": "...", "icon": "sparkles" } ] }
{ "badges": [ { "id": "badge-first-prompt", "title": "Первый промпт", "description": "...", "icon": "star", "condition": "закончен урок basics-first-prompt" } ] }
```
