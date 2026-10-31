import { getRecommendations, getRelatedPatternIds } from "./lib/decision-engine.js";
import { renderDemo } from "./lib/demo-catalog.js";
import { buildPrompt } from "./lib/prompt-builder.js";

const [families, cases, patterns] = await Promise.all([
  fetch(new URL("./data/families.json", import.meta.url)).then((response) => response.json()),
  fetch(new URL("./data/cases.json", import.meta.url)).then((response) => response.json()),
  fetch(new URL("./data/patterns.json", import.meta.url)).then((response) => response.json()),
]);

const root = document.querySelector("#app-root");
const toastRegion = document.querySelector("#toast-region");
const patternById = new Map(patterns.map((pattern) => [pattern.id, pattern]));
const familyById = new Map(families.map((family) => [family.id, family]));
const patternsByFamily = new Map(families.map((family) => [family.id, patterns.filter((pattern) => pattern.family === family.id)]));
const state = { page: "explore", familyId: null, caseId: null, patternId: patterns[0]?.id, query: "", answers: {} };
let toastTimer;

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function currentCase() { return cases.find((item) => item.id === state.caseId); }
function patternLink(patternId, label = "查看术语说明") {
  const pattern = patternById.get(patternId);
  if (!pattern) return "";
  return `<button class="text-link" type="button" data-pattern="${escapeHtml(pattern.id)}">${escapeHtml(label)} ↗</button>`;
}

function navigate(page, id = "") {
  const target = id ? `#${page}/${encodeURIComponent(id)}` : `#${page}`;
  if (location.hash === target) { syncRoute(); return; }
  location.hash = target;
}

function syncRoute() {
  const [, page = "explore", id] = location.hash.match(/^#([^/]+)\/?(.*)$/) ?? [];
  state.page = ["explore", "cases", "patterns"].includes(page) ? page : "explore";
  state.caseId = state.page === "cases" && id ? decodeURIComponent(id) : null;
  state.patternId = state.page === "patterns" && id ? decodeURIComponent(id) : state.patternId;
  if (state.caseId && !cases.some((item) => item.id === state.caseId)) state.caseId = null;
  if (state.patternId && !patternById.has(state.patternId)) state.patternId = patterns[0]?.id;
  if (state.page !== "cases") state.familyId = null;
  render();
  window.scrollTo(0, 0);
}

function updateShell() {
  document.querySelectorAll("[data-page]").forEach((element) => {
    const page = element.dataset.page;
    element.classList.toggle("active", page === state.page);
    if (element.matches("[role=tab]")) element.setAttribute("aria-selected", String(page === state.page));
  });
  const isExplore = state.page === "explore";
  document.querySelector(".hero")?.classList.toggle("hidden-section", !isExplore);
  document.querySelector(".lesson-strip")?.classList.toggle("hidden-section", !isExplore);
  document.querySelector(".page-tabs")?.classList.toggle("hidden-section", Boolean(state.caseId));
  const count = String(cases.length);
  document.querySelector("#case-count").textContent = count;
  document.querySelector("#tab-case-count").textContent = `(${count})`;
}

function renderFamilyCard(family) {
  const familyCases = cases.filter((item) => item.family === family.id);
  return `<button class="family-card" type="button" data-family="${escapeHtml(family.id)}">
    <span class="family-icon" aria-hidden="true">${escapeHtml(family.icon)}</span>
    <span class="family-card-title"><strong>${escapeHtml(family.label)}</strong><small>${familyCases.length} 个生活化案例</small></span>
    <span class="family-description">${escapeHtml(family.description)}</span>
    <span class="family-examples">${familyCases.slice(0, 2).map((item) => `“${escapeHtml(item.phrase)}”`).join("　")}</span>
    <span class="family-arrow" aria-hidden="true">↗</span>
  </button>`;
}

function renderExplore() {
  const totalPatterns = patterns.length;
  return `<section class="content-section explore-content">
    <div class="section-heading"><div><p class="eyebrow">START WITH WHAT YOU WANT TO DO</p><h2>你想让用户完成什么？</h2><p>先挑一个熟悉的场景，不用先知道它的专业名称。</p></div><span class="content-count">${cases.length} 个案例 · ${totalPatterns} 个术语</span></div>
    <div class="family-grid">${families.map(renderFamilyCard).join("")}</div>
    <div class="section-footer"><span>还不确定从哪里开始？</span><button class="text-link" type="button" data-page="cases">浏览全部新手说法 →</button></div>
  </section>`;
}

function caseCard(item) {
  const family = familyById.get(item.family);
  const patternsInCase = [...new Set(item.recommendations.flatMap(getRelatedPatternIds))];
  return `<button class="case-card" type="button" data-case="${escapeHtml(item.id)}">
    <span class="case-card-meta"><span>${escapeHtml(family?.icon ?? "✳")} ${escapeHtml(family?.label ?? "")}</span><span>${patternsInCase.length} 个可能做法</span></span>
    <strong>${escapeHtml(item.title)}</strong><q>${escapeHtml(item.phrase)}</q>
    <span class="case-card-patterns">${patternsInCase.slice(0, 4).map((patternId) => escapeHtml(patternById.get(patternId)?.localName ?? "")).join(" · ")}</span>
    <span class="case-card-arrow" aria-hidden="true">↗</span>
  </button>`;
}

function renderCases() {
  const query = state.query.trim().toLocaleLowerCase();
  const visible = cases.filter((item) => {
    const inFamily = !state.familyId || item.family === state.familyId;
    const family = familyById.get(item.family);
    const text = [item.title, item.phrase, item.goal, item.context, family?.label, ...(item.keywords ?? [])].join(" ").toLocaleLowerCase();
    return inFamily && (!query || text.includes(query));
  });
  const family = familyById.get(state.familyId);
  return `<section class="content-section cases-content">
    <div class="section-heading"><div><p class="eyebrow">EVERYDAY WORDS → CLEARER INTERACTIONS</p><h2>${family ? escapeHtml(family.label) : "从一句需求开始"}</h2><p>${family ? escapeHtml(family.description) : "这些都是新手产品经理可能会说的话。点开后，回答一个关键问题，再比较几种界面做法。"}</p></div><span class="content-count">找到 ${visible.length} 个案例</span></div>
    <div class="case-tools"><label class="case-search"><span aria-hidden="true">⌕</span><input id="case-search-input" type="search" value="${escapeHtml(state.query)}" placeholder="搜“选择框”“加载”或“保存成功”…" /></label><div class="family-filters"><button type="button" class="filter-chip ${!state.familyId ? "selected" : ""}" data-family-filter="">全部场景</button>${families.map((item) => `<button type="button" class="filter-chip ${state.familyId === item.id ? "selected" : ""}" data-family-filter="${escapeHtml(item.id)}">${escapeHtml(item.label)}</button>`).join("")}</div></div>
    <div class="case-grid">${visible.map(caseCard).join("") || `<div class="empty-search"><strong>没有找到这个说法</strong><p>试试更短的关键词，或者浏览全部场景。</p></div>`}</div>
  </section>`;
}

function recommendationCard(recommendation, main = true, pending = false) {
  const pattern = patternById.get(recommendation.primaryPatternId);
  if (!pattern) return "";
  const alternatives = (recommendation.alternativePatternIds ?? []).map((id) => patternById.get(id)).filter(Boolean);
  const supporting = (recommendation.supportingPatternIds ?? []).map((id) => patternById.get(id)).filter(Boolean);
  return `<article class="recommendation-card ${main ? "recommended" : "alternative-recommendation"} ${pending ? "pending-recommendation" : ""}">
    <div class="recommendation-label"><span>${pending ? "一种可能做法" : main ? "✳ 推荐做法" : "条件不同，也可以这样"}</span>${patternLink(pattern.id)}</div>
    <div class="pattern-card-title"><div><h3>${escapeHtml(pattern.term)}</h3><span>${escapeHtml(pattern.localName)}</span></div><span class="pattern-stamp" aria-hidden="true">${escapeHtml(familyById.get(pattern.family)?.icon ?? "✳")}</span></div>
    <p class="pattern-summary">${escapeHtml(pattern.summary)}</p><p class="recommendation-reason">${escapeHtml(recommendation.reason)}</p>
    ${supporting.length ? `<div class="pattern-combination"><strong>通常还会搭配</strong>${supporting.map((item) => patternLink(item.id, `${item.term} · ${item.localName}`)).join("")}</div>` : ""}
    ${alternatives.length ? `<div class="pattern-alternatives"><strong>相近做法</strong>${alternatives.map((item) => patternLink(item.id, `${item.term} · ${item.localName}`)).join("")}</div>` : ""}
  </article>`;
}

function renderPrompt(caseStudy, recommendation, pattern) {
  const prompt = buildPrompt(caseStudy, recommendation, pattern);
  return `<section class="prompt-builder"><div class="prompt-builder-heading"><div><span class="fact-label">TAKE THIS TO YOUR AI CODING TOOL</span><h3>把需求说得更具体</h3></div><button class="copy-button" type="button" data-copy-prompt>复制指令 ↗</button></div><p class="prompt-hint">可以直接复制，也可以先按你的项目情况修改。</p><textarea class="prompt-editor" aria-label="可编辑的 AI Coding 指令">${escapeHtml(prompt)}</textarea></section>`;
}

function renderCaseDetail() {
  const item = currentCase();
  if (!item) return renderCases();
  const family = familyById.get(item.family);
  const answers = state.answers[item.id] ?? {};
  const { recommendations, resolved } = getRecommendations(item, answers);
  const primaryRecommendation = recommendations[0];
  const primaryPattern = patternById.get(primaryRecommendation?.primaryPatternId);
  const answerText = item.questions.map((question) => {
    const chosen = answers[question.id];
    return `<fieldset class="question-block"><legend>${escapeHtml(question.prompt)}</legend><div class="answer-options">${question.options.map((option) => `<button type="button" class="answer-option ${chosen === option.id ? "selected" : ""}" data-question="${escapeHtml(question.id)}" data-option="${escapeHtml(option.id)}" aria-pressed="${chosen === option.id}"><span class="answer-radio" aria-hidden="true"></span><span><strong>${escapeHtml(option.label)}</strong>${option.hint ? `<small>${escapeHtml(option.hint)}</small>` : ""}</span></button>`).join("")}</div></fieldset>`;
  }).join("");
  const conditional = resolved ? item.recommendations.filter((recommendation) => recommendation.primaryPatternId !== primaryRecommendation.primaryPatternId) : [];
  return `<section class="content-section case-detail-content">
    <button class="back-link" type="button" data-page="cases">← 返回案例库</button>
    <div class="case-intro"><span class="case-family-tag">${escapeHtml(family?.icon ?? "✳")} ${escapeHtml(family?.label ?? "")}</span><p class="eyebrow">A REAL BEGINNER REQUEST</p><h2>${escapeHtml(item.phrase)}</h2><p>${escapeHtml(item.goal)}</p></div>
    <div class="case-context"><strong>场景补充</strong><p>${escapeHtml(item.context)}</p></div>
    <div class="case-decision-layout"><div class="decision-questions"><div class="decision-heading"><span class="step-number">01</span><div><h3>先想清楚一个关键条件</h3><p>这个答案会改变适合的界面做法。</p></div></div>${answerText}<button class="reset-answer" type="button" data-reset-answer>清除选择，重新比较</button></div>
      <div class="recommendations-column"><div class="decision-heading results-heading"><span class="step-number">02</span><div><h3>${resolved ? "这类场景适合的做法" : "可能的几种做法"}</h3><p>${resolved ? "根据你刚才选择的条件推荐。" : "选择左侧条件后，推荐会更具体。"}</p></div></div>
      ${recommendations.map((recommendation, index) => recommendationCard(recommendation, resolved && index === 0, !resolved)).join("")}
      ${conditional.length ? `<details class="other-conditions"><summary>如果情况不同，还有这些选择</summary><div>${conditional.map((recommendation) => recommendationCard(recommendation, false)).join("")}</div></details>` : ""}</div>
    </div>
    ${resolved && primaryPattern ? `<section class="try-pattern"><div class="decision-heading"><span class="step-number">03</span><div><h3>动手试试这个模式</h3><p>这是一个可操作的 HTML 示例，看看它怎样回应用户。</p></div></div><div class="demo-panel"><div class="demo-panel-heading"><span><strong>${escapeHtml(primaryPattern.term)}</strong><small>${escapeHtml(primaryPattern.localName)}</small></span><span class="demo-live"><i></i> LIVE HTML</span></div><div class="demo-stage" data-demo-id="${escapeHtml(primaryPattern.demoId)}">${renderDemo(primaryPattern)}</div><p class="demo-caption">试着点击、输入或切换选项。</p></div>${renderPrompt(item, primaryRecommendation, primaryPattern)}</section>` : `<div class="choose-condition-note"><span aria-hidden="true">↑</span><div><strong>选中一个条件，继续看演示和 AI 指令</strong><p>不同的用户目标可能需要不同组件；我们不会在条件不清楚时替你猜。</p></div></div>`}
    <div class="case-next"><span>这类模式也会出现在其他需求中。</span><button type="button" class="text-link" data-page="patterns">去术语索引浏览 ${patterns.length} 个名称 ↗</button></div>
  </section>`;
}

function renderPatternRow(pattern) {
  const selected = pattern.id === state.patternId;
  return `<button type="button" class="pattern-row ${selected ? "selected" : ""}" data-pattern-select="${escapeHtml(pattern.id)}" aria-pressed="${selected}"><span class="pattern-row-icon">${escapeHtml(familyById.get(pattern.family)?.icon ?? "✳")}</span><span><strong>${escapeHtml(pattern.term)}</strong><small>${escapeHtml(pattern.localName)}</small></span><span class="row-arrow" aria-hidden="true">↗</span></button>`;
}

function renderPatternDetail(pattern) {
  if (!pattern) return `<div class="detail-empty"><span>⌕</span><p>选择一个术语，查看它什么时候适合使用。</p></div>`;
  const related = cases.filter((item) => item.recommendations.some((recommendation) => getRelatedPatternIds(recommendation).includes(pattern.id)));
  return `<article class="pattern-detail"><div class="detail-topline"><span class="detail-number">${String(patterns.indexOf(pattern) + 1).padStart(2, "0")} / INTERACTION PATTERN</span><span class="detail-category">${escapeHtml(familyById.get(pattern.family)?.label ?? "")}</span></div><div class="detail-title-row"><div><h3>${escapeHtml(pattern.term)}</h3><span class="local-name">${escapeHtml(pattern.localName)}</span></div><span class="detail-spark" aria-hidden="true">✳</span></div><p class="detail-summary">${escapeHtml(pattern.summary)}</p><div class="detail-facts"><div><span class="fact-label">适合什么时候用</span><p>${escapeHtml(pattern.useWhen)}</p></div><div><span class="fact-label">不适合这些情况</span><p>${escapeHtml(pattern.avoidWhen)}</p></div></div><p class="contrast-note"><span aria-hidden="true">↔</span><span>${escapeHtml(pattern.contrast)}</span></p><div class="demo-heading"><div><span class="fact-label">TRY IT YOURSELF</span><strong>HTML 交互预览</strong></div><span class="demo-live"><i></i> LIVE HTML</span></div><div class="demo-panel"><div class="demo-stage" data-demo-id="${escapeHtml(pattern.demoId)}">${renderDemo(pattern)}</div></div><div class="pattern-use-cases"><span class="fact-label">从这些新手说法进入</span>${related.map((item) => `<button class="related-case" type="button" data-case="${escapeHtml(item.id)}"><span>${escapeHtml(item.phrase)}</span><b>↗</b></button>`).join("") || "<p>关联案例正在整理中。</p>"}</div><div class="prompt-card"><div class="prompt-card-head"><span class="fact-label">COPY THIS INTO YOUR AI TOOL</span><button class="copy-button" type="button" data-copy-pattern="${escapeHtml(pattern.id)}">复制示例指令</button></div><p>${escapeHtml(pattern.promptExample)}</p></div></article>`;
}

function renderPatterns() {
  const query = state.query.trim().toLocaleLowerCase();
  const visible = patterns.filter((pattern) => {
    const family = familyById.get(pattern.family);
    const haystack = [pattern.term, pattern.localName, pattern.summary, pattern.useWhen, pattern.avoidWhen, pattern.contrast, ...(pattern.aliases ?? []), family?.label].join(" ").toLocaleLowerCase();
    return !query || haystack.includes(query);
  });
  if (!visible.some((pattern) => pattern.id === state.patternId) && visible.length) state.patternId = visible[0].id;
  const selected = visible.find((pattern) => pattern.id === state.patternId);
  return `<section class="content-section patterns-content"><div class="section-heading"><div><p class="eyebrow">LOOK UP A PRECISE NAME</p><h2>术语索引</h2><p>知道一个名称？在这里查解释、适用场景、可操作示例和关联案例。</p></div><span class="content-count">${visible.length} / ${patterns.length} 个模式</span></div>
    <label class="pattern-search"><span aria-hidden="true">⌕</span><input id="pattern-search-input" type="search" value="${escapeHtml(state.query)}" placeholder="搜中文名、英文名或常用说法…" /><kbd>/</kbd></label>
    <div class="pattern-layout"><aside class="pattern-list" aria-label="交互模式列表">${visible.length ? visible.map(renderPatternRow).join("") : `<p class="empty-state">没有找到匹配的术语。试试“复选框”“确认”或“自动消失”。</p>`}</aside><div class="pattern-detail-panel">${renderPatternDetail(selected)}</div></div>
  </section>`;
}

function render() {
  updateShell();
  if (!root) return;
  root.setAttribute("aria-busy", "false");
  root.innerHTML = state.page === "explore" ? renderExplore()
    : state.page === "cases" ? (state.caseId ? renderCaseDetail() : renderCases())
      : renderPatterns();
}

function notify(message) {
  clearTimeout(toastTimer);
  toastRegion.innerHTML = `<div class="toast-card"><span class="toast-check">✓</span><span>${escapeHtml(message)}</span><button type="button" aria-label="关闭提示">×</button></div>`;
  toastRegion.querySelector("button")?.addEventListener("click", () => { toastRegion.innerHTML = ""; });
  toastTimer = setTimeout(() => { toastRegion.innerHTML = ""; }, 3000);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const field = document.createElement("textarea");
    field.value = text;
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.append(field);
    field.select();
    document.execCommand("copy");
    field.remove();
  }
  notify("指令已复制，可以粘贴到 AI Coding 工具里");
}

function openDemoLayer(kind, trigger) {
  if (["menu", "popover"].includes(kind)) {
    let layer = trigger.parentElement.querySelector(".demo-floating");
    if (!layer) {
      layer = document.createElement("div");
      layer.className = "demo-floating";
      layer.hidden = true;
      layer.innerHTML = kind === "menu"
        ? `<button type="button" data-demo-action="toast">个人设置</button><button type="button" data-demo-action="toast">切换账户</button><button type="button" data-demo-action="toast">退出登录</button>`
        : `<strong>Mina Chen</strong><small>mina@example.com</small><button type="button" data-demo-action="toast">查看个人资料 ↗</button>`;
      trigger.insertAdjacentElement("afterend", layer);
    }
    layer.hidden = !layer.hidden;
    return;
  }
  const dialog = document.createElement("dialog");
  dialog.className = `demo-dialog demo-${kind}`;
  const contents = {
    modal: `<p>更新后会显示在你的个人资料中。</p><label class="demo-control"><span>昵称</span><input value="Mina Chen" /></label><div class="demo-dialog-actions"><button type="button" data-demo-action="close">取消</button><button class="primary" type="button" data-demo-action="close">保存</button></div>`,
    alert: `<p>删除后，项目及其中的文件都无法恢复。</p><div class="demo-dialog-actions"><button type="button" data-demo-action="close">取消</button><button class="danger" type="button" data-demo-action="close">永久删除</button></div>`,
    drawer: `<p>ORD-2048 · 今天 10:42</p><div class="drawer-info"><span>订单状态</span><strong>已发货</strong><span>配送地址</span><strong>杭州市西湖区</strong><span>预计送达</span><strong>11 月 2 日</strong></div>`,
    sheet: `<p>选择一种分享方式</p><div class="share-options"><button type="button" data-demo-action="toast">↗<span>复制链接</span></button><button type="button" data-demo-action="toast">✉<span>邮件</span></button><button type="button" data-demo-action="toast">•••<span>更多</span></button></div>`,
  };
  const headings = { modal: "编辑昵称", alert: "确定要删除吗？", drawer: "订单详情", sheet: "分享文章" };
  dialog.setAttribute("aria-label", headings[kind] ?? "示例");
  if (kind === "alert") dialog.setAttribute("role", "alertdialog");
  dialog.innerHTML = `<div class="demo-dialog-heading"><h3>${headings[kind] ?? "示例"}</h3><button type="button" aria-label="关闭" data-demo-action="close">×</button></div>${contents[kind] ?? ""}`;
  document.body.append(dialog);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
    const action = event.target.closest("[data-demo-action]")?.dataset.demoAction;
    if (action === "close") dialog.close();
    if (action === "toast") { dialog.close(); notify("示例操作已完成"); }
  });
  dialog.addEventListener("close", () => dialog.remove(), { once: true });
  dialog.showModal();
}

function handleDemoClick(event) {
  const demoLink = event.target.closest(".demo-link");
  if (demoLink) { event.preventDefault(); notify("示例：已前往订单详情"); return; }
  const actionElement = event.target.closest("[data-demo-action]");
  if (actionElement) {
    const action = actionElement.dataset.demoAction;
    if (["modal", "alert", "drawer", "sheet", "menu", "popover"].includes(action)) openDemoLayer(action, actionElement);
    else if (action === "toggle-password") {
      const input = actionElement.closest(".demo-stage")?.querySelector('input[type="password"],input[type="text"]');
      if (input) { input.type = input.type === "password" ? "text" : "password"; actionElement.textContent = input.type === "password" ? "显示密码" : "隐藏密码"; }
    } else if (action === "toast") notify("示例操作已完成");
  }
  const segment = event.target.closest(".demo-segment button");
  if (segment) {
    segment.parentElement.querySelectorAll("button").forEach((button) => button.classList.toggle("selected", button === segment));
  }
  const tab = event.target.closest(".demo-tabs [role=tab]");
  if (tab) {
    tab.parentElement.querySelectorAll("[role=tab]").forEach((button) => { button.classList.toggle("selected", button === tab); button.setAttribute("aria-selected", String(button === tab)); });
  }
  const row = event.target.closest(".demo-result-list button");
  if (row) notify(`已选择 ${row.textContent.split(" · ")[0]}`);
}

document.addEventListener("click", (event) => {
  const pageButton = event.target.closest("[data-page]");
  if (pageButton) { event.preventDefault(); navigate(pageButton.dataset.page); return; }
  const familyButton = event.target.closest("[data-family]");
  if (familyButton) { state.familyId = familyButton.dataset.family; state.query = ""; navigate("cases"); return; }
  const familyFilter = event.target.closest("[data-family-filter]");
  if (familyFilter) { state.familyId = familyFilter.dataset.familyFilter || null; render(); return; }
  const caseButton = event.target.closest("[data-case]");
  if (caseButton) { state.answers[caseButton.dataset.case] = {}; navigate("cases", caseButton.dataset.case); return; }
  const answer = event.target.closest("[data-question][data-option]");
  if (answer) {
    const item = currentCase();
    state.answers[item.id] ??= {};
    state.answers[item.id][answer.dataset.question] = answer.dataset.option;
    render();
    return;
  }
  if (event.target.closest("[data-reset-answer]")) {
    if (state.caseId) state.answers[state.caseId] = {};
    render();
    return;
  }
  const patternButton = event.target.closest("[data-pattern]");
  if (patternButton) { state.query = ""; state.patternId = patternButton.dataset.pattern; navigate("patterns", patternButton.dataset.pattern); return; }
  const patternSelect = event.target.closest("[data-pattern-select]");
  if (patternSelect) { state.patternId = patternSelect.dataset.patternSelect; render(); return; }
  const copy = event.target.closest("[data-copy-prompt]");
  if (copy) {
    const item = currentCase();
    if (!item) return;
    const recommendation = getRecommendations(item, state.answers[item.id] ?? {}).recommendations[0];
    const pattern = patternById.get(recommendation.primaryPatternId);
    const text = root.querySelector(".prompt-editor")?.value ?? buildPrompt(item, recommendation, pattern);
    copyText(text);
    return;
  }
  const copyPattern = event.target.closest("[data-copy-pattern]");
  if (copyPattern) { const pattern = patternById.get(copyPattern.dataset.copyPattern); if (pattern) copyText(pattern.promptExample); return; }
  if (event.target.closest(".demo-stage")) handleDemoClick(event);
});

document.addEventListener("input", (event) => {
  if (event.target.id === "case-search-input") { state.query = event.target.value; const position = event.target.selectionStart; render(); const next = document.querySelector("#case-search-input"); next?.focus(); next?.setSelectionRange(position, position); }
  if (event.target.id === "pattern-search-input") { state.query = event.target.value; const position = event.target.selectionStart; render(); const next = document.querySelector("#pattern-search-input"); next?.focus(); next?.setSelectionRange(position, position); }
  if (event.target.matches("[data-demo-search]")) {
    const query = event.target.value.toLocaleLowerCase();
    event.target.closest(".demo-stage")?.querySelectorAll(".demo-result-list button").forEach((button) => { button.hidden = !button.textContent.toLocaleLowerCase().includes(query); });
  }
});

document.querySelector("#hero-search")?.addEventListener("submit", (event) => {
  event.preventDefault();
  state.query = document.querySelector("#hero-query").value;
  state.familyId = null;
  navigate("cases");
});

document.addEventListener("click", (event) => {
  const suggestion = event.target.closest("[data-query]");
  if (!suggestion) return;
  document.querySelector("#hero-query").value = suggestion.dataset.query;
  state.query = suggestion.dataset.query;
  navigate("cases");
});

document.addEventListener("keydown", (event) => {
  if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
    event.preventDefault();
    const search = document.querySelector(state.page === "patterns" ? "#pattern-search-input" : state.page === "cases" ? "#case-search-input" : "#hero-query");
    search?.focus();
  }
  if (event.key === "Escape") document.querySelectorAll(".demo-floating:not([hidden])").forEach((layer) => { layer.hidden = true; });
});

window.addEventListener("hashchange", syncRoute);
syncRoute();
