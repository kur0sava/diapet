# Development Methodology — Claude Code + Mobile App

> Универсальный подход к разработке мобильных приложений с Claude Code.
> Скопируйте в другой проект и адаптируйте под стек.

---

## 1. Файловая структура проекта

```
project/
├── ROADMAP.md                    # Версионированный план развития
├── DEVELOPMENT_METHODOLOGY.md    # Этот файл
├── CLAUDE.md                     # Инструкции для Claude Code (корень проекта)
├── .claude/
│   ├── plans/                    # Детальные планы реализации (создаются в Plan Mode)
│   │   └── *.md                  # Каждая фича = отдельный план
│   ├── settings.local.json       # Локальные настройки Claude Code
│   └── projects/
│       └── <project-hash>/
│           └── memory/
│               ├── MEMORY.md         # Индекс всех memory-файлов (≤200 строк)
│               ├── user_*.md         # Профиль пользователя
│               ├── feedback_*.md     # Корректировки подхода
│               ├── project_*.md      # Контекст проекта/фич
│               └── reference_*.md    # Ссылки на внешние системы
```

---

## 2. Roadmap (ROADMAP.md)

### Формат
```markdown
# Project Roadmap

## v1.0.0 — MVP [██████████ 100%]
- [x] Feature A
- [x] Feature B

## v1.1.0 — Improvements [████░░░░░░ 40%]
- [x] Bug fix X
- [ ] Feature C
- [ ] Feature D

## v2.0.0 — Major Release [░░░░░░░░░░ 0%]
### Phase 1: ...
### Phase 2: ...
```

### Правила
- Обновлять **после каждого коммита** — отмечать выполненные пункты
- Прогресс-бары визуальные (`█░`)
- Каждая версия = секция с фазами
- Незавершённые задачи явно переносятся в следующую версию
- Указывать **что сделано** и **что осталось** — никаких пропусков

---

## 3. Memory System (Persistent Context)

### Типы memory-файлов

| Тип | Назначение | Когда создавать |
|-----|-----------|-----------------|
| `user` | Роль, навыки, предпочтения разработчика | При первом взаимодействии |
| `feedback` | Корректировки подхода ("не делай так") | При любом замечании |
| `project` | Контекст фич, решений, блокеров | При изменении планов |
| `reference` | Ссылки на внешние системы | При упоминании ресурсов |

### Формат memory-файла
```markdown
---
name: Descriptive Name
description: One-line — used to decide relevance in future sessions
type: user|feedback|project|reference
---

Content here.

**Why:** Reason this matters.
**How to apply:** When/where to use this.
```

### MEMORY.md — индекс
- Только ссылки на файлы + краткое описание
- Максимум 200 строк (обрезается при загрузке)
- Обновлять при добавлении/удалении memory-файлов
- Включать текущее состояние проекта (версия, ветка, что сделано)

### Что НЕ сохранять в memory
- Код, архитектуру, пути к файлам — выводятся из кода
- Git-историю — выводится из `git log`
- Фиксы багов — они в коде и коммитах
- Временные задачи текущей сессии — для этого есть Tasks

---

## 4. Plans (.claude/plans/)

### Когда создавать план
- Перед любой нетривиальной фичей (>3 файлов)
- Когда нужно согласование подхода
- Для многофазных задач

### Формат плана
```markdown
# Feature Name

## Context
What and why.

## Phase 1: ...
### 1.1 Task
**File:** path/to/file.ts
- What to do
- How to do it

## Phase N: Verification
1. `npx tsc --noEmit`
2. Walkthrough scenarios
3. Both locales

## Execution Order
Phase 1 → Phase 2 → ...

## Critical Files
| File | Action |
|------|--------|

## New Files
```

### Правила
- План сохраняется и в `.claude/plans/` и в memory (project-файл с кратким описанием)
- План обновляется по ходу выполнения
- Никогда не удалять план до завершения

---

## 5. Commits — Autosave Protocol

### Правила коммитов
1. **После каждой фазы/крупного изменения** — коммит
2. **Перед коммитом** — `npx tsc --noEmit` (или эквивалент для стека)
3. **Формат сообщения:**
   ```
   type: краткое описание

   - Детали изменения 1
   - Детали изменения 2

   Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
   ```
4. **Типы:** `feat`, `fix`, `refactor`, `docs`, `chore`
5. **Никогда** не `git push` без явного запроса
6. **Никогда** не `--force`, `--no-verify`, `--amend` без явного запроса

### Autosave = коммит после каждой логически завершённой единицы работы

---

## 6. Verification Protocol

### После каждого изменения
```bash
npx tsc --noEmit          # Проверка типов
npm run lint              # Линтер (если есть)
```

### После каждой фазы
- Проверка типов
- Коммит
- Обновление ROADMAP.md
- Обновление memory (если планы изменились)

### Перед релизом
- Полный аудит (см. раздел 7)
- Тест на реальном устройстве
- Оба языка (если i18n)
- Edge cases: 0 данных, 1 запись, 1000 записей
- Dark mode + Light mode
- Offline сценарии

---

## 7. Audit System (Multi-Agent)

### Агенты аудита (запускать порциями по 2-3)

| # | Агент | Фокус |
|---|-------|-------|
| 1 | `paranoid-codebase-auditor` | Runtime crashes, race conditions, memory leaks, null states |
| 2 | `paranoid-ux-auditor` | Adversarial UX: confused/impulsive/malicious users |
| 3 | `logic-reviewer` | Business logic consistency |
| 4 | `logic-reviewer` (deep) | Повторный проход с фокусом на сложной логике |
| 5 | `code-auditor` | Static analysis, type issues |
| 6 | `code-auditor` (round 2) | Re-run на изменённых файлах |
| 7 | `ux-scenario-tester` | Поведенческие сценарии |
| 8 | `diapet-medical-auditor` | (специфичный) Медицинские данные |

### Процесс аудита
1. Запустить агентов порциями (API лимиты)
2. Собрать findings
3. Приоритизировать: CRITICAL → HIGH → MEDIUM → LOW
4. Исправить CRITICAL/HIGH
5. Коммит после каждой порции исправлений
6. Re-run агентов на изменённых файлах
7. Обновить ROADMAP с результатами

### Классификация findings
- **CRITICAL** — crash, data loss, security
- **HIGH** — broken UX flow, wrong data display
- **MEDIUM** — suboptimal UX, minor inconsistency
- **LOW** — cosmetic, nice-to-have

---

## 8. Feature Development Workflow

```
1. Планирование (Plan Mode)
   └── Создать план в .claude/plans/
   └── Сохранить в memory (project-файл)
   └── Обновить ROADMAP.md

2. Реализация (по фазам)
   └── Фаза N:
       ├── Написать код
       ├── tsc --noEmit
       ├── Коммит
       └── Обновить ROADMAP

3. Верификация
   └── tsc + lint
   └── Edge cases
   └── i18n обоих локалей
   └── Dark/Light mode

4. Аудит (перед релизом)
   └── Multi-agent audit
   └── Fix findings
   └── Re-audit

5. Релиз
   └── Обновить версию
   └── Build
   └── Push
```

---

## 9. Session Continuity

### В конце каждой сессии
1. Коммит всех незафиксированных изменений
2. Обновить MEMORY.md — текущее состояние, что сделано, что осталось
3. Обновить ROADMAP.md — отметить прогресс
4. Обновить/создать memory-файлы для новых решений
5. Сохранить планы в `.claude/plans/`

### В начале новой сессии
- Claude автоматически загружает MEMORY.md
- Читает ROADMAP.md для контекста
- Читает активный план из `.claude/plans/`
- Продолжает с места остановки

### Ключевое правило
> **Никакой информации не должно теряться между сессиями.**
> Всё что нужно для продолжения = MEMORY.md + ROADMAP.md + .claude/plans/

---

## 10. Quality Principles

1. **Никаких placeholder'ов** — реализовать полностью или пометить `TODO` с тикетом
2. **Никаких хардкодов** — всё через i18n, константы, конфиги
3. **Edge cases** — 0 данных? 1 запись? 1000 записей? Пустая строка? null?
4. **Обе локали** — проверять RU и EN (или все локали проекта)
5. **Обе темы** — Light и Dark mode
6. **Offline** — что происходит без сети?
7. **Безопасность** — OWASP Top 10, no injection, no XSS
8. **Accessibility** — minHeight 44px для тач-целей, контраст текста
9. **Медицинские данные** — если применимо: disclaimer, не давать диагнозов, ссылки на литературу

---

## 11. Git Workflow

```
master ─── production branch
  └── feature/xxx ─── feature branches (optional для крупных фич)
```

### Для одного разработчика
- Работа прямо в master (с частыми коммитами)
- Feature branches для экспериментальных/крупных фич
- Теги для релизов: `v1.0.0`, `v1.1.0`

### Для команды
- Protected master, PR required
- Feature branches обязательны
- Review перед merge

---

## 12. Адаптация под проект

### Что менять при копировании
1. **ROADMAP.md** — создать с нуля под проект
2. **MEMORY.md** — создать с нуля, описать проект
3. **Команды проверки** — заменить `npx tsc --noEmit` на эквивалент:
   - Python: `mypy .`, `pytest`
   - Go: `go vet ./...`, `go test ./...`
   - Rust: `cargo check`, `cargo test`
4. **Агенты аудита** — убрать специфичные (medical), оставить универсальные
5. **i18n** — если нет, убрать из чеклистов
6. **Медицинские правила** — убрать если не применимо

---

## Quick Reference

| Действие | Что делать |
|----------|-----------|
| Новая фича | Plan → Code → tsc → Commit → ROADMAP |
| Баг-фикс | Read → Fix → tsc → Commit → ROADMAP |
| Конец сессии | Commit → MEMORY → ROADMAP → Plans |
| Перед релизом | Audit → Fix → Re-audit → Build → Push |
| Новый проект | Скопировать этот файл + создать ROADMAP + MEMORY |
