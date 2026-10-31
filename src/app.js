import { getRecommendations, getRelatedPatternIds } from "./lib/decision-engine.js";
import { renderDemo } from "./lib/demo-catalog.js";
import { buildPrompt } from "./lib/prompt-builder.js";

const [families, cases, patterns, colloquialisms, journeys, sources] = await Promise.all([
  fetch(new URL("./data/families.json", import.meta.url)).then((response) => response.json()),
  fetch(new URL("./data/cases.json", import.meta.url)).then((response) => response.json()),
  fetch(new URL("./data/patterns.json", import.meta.url)).then((response) => response.json()),
  fetch(new URL("./data/colloquialisms.json", import.meta.url)).then((response) => response.json()),
  fetch(new URL("./data/journeys.json", import.meta.url)).then((response) => response.json()),
  fetch(new URL("./data/sources.json", import.meta.url)).then((response) => response.json()),
]);

const root = document.querySelector("#app-root");
const toastRegion = document.querySelector("#toast-region");
const PAGE_SIZE = { cases: 12, colloquialisms: 18, patterns: 24 };
const patternById = new Map(patterns.map((pattern) => [pattern.id, pattern]));
const colloquialById = new Map(colloquialisms.map((item) => [item.id, item]));
const familyById = new Map(families.map((family) => [family.id, family]));
const journeyById = new Map(journeys.map((journey) => [journey.id, journey]));
const sourceById = new Map(sources.map((source) => [source.id, source]));
const caseCountsByJourney = new Map(journeys.map((journey) => [journey.id, cases.filter((item) => item.journeyId === journey.id).length]));
const patternsByFamily = new Map(families.map((family) => [family.id, patterns.filter((pattern) => pattern.family === family.id)]));
const state = { page: "explore", familyId: null, journeyId: null, caseId: null, colloquialId: null, patternId: patterns[0]?.id, query: "", casePage: 0, colloquialPage: 0, patternPage: 0, patternCasePage: 0, answers: {} };
let toastTimer;

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function currentCase() { return cases.find((item) => item.id === state.caseId); }
function currentColloquial() { return colloquialById.get(state.colloquialId); }
function findColloquial(value) {
  const query = String(value ?? "").trim().toLocaleLowerCase();
  if (!query) return null;
  return colloquialisms.find((item) => [item.phrase, ...(item.aliases ?? [])].some((label) => label.toLocaleLowerCase() === query))
    ?? colloquialisms.find((item) => [item.phrase, ...(item.aliases ?? [])].some((label) => label.toLocaleLowerCase().includes(query) || query.includes(label.toLocaleLowerCase())));
}
function patternLink(patternId, label = "看标准叫法") {
  const pattern = patternById.get(patternId);
  if (!pattern) return "";
  return `<button class="text-link" type="button" data-pattern="${escapeHtml(pattern.id)}">${escapeHtml(label)} ↗</button>`;
}

function renderPagination(list, page, pageSize, total, label) {
  const pageCount = Math.ceil(total / pageSize);
  if (pageCount <= 1) return "";
  const start = page * pageSize + 1;
  const end = Math.min(total, start + pageSize - 1);
  return `<nav class="content-pagination" aria-label="${escapeHtml(label)}"><span>显示第 ${start}–${end} 项，共 ${total} 项</span><div><button type="button" data-pager="${list}" data-pager-action="previous" data-page-index="${page - 1}" ${page === 0 ? "disabled" : ""}>← 上一页</button><span>第 ${page + 1} / ${pageCount} 页</span><button type="button" data-pager="${list}" data-pager-action="next" data-page-index="${page + 1}" ${page + 1 >= pageCount ? "disabled" : ""}>下一页 →</button></div></nav>`;
}

function renderRelatedCasePagination(page, total) {
  const pageSize = 6;
  const pageCount = Math.ceil(total / pageSize);
  if (pageCount <= 1) return "";
  const start = page * pageSize + 1;
  const end = Math.min(total, start + pageSize - 1);
  return `<nav class="related-case-pagination" aria-label="关联需求情境分页"><span>显示 ${start}–${end} / ${total} 个情境</span><div><button type="button" data-related-case-page="${page - 1}" ${page === 0 ? "disabled" : ""}>上一批</button><button type="button" data-related-case-page="${page + 1}" ${page + 1 >= pageCount ? "disabled" : ""}>下一批</button></div></nav>`;
}

function navigate(page, id = "") {
  const target = id ? `#${page}/${encodeURIComponent(id)}` : `#${page}`;
  if (location.hash === target) { syncRoute(); return; }
  location.hash = target;
}

function syncRoute() {
  const previousPatternId = state.patternId;
  const [, page = "explore", id] = location.hash.match(/^#([^/]+)\/?(.*)$/) ?? [];
  state.page = ["explore", "colloquial", "patterns", "cases", "help"].includes(page) ? page : "explore";
  state.caseId = state.page === "cases" && id ? decodeURIComponent(id) : null;
  state.colloquialId = state.page === "colloquial" && id ? decodeURIComponent(id) : null;
  state.patternId = state.page === "patterns" && id ? decodeURIComponent(id) : state.patternId;
  if (state.caseId && !cases.some((item) => item.id === state.caseId)) state.caseId = null;
  if (state.colloquialId && !colloquialById.has(state.colloquialId)) state.colloquialId = null;
  if (state.patternId && !patternById.has(state.patternId)) state.patternId = patterns[0]?.id;
  if (state.patternId !== previousPatternId) state.patternCasePage = 0;
  if (state.page !== "cases") { state.familyId = null; state.journeyId = null; }
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
  document.querySelector("#family-count").textContent = String(families.length);
  document.querySelector("#colloquial-count").textContent = String(colloquialisms.length);
  document.querySelector("#pattern-count").textContent = String(patterns.length);
  document.querySelector("#case-count").textContent = String(cases.length);
}

function renderFamilyCard(family) {
  const familyCases = cases.filter((item) => item.family === family.id);
  return `<button class="family-card" type="button" data-family="${escapeHtml(family.id)}">
    <span class="family-icon" aria-hidden="true">${escapeHtml(family.icon)}</span>
    <span class="family-card-title"><strong>${escapeHtml(family.label)}</strong><small>${familyCases.length} 个生活化案例</small></span>
    <span class="family-description">${escapeHtml(family.description)}</span>
    <span class="family-examples">需求示例：${familyCases.slice(0, 2).map((item) => escapeHtml(item.phrase)).join("　")}</span>
    <span class="family-arrow" aria-hidden="true">↗</span>
  </button>`;
}

function renderExplore() {
  const totalPatterns = patterns.length;
  return `<section class="content-section explore-content">
    <div class="section-heading"><div><p class="eyebrow">START WITH WHAT YOU WANT TO DO</p><h2>你想让用户完成什么？</h2><p>先挑一个熟悉的服务任务，不用先知道它的专业名称；也可以直接从“弹框”“文本框”这样的俗语找起。场景示例附有官方设计指南依据。</p></div><span class="content-count">${cases.length} 个案例 · ${colloquialisms.length} 个俗语</span></div>
    <div class="family-grid">${families.map(renderFamilyCard).join("")}</div>
    <section class="journey-entry"><div><h3>沿着完整任务脉络找</h3><p>从收集信息、判断条件，到提交、恢复与跟进。</p></div><div class="journey-chips">${journeys.map((journey) => `<button type="button" class="journey-chip" data-journey="${escapeHtml(journey.id)}"><span>${escapeHtml(journey.label)}</span><small>${caseCountsByJourney.get(journey.id) ?? 0} 个场景 ↗</small></button>`).join("")}</div></section>
    <div class="colloquial-entry"><div><span class="fact-label">START FROM WORDS YOU ALREADY USE</span><h3>你平时会怎么说？</h3><p>一个俗语可能有几种意思。点开看看每种做法有什么效果。</p></div><div class="colloquial-chips">${["弹框","文本框","选择框","下拉框","提示"].map((word) => `<button type="button" class="phrase-chip" data-colloquial="${escapeHtml(word)}">${escapeHtml(word)} ↗</button>`).join("")}</div></div>
    <div class="section-footer"><span>按完整场景继续了解</span><button class="text-link" type="button" data-page="cases">转到“按场景找” →</button></div>
  </section>`;
}

function caseCard(item) {
  const family = familyById.get(item.family);
  const journey = journeyById.get(item.journeyId);
  const patternsInCase = [...new Set(item.recommendations.flatMap(getRelatedPatternIds))];
  return `<button class="case-card" type="button" data-case="${escapeHtml(item.id)}">
    <span class="case-card-meta"><span>${escapeHtml(journey?.label ?? family?.label ?? "")}</span><span>${patternsInCase.length} 个可能做法</span></span>
    <strong>${escapeHtml(item.title)}</strong><span class="case-card-phrase">${escapeHtml(item.phrase)}</span>
    <span class="case-card-patterns">${patternsInCase.slice(0, 4).map((patternId) => escapeHtml(patternById.get(patternId)?.localName ?? "")).join(" · ")}</span>
    <span class="case-card-arrow" aria-hidden="true">↗</span>
  </button>`;
}

function renderCases() {
  const query = state.query.trim().toLocaleLowerCase();
  const journey = journeyById.get(state.journeyId);
  const visible = cases.filter((item) => {
    const inFamily = !state.familyId || item.family === state.familyId;
    const inJourney = !state.journeyId || item.journeyId === state.journeyId;
    const family = familyById.get(item.family);
    const itemJourney = journeyById.get(item.journeyId);
    const sourceLabels = (item.sourceIds ?? []).map((sourceId) => sourceById.get(sourceId)?.label ?? "");
    const text = [item.title, item.phrase, item.goal, item.context, family?.label, itemJourney?.label, ...sourceLabels, ...(item.keywords ?? [])].join(" ").toLocaleLowerCase();
    return inFamily && inJourney && (!query || text.includes(query));
  });
  const family = familyById.get(state.familyId);
  const pageSize = PAGE_SIZE.cases;
  const pageCount = Math.max(1, Math.ceil(visible.length / pageSize));
  state.casePage = Math.min(state.casePage, pageCount - 1);
  const pageItems = visible.slice(state.casePage * pageSize, (state.casePage + 1) * pageSize);
  return `<section class="content-section cases-content">
    <div class="section-heading"><div><p class="eyebrow">OFFICIAL SERVICE TASKS → REQUEST SCENARIOS</p><h2>${escapeHtml(journey?.label ?? family?.label ?? "从一句需求开始")}</h2><p>${escapeHtml(journey?.description ?? family?.description ?? "场景从官方设计指南描述的服务任务整理而来，再改写为便于讨论的需求示例。点开后，先回答会改变做法的条件，再看推荐理由和来源。")}</p></div><span class="content-count">找到 ${visible.length} 个案例</span></div>
    <div class="case-tools"><label class="case-search"><span aria-hidden="true">⌕</span><input id="case-search-input" type="search" value="${escapeHtml(state.query)}" placeholder="搜“选择框”“加载”或“保存成功”…" /></label><label class="case-path-filter"><span>沿任务脉络浏览</span><select id="case-journey-filter"><option value="">全部脉络（${cases.length}）</option>${journeys.map((item) => `<option value="${escapeHtml(item.id)}" ${state.journeyId === item.id ? "selected" : ""}>${escapeHtml(item.label)}（${caseCountsByJourney.get(item.id) ?? 0}）</option>`).join("")}</select></label><div class="family-filters" aria-label="按需求类型筛选"><button type="button" class="filter-chip ${!state.familyId ? "selected" : ""}" data-family-filter="">全部需求类型</button>${families.map((item) => `<button type="button" class="filter-chip ${state.familyId === item.id ? "selected" : ""}" data-family-filter="${escapeHtml(item.id)}">${escapeHtml(item.label)}</button>`).join("")}</div></div>
    <div class="case-grid">${pageItems.map(caseCard).join("") || `<div class="empty-search"><strong>没有找到这个说法</strong><p>试试更短的关键词，或者浏览全部场景。</p></div>`}</div>
    ${renderPagination("cases", state.casePage, pageSize, visible.length, "场景分页")}
  </section>`;
}

function recommendationCard(recommendation, main = true, pending = false) {
  const pattern = patternById.get(recommendation.primaryPatternId);
  if (!pattern) return "";
  const alternatives = (recommendation.alternativePatternIds ?? []).map((id) => patternById.get(id)).filter(Boolean);
  const supporting = (recommendation.supportingPatternIds ?? []).map((id) => patternById.get(id)).filter(Boolean);
  return `<article class="recommendation-card ${main ? "recommended" : "alternative-recommendation"} ${pending ? "pending-recommendation" : ""}">
    <div class="recommendation-label"><span>${pending ? "一种可能做法" : main ? "✳ 推荐做法" : "条件不同，也可以这样"}</span>${patternLink(pattern.id)}</div>
    <div class="pattern-card-title"><div><h3>${escapeHtml(pattern.localName)}</h3><span>专业名称：${escapeHtml(pattern.term)}</span></div><span class="pattern-stamp" aria-hidden="true">${escapeHtml(familyById.get(pattern.family)?.icon ?? "✳")}</span></div>
    <p class="pattern-summary">${escapeHtml(pattern.summary)}</p><p class="recommendation-reason">${escapeHtml(recommendation.reason)}</p>
    ${supporting.length ? `<div class="pattern-combination"><strong>通常还会搭配</strong>${supporting.map((item) => patternLink(item.id, item.localName)).join("")}</div>` : ""}
    ${alternatives.length ? `<div class="pattern-alternatives"><strong>相近做法</strong>${alternatives.map((item) => patternLink(item.id, item.localName)).join("")}</div>` : ""}
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
  const journey = journeyById.get(item.journeyId);
  const itemSources = (item.sourceIds ?? []).map((sourceId) => sourceById.get(sourceId)).filter(Boolean);
  const answers = state.answers[item.id] ?? {};
  const { recommendations, resolved } = getRecommendations(item, answers);
  const primaryRecommendation = recommendations[0];
  const primaryPattern = patternById.get(primaryRecommendation?.primaryPatternId);
  const relatedColloquial = colloquialisms.find((entry) => primaryPattern && entry.patternIds.includes(primaryPattern.id));
  const answerText = item.questions.map((question) => {
    const chosen = answers[question.id];
    return `<fieldset class="question-block"><legend>${escapeHtml(question.prompt)}</legend><div class="answer-options">${question.options.map((option) => `<button type="button" class="answer-option ${chosen === option.id ? "selected" : ""}" data-question="${escapeHtml(question.id)}" data-option="${escapeHtml(option.id)}" aria-pressed="${chosen === option.id}"><span class="answer-radio" aria-hidden="true"></span><span><strong>${escapeHtml(option.label)}</strong>${option.hint ? `<small>${escapeHtml(option.hint)}</small>` : ""}</span></button>`).join("")}</div></fieldset>`;
  }).join("");
  const conditional = resolved ? item.recommendations.filter((recommendation) => recommendation.primaryPatternId !== primaryRecommendation.primaryPatternId) : [];
  return `<section class="content-section case-detail-content">
    <button class="back-link" type="button" data-page="cases">← 返回按场景找</button>
    <div class="case-intro"><span class="case-family-tag">${escapeHtml(family?.icon ?? "✳")} ${escapeHtml(family?.label ?? "")} · ${escapeHtml(journey?.label ?? "")}</span><p class="eyebrow">OFFICIAL TASK → REQUEST SCENARIO</p><h2>${escapeHtml(item.phrase)}</h2><p>${escapeHtml(item.goal)}</p></div>
    <div class="case-context"><strong>场景补充</strong><p>${escapeHtml(item.context)}</p></div>
    ${itemSources.length ? `<section class="case-sources"><strong>参考依据</strong><div>${itemSources.map((source) => `<a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.label)} ↗</a>`).join("")}</div><p>本例将官方指南中的服务任务改写成便于讨论的需求情境；具体产品仍需按自身规则和用户研究确认。</p></section>` : ""}
    <div class="case-decision-layout"><div class="decision-questions"><div class="decision-heading"><span class="step-number">01</span><div><h3>先想清楚一个关键条件</h3><p>这个答案会改变适合的界面做法。</p></div></div>${answerText}<button class="reset-answer" type="button" data-reset-answer>清除选择，重新比较</button></div>
      <div class="recommendations-column"><div class="decision-heading results-heading"><span class="step-number">02</span><div><h3>${resolved ? "这类场景适合的做法" : "可能的几种做法"}</h3><p>${resolved ? "根据你刚才选择的条件推荐。" : "选择左侧条件后，推荐会更具体。"}</p></div></div>
      ${recommendations.map((recommendation, index) => recommendationCard(recommendation, resolved && index === 0, !resolved)).join("")}
      ${conditional.length ? `<details class="other-conditions"><summary>如果情况不同，还有这些选择</summary><div>${conditional.map((recommendation) => recommendationCard(recommendation, false)).join("")}</div></details>` : ""}</div>
    </div>
    ${resolved && primaryPattern ? `<section class="try-pattern"><div class="decision-heading"><span class="step-number">03</span><div><h3>动手试试这种做法</h3><p>先用容易理解的中文名称；专业名称只是补充。</p></div></div><div class="demo-panel"><div class="demo-panel-heading"><span><strong>${escapeHtml(primaryPattern.localName)}</strong><small>专业名称：${escapeHtml(primaryPattern.term)}</small></span><span class="demo-live"><i></i> LIVE HTML</span></div><div class="demo-stage" data-demo-id="${escapeHtml(primaryPattern.demoId)}">${renderDemo(primaryPattern)}</div><p class="demo-caption">试着点击、输入或切换选项。</p></div>${renderPrompt(item, primaryRecommendation, primaryPattern)}</section>` : `<div class="choose-condition-note"><span aria-hidden="true">↑</span><div><strong>选中一个条件，继续看演示和 AI 指令</strong><p>不同的做法会产生不同效果；条件没说清楚时，会先把可能性展开给你看。</p></div></div>`}
    <div class="case-next"><span>想从熟悉的词继续？</span><button type="button" class="text-link" ${relatedColloquial ? `data-colloquial-id="${escapeHtml(relatedColloquial.id)}"` : 'data-colloquial="弹框"'}>去“${escapeHtml(relatedColloquial?.phrase ?? "弹框")}”里比较 ↗</button></div>
  </section>`;
}

function renderPatternRow(pattern) {
  const selected = pattern.id === state.patternId;
  return `<button type="button" class="pattern-row ${selected ? "selected" : ""}" data-pattern-select="${escapeHtml(pattern.id)}" aria-pressed="${selected}"><span class="pattern-row-icon">${escapeHtml(familyById.get(pattern.family)?.icon ?? "✳")}</span><span><strong>${escapeHtml(pattern.localName)}</strong><small>专业名称：${escapeHtml(pattern.term)}</small></span><span class="row-arrow" aria-hidden="true">↗</span></button>`;
}

function renderPatternDetail(pattern) {
  if (!pattern) return `<div class="detail-empty"><span>⌕</span><p>选择一个术语，查看它什么时候适合使用。</p></div>`;
  const related = cases.filter((item) => item.recommendations.some((recommendation) => getRelatedPatternIds(recommendation).includes(pattern.id)));
  const colloquialUses = colloquialisms.filter((item) => item.patternIds.includes(pattern.id));
  const relatedPageSize = 6;
  const relatedPageCount = Math.max(1, Math.ceil(related.length / relatedPageSize));
  state.patternCasePage = Math.min(state.patternCasePage, relatedPageCount - 1);
  const relatedPageItems = related.slice(state.patternCasePage * relatedPageSize, (state.patternCasePage + 1) * relatedPageSize);
  return `<article class="pattern-detail"><div class="detail-topline"><span class="detail-number">${String(patterns.indexOf(pattern) + 1).padStart(2, "0")} / 专业名称</span><span class="detail-category">${escapeHtml(familyById.get(pattern.family)?.label ?? "")}</span></div><div class="detail-title-row"><div><h3>${escapeHtml(pattern.localName)}</h3><span class="local-name">对应的专业名称：${escapeHtml(pattern.term)}</span></div><span class="detail-spark" aria-hidden="true">✳</span></div><p class="detail-summary">${escapeHtml(pattern.summary)}</p><div class="detail-facts"><div><span class="fact-label">适合什么时候用</span><p>${escapeHtml(pattern.useWhen)}</p></div><div><span class="fact-label">不适合这些情况</span><p>${escapeHtml(pattern.avoidWhen)}</p></div></div><p class="contrast-note"><span aria-hidden="true">↔</span><span>${escapeHtml(pattern.userEffect ?? pattern.contrast)}</span></p><div class="demo-heading"><div><span class="fact-label">TRY IT YOURSELF</span><strong>看看这种做法</strong></div><span class="demo-live"><i></i> LIVE HTML</span></div><div class="demo-panel"><div class="demo-stage" data-demo-id="${escapeHtml(pattern.demoId)}">${renderDemo(pattern)}</div></div><div class="pattern-use-cases"><span class="fact-label">大家可能会怎么说</span>${colloquialUses.map((item) => `<button class="related-case" type="button" data-colloquial-id="${escapeHtml(item.id)}"><span>“${escapeHtml(item.phrase)}”</span><b>↗</b></button>`).join("") || "<p>相关说法正在整理中。</p>"}</div><div class="pattern-use-cases"><span class="fact-label">从这些需求情境进入</span>${relatedPageItems.map((item) => `<button class="related-case" type="button" data-case="${escapeHtml(item.id)}"><span>${escapeHtml(item.phrase)}</span><b>↗</b></button>`).join("") || "<p>关联案例正在整理中。</p>"}</div>${renderRelatedCasePagination(state.patternCasePage, related.length)}<div class="prompt-card"><div class="prompt-card-head"><span class="fact-label">复制给 AI 的中文说法</span><button class="copy-button" type="button" data-copy-pattern="${escapeHtml(pattern.id)}">复制示例指令</button></div><p>${escapeHtml(pattern.promptExample)}</p></div></article>`;
}

function renderColloquialCard(item) {
  const previewNames = item.patternIds.slice(0, 4).map((id) => patternById.get(id)?.localName).filter(Boolean);
  return `<button type="button" class="colloquial-card" data-colloquial-id="${escapeHtml(item.id)}"><span class="colloquial-card-top"><span class="colloquial-quote">“${escapeHtml(item.phrase)}”</span><span class="colloquial-count">${item.patternIds.length} 种可能</span></span><span class="colloquial-card-copy">${escapeHtml(item.description)}</span><span class="colloquial-aliases">你也可能会说：${(item.aliases ?? []).slice(0, 4).map(escapeHtml).join(" · ")}</span><span class="colloquial-preview-names">${previewNames.map(escapeHtml).join("　·　")}</span><span class="case-card-arrow" aria-hidden="true">↗</span></button>`;
}

function renderColloquialIndex() {
  const query = state.query.trim().toLocaleLowerCase();
  const visible = colloquialisms.filter((item) => {
    const names = item.patternIds.map((id) => patternById.get(id)?.localName ?? "");
    return [item.phrase, item.description, item.question, ...(item.aliases ?? []), ...names].join(" ").toLocaleLowerCase().includes(query);
  });
  const pageSize = PAGE_SIZE.colloquialisms;
  const pageCount = Math.max(1, Math.ceil(visible.length / pageSize));
  state.colloquialPage = Math.min(state.colloquialPage, pageCount - 1);
  const pageItems = visible.slice(state.colloquialPage * pageSize, (state.colloquialPage + 1) * pageSize);
  return `<section class="content-section colloquial-content"><div class="section-heading"><div><p class="eyebrow">START WITH WORDS YOU ALREADY USE</p><h2>俗语：你平时会怎么说？</h2><p>“弹框”“文本框”“下拉框”这些日常说法很常见，但一个词可能指好几种做法。点开看看它们的样子、效果、适用场景和要留意的地方。</p></div><span class="content-count">${visible.length} / ${colloquialisms.length} 个常用说法</span></div><div class="colloquial-note"><span>这不是你说错了。</span>日常词语本来就比较宽泛；这里帮你把它可能对应的界面做法逐个展开，再决定怎么告诉 AI。</div><label class="pattern-search"><span aria-hidden="true">⌕</span><input id="colloquial-search-input" type="search" value="${escapeHtml(state.query)}" placeholder="搜“弹框”“文本框”“点头像弹出”…" /><kbd>/</kbd></label><div class="colloquial-grid">${pageItems.map(renderColloquialCard).join("") || `<div class="empty-search"><strong>暂时没有这个说法</strong><p>换一个更短、更口语的词试试。</p></div>`}</div>${renderPagination("colloquialisms", state.colloquialPage, pageSize, visible.length, "俗语分页")}</section>`;
}

function colloquialPrompt(item, pattern) {
  return [`我想做“${item.phrase}”里这种意思：${pattern.localName}。`, `界面大概是这样：${pattern.summary}`, `适合的场景：${pattern.useWhen}`, `请留意：${pattern.avoidWhen}`, `具体交互要求：${pattern.promptExample}`].join("\n");
}

function colloquialExample(item, pattern) {
  return `我说的“${item.phrase}”，是想要“${pattern.localName}”这种效果。${pattern.promptExample}`;
}

function colloquialPatternCard(item, pattern, index) {
  return `<article class="colloquial-pattern-card"><div class="colloquial-pattern-heading"><span class="colloquial-pattern-number">${String(index + 1).padStart(2, "0")}</span><div><h3>${escapeHtml(pattern.localName)}</h3><small>专业名称：${escapeHtml(pattern.term)}</small></div><span class="pattern-stamp" aria-hidden="true">${escapeHtml(familyById.get(pattern.family)?.icon ?? "✳")}</span></div><div class="colloquial-demo-heading"><strong>效果预览</strong><span class="demo-live"><i></i> 可直接操作</span></div><div class="demo-stage colloquial-demo-stage" data-demo-id="${escapeHtml(pattern.demoId)}" data-lazy-demo="true" data-demo-loaded="false" aria-busy="true"><div class="demo-lazy-placeholder" aria-hidden="true"><span></span><span></span><span></span></div><small class="sr-only">滚动到此处后载入交互预览</small></div><details class="colloquial-card-details"><summary><span>了解这个效果</span><small>作用 · 场景 · AI 说法</small></summary><div class="colloquial-explanation"><div class="colloquial-summary"><span>这个效果是什么</span><p>${escapeHtml(pattern.summary)}</p></div><div class="colloquial-facts"><div><strong>对用户有什么影响</strong><p>${escapeHtml(pattern.userEffect ?? pattern.contrast)}</p></div><div><strong>适合什么场景</strong><p>${escapeHtml(pattern.useWhen)}</p></div><div><strong>不适合时要留意</strong><p>${escapeHtml(pattern.avoidWhen)}</p></div></div><div class="colloquial-prompt-preview"><span>可以这样告诉 AI</span><p>${escapeHtml(colloquialExample(item, pattern))}</p></div><div class="colloquial-card-actions"><button type="button" class="copy-button" data-copy-colloquial="${escapeHtml(item.id)}" data-copy-colloquial-pattern="${escapeHtml(pattern.id)}">复制这段中文说法</button>${patternLink(pattern.id, "了解专业名称")}</div></div></details></article>`;
}

function renderColloquialDetail() {
  const item = currentColloquial();
  if (!item) return renderColloquialIndex();
  const linkedCases = cases.filter((caseStudy) => (item.caseIds ?? []).includes(caseStudy.id));
  const mappedPatterns = item.patternIds.map((id) => patternById.get(id)).filter(Boolean);
  return `<section class="content-section colloquial-detail-content"><button class="back-link" type="button" data-page="colloquial">← 返回俗语列表</button><div class="colloquial-detail-intro"><span class="fact-label">你可能会这样说</span><h2>“${escapeHtml(item.phrase)}”</h2><div class="colloquial-alias-cloud">${(item.aliases ?? []).map((alias) => `<span>“${escapeHtml(alias)}”</span>`).join("")}</div><p>先看 ${mappedPatterns.length} 种界面效果，需要时再展开说明。</p></div><div class="colloquial-results-heading"><div><p class="eyebrow">ONE EVERYDAY WORD · MANY INTERACTIONS</p><h3>“${escapeHtml(item.phrase)}”可能是这些样子</h3><p>点开每张卡片，可以继续了解它的作用和使用场景。</p></div><span class="content-count">${mappedPatterns.length} 种效果可比较</span></div><div class="colloquial-pattern-grid">${mappedPatterns.map((pattern, index) => colloquialPatternCard(item, pattern, index)).join("")}</div><details class="colloquial-meaning-details"><summary>这个说法可能是什么意思？<small>补充辨析问题</small></summary><div class="colloquial-meaning-note"><div><span class="fact-label">这句话的范围</span><p>${escapeHtml(item.description)}</p></div><div class="colloquial-question"><span>想一想</span><strong>${escapeHtml(item.question)}</strong></div></div></details>${linkedCases.length ? `<div class="colloquial-related-cases"><div><span class="fact-label">继续从具体需求来判断</span><h3>把你想做的事情说完整</h3></div><div>${linkedCases.map((caseStudy) => `<button type="button" class="related-case" data-case="${escapeHtml(caseStudy.id)}"><span>${escapeHtml(caseStudy.phrase)}</span><b>↗</b></button>`).join("")}</div></div>` : ""}</section>`;
}

function renderPatterns() {
  const query = state.query.trim().toLocaleLowerCase();
  const visible = patterns.filter((pattern) => {
    const family = familyById.get(pattern.family);
    const haystack = [pattern.term, pattern.localName, pattern.summary, pattern.useWhen, pattern.avoidWhen, pattern.contrast, ...(pattern.aliases ?? []), family?.label].join(" ").toLocaleLowerCase();
    return !query || haystack.includes(query);
  });
  const pageSize = PAGE_SIZE.patterns;
  const pageCount = Math.max(1, Math.ceil(visible.length / pageSize));
  state.patternPage = Math.min(state.patternPage, pageCount - 1);
  const pageItems = visible.slice(state.patternPage * pageSize, (state.patternPage + 1) * pageSize);
  if (!pageItems.some((pattern) => pattern.id === state.patternId) && pageItems.length) state.patternId = pageItems[0].id;
  const selected = pageItems.find((pattern) => pattern.id === state.patternId);
  return `<section class="content-section patterns-content"><div class="section-heading"><div><p class="eyebrow">OPTIONAL TECHNICAL REFERENCE</p><h2>专业术语</h2><p>平时不用先记住这些名字。这里提供标准名称，方便进一步查资料或和开发者沟通。</p></div><span class="content-count">${visible.length} / ${patterns.length} 个名称</span></div>
    <label class="pattern-search"><span aria-hidden="true">⌕</span><input id="pattern-search-input" type="search" value="${escapeHtml(state.query)}" placeholder="搜中文名、英文名或常用说法…" /><kbd>/</kbd></label>
    <div class="pattern-layout"><aside class="pattern-list" aria-label="交互模式列表">${pageItems.length ? pageItems.map(renderPatternRow).join("") + renderPagination("patterns", state.patternPage, pageSize, visible.length, "术语分页") : `<p class="empty-state">没有找到匹配的术语。试试“复选框”“确认”或“自动消失”。</p>`}</aside><div class="pattern-detail-panel">${renderPatternDetail(selected)}</div></div>
  </section>`;
}

function renderHelp() {
  const contributionUrl = "https://github.com/jinhefeng/ui-words-for-ai/blob/main/CONTRIBUTING.md";
  const dataUrl = (file) => `https://github.com/jinhefeng/ui-words-for-ai/blob/main/src/data/${file}`;
  return `<section class="content-section help-content">
    <div class="section-heading"><div><p class="eyebrow">HELP · HUMAN AND AI CONTRIBUTION GUIDE</p><h2>怎样补充教程内容？</h2><p>本页既给内容维护者阅读，也给 AI Coding 助手作为项目约定。四类静态数据分别描述需求入口、俗语、交互术语和具体场景；它们通过稳定 ID 互相引用。</p></div><span class="content-count">${families.length} 类需求 · ${patterns.length} 个术语 · 静态文件</span></div>
    <section class="ai-rules" aria-labelledby="ai-rules-title"><div class="ai-rules-heading"><span class="fact-label">AI MAINTENANCE CONTRACT</span><h3 id="ai-rules-title">AI 协助修改本项目时，先遵循这些规则</h3></div><ol>
      <li><strong>先理解用户任务。</strong>保留用户原话，说明用户要完成什么、界面在哪里出现、用户如何结束操作，以及结果是否立即生效；没有证据时先保留问题，不要替用户猜组件。</li>
      <li><strong>先查再新增。</strong>检查四份 JSON、相关案例和 <code>demo-catalog.js</code>。能复用就补充关系或说明，不要因同义说法重复建条目。</li>
      <li><strong>区分四种内容。</strong>需求入口归纳多个目标；俗语保留日常说法并连接多个可能；术语表示一种明确的交互行为；场景描述一项具体任务及改变推荐结果的条件。</li>
      <li><strong>只有行为不同才新建术语。</strong>判断差异要看触发方式、出现位置、是否阻断、如何关闭、状态是否持续、选择是否立即生效等，不要只看外观或名字。</li>
      <li><strong>保持中文优先和多对多关系。</strong><code>localName</code> 用新手听得懂的中文，<code>term</code> 补充标准术语；一个俗语、场景或术语都可以连接多个相关条目。</li>
      <li><strong>保持数据与预览分离。</strong>JSON 只放纯数据和普通文案。只有新模式确实需要新交互预览时，才在 <code>src/lib/demo-catalog.js</code> 增加本地示例；不要写远程请求、任意脚本或 HTML 字符串到 JSON。</li>
      <li><strong>完成后核对并汇报。</strong>确认 JSON 可解析、所有引用 ID 存在、问题选项与 <code>when</code> 完全匹配、每个 <code>demoId</code> 均已注册；报告改动文件、关系和人工检查结果。</li>
    </ol></section>
    <div class="help-note"><strong>推荐的建模顺序：真实用户任务 → 现有模式复用 → 补齐俗语和需求入口。</strong><span>具体场景通常引用已有术语；只有找不到行为相同的模式时才增加术语和可操作预览。</span></div>
    <div class="help-grid">
      <article class="help-card"><div class="help-card-heading"><span class="help-number">01</span><div><span class="fact-label">需求入口 · 归纳一类用户目标</span><h3>新增“按需求找”的分类</h3></div></div><p>需求入口是内容归类，不是页面组件，也不是具体案例。一个分类应能容纳多条相关任务；不要为了单个新案例增加分类。</p><p class="help-file-path">编辑 <code>src/data/families.json</code>：每项包含 <code>id</code>、<code>label</code>、<code>icon</code>、<code>description</code>。</p><details class="help-details"><summary>字段与关联细则</summary><div class="help-detail-body"><ul><li><code>id</code>：唯一、稳定、简短的英文 kebab-case ID；已有 ID 被案例或术语引用，不要随意改名。</li><li><code>label</code>：从用户目标命名，例如“输入信息”“选择和设定”，避免以控件名命名。</li><li><code>description</code>：说明用户想做的事及覆盖范围；具体条件和推荐写在场景中。</li><li>新增后检查 <code>cases.json</code> 与 <code>patterns.json</code> 是否应通过 <code>family</code> 归入该分类。顶部需求数量由文件条数自动计算，不要手改导航。</li></ul><a class="help-file-link" href="${dataUrl("families.json")}" target="_blank" rel="noreferrer">打开 families.json ↗</a></div></details></article>
      <article class="help-card"><div class="help-card-heading"><span class="help-number">02</span><div><span class="fact-label">俗语 · 用户日常使用的说法</span><h3>让一个俗语连接多种可能</h3></div></div><p>俗语索引保留小白真实表达，并让读者先比较效果名称和预览，再看解释。宽泛词不能直接当成唯一术语。</p><p class="help-file-path">编辑 <code>src/data/colloquialisms.json</code>：每项包含 <code>id</code>、<code>phrase</code>、<code>aliases</code>、<code>description</code>、<code>question</code>、<code>patternIds</code>、<code>caseIds</code>。</p><details class="help-details"><summary>字段与关联细则</summary><div class="help-detail-body"><ul><li><code>phrase</code> 保留用户最常见的原说法；<code>aliases</code> 只列真实同义说法、变体或常见误称。</li><li><code>description</code> 说明这个词为什么含义宽泛；<code>question</code> 是帮助区分用途的自然语言问题，不要写成术语考试。</li><li><code>patternIds</code> 指向一个或多个不同交互模式；<code>caseIds</code> 指向能展示实际任务的案例。每个 ID 必须在对应 JSON 文件存在。</li><li>只因名称不同不要重复建条目；若一词含义确实不同，应保留每种可行做法并说明差异。顶部俗语数量由此文件条数自动计算。</li></ul><a class="help-file-link" href="${dataUrl("colloquialisms.json")}" target="_blank" rel="noreferrer">打开 colloquialisms.json ↗</a></div></details></article>
      <article class="help-card"><div class="help-card-heading"><span class="help-number">03</span><div><span class="fact-label">术语 · 一种明确的交互行为</span><h3>只为有行为差异的做法新增术语</h3></div></div><p>页面优先展示中文口语化名称，专业术语用作查找和沟通的补充。外观不同但行为相同的做法，通常不必建立两个模式。</p><p class="help-file-path">编辑 <code>src/data/patterns.json</code>，并按需编辑 <code>src/lib/demo-catalog.js</code>。</p><details class="help-details"><summary>字段、预览与关联细则</summary><div class="help-detail-body"><ul><li>填写唯一 <code>id</code>、中文 <code>localName</code>、标准 <code>term</code>、归属 <code>family</code>、<code>aliases</code>、<code>summary</code>、<code>useWhen</code>、<code>avoidWhen</code>、<code>contrast</code>、<code>userEffect</code>、<code>promptExample</code> 和 <code>demoId</code>。</li><li>把使用时机、限制、与相似模式的区别、对用户的影响分开写，避免只有定义没有决策信息。</li><li><code>demoId</code> 必须唯一并在 demo registry 注册。只有交互行为需要演示时才新增示例；示例使用本地 HTML 与现有事件代理，不加载外部脚本或服务。</li><li>完成后检查该模式是否被相关案例的推荐、俗语的 <code>patternIds</code> 连接。顶部术语数量由文件条数自动计算。</li></ul><a class="help-file-link" href="${dataUrl("patterns.json")}" target="_blank" rel="noreferrer">打开 patterns.json ↗</a></div></details></article>
      <article class="help-card"><div class="help-card-heading"><span class="help-number">04</span><div><span class="fact-label">场景 · 一件具体的用户任务</span><h3>从条件推导“按场景找”的案例</h3></div></div><p>场景是内容链的核心：从官方指南描述的服务任务整理需求情境示例，写清任务、所在情境和真正会改变交互做法的条件。除非有可核实的访谈证据，不要把改写说成用户原话。不要在提问前假定组件。</p><p class="help-file-path">编辑 <code>src/data/cases.json</code>：每项包含 <code>id</code>、<code>family</code>、<code>journeyId</code>、<code>sourceIds</code>、<code>title</code>、<code>phrase</code>、<code>keywords</code>、<code>goal</code>、<code>context</code>、<code>questions</code>、<code>recommendations</code>。</p><details class="help-details"><summary>问题与推荐规则细则</summary><div class="help-detail-body"><ul><li>每个问题包含稳定的 <code>id</code>、面向用户的 <code>prompt</code> 和 <code>options</code>；每个选项含稳定的 <code>id</code>、清楚的 <code>label</code>，需要时加例子的 <code>hint</code>。</li><li>每条推荐的 <code>when</code> 使用“问题 ID → 选项 ID”的精确映射；所有 ID 都必须与对应问题及选项一致。多条件表示这些答案同时成立。</li><li>推荐字段为 <code>primaryPatternId</code>、<code>supportingPatternIds</code>、<code>alternativePatternIds</code> 和 <code>reason</code>。主模式回答主要需求，补充模式解释可组合做法，替代模式说明不同条件下的选择。</li><li>未回答足够条件时页面会展示尚未判定的候选；不要把候选写成确定推荐。<code>journeyId</code> 指向 <code>journeys.json</code> 的任务脉络；<code>sourceIds</code> 指向 <code>sources.json</code> 的官方依据。每个新增场景都要有相关来源，并说明这是指南任务的情境改写。顶部场景数量由此文件条数自动计算。</li></ul><a class="help-file-link" href="${dataUrl("cases.json")}" target="_blank" rel="noreferrer">打开 cases.json ↗</a> · <a class="help-file-link" href="${dataUrl("journeys.json")}" target="_blank" rel="noreferrer">journeys.json ↗</a> · <a class="help-file-link" href="${dataUrl("sources.json")}" target="_blank" rel="noreferrer">sources.json ↗</a></div></details></article>
    </div>
    <section class="help-relations" aria-labelledby="relations-title"><h3 id="relations-title">四类内容怎样互相连接？</h3><p><strong>需求入口</strong>给场景和术语归类；<strong>场景</strong>通过问题与精确答案条件推荐一个或多个术语；<strong>俗语</strong>把日常说法连接到可能的术语和具体场景。所有连接使用 ID，不依赖显示名称。</p><p>整体关系允许一对多和多对多：一个俗语可以连接多个术语和案例；多个俗语、案例也可以复用同一个术语。新增数据时优先复用已有模式，避免重复内容。</p></section>
    <section class="help-relations help-references" aria-labelledby="references-title"><h3 id="references-title">这批内容参考的官方指南</h3><p>本站把指南整理成适合新手阅读的中文判断说明，并非照搬某一套组件库的外观。</p><ul>
      <li><a href="https://www.w3.org/WAI/ARIA/apg/patterns/" target="_blank" rel="noreferrer">WAI-ARIA Authoring Practices Guide</a>：交互模式及语义边界，特别是普通表格与交互式网格的区别。</li>
      <li><a href="https://design-system.service.gov.uk/components/pagination/" target="_blank" rel="noreferrer">GOV.UK Pagination</a>：只在性能或浏览体验确实受益时分页；筛选和排序应用于完整结果集，避免自动无限滚动。</li>
      <li><a href="https://design-system.service.gov.uk/components/date-input/" target="_blank" rel="noreferrer">GOV.UK Date input</a>、<a href="https://designsystem.digital.gov/components/date-picker/" target="_blank" rel="noreferrer">USWDS Date picker</a> 和 <a href="https://designsystem.digital.gov/components/date-range-picker/" target="_blank" rel="noreferrer">USWDS Date range picker</a>：区分填写已知日期与需要日历上下文的日期安排，并保留手动输入。</li>
      <li><a href="https://design-system.service.gov.uk/components/file-upload/" target="_blank" rel="noreferrer">GOV.UK File upload</a>：仅在上传对任务确有必要时要求用户提供文件，并清楚说明限制和错误恢复方式。</li>
      <li><a href="https://design-system.service.gov.uk/components/character-count/" target="_blank" rel="noreferrer">GOV.UK Character count</a> 与 <a href="https://designsystem.digital.gov/components/table/" target="_blank" rel="noreferrer">USWDS Table</a>：有真实长度上限再显示计数；表格适合按相同字段组织和比较记录。</li>
      <li><a href="https://designsystem.digital.gov/components/collection/" target="_blank" rel="noreferrer">USWDS Collection</a>：用标题、短说明和元数据浏览相关内容，不将其当作密集数据表格。</li>
      <li><a href="https://designsystem.digital.gov/components/step-indicator/" target="_blank" rel="noreferrer">USWDS Step indicator</a> 与 <a href="https://design-system.service.gov.uk/components/task-list/" target="_blank" rel="noreferrer">GOV.UK Task list</a>：区分线性流程当前位置和可独立完成的任务总览。</li>
      <li><a href="https://design-system.service.gov.uk/components/summary-list/" target="_blank" rel="noreferrer">GOV.UK Summary list</a>：提交前按键和值成对复核答案；不要拿它替代表格或任务清单。</li>
    </ul></section>
    <div class="help-workflow"><div><span class="fact-label">AI 与人工都按这份清单收尾</span><h3>内容修改完成标准</h3></div><ol><li>四份 JSON 均可解析；没有重复或无效 ID。</li><li>需求、俗语、术语、场景和预览之间的引用都能找到目标。</li><li>推荐条件中的问题与选项真实存在；推荐理由能解释用户体验差异。</li><li>相关页面可打开；名称、预览与帮助说明顺序正确；窄屏可浏览。</li><li>汇报改了什么、复用了什么、检查到什么；没有验证的内容明确标出。</li></ol><a class="copy-button help-contribute-link" href="${contributionUrl}" target="_blank" rel="noreferrer">打开完整贡献指南 ↗</a></div>
    <p class="help-footnote">数据保存在 HTML/CSS、原生 JavaScript 和 JSON 静态文件中，不需要数据库。计数从数据文件自动生成；添加或删除条目后无需单独修改导航数量。</p>
  </section>`;
}

function render() {
  updateShell();
  if (!root) return;
  root.setAttribute("aria-busy", "false");
  root.innerHTML = state.page === "explore" ? renderExplore()
    : state.page === "colloquial" ? (state.colloquialId ? renderColloquialDetail() : renderColloquialIndex())
    : state.page === "patterns" ? renderPatterns()
      : state.page === "cases" ? (state.caseId ? renderCaseDetail() : renderCases())
        : renderHelp();
  observeLazyDemos();
}

function mountDemoStage(stage) {
  const pattern = patternById.get(stage.dataset.demoId);
  if (!pattern || stage.dataset.demoLoaded === "true") return;
  stage.innerHTML = renderDemo(pattern);
  stage.dataset.demoLoaded = "true";
  stage.setAttribute("aria-busy", "false");
}

function observeLazyDemos() {
  const stages = [...root.querySelectorAll('[data-lazy-demo="true"][data-demo-loaded="false"]')];
  if (!stages.length) return;
  if (!("IntersectionObserver" in window)) {
    stages.forEach(mountDemoStage);
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      mountDemoStage(entry.target);
      observer.unobserve(entry.target);
    });
    if (!root.querySelector('[data-lazy-demo="true"][data-demo-loaded="false"]')) observer.disconnect();
  }, { rootMargin: "280px 0px" });
  stages.forEach((stage) => observer.observe(stage));
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
  const pager = event.target.closest("[data-pager]");
  if (pager) {
    const pageKey = { cases: "casePage", colloquialisms: "colloquialPage", patterns: "patternPage" }[pager.dataset.pager];
    if (!pageKey || pager.disabled) return;
    const action = pager.dataset.pagerAction;
    state[pageKey] = Number(pager.dataset.pageIndex);
    render();
    const focusAction = action === "next" ? "previous" : "next";
    root.querySelector(`[data-pager="${pager.dataset.pager}"][data-pager-action="${focusAction}"]:not(:disabled)`)?.focus();
    return;
  }
  const pageButton = event.target.closest("[data-page]");
  if (pageButton) { event.preventDefault(); navigate(pageButton.dataset.page); return; }
  const colloquialIdButton = event.target.closest("[data-colloquial-id]");
  if (colloquialIdButton) { state.query = ""; navigate("colloquial", colloquialIdButton.dataset.colloquialId); return; }
  const colloquialButton = event.target.closest("[data-colloquial]");
  if (colloquialButton) {
    const item = findColloquial(colloquialButton.dataset.colloquial);
    state.query = "";
    navigate("colloquial", item?.id ?? "");
    return;
  }
  const familyButton = event.target.closest("[data-family]");
  if (familyButton) { state.familyId = familyButton.dataset.family; state.journeyId = null; state.query = ""; state.casePage = 0; navigate("cases"); return; }
  const journeyButton = event.target.closest("[data-journey]");
  if (journeyButton) { state.journeyId = journeyButton.dataset.journey; state.familyId = null; state.query = ""; state.casePage = 0; navigate("cases"); return; }
  const familyFilter = event.target.closest("[data-family-filter]");
  if (familyFilter) { state.familyId = familyFilter.dataset.familyFilter || null; state.casePage = 0; render(); return; }
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
  if (patternButton) { state.query = ""; state.patternPage = 0; state.patternCasePage = 0; state.patternId = patternButton.dataset.pattern; navigate("patterns", patternButton.dataset.pattern); return; }
  const patternSelect = event.target.closest("[data-pattern-select]");
  if (patternSelect) { if (state.patternId !== patternSelect.dataset.patternSelect) state.patternCasePage = 0; state.patternId = patternSelect.dataset.patternSelect; render(); return; }
  const relatedCasePage = event.target.closest("[data-related-case-page]");
  if (relatedCasePage && !relatedCasePage.disabled) { state.patternCasePage = Number(relatedCasePage.dataset.relatedCasePage); render(); return; }
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
  const copyColloquial = event.target.closest("[data-copy-colloquial]");
  if (copyColloquial) {
    const item = colloquialById.get(copyColloquial.dataset.copyColloquial);
    const pattern = patternById.get(copyColloquial.dataset.copyColloquialPattern);
    if (item && pattern) copyText(colloquialPrompt(item, pattern));
    return;
  }
  if (event.target.closest(".demo-stage")) handleDemoClick(event);
});

document.addEventListener("change", (event) => {
  if (event.target.id === "case-journey-filter") { state.journeyId = event.target.value || null; state.casePage = 0; render(); }
});

document.addEventListener("input", (event) => {
  if (event.target.id === "case-search-input") { state.query = event.target.value; state.casePage = 0; const position = event.target.selectionStart; render(); const next = document.querySelector("#case-search-input"); next?.focus(); next?.setSelectionRange(position, position); }
  if (event.target.id === "pattern-search-input") { state.query = event.target.value; state.patternPage = 0; const position = event.target.selectionStart; render(); const next = document.querySelector("#pattern-search-input"); next?.focus(); next?.setSelectionRange(position, position); }
  if (event.target.id === "colloquial-search-input") { state.query = event.target.value; state.colloquialPage = 0; const position = event.target.selectionStart; render(); const next = document.querySelector("#colloquial-search-input"); next?.focus(); next?.setSelectionRange(position, position); }
  if (event.target.matches("[data-demo-search]")) {
    const query = event.target.value.toLocaleLowerCase();
    event.target.closest(".demo-stage")?.querySelectorAll(".demo-result-list button").forEach((button) => { button.hidden = !button.textContent.toLocaleLowerCase().includes(query); });
  }
  if (event.target.matches("[data-character-count]")) {
    const stage = event.target.closest(".demo-stage");
    const count = Array.from(event.target.value).length;
    const limit = Number(event.target.maxLength) || 100;
    const output = stage?.querySelector(".demo-character-count");
    if (output) output.textContent = `已输入 ${count} / ${limit} 个字符`;
  }
});

document.querySelector("#hero-search")?.addEventListener("submit", (event) => {
  event.preventDefault();
  state.query = document.querySelector("#hero-query").value;
  state.familyId = null;
  state.journeyId = null;
  state.casePage = 0;
  navigate("cases");
});

document.addEventListener("click", (event) => {
  const suggestion = event.target.closest("[data-query]");
  if (!suggestion) return;
  document.querySelector("#hero-query").value = suggestion.dataset.query;
  state.query = suggestion.dataset.query;
  state.casePage = 0;
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
