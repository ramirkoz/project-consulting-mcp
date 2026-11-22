# Project Consulting MCP: Index для AI-агентів

**Опубліковано й доступно:** [npm `@ramirkoz/project-consulting-mcp@0.1.1`](https://www.npmjs.com/package/@ramirkoz/project-consulting-mcp/v/0.1.1) та [офіційний MCP Registry `io.github.ramirkoz/project-consulting@0.1.1`](https://registry.modelcontextprotocol.io/v0.1/servers/io.github.ramirkoz%2Fproject-consulting/versions/0.1.1).

> **Поточна гілка — неопублікований кандидат `0.1.2-next.0`.** Вона додає четвертий MCP-інструмент для структурованого shortlist, але його серверний Index API ще НЕ розгорнуто. Встановлювати цей кандидат як готовий продукт не можна. Публічні npm та Registry залишаються на `0.1.1`.

## Опубліковані можливості MCP 0.1.1

| Інструмент | Що робить |
|---|---|
| `index_search_mcp_servers` | Безкоштовний пошук за датованими метаданими MCP-каталогу |
| `index_capabilities` | Показує фактичні можливості та обмеження Index |
| `coster_export_guide` | Без мережі пояснює, як отримати експорти OpenAI, OpenRouter, Anthropic і Gemini |

Ці інструменти не запускають чужі MCP-сервери, не підтверджують їхньої безпеки, не читають локальні фінансові файли й не збирають API-ключі.

## Новий інструмент лише в гілці 0.1.2-next.0

`index_shortlist_mcp_servers` приймає структурований запит:

```json
{
  "query": "pdf",
  "filters": {
    "sourceCodes": ["MCP_OFFICIAL_REGISTRY"],
    "statuses": ["active"],
    "requireRepositoryUrl": true,
    "excludeDeprecated": true
  },
  "limit": 12,
  "offset": 0
}
```

Фільтри відбирають записи **за заявленим джерелом, статусом і наявністю коректних HTTPS-посилань**, перед звичайним Ranking v3. Ніяких нових парсерів природної мови, платежів чи перевірок виконання сторонніх інструментів.

**Важливо:** запис у MCP Registry не доводить, що інструмент створений саме заявленим постачальником. Статус `active` і HTTPS-посилання не доводять справність, безпечність чи успішність MCP-викликів. Відповідь залишається `metadata_only`, `taskSuccessVerified:false`.

Поки backend `/api/v1/index/agent-structured-shortlist` не ввімкнений окремим дозволом, MCP чесно повертає помилку `STRUCTURED_SHORTLIST_UNAVAILABLE`, а не удає, що збігів немає.

## Встановлення чинної публічної версії

Потрібні Node.js 20+ і MCP-клієнт зі stdio.

```bash
npx -y @ramirkoz/project-consulting-mcp@0.1.1
```

Версія `0.1.2-next.0` є тільки у вихідному коді гілки. Команду npm для її встановлення не публікуємо.

## Приватність і фінанси

Coster Free Audit безкоштовний. Full Report також безкоштовний, але вимагає окремої явної згоди на дослідницький ResearchBundle. MCP не оформлює цю згоду і не завантажує файли. Index залишається безкоштовним для людей та агентів. Жодного продажу приватних логів чи фінансових CSV/JSON.

## Статус розробки

- MCP 0.1.1: опубліковано три read-only інструменти, код у main.
- MCP 0.1.2-next.0: четвертий інструмент у відокремленій гілці, без npm/Registry публікації.
- Index P2.0: окремий backend пройшов 5/5 синтетичних тестів на HostPro, але ще не розгорнутий.
- Новий MCP-кандидат: код і синтетичні тести підготовлені; їхній результат ще не підтверджено.

Деталі: [контракт P2.1](docs/INDEX_NEXT_P21_MCP_STRUCTURED_SHORTLIST_CANDIDATE.md). Публікація потребує окремого погодження власника та попередньої активації Index backend. Не змінюємо production, Worker, Discovery, PostgreSQL, cron або Coster.
