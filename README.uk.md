# Project Consulting MCP — Index для AI-агентів

Безкоштовні MCP-інструменти пошуку та порівняння MCP-серверів, а також довідка про експорт витрат на AI. Index і Coster залишаються безкоштовними.

**Поточний реліз: 0.1.4**, опублікований 25.11.2026 у [npm](https://www.npmjs.com/package/@ramirkoz/project-consulting-mcp/v/0.1.4) та [Official MCP Registry](https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.ramirkoz%2Fproject-consulting). Доступні шість інструментів лише для читання.

## Шість інструментів релізу 0.1.4

| Інструмент | Можливість |
| --- | --- |
| `index_search_mcp_servers` | Пошук серверів за призначенням |
| `index_shortlist_mcp_servers` | Структурований відбір за джерелом, статусом і HTTPS-полями |
| `index_compare_mcp_servers` | **Порівняння 2–4 серверів за точними назвами** |
| `index_installation_metadata` | Датовані метадані пакетів і remote-підключень за точною назвою |
| `index_capabilities` | Машинозрозумілий перелік можливостей Index |
| `coster_export_guide` | Довідка щодо експорту OpenAI, OpenRouter, Claude і Gemini |

Приклад вхідних даних для **інструмента точного порівняння**:

```json
{"names":["io.github.example/pdf-reader","github:example/pdf-cleaner"]}
```

Інструмент надсилає лише ці назви до вже реалізованого безкоштовного API `POST https://pc.zp.ua/index-agent/v1/agent-exact-compare`. Результат зберігає порядок, показує відсутні записи та джерела. Історичні відомості RoninForge датовані **13.09.2026**. Вони **не підтверджують** поточну доступність сервера, безпечність, правильність встановлення або успішне виконання завдань. MCP нічого не встановлює та не запускає чужих інструментів.

Новий інструмент `index_installation_metadata` приймає `{"name":"io.github.ramirkoz/project-consulting"}` та звертається до `POST https://pc.zp.ua/index-agent/v1/agent-installation-metadata`. Дані є деклараціями видавців, а не підтвердженням встановлення, безпеки чи автентифікації.

## Технічні межі

Локальний транспорт **stdio**, Node.js 20+, SDK `@modelcontextprotocol/server` 2.4.0. Запит приймає рівно 2–4 унікальні назви, має обмеження 640 байтів, повертає типізовані дані та не вимагає ключів чи платежів. Браузерний доступ до цього агентного API навмисно обмежений.

## Підключення до MCP-клієнта

Команда локального stdio-запуску:

```bash
npx -y @ramirkoz/project-consulting-mcp@0.1.4
```

Приклад конфігурації (формат залежить від MCP-клієнта):

```json
{"mcpServers":{"project-consulting":{"command":"npx","args":["-y","@ramirkoz/project-consulting-mcp@0.1.4"]}}}
```

Реліз 0.1.4 підготовлено з коміту `cfd081de7ef2b2acb1e62ce93e2dba3954533a12`. Чотири цільові тести та живий виклик MCP пройдено на HostPro. Публікацію в обох реєстрах підтверджено 25.11.2026. Опублікований архів містить попередню редакцію README; ці зміни лише в GitHub.

Coster Free Audit залишається безкоштовним, Full Report теж безкоштовний, але потребує явної згоди на ResearchBundle у браузерному застосунку. MCP не може надати її замість користувача, не читає фінансові файли та не проводить оплату.

Технічна документація: [P15f](docs/INDEX_NEXT_P15F_EXACT_COMPARE_MCP_013_SOURCE.md).
