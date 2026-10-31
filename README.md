# 说准一点 · UI Words

> 面向 AI Coding 新手的交互术语教程：把“做个弹窗”变成 AI 能准确实现的界面指令。

很多界面需求听起来只有一个词，实际却对应多种交互。比如“弹窗”可能是自动消失的 Toast、需要用户处理的 Modal Dialog、从侧边进入的 Drawer，或贴着某个按钮出现的 Popover。说清术语、触发方式和结束条件，AI 才更容易写对。

## 当前原型

- 术语可搜索、按场景筛选。
- 每个术语说明它解决什么问题、何时使用，以及和相近术语的区别。
- 右侧示例可以实际操作，并提供可复制的 AI 指令。
- 首批内容聚焦 Toast、Modal Dialog、Alert Dialog、Drawer、Popover、Tooltip 和 Bottom Sheet。
- 使用原生 HTML、CSS 和 JavaScript，无构建步骤、无依赖。

## 本地运行

在项目目录运行：

```sh
python3 -m http.server 8000
```

然后打开 <http://localhost:8000>。也可以用任意静态文件服务器托管。

## 内容原则

一个术语条目应帮助读者从真实需求走向明确指令，至少回答：

1. 用户想完成什么？
2. 交互何时出现，用户如何结束或确认？
3. 是否阻断当前页面、是否有锚点、是否自动消失？
4. 哪个术语准确描述这种行为？

术语是沟通工具。遇到实现差异时，优先写明触发、位置、关闭方式、键盘行为和无障碍语义，再补上术语名。

## 贡献

欢迎补充术语、修正边界、改进例子或提升无障碍体验。开始前请阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 项目状态

这是一个首版原型，公开仓库位于 [jinhefeng/ui-words-for-ai](https://github.com/jinhefeng/ui-words-for-ai)。项目许可证尚未选择；在许可证确定前，请勿把本项目视为已授予复用权。
