# Реестр официальных первоисточников

Все уроки «Академии Claude» строятся на официальных документах Anthropic.
Этот файл — единый реестр источников. Проверено: 2026-07-19.

## 1. Справочный центр claude.ai (для конечных пользователей)

**https://support.claude.com/en/** — база уроков Миров 1–3.

| Категория | Что внутри |
|---|---|
| Getting Started | что умеет Claude, интерфейсы, подписка |
| Claude Features | Projects, Artifacts, Deep Research, голос, инструкции, коннекторы |
| Claude Account & Plans | профиль, тарифы, лимиты |
| Claude on Mobile | iOS/Android |
| Claude in Your Workspace | Slack (Claude Tag), Microsoft 365, организации |
| Skills & Extensions | пользовательские скиллы, расширения |
| Compliance & Security | конфиденциальность, данные |

Ключевые статьи:
- Using skills in Claude — https://support.claude.com/en/articles/12512180-using-skills-in-claude
- Creating custom skills — https://support.claude.com/en/articles/12512198-creating-custom-skills
- MCP connectors — https://support.claude.com/en/articles/14503689-mcp-connectors
- Connectors Directory FAQ — https://support.claude.com/en/articles/11596036-anthropic-connectors-directory-faq
- Claude Tag (Slack) — https://support.claude.com/en/articles/15594475-what-is-claude-tag
- Release notes — https://support.claude.com/en/articles/12138966-release-notes

## 2. Документация платформы / API

**https://platform.claude.com/docs** — база уроков Мира 7.

- Quickstart — https://platform.claude.com/docs/en/quickstart
- Модели — https://platform.claude.com/docs/en/about-claude/models/overview
- Messages API — https://platform.claude.com/docs/en/build-with-claude/working-with-messages
- Prompt engineering — https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview
- Best practices промптинга — https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
- Tool use — https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview
- Туториал «агент с инструментами» — https://platform.claude.com/docs/en/agents-and-tools/tool-use/build-a-tool-using-agent
- Tool Runner — https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-runner
- Managed Agents — https://platform.claude.com/docs/en/managed-agents/overview
- Vision — https://platform.claude.com/docs/en/build-with-claude/vision
- Extended thinking — https://platform.claude.com/docs/en/build-with-claude/extended-thinking
- Structured outputs — https://platform.claude.com/docs/en/build-with-claude/structured-outputs
- Cookbook (веб) — https://platform.claude.com/cookbook/
- Цены — https://claude.com/pricing
- Release notes — https://platform.claude.com/docs/en/release-notes/overview

## 3. Документация Claude Code

**https://code.claude.com/docs** — база уроков Миров 4–6. Индекс: https://code.claude.com/docs/llms.txt

Основные страницы:
- Overview / Quickstart / Setup — /en/overview, /en/quickstart, /en/setup
- Память CLAUDE.md — /en/memory; контекст — /en/context-window
- Поверхности: /en/vs-code, /en/jetbrains, /en/desktop-quickstart, /en/claude-code-on-the-web, /en/mobile, /en/slack, /en/chrome
- Workflows: /en/common-workflows, /en/best-practices, /en/workflows
- Агенты: /en/sub-agents, /en/agent-teams
- Кастомизация: /en/skills, /en/hooks-guide, /en/mcp-quickstart, /en/mcp
- Плагины: /en/plugins, /en/discover-plugins, /en/plugin-marketplaces, /en/plugins-reference
- Автоматизация: /en/scheduled-tasks, /en/routines, /en/github-actions, /en/gitlab-ci-cd
- Безопасность: /en/permissions, /en/settings, /en/sandbox-environments, /en/security
- Agent SDK: /en/agent-sdk/overview, /en/agent-sdk/quickstart, /en/agent-sdk/python, /en/agent-sdk/typescript
- Справка: /en/cli-reference, /en/changelog, /en/glossary

## 4. Библиотека скиллов и плагины

- **anthropics/skills** — https://github.com/anthropics/skills — официальная библиотека Agent Skills: 17 скиллов (docx, pdf, pptx, xlsx, canvas-design, frontend-design, mcp-builder, skill-creator, brand-guidelines, algorithmic-art, theme-factory, slack-gif-creator, web-artifacts-builder, webapp-testing, claude-api, internal-comms, doc-coauthoring), `spec/` — спецификация, `template/` — шаблон нового скилла.
- Спецификация Agent Skills — http://agentskills.io
- **anthropics/claude-plugins-official** — https://github.com/anthropics/claude-plugins-official — курируемый маркетплейс (~101 плагин: github, linear, notion, aws-core, cloudflare, mongodb и др.)
- **anthropics/claude-plugins-community** — https://github.com/anthropics/claude-plugins-community — community-маркетплейс с ревью

## 5. Model Context Protocol (MCP)

- Сайт/докуметация — https://modelcontextprotocol.io/ (Architecture, quickstarts, Specification)
- Спецификация (GitHub) — https://github.com/modelcontextprotocol/modelcontextprotocol
- Официальный реестр серверов — https://registry.modelcontextprotocol.io/
- Эталонные серверы — https://github.com/modelcontextprotocol/servers (Everything, Fetch, Filesystem, Git, Memory, Sequential Thinking, Time)
- SDK: Python — https://github.com/modelcontextprotocol/python-sdk, TypeScript — https://github.com/modelcontextprotocol/typescript-sdk
- Каталог коннекторов claude.ai — https://claude.com/connectors (~439 коннекторов, 30 категорий)

## 6. Agent SDK и примеры

- Python SDK — https://github.com/anthropics/claude-agent-sdk-python (`pip install claude-agent-sdk`)
- TypeScript SDK — https://github.com/anthropics/claude-agent-sdk-typescript (`@anthropic-ai/claude-agent-sdk`)
- **Claude Cookbooks** — https://github.com/anthropics/anthropic-cookbook — Jupyter-ноутбуки: RAG, tool use, sub-agents, prompt caching, evals, vision
- **Quickstarts** — https://github.com/anthropics/anthropic-quickstarts — готовые приложения: Customer Support Agent, Financial Data Analyst, Computer Use Demo, Browser Use Demo, Autonomous Coding Agent

## 7. Обучающие курсы Anthropic (бесплатные, с сертификатами)

- **Anthropic Academy** — https://anthropic.skilljar.com/ и https://www.anthropic.com/learn
- Курсы: AI Fluency, Getting Started with Claude, Building with the Claude API, MCP Deep Dive, Claude Code in Action, Extended Thinking, Structured Outputs, Building Agents, Managed Agents, Dynamic Workflows (13+)

## 8. Каналы новостей (для актуализации контента)

- Anthropic Newsroom — https://www.anthropic.com/news
- Claude Blog — https://claude.com/blog
- Claude Code changelog — https://code.claude.com/docs/en/changelog
- API release notes — https://platform.claude.com/docs/en/release-notes/overview
- Releases на GitHub — https://github.com/anthropics/claude-code/releases

---

### Правило использования источников в уроках

1. Каждый урок обязан иметь поле `sources: []` минимум с одним URL из этого реестра.
2. Теория урока — пересказ первоисточника своими словами на русском + кнопка «Читать оригинал».
3. Поле `verifiedAt` в уроке = дата последней сверки с источником.
4. Ежемесячная ревизия по каналам из раздела 8.
