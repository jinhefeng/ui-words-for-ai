# ADR-001：访问分析使用 Umami Cloud

- Status: accepted
- Date: 2026-11-01
- Context: 维护者希望查看网站访问数据；主站部署在 GitHub Pages，没有用于接收和保存事件的自有后端。
- Decision: 接入 Umami Cloud 托管统计。网站在配置 Website ID 且域名匹配时加载官方 tracker；只启用页面浏览，排除查询参数并尊重 Do Not Track。Umami Cloud 提供维护者后台。
- Alternatives: 自建 Worker/数据库/后台；改用其他第三方统计产品；不采集访问数据。维护者已选择第三方统计平台，本项目选 Umami Cloud 以复用其托管后台并保持网站静态部署。
- Consequences: 无新增项目后端或依赖安装步骤；需维护者自行创建并管理 Umami Cloud 账号和 Website ID。统计记录存放在第三方，无法补录历史访问，使用量受账户方案约束。Umami 会处理 IP 和浏览器信息以生成匿名会话/估算地区，网络服务也可能有运行或安全日志。
- Affected packages/components: WP-09; `src/lib/analytics.js`; `src/lib/analytics-config.js`; `src/app.js`; `index.html`; README、贡献指南、产品设计和架构文档。
- Verification: 配置 ID 前应不发出统计请求；配置后在正式站点通过 Umami Realtime 检查初始访问和 hash 路由。线上门待维护者配置账号后完成。
- References: [Umami tracker configuration](https://docs.umami.is/docs/tracker-configuration), [SPA tracking](https://docs.umami.is/docs/guides/track-single-page-apps), [metric definitions](https://docs.umami.is/docs/metric-definitions), [Cloud pricing](https://umami.is/pricing).
