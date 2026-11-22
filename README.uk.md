# Project Consulting MCP: Index для AI-агентів

**Публічна версія:** `@ramirkoz/project-consulting-mcp@0.1.1` у [npm](https://www.npmjs.com/package/@ramirkoz/project-consulting-mcp/v/0.1.1) та `io.github.ramirkoz/project-consulting@0.1.1` в [офіційному MCP Registry](https://registry.modelcontextprotocol.io/v0.1/servers/io.github.ramirkoz%2Fproject-consulting/versions/0.1.1). Вона містить **три** read-only інструменти.

**Ця гілка:** підготовлений, але **ЩЕ НЕ ОПУБЛІКОВАНИЙ** кандидат `0.1.2` із четвертим інструментом `index_shortlist_mcp_servers`.

22.11.2026 власник перевірив незалежний Index Agent за адресою `https://pc.zp.ua/index-agent`: HTTP health/capabilities 200, структурований пошук HTTP 200, 2 результати з 2 866 збігів для запиту `search`. Це перевірка **HTTP API**, а не доказ публікації пакета 0.1.2 чи реального використання його стороннім агентом.

## Інструменти

| Інструмент | Функція | Стан |
| --- | --- | --- |
| `index_search_mcp_servers` | Пошук в існуючому Index API | Є в 0.1.1 |
| `index_capabilities` | Поточні можливості Index | Є в 0.1.1 |
| `coster_export_guide` | Довідка щодо експорту OpenAI, OpenRouter, Claude, Gemini | Є в 0.1.1 |
| `index_shortlist_mcp_servers` | Структурований безкоштовний пошук за джерелом, статусом і HTTPS-полями | Лише кандидат 0.1.2 |

Новий інструмент відбирає записи за явними обмеженнями перед Ranking v3 і повертає **метадані**, а не доказ справності, безпеки чи реального виконання MCP-сервера. Історичне джерело RoninForge має дату **13.09.2026**. Не запускати чужий npm/MCP-код лише на підставі запису в каталозі.

Приклад запиту для майбутнього четвертого інструмента:

```json
{
  "query": "search",
  "limit": 2,
  "filters": {
    "sourceCodes": ["RONINFORGE_STATE_OF_MCP"],
    "excludeDeprecated": true
  }
}
```

## Встановлення чинної версії

Для локального MCP stdio-клієнта потрібен Node.js 20+:

```bash
npx -y @ramirkoz/project-consulting-mcp@0.1.1
```

Ця команда запускає сторонній пакет на вашому пристрої. Перевіряйте джерело та права доступу. **Версію 0.1.2 поки не встановлювати:** реліз в npm і Registry ще не здійснено.

## Приватність і реліз

Index залишається безкоштовним для людей та агентів. MCP не читає локальні фінансові експорти, не передає API-ключі, не запускає чужі MCP-сервери та не проводить платежі.

Coster Free Audit безкоштовний. Full Report не має грошової вартості, але потребує явної згоди на ResearchBundle. MCP не може надавати цю згоду замість користувача.

Вихідний кандидат має узгоджену версію `0.1.2` у package/lock/Registry metadata. Перед випуском потрібен один контрольований release-preflight, окреме погодження власника на npm-публікацію та окреме оновлення Official MCP Registry. Зміни на HostPro або в Coster не потрібні.

Технічний запис: [docs/INDEX_NEXT_P27_STABLE_012_RELEASE_CANDIDATE.md](docs/INDEX_NEXT_P27_STABLE_012_RELEASE_CANDIDATE.md).
