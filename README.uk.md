# Project Consulting MCP: спочатку Index

**Опубліковано:** [npm-пакет `@ramirkoz/project-consulting-mcp@0.1.0`](https://www.npmjs.com/package/@ramirkoz/project-consulting-mcp) та [офіційний MCP Registry `io.github.ramirkoz/project-consulting@0.1.0`](https://registry.modelcontextprotocol.io/v0.1/servers/io.github.ramirkoz%2Fproject-consulting/versions/0.1.0).

Фаза A містить три інструменти лише для читання:

- index_search_mcp_servers: пошук датованих метаданих MCP-серверів через відкритий API Index. Результати не підтверджують справність чи безпеку сторонніх серверів.
- index_capabilities: інформація про публічні можливості Index.
- coster_export_guide: локальна статична довідка, де отримати офіційні експорти OpenAI, OpenRouter, Claude та Gemini.

Пошуковий запит Index передає тільки текст пошуку, offset і limit на pc.zp.ua. **Фаза A не читає файлів користувача**, не створює Full Report, не передає фінансових CSV, не приймає дослідницької згоди й не збирає API-ключі.

Потрібні Node.js >= 20, MCP SDK v2, Zod 4. Сервер використовує stdio і запускається тільки локальним MCP-клієнтом, а не як додатковий сервер на HostPro.

Для повного звіту Coster людина має відкрити https://pc.zp.ua/coster/ і надати окрему згоду у браузері.

Це окремий публічний репозиторій вихідного коду MCP із ліцензією **MIT**. Версія **0.1.0** вже опублікована в npm та офіційному MCP Registry. Для локальної розробки (Node.js 20+) використовуйте `npm ci` та `npm test`. Залежності зафіксовано в `package-lock.json`. Зверніть увагу: вже опубліковані метадані npm/Registry 0.1.0 могли зберегти посилання на початковий приватний репозиторій; поява цього репозиторію їх автоматично не змінює. Нові зміни випускаються тільки наступною версією.

Phase B із локальним coster_audit_files — майбутній окремий випуск після фази Index.
