# Task Constitution

## 1. Mission
Build a public, beginner-friendly tutorial that starts from novice product language and user goals, uses clarifying questions to map one vague request to multiple precise UI patterns, and pairs each pattern with an explanation, an interactive HTML example, and a copyable AI instruction.

## 2. Success Criteria
- [ ] A newcomer with no UI vocabulary can start from an everyday phrase and understand the questions that narrow the solution.
- [ ] A common colloquial phrase can be opened as a one-to-many map, with each option shown by its Chinese plain-language name, effect, usage, downside, and interactive example.
- [ ] Ambiguous requests map to multiple relevant patterns with clear decision reasons; each pattern has a plain-language explanation, usage boundary, runnable example, and precise instruction.
- [ ] The project has a usable public-repository structure, contribution guidance, and a recorded license/reuse boundary before inviting reuse.

## 3. Task Tree
### T1 — 术语体系与教程内容
- Status: 进行中
- Objective: 从新手产品经理的口语表达和用户目标出发，建立“一种说法 → 澄清条件 → 多个精准交互模式”的内容体系。
- Acceptance: 口语入口覆盖常见需求；含糊表达能映射到多个候选模式和可理解的判断条件；每个模式有解释、适用边界、示例和精准指令。
- Children: 已建立 8 个小白需求族、17 个种子案例和 25 个俗语入口；当前持续校准多义表达、中文叫法、区分问题和关联案例。

### T2 — 交互式教程原型
- Status: 进行中
- Objective: 让读者从自己的口语需求进入，通过少量澄清问题比较多个模式，再操作 HTML 示例并生成精准指令。
- Acceptance: 需求探索与俗语入口服务小白用户，专业术语为辅助查阅；推荐理由和分支可解释；示例、比较和中文优先的 AI 指令与内容数据关联；桌面和窄屏可用。
- Children: buildless 静态网站框架、案例目录、俗语一对多索引、中文优先术语页、纯函数推荐逻辑、交互示例目录和复制指令已实现；响应式、键盘与屏幕阅读器人工验收仍待完成。

### T3 — 公共项目初始化与交付
- Status: 进行中
- Objective: 建立适合公开维护的仓库文件、说明和贡献入口，并明确公开发布步骤。
- Acceptance: 本地 Git 项目、清晰 README、贡献说明和许可证决策记录齐备；远程地址与可见性可验证。
- Children: 许可证仍待项目所有者决定；公开仓库和首版文件已创建并同步。

### T4 — 零星项目 / Miscellaneous
- Status: 未开始
- Objective: 收纳不属于主工作流的小型、独立事项。
- Acceptance: 每个事项都有来源、状态和下一动作。
- Children: 按需展开。

## 4. Current Focus
- Task: T1 + T2 + T3
- Parent path: Project initialization
- Objective: 落地俗语一对多浏览，让小白能比较中文叫法、效果、场景和预览，再复制清楚的中文指令。
- Next action: 更新公开仓库和 GPT Sites 预览，然后进行浏览器人工体验走查。

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

## 6. Knowledge Context
- Constraints: 面向 AI Coding 新手；俗语是导航入口之一；一个俗语可对多个模式；使用中文语言名称优先，专业术语为补充；强调“先说清用户意图和交互，再选术语”。
- Dependencies: 本地 Git 工作区已与 GitHub 公开仓库 `https://github.com/jinhefeng/ui-words-for-ai` 的 `main` 分支同步，暂存树与远端提交核对一致。
- Relevant files: `docs/system-design.md`, `.engineering/architecture-baseline.md`, `.engineering/delivery-plan.md`, `README.md`, `src/`。
- Open decisions: 项目许可证尚未选择。当前项目名为“说准一点 / UI Words”，GitHub 仓库为 `jinhefeng/ui-words-for-ai`。

## 7. Change History
| Date | Change | Reason | Affected tasks |
|---|---|---|---|
| 2026-10-31 | 初始化 mission、成功标准、三条主工作流及首版范围 | 用户请求启动面向新手的公开 AI Coding 术语教程项目 | T1, T2, T3 |
| 2026-10-31 | 初始化静态交互教程并创建 public GitHub 仓库 | 交付首批术语、组件预览和公开维护入口 | T1, T2, T3 |
| 2026-10-31 | 将新手口语到精准模式的一对多映射确立为产品主线 | 用户明确确认小白视角，并要求进一步设计产品功能与技术架构 | T1, T2 |
| 2026-10-31 | 首期用 17 个真实说法展示 8 个需求族到 32 个交互模式的映射 | 先用实际案例搭出网站框架，未来独立增补内容 | 内容与页面逻辑分离；新增案例引用已有模式和受限分支数据 |
| 2026-10-31 | 增加 25 个俗语入口和一个中文叫法优先的浏览路径 | 把新手已有词汇连接到多种精确做法，让用户能边看效果边学习名称 | 新增 `colloquialisms.json`；模式目录扩展至 33 项；指令生成器不再把英文术语放在首位 |

## 8. Detail Pointers
- Format: v1 single-file
- Active branch detail: none
- History: this file
- Product design proposal: `docs/system-design.md`
- Engineering baseline: `.engineering/architecture-baseline.md`
- Work-package detail: `.engineering/delivery-plan.md`

## 9. Current Round
- Round: R3
- Frontier: T1, T2, T3
- Granularity target: objective + output + acceptance
- Exit condition: 俗语入口、中文叫法优先的案例/术语页和可复制指令已实现，并更新公开仓库及预览；之后通过维护者体验审阅确定内容修订和扩充优先级。

## 10. Technical Debt Queue
| ID | Discovered in | Debt | Why deferred | Trigger / target round | Priority | Status |
|---|---|---|---|---|---|---|
| D1 | T3 | 选择许可证并记录复用边界 | 需项目所有者决定；公开可见不等于自动授予使用权 | 邀请外部复用或收贡献前 | 高 | 待决策 |
