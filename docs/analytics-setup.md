# Umami Cloud 访问分析配置

本站保留 GitHub Pages 静态部署；Umami Cloud 提供第三方事件接收服务和维护者统计后台。本仓库只含可选 tracker 接入代码，不包含统计账号或个人凭据。

## 启用步骤

1. 在 [Umami Cloud](https://cloud.umami.is/signup) 注册账号并添加一个网站。创建账户时需选择 US 或 EU 数据区域；[Umami 文档](https://docs.umami.is/docs/cloud/faq)目前说明该选项之后不可直接修改，请先确认再完成注册。当前配置的正式地址是 `jinhefeng.github.io`（GitHub Pages）、`ui-words-guide.jinhefeng.chatgpt.site`（Sites）和 `ui.saveas.me`（自有服务器）。
2. 打开 Umami 网站设置中的 Tracking code，复制 Website ID。Website ID 是会公开出现在网站代码里的标识，不是登录密码或 API 密钥。
3. 在对应发布源的 `src/lib/analytics-config.js` 中检查或设置 Website ID：Sites 发布源是 `sites/ui-words-preview/src/lib/analytics-config.js`；根目录 `src/lib/analytics-config.js` 对应 GitHub Pages。若多个地址共用同一个 Umami 网站，在两份配置里填写相同 ID。`domains` 数组默认包含上述三个地址；只统计其中部分时删掉其他域名。不要把开发环境域名加入统计范围。
4. 发布对应静态站点。Sites 源需要保存并发布新版本；GitHub Pages 在把变更推送到 `main` 后由仓库工作流部署。站点只在 Website ID 非空且域名匹配时加载统计脚本。
5. 登录 [Umami Cloud 后台](https://cloud.umami.is/dashboard)，打开该网站的 Realtime 报告，分别访问首页、一个需求页和一个案例详情页，确认页面浏览进入统计。页面使用 hash 路由，Umami 默认保留 hash 页面路径。

## 统计范围

- 当前只统计页面浏览；能按页面查看访问量，并查看会话、引荐来源、浏览器、操作系统、设备和大致地区。
- 主站统计脚本遵守浏览器 Do Not Track 设置，并排除 URL 查询参数。站内搜索内容保存在浏览器运行状态中，不作为访问事件发送；AI 指令和示例控件输入值也不会发送。
- Umami 通过访问者 IP 地址和浏览器信息生成匿名会话，并可估算地区。Umami 文档说明，原始 IP 不作为标准分析记录字段；其网络服务及处理商仍可能为运行和安全目的处理相关网络数据。详情见 [Umami 指标定义](https://docs.umami.is/docs/metric-definitions)、[Umami Cloud 常见问题](https://docs.umami.is/docs/cloud/faq) 和[隐私说明](https://umami.is/privacy)。
- 若统计脚本被广告拦截器、浏览器设置或网络策略拦截，数据可能不完整。上线前的访问无法回填。此统计服务用于匿名访问分析，不提供按真实身份查询用户的审计日志。

截至 2026-11-01，Umami Cloud Hobby 免费档列出每月最多 100,000 个事件、1 个网站和 6 个月分析数据保留；计划和配额可能变化，使用前查看[当前价格](https://umami.is/pricing)与账户中的用量页。我们不会在代码中自动升级付费方案。

## 暂停或移除

将 `analytics-config.js` 中的 `websiteId` 清空并重新发布，即可停止加载统计脚本。统计后台已收集的数据仍由 Umami Cloud 账号管理；删除、导出和保留期限应在该账号的服务设置中处理。
