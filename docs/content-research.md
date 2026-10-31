# 内容扩展、来源与加载策略

更新时间：2026-11-01

## 本轮扩展：从服务任务补齐六类对象

上一轮将案例整理成 8 条跨步骤服务脉络。本轮从这些脉络中找出原有目录覆盖薄弱的实体主题，再补齐分类、模式、口语入口和场景之间的连接。当前共有 **17 个需求族、128 条俗语表达、72 个交互模式、161 个需求场景、8 条任务脉络和 51 个去重来源**。相较上一版，本轮新增 6 个需求族、48 条俗语表达、24 个模式、37 个场景和 10 个官方来源。

新增主题按同一套关系模型扩展：每个新需求族至少包含 6 条有条件分支和来源的场景、至少 2 个对应模式；48 条俗语表达按六个主题各整理 8 条，并通过稳定 ID 连接相关模式与场景。模式计数中包括从旧分类迁入新分类的已有条目，因此每个主题现有模式数会比本轮新建数多。

| 新增需求族 | 新增场景 | 新建模式 | 主要任务边界 | 主要来源方向 |
|---|---:|---:|---|---|
| 账户与身份验证 `identity` | 6 | 6 | 账户是否必要、访问码、邮箱/手机号验证、会话到期、保存后退出 | ONS access codes、save and sign out；GOV.UK 创建账户、确认邮箱和手机号 |
| 文件与办理材料 `documents` | 6 | 2 | 上传后核对材料、替换文件、下载回执、判断文件说明与办理清单 | GOV.UK 文件上传与任务清单；USWDS 文件输入和内容集合 |
| 日期、时长与预约 `datetime` | 6 | 2 | 已知日期、持续时间、开放时段与精确时刻的不同输入方式 | GOV.UK Date input；USWDS Date picker、Date range picker、Time picker；ONS durations |
| 联系、反馈与对话 `communication` | 6 | 4 | 联系渠道、反馈与求助的区分、持续消息往返、服务团队回复 | GOV.UK Contact a department or service team；ONS messages、feedback 和 contact patterns |
| 服务偏好与同意 `preferences` | 7 | 3 | Cookie 分类、语言切换、通知主题/渠道、可选偏好与必须提醒的区别 | ONS cookie、language selector；USWDS 表单开关与选择控件 |
| 完整服务页面 `service-pages` | 6 | 7 | 单问题页、适用性分流、提交前检查、确认页、分章节办理、服务故障和主题指南 | GOV.UK question pages、check answers、confirmation、suitability；ONS Hub and Spoke、guide 和状态页面 |

新增模式 ID 为 `access-code`、`account-creation`、`email-confirmation`、`phone-verification`、`session-expiry`、`save-and-exit`、`file-list`、`document-download`、`duration-input`、`time-picker`、`feedback-form`、`contact-form`、`message-thread`、`cookie-preferences`、`language-selector`、`notification-preferences`、`question-page`、`suitability-check`、`check-answers-page`、`confirmation-page`、`hub-and-spoke`、`service-status-page`、`service-guide` 和 `contact-options`。其中材料清单、下载说明和通知偏好是依据多个官方指南归纳的教学组合；详情页会明确标出归纳边界，不把组合包装成官方独立组件。

这些主题都放回已有 8 条服务任务脉络中，而不是按新组件逐条造孤立故事。场景分支只询问会改变推荐的条件，并连接到一个或多个模式、需求族、任务脉络和具体来源。俗语作为搜索入口连接模式和场景，不重复保存完整解释或重新创建同义模式。

## 来源与编辑边界

每条场景和模式都通过 `sourceIds` 指向 `src/data/sources.json` 中可直接打开的来源。来源目录去重保存官方页面标题和 URL。新增来源来自 ONS Service Manual、GOV.UK Design System、USWDS，以及 WAI-ARIA Authoring Practices Guide；来源页面支持任务分类、组件边界或无障碍交互语义，不代表本站的每个组合都被某个设计系统正式命名。

主要依据包括：

- [ONS Service Manual：Patterns](https://service-manual.ons.gov.uk/design-system/patterns)：服务模式目录，涵盖访问码、时长、保存与退出、联系/反馈、Cookie、消息、问题页、确认、服务状态、指南和 Hub and Spoke。
- [ONS Access codes](https://service-manual.ons.gov.uk/design-system/patterns/access-codes)、[Durations](https://service-manual.ons.gov.uk/design-system/patterns/durations) 与 [Save and sign out](https://service-manual.ons.gov.uk/design-system/patterns/save-and-sign-out)：身份访问、持续时长和中断后继续。
- [ONS Control cookies](https://service-manual.ons.gov.uk/design-system/patterns/cookies-settings)：展示如何把必要类别与可选类别分开，并允许用户保存或之后更改偏好；此处只作为通知设置的界面类比，不能用来决定通知规则。
- [GOV.UK Design System：Patterns](https://design-system.service.gov.uk/patterns/)：创建账户、确认联系方式、联系团队、问题页、检查答案、确认页与服务适用性判断。
- [GOV.UK Create accounts](https://design-system.service.gov.uk/patterns/create-accounts/)、[Confirm an email address](https://design-system.service.gov.uk/patterns/confirm-an-email-address/)、[Confirm a phone number](https://design-system.service.gov.uk/patterns/confirm-a-phone-number/)：账户必要性、验证链路和验证失败/重试边界。
- [GOV.UK Check a service is suitable](https://design-system.service.gov.uk/patterns/check-a-service-is-suitable/)、[Question pages](https://design-system.service.gov.uk/patterns/question-pages/)、[Check answers](https://design-system.service.gov.uk/patterns/check-answers/) 与 [Confirmation pages](https://design-system.service.gov.uk/patterns/confirmation-pages/)：先分流、逐题收集、提交前修改和完成后续说明。
- [GOV.UK Contact a department or service team](https://design-system.service.gov.uk/patterns/contact-a-department-or-service-team/)：按问题和服务能力提供合适的联系渠道。
- [USWDS Time picker](https://designsystem.digital.gov/components/time-picker/) 和 [USWDS Components](https://designsystem.digital.gov/components/)：预约时间以及输入、选择、文件、表格和集合控件。
- [WAI-ARIA APG Patterns](https://www.w3.org/WAI/ARIA/apg/patterns/)：键盘与语义边界，尤其是普通表格与交互式网格、对话框、选项和切换控件的区别。

**内容不是用户研究逐字稿。** 卡片中的中文需求、俗语检索表达和角色情境是基于指南任务编写的教学示例；没有明确研究记录时，不加引号冒充用户原话。模式推荐是帮助讨论的教学映射，并不意味着官方要求所有产品选用同一个组件。实际产品还需结合服务规则、真实用户研究和内容测试。

## 六类数据对象与引用

- `families.json`：17 类用户目标入口；场景和模式通过 `family` 归类。
- `colloquialisms.json`：128 条自然语言检索入口；用 `patternIds`、`caseIds` 复用模式与场景。
- `patterns.json`：72 个可区分行为的模式；用 `family` 分类、`sourceIds` 记录依据，必要时以 `sourceNote` 说明本站归纳。
- `cases.json`：161 条任务、澄清问题和条件推荐；每条关联 `family`、`journeyId`、`sourceIds`。
- `journeys.json`：8 条可供多条场景复用的任务脉络。
- `sources.json`：51 项去重后的官方参考页。

## 加载与渲染

六份数据作为站点静态资源随页面提供，浏览器启动时通过 `Promise.all` 并行读取；页面浏览不请求案例 API。当前六份 JSON 合计约 **425 KB**（425,014 字节，未压缩），场景和模式仍可完整搜索，来源标题与 URL 只保存一次。官方链接只有在读者点击后才离开站点。

可见内容按固定批次渲染：场景每页 12 项、俗语每页 18 项、模式每页 24 项；模式详情中的关联场景每批 6 项；俗语候选的交互预览滚动到接近视口时才挂载。搜索和筛选作用于完整数据集，但列表 DOM 只包含当前页；不使用无限滚动，也不一次性创建全部预览。

下一步的性能决策以真实浏览器数据为准：若移动设备出现 JSON 下载、解析或启动时间瓶颈，再按任务脉络拆分数据文件，并为全局搜索保留按需加载或索引方案。增加对象数量本身不应扩大同一屏的 DOM 数量。
