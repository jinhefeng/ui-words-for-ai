const button = (label, action = "toast", extra = "") => `<button class="demo-button ${extra}" type="button" data-demo-action="${action}">${label}</button>`;
const field = (label, type = "text", placeholder = "请填写") => `<label class="demo-control"><span>${label}</span><input type="${type}" placeholder="${placeholder}" /></label>`;

export function renderDemo(pattern) {
  const id = pattern.demoId;
  const examples = {
    "text-field": `${field("项目名称", "text", "例如：春季营销")}${button("保存名称")}`,
    textarea: `<label class="demo-control"><span>项目说明</span><textarea rows="3" placeholder="写下需要补充的说明…"></textarea></label><small>支持换行</small>`,
    "password-field": `${field("登录密码", "password", "至少 8 位")}${button("显示密码", "toggle-password")}`,
    "search-field": `<label class="demo-control"><span>搜索客户</span><input type="search" placeholder="输入名称，例如 Mina" data-demo-search /></label><div class="demo-result-list"><button type="button">Mina Chen · mina@example.com</button><button type="button">Ming Zhao · ming@example.com</button><button type="button">Maya Lin · maya@example.com</button></div>`,
    combobox: `<label class="demo-control"><span>选择项目</span><input type="search" placeholder="输入以查找候选项" list="demo-projects" /><datalist id="demo-projects"><option>春季营销</option><option>客户访谈</option><option>产品改版</option></datalist></label>`,
    select: `<label class="demo-control"><span>选择地区</span><select><option>请选择地区</option><option>华东</option><option>华南</option><option>华北</option></select></label>`,
    "radio-group": `<fieldset class="demo-options"><legend>选择账户类型</legend><label><input type="radio" name="demo-plan" checked /> 个人 <small>适合独立使用</small></label><label><input type="radio" name="demo-plan" /> 团队 <small>适合多人协作</small></label><label><input type="radio" name="demo-plan" /> 企业 <small>需要高级管理</small></label></fieldset>`,
    "segmented-control": `<div class="demo-segment" role="group" aria-label="视图模式"><button class="selected" type="button">列表</button><button type="button">网格</button></div>`,
    "checkbox-group": `<fieldset class="demo-options"><legend>选择关注的主题</legend><label><input type="checkbox" checked /> 设计</label><label><input type="checkbox" /> 产品</label><label><input type="checkbox" /> 工程</label></fieldset>`,
    "multi-select": `<label class="demo-control"><span>选择标签（可多选）</span><select multiple size="3"><option selected>设计</option><option>产品</option><option>工程</option><option>研究</option></select></label>`,
    checkbox: `<label class="demo-check"><input type="checkbox" /> 保存时同时发送邮件通知</label>`,
    switch: `<label class="demo-switch"><span><strong>开启邮件通知</strong><small>设置会立即生效</small></span><input type="checkbox" role="switch" checked /><i aria-hidden="true"></i></label>`,
    button: button("保存更改", "toast", "primary"),
    link: `<a class="demo-link" href="#demo-destination">查看订单详情 ↗</a>`,
    toast: button("保存并显示 Toast"),
    "inline-status": `<div class="demo-status"><b>✓</b><span><strong>已保存</strong><small>所有更改已同步</small></span></div>`,
    banner: `<div class="demo-banner"><span>网络连接不稳定，请检查网络后重试。</span>${button("重试")}</div>`,
    "inline-validation": `<label class="demo-control"><span>邮箱地址</span><input aria-invalid="true" value="mina@" /></label><p class="demo-error">请输入完整的邮箱地址，例如 mina@example.com。</p>`,
    "error-summary": `<div class="demo-error-summary"><strong>请检查以下 2 项</strong><button type="button" data-demo-action="toast">邮箱地址格式不正确</button><button type="button" data-demo-action="toast">项目名称不能为空</button></div>`,
    "modal-dialog": button("编辑昵称", "modal"),
    "alert-dialog": button("删除项目", "alert", "danger"),
    drawer: button("查看订单详情", "drawer"),
    popover: button("Mina 的账户信息⌄", "popover"),
    menu: button("更多操作 ···", "menu"),
    tooltip: `<button class="demo-tooltip-trigger" type="button">撤销 <span class="demo-tooltip">撤销上一步操作</span></button>`,
    "bottom-sheet": button("分享文章", "sheet"),
    tabs: `<div class="demo-tabs"><div role="tablist"><button class="selected" role="tab" aria-selected="true" type="button">概览</button><button role="tab" aria-selected="false" type="button">活动</button><button role="tab" aria-selected="false" type="button">设置</button></div><p>这里显示当前选中标签对应的内容。</p></div>`,
    accordion: `<details class="demo-accordion"><summary>如何邀请团队成员？</summary><p>打开团队设置，输入成员邮箱并发送邀请。</p></details><details class="demo-accordion"><summary>可以随时更改计划吗？</summary><p>可以在账户设置中查看和调整当前计划。</p></details>`,
    spinner: `<div class="demo-wait"><span class="spinner" aria-hidden="true"></span><span>正在保存，请稍候…</span></div>`,
    skeleton: `<div class="demo-skeleton"><i></i><span><b></b><b></b></span></div><div class="demo-skeleton"><i></i><span><b></b><b></b></span></div>`,
    progress: `<label class="demo-control"><span>上传文件 <strong>64%</strong></span><progress value="64" max="100">64%</progress></label>`,
    "empty-state": `<div class="demo-empty"><span aria-hidden="true">✳</span><strong>还没有项目</strong><p>创建第一个项目，开始和团队一起协作。</p>${button("创建项目")}</div>`,
    "no-results": `<div class="demo-empty"><strong>没有找到匹配结果</strong><p>试试其他关键词，或清除当前筛选条件。</p>${button("清除搜索")}</div>`,
  };
  return examples[id] ?? `<p class="demo-fallback">${pattern.summary}</p>`;
}
