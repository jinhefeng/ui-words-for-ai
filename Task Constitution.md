# Task Constitution

## 1. Mission
Build a public, beginner-friendly tutorial that starts from novice product language and user goals, uses clarifying questions to map one vague request to multiple precise UI patterns, and pairs each pattern with an explanation, an interactive HTML example, and a copyable AI instruction.

## 2. Success Criteria
- [ ] A newcomer with no UI vocabulary can start from an everyday phrase and understand the questions that narrow the solution.
- [ ] A common colloquial phrase can be opened as a one-to-many map, with each option shown by its Chinese plain-language name, effect, usage, downside, and interactive example.
- [ ] The help page explains how contributors add all six linked data objects: demand categories, colloquial phrases, patterns, scenarios, task journeys, and sources.
- [ ] Ambiguous requests map to multiple relevant patterns with clear decision reasons; each pattern has a plain-language explanation, usage boundary, runnable example, and precise instruction.
- [ ] The project has a usable public-repository structure, contribution guidance, and a recorded license/reuse boundary before inviting reuse.

## 3. Task Tree
### T1 — 术语体系与教程内容
- Status: 进行中
- Objective: 从新手产品经理的口语表达和用户目标出发，建立“一种说法 → 澄清条件 → 多个精准交互模式”的内容体系。
- Acceptance: 口语入口覆盖常见需求；含糊表达能映射到多个候选模式和可理解的判断条件；每个模式有解释、适用边界、示例和精准指令。
- Children: 本轮扩展至 17 个需求族、161 个需求场景、128 条俗语检索表达和 72 个交互模式；数据另含 8 条任务脉络与 51 个去重来源。新增主题均有官方来源、条件分支及跨实体 ID 关系。持续校准多义表达、中文叫法、判断条件和实体关联。

### T2 — 交互式教程原型
- Status: 进行中
- Objective: 让读者从自己的口语需求进入，通过少量澄清问题比较多个模式，再操作 HTML 示例并生成精准指令。
- Acceptance: 需求探索与俗语入口服务小白用户，专业术语为辅助查阅；推荐理由和分支可解释；示例、比较和中文优先的 AI 指令与内容数据关联；桌面和窄屏可用。
- Children: buildless 静态网站框架、需求场景目录、8 条任务脉络筛选、场景和模式的官方来源详情、俗语一对多索引、中文优先术语页、纯函数推荐逻辑、交互示例目录、复制指令和六类数据对象贡献帮助页已实现；场景/俗语/术语目录手动分页，模式关联场景每批呈现 6 条，俗语详情的交互预览接近视口时再挂载；内容扩充发布于 Version 12，访问分析接入发布于 Version 13，Umami ID、自有域名与更新后的配置说明发布于 Version 15；浏览器体验门仍包含窄屏、键盘与屏幕阅读器人工验收。

### T3 — 公共项目初始化与交付
- Status: 进行中
- Objective: 建立适合公开维护的仓库文件、说明和贡献入口，并明确公开发布步骤。
- Acceptance: 本地 Git 项目、清晰 README、贡献说明和许可证决策记录齐备；远程地址与可见性可验证。
- Children: 许可证仍待项目所有者决定；公开仓库和首版文件已创建并同步；Site Version 15 已发布，保留原访问范围。

### T4 — 零星项目 / Miscellaneous
- Status: 进行中
- Objective: 收纳不属于主工作流的小型、独立事项。
- Acceptance: 每个事项都有来源、状态和下一动作。
- Children:
  - **T4.1 — 网站访问统计**
    - Status: 进行中
    - Objective: 让维护者在托管统计后台查看网站访问数据，同时保持教程站点静态部署。
    - Acceptance: 正式站点配置统计 ID 后，能看到页面浏览和 hash 路由；公开页面说明数据采集范围；搜索和 AI 指令不作为事件发送。
    - Dependencies: Website ID 已写入 GitHub Pages 与 Sites 源配置；Sites Version 15 已发布。GitHub Pages 变更仍需推送，自有服务器需部署后再做 Realtime 核对。

## 4. Current Focus
- Task: T4.1
- Parent path: T4 零星项目 → T4.1 网站访问统计
- Objective: 完成 Umami Cloud 可选访问分析接入。
- Next action: 推送根目录改动并在 `ui.saveas.me` 部署更新后的静态文件；访问各正式域名后，在 Umami Realtime 报告核对页面浏览和 hash 路由。

## 5. Decision Log
| Date | Decision | Rationale | Impact |
|---|---|---|---|
| 2026-10-31 | 首版使用原生 HTML/CSS/JS 与静态术语数据 | 无需构建工具，新手可直接阅读和修改 | 便于 fork、学习和静态托管 |
| 2026-10-31 | 以“弹窗”相关术语作为首轮交互样本 | 这是用户给出的典型模糊表达，可清楚展示精确术语的价值 | 保留并映射到口语需求族；首期不再只覆盖浮层 |
| 2026-10-31 | 主内容从小白口语入口映射到多个交互模式；术语表降为辅助索引 | 用户要求以小白产品经理的视角组织内容，并强调一对多映射 | T1、T2 的范围和主导航调整；详细方案见 `docs/system-design.md` |
| 2026-10-31 | 创建公开 GitHub 仓库 `jinhefeng/ui-words-for-ai` | 用户明确要求 public 项目 | 首版源文件同步到公开仓库；许可证仍未选择 |
| 2026-10-31 | 先以 17 个种子案例搭建可扩展的网站框架 | 用户要求先建立网站入口和一批案例，后续持续补充内容 | 主流程从需求族进入案例、条件分支、组件预览和可编辑指令；采用静态 JSON 数据与原生模块 |
| 2026-10-31 | 项目采用传统静态站点，不引入数据库或应用后端 | 用户希望方便部署、分享和继续丰富内容 | HTML/CSS、原生 JavaScript 与仓库内 JSON 文件；不依赖 UI 框架、构建服务或远程 API |
| 2026-10-31 | 增加“俗语”入口并优先展示中文表达，专业术语作为补充 | 用户指出“弹框”“文本框”等常用说法可能对应多种行为，新手需要先理解差异再学习标准名称 | 新增俗语到多个模式的静态映射；案例推荐和复制指令使用中文叫法优先 |
| 2026-10-31 | 俗语详情采用“先看效果，再解释”的顺序 | 用户指出进入俗语后应先展示多种效果及名称，再解释每种效果；先读说明再看效果会颠倒学习顺序 | 每个候选先显示中文名称和可操作示例，再显示作用、影响、场景和 AI 说法；俗语辨析文字后置 |
| 2026-10-31 | 俗语效果卡默认紧凑展示，详细解释由读者展开 | 用户要求一屏展示更多可能效果；说明文字可以在二次操作后再出现 | 采用响应式多列效果卡，先展示中文名称、标准名和可操作示例；“了解这个效果”展开影响、场景、注意点和中文 AI 说法；页面间距整体收紧 |
| 2026-10-31 | 导航调整为“按需求找、按俗语找、按术语找、按场景找、帮助说明” | 用户要求按学习入口重命名并排序菜单，同时需要指导贡献者增加四类内容 | 顶部主导航作为唯一浏览菜单；帮助页分别说明 `families.json`、`colloquialisms.json`、`patterns.json`/示例注册表和 `cases.json` 的维护方法 |
| 2026-10-31 | 移除重复的页面导航，并为四类内容显示动态数量 | 用户指出红框中的第二导航重复，并希望需求与术语数量出现在主导航 | 需求、俗语、术语、场景数量直接从数据数组读取；手机窄屏通过顶部导航横向滚动访问完整菜单 |
| 2026-10-31 | 将帮助说明扩展为人类与 AI 共用的维护规范 | 用户明确帮助页也要指导 AI，需要比简短介绍更完整 | 新增 AI 协作契约、字段与 ID 关联规则、推荐匹配说明、预览边界、完成检查清单和可复用任务模板 |
| 2026-10-31 | 用官方设计系统指引扩展内容目录，并按需呈现大列表 | 用户要求先搜索并大幅丰富内容，同时关注大量内容加载卡顿 | 首轮增至 40 个场景；记录 WAI-ARIA APG、GOV.UK 和 USWDS 来源；目录手动分页，俗语详情预览接近视口时挂载 |
| 2026-10-31 | 按官方服务任务脉络继续扩展需求场景 | 用户指出 40 个场景远远不足，要求有来源、有脉络，不凭空造案例 | 新增 84 个有官方来源 ID 的情境，总计 124 个；增加 8 条任务脉络入口和详情来源；场景每页 12 条、模式关联场景每批 6 条；明确示例改写不是访谈原话 |
| 2026-11-01 | 为静态站点增加第三方托管访问分析 | 用户要求在后台查看网站访问数据，并选择第三方统计平台 | 新增 T4.1；采用 Umami Cloud 页面浏览统计，不自建后端；线上数据仍等待维护者配置 Website ID |
| 2026-11-01 | 发布访问分析接入代码到 Sites Version 13 | Sites 发布流程完成，保留原访问范围 | 页面说明和可选 tracker 已部署；Website ID 为空，尚未开始采集；GitHub Pages 配置仍在根目录工作区 |
| 2026-11-01 | 精简页脚采集说明、配置 Umami Website ID，并加入 `ui.saveas.me` 域名；发布 Sites Version 15 | 维护者提供 Website ID 和自有服务器域名 | Sites 已部署新配置；GitHub Pages 待推送，自有服务器待部署并核对 Realtime |

## 6. Knowledge Context
- Constraints: 面向 AI Coding 新手；俗语是导航入口之一；一个俗语可对多个模式；使用中文语言名称优先，专业术语为补充；强调“先说清用户意图和交互，再选术语”。
- Dependencies: GitHub 公开仓库 `https://github.com/jinhefeng/ui-words-for-ai` 是项目公开源码入口；现有 GPT Site 已发布 Version 15，保留其现有访问范围；Umami Website ID 已配置，需将根目录版本推送到 GitHub Pages，并在自有服务器部署后核对数据。
- Relevant files: `docs/system-design.md`, `docs/content-research.md`, `.engineering/architecture-baseline.md`, `.engineering/delivery-plan.md`, `README.md`, `src/`。
- Open decisions: 项目许可证尚未选择。当前项目名为“说准一点 / UI Words”，GitHub 仓库为 `jinhefeng/ui-words-for-ai`。

## 7. Change History
| Date | Change | Reason | Affected tasks |
|---|---|---|---|
| 2026-10-31 | 初始化 mission、成功标准、三条主工作流及首版范围 | 用户请求启动面向新手的公开 AI Coding 术语教程项目 | T1, T2, T3 |
| 2026-10-31 | 初始化静态交互教程并创建 public GitHub 仓库 | 交付首批术语、组件预览和公开维护入口 | T1, T2, T3 |
| 2026-10-31 | 将新手口语到精准模式的一对多映射确立为产品主线 | 用户明确确认小白视角，并要求进一步设计产品功能与技术架构 | T1, T2 |
| 2026-10-31 | 首期用 17 个真实说法展示 8 个需求族到 32 个交互模式的映射 | 先用实际案例搭出网站框架，未来独立增补内容 | 内容与页面逻辑分离；新增案例引用已有模式和受限分支数据 |
| 2026-10-31 | 增加 25 个俗语入口和一个中文叫法优先的浏览路径 | 把新手已有词汇连接到多种精确做法，让用户能边看效果边学习名称 | 新增 `colloquialisms.json`；模式目录扩展至 33 项；指令生成器不再把英文术语放在首位 |
| 2026-10-31 | 将俗语对照、中文 AI 说法预览发布到公开仓库和 GPT Sites Version 3 | 让新手能先看清可直接复制的话，再决定采用哪种界面做法 | 网站可体验；后续继续按维护者和用户反馈扩展内容 |
| 2026-10-31 | 根据反馈重排俗语详情并发布 GPT Sites Version 4 | 用户要求从俗语进入后先看到不同界面效果及名称，说明文字放在视觉预览之后；浏览器确认了新的页面顺序 | 候选卡先展示中文名和可操作预览，再展示解释、场景和 AI 说法；任务树结构不变 |
| 2026-10-31 | 压缩俗语效果卡与全站间距并发布 GPT Sites Version 6 | 用户希望默认看到更多效果，解释由二次操作展开，并指出全站空隙过大 | 桌面效果卡改为三列、平板两列、窄屏单列；折叠说明保留场景、影响、注意点和中文 AI 说法；整体间距收紧，任务树结构不变 |
| 2026-10-31 | 调整五项主导航并增加贡献帮助页，发布 GPT Sites Version 7 | 用户指定入口名称和顺序，并要求说明怎样补充需求、俗语、术语和场景 | 主导航作为唯一浏览入口；新增网站内维护说明和完整贡献指南链接 |
| 2026-10-31 | 移除重复导航、增加四类动态计数并扩充 AI 维护帮助，发布 GPT Sites Version 8 | 用户指出页面导航重复，要求需求与术语计数，并要求帮助说明也能直接指导 AI | 顶部菜单保留五项顺序并显示动态计数；帮助页与 `CONTRIBUTING.md` 统一为详细的 AI/人工编辑规范 |
| 2026-10-31 | 扩展内容并按目录分页、近视口挂载示例，发布 GPT Sites Version 9 | 用户要求内容大幅增加并避免大页面一次渲染造成卡顿 | 40 个场景、57 个俗语、48 个模式；三个目录使用分页，俗语详情交互示例按需挂载 |
| 2026-10-31 | 新增 23 个日常说法入口，发布 GPT Sites Version 10 | 在已覆盖的案例和模式间补充更多用户常见表达 | 俗语入口增至 80 个，搜索仍跨完整数据集，分页和近视口预览策略保持有效 |
| 2026-10-31 | 增加官方任务脉络与 84 个有来源的场景，并发布 Version 11 | 用户要求增加更多有脉络、能追溯官方依据的场景，并控制一次渲染的 DOM 数量 | 场景总数 124；8 条任务脉络可从首页和场景筛选进入；每条场景显示来源；浏览器确认条件分支更新推荐，case list 每页 12 项、pattern 关联案例每批 6 项；Version 11 发布成功 |
| 2026-11-01 | 按六个主题系统扩充其他对象类型并发布 Version 12 | 用户要求需求族、俗语、模式等对象同步增加，并保持内容脉络 | 新增 6 个需求族、48 条俗语表达、24 个模式、37 个场景和 10 个来源；总量为 17/128/72/161/8/51；官方依据、场景分支和跨实体关系经核对，浏览器确认导航数量、筛选、来源说明及条件推荐；Version 12 发布成功 |

## 8. Detail Pointers
- Format: v1 single-file
- Active branch detail: none
- History: this file
- Product design proposal: `docs/system-design.md`
- Engineering baseline: `.engineering/architecture-baseline.md`
- Work-package detail: `.engineering/delivery-plan.md`

## 9. Current Round
- Round: R7（站点访问统计接入）
- Frontier: T4.1
- Granularity target: objective + static-site integration + provider setup + Realtime acceptance
- Exit condition: Umami Cloud Website ID 与三个正式域名已配置；线上页面浏览、hash 路由和隐私边界均完成核对。

## 10. Technical Debt Queue
| ID | Discovered in | Debt | Why deferred | Trigger / target round | Priority | Status |
|---|---|---|---|---|---|---|
| D1 | T3 | 选择许可证并记录复用边界 | 需项目所有者决定；公开可见不等于自动授予使用权 | 邀请外部复用或收贡献前 | 高 | 待决策 |
