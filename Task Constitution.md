# Task Constitution

## 1. Mission
Build a public, beginner-friendly tutorial library that teaches people how to describe UI precisely to AI coding tools, pairing each term with a clear explanation, a copyable instruction, and an interactive HTML example.

## 2. Success Criteria
- [ ] A newcomer can distinguish commonly confused UI terms and find the right one for a described need.
- [ ] Each published term has a plain-language explanation, usage guidance, and a runnable interactive example.
- [ ] The project has a usable public-repository structure, contribution guidance, and an explicit license decision before publication.

## 3. Task Tree
### T1 — 术语体系与教程内容
- Status: 进行中
- Objective: 建立可扩展的分类和术语内容模型，先覆盖新手常说的“弹窗”。
- Acceptance: 至少有一组边界清晰的术语，每项包含定义、使用时机、与相近术语的区别及精准指令。
- Children: 当前轮先交付首批术语；更大范围在有证据后展开。

### T2 — 交互式教程原型
- Status: 进行中
- Objective: 让读者能浏览术语并直接操作 HTML 示例。
- Acceptance: 可搜索和筛选术语；详情区能运行对应交互并复制精准指令；桌面和窄屏可用。
- Children: 首版以内置静态数据与原生 Web API 实现。

### T3 — 公共项目初始化与交付
- Status: 进行中
- Objective: 建立适合公开维护的仓库文件、说明和贡献入口，并明确公开发布步骤。
- Acceptance: 本地 Git 项目、清晰 README、贡献说明和许可证决策记录齐备；远程地址与可见性可验证。
- Children: 仓库托管账号/名称和许可证仍待确定后才能完成远程发布。

### T4 — 零星项目 / Miscellaneous
- Status: 未开始
- Objective: 收纳不属于主工作流的小型、独立事项。
- Acceptance: 每个事项都有来源、状态和下一动作。
- Children: 按需展开。

## 4. Current Focus
- Task: T1 + T2 + T3
- Parent path: Project initialization
- Objective: 形成可审阅的首版术语教程项目。
- Next action: 浏览器人工走查七个示例；请维护者决定许可证后再声明复用权。

## 5. Decision Log
| Date | Decision | Rationale | Impact |
|---|---|---|---|
| 2026-10-31 | 首版使用原生 HTML/CSS/JS 与静态术语数据 | 无需构建工具，新手可直接阅读和修改 | 便于 fork、学习和静态托管 |
| 2026-10-31 | 以“弹窗”相关术语作为第一组内容 | 这是用户给出的典型模糊表达，可清楚展示精确术语的价值 | 首批覆盖 Toast、Modal、Alert Dialog、Drawer、Popover、Tooltip、Bottom Sheet |
| 2026-10-31 | 创建公开 GitHub 仓库 `jinhefeng/ui-words-for-ai` | 用户明确要求 public 项目 | 首版源文件同步到公开仓库；许可证仍未选择 |

## 6. Knowledge Context
- Constraints: 面向 AI Coding 新手；强调“先说清用户意图和交互，再选术语”，术语不是脱离情境的关键词清单。
- Dependencies: 本地 Git 工作区已与 GitHub 公开仓库 `https://github.com/jinhefeng/ui-words-for-ai` 的 `main` 分支同步，暂存树与远端提交核对一致。
- Relevant files: `README.md`, `index.html`, `src/`, `Task Constitution.md`。
- Open decisions: 项目许可证尚未选择。当前项目名为“说准一点 / UI Words”，GitHub 仓库为 `jinhefeng/ui-words-for-ai`。

## 7. Change History
| Date | Change | Reason | Affected tasks |
|---|---|---|---|
| 2026-10-31 | 初始化 mission、成功标准、三条主工作流及首版范围 | 用户请求启动面向新手的公开 AI Coding 术语教程项目 | T1, T2, T3 |
| 2026-10-31 | 初始化静态交互教程并创建 public GitHub 仓库 | 交付首批术语、组件预览和公开维护入口 | T1, T2, T3 |

## 8. Detail Pointers
- Format: v1 single-file
- Active branch detail: none
- History: this file

## 9. Current Round
- Round: R1
- Frontier: T1, T2, T3
- Granularity target: objective + output + acceptance
- Exit condition: 三条主工作流均交付首个可审阅结果或明确记录外部阻塞。

## 10. Technical Debt Queue
| ID | Discovered in | Debt | Why deferred | Trigger / target round | Priority | Status |
|---|---|---|---|---|---|---|
| D1 | T3 | 选择开源许可证与远程仓库归属 | 需项目所有者决定；公开可见不等于自动授予使用权 | 首次推送前 | 高 | 待处理 |
