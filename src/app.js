import { categories, terms } from "./data/terms.js";

const list = document.querySelector("#term-list");
const detail = document.querySelector("#term-detail");
const search = document.querySelector("#term-search");
const filters = document.querySelector("#category-filters");
const toastRegion = document.querySelector("#toast-region");
let selectedId = "toast";
let activeCategory = "all";
let toastTimer;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function matchingTerms() {
  const query = search.value.trim().toLocaleLowerCase();
  return terms.filter((term) => {
    const inCategory = activeCategory === "all" || term.category === activeCategory;
    const haystack = [term.name, term.localName, term.short, term.useWhen, term.scenario].join(" ").toLocaleLowerCase();
    return inCategory && (!query || haystack.includes(query));
  });
}

function renderFilters() {
  filters.innerHTML = categories.map((category) => `
    <button class="filter-chip ${activeCategory === category.id ? "selected" : ""}" type="button" data-category="${category.id}" aria-pressed="${activeCategory === category.id}">
      <span aria-hidden="true">${category.icon}</span>${category.label}
    </button>`).join("");
}

function renderList() {
  const visible = matchingTerms();
  if (!visible.some((term) => term.id === selectedId) && visible.length) selectedId = visible[0].id;
  list.innerHTML = visible.length ? visible.map((term) => `
    <button type="button" class="term-row ${selectedId === term.id ? "selected" : ""}" data-term="${term.id}" aria-pressed="${selectedId === term.id}">
      <span class="term-index">${term.number}</span>
      <span class="term-row-copy"><strong>${term.name}</strong><small>${term.localName}</small></span>
      <span class="row-arrow" aria-hidden="true">↗</span>
    </button>`).join("") : `<p class="empty-state">没有找到匹配的术语。试试“确认”“移动端”或“自动消失”。</p>`;
  const selected = visible.find((term) => term.id === selectedId);
  if (selected) renderDetail(selected);
  else detail.innerHTML = `<div class="detail-empty"><span>⌕</span><p>换个关键词，再找找看。</p></div>`;
}

function demoMarkup(term) {
  const demos = {
    toast: `<div class="demo-canvas toast-demo"><div class="fake-page"><div class="fake-page-bar"><i></i><i></i><i></i></div><span class="fake-avatar">M</span><div class="fake-lines"><i></i><i></i><i></i></div><button class="demo-action" data-action="toast">保存更改 <span>↗</span></button></div><p class="demo-caption">点一下，看看它怎么轻轻出现。</p></div>`,
    modal: `<div class="demo-canvas centered-demo"><div class="fake-page"><div class="fake-page-bar"><i></i><i></i><i></i></div><span class="fake-avatar">M</span><div class="fake-lines"><i></i><i></i><i></i></div><button class="demo-action" data-action="modal">编辑昵称 <span>↗</span></button></div><p class="demo-caption">点击后打开 Modal Dialog，聚焦一个小任务。</p></div>`,
    "alert-dialog": `<div class="demo-canvas centered-demo"><div class="fake-page"><div class="fake-page-bar"><i></i><i></i><i></i></div><strong class="fake-page-title">项目设置</strong><div class="fake-lines"><i></i><i></i><i></i></div><button class="demo-action danger-trigger" data-action="alert-dialog">删除项目 <span>↗</span></button></div><p class="demo-caption">操作有重要后果时，先清楚说明再让用户选择。</p></div>`,
    drawer: `<div class="demo-canvas drawer-demo"><div class="drawer-page"><div class="fake-page-bar"><i></i><i></i><i></i></div><strong>Recent orders</strong><div class="order-row"><span>ORD-2048</span><small>今天 · 已发货</small></div><div class="order-row faded"><span>ORD-2047</span><small>昨天 · 已送达</small></div><button class="demo-action" data-action="drawer">查看订单 <span>↗</span></button></div><p class="demo-caption">点一下，从右侧展开更多信息。</p></div>`,
    popover: `<div class="demo-canvas popover-demo"><button class="profile-trigger" type="button" data-action="popover" aria-expanded="false"><span class="fake-avatar">M</span><span><strong>Mina</strong><small>点击查看</small></span><b>⌄</b></button><div class="popover-card" id="demo-popover" hidden><strong>Mina Chen</strong><small>mina@example.com</small><button type="button" data-action="toast">个人设置 <span>↗</span></button></div><p class="demo-caption">内容贴着触发按钮展开。</p></div>`,
    tooltip: `<div class="demo-canvas tooltip-demo"><button class="tooltip-target" type="button" aria-label="撤销上一步" aria-describedby="demo-tooltip"><span aria-hidden="true">↶</span><span class="tooltip-bubble" id="demo-tooltip">撤销上一步</span></button><p class="demo-caption">悬停或用键盘 Tab 聚焦圆形按钮。</p></div>`,
    "bottom-sheet": `<div class="demo-canvas sheet-demo"><div class="phone-frame"><div class="phone-status"><span>9:41</span><span>●●● ▰</span></div><div class="phone-content"><span class="phone-kicker">FIELD NOTES · 12 MIN READ</span><strong>Designing for clarity</strong><p>Small interactions shape how a product feels.</p><button class="demo-action" data-action="sheet">分享文章 <span>↗</span></button></div><div class="phone-home"></div></div><p class="demo-caption">在手机上从底部展开常用操作。</p></div>`,
  };
  return demos[term.id];
}

function renderDetail(term) {
  detail.innerHTML = `
    <div class="detail-topline"><span class="detail-number">${term.number} / INTERACTION PATTERN</span><span class="detail-category">${categories.find((item) => item.id === term.category)?.label}</span></div>
    <div class="detail-title-row"><div><h3>${term.name}</h3><span class="local-name">${term.localName}</span></div><span class="detail-spark" aria-hidden="true">✳</span></div>
    <p class="detail-summary">${term.short}</p>
    <div class="detail-facts"><div><span class="fact-label">适合什么时候用</span><p>${term.useWhen}</p></div><div><span class="fact-label">不适合这些情况</span><p>${term.avoidWhen}</p></div></div>
    <p class="contrast-note"><span aria-hidden="true">↔</span><span>${term.contrast}</span></p>
    <div class="demo-heading"><div><span class="fact-label">TRY IT YOURSELF</span><strong>交互预览</strong></div><span class="demo-live"><i></i> LIVE HTML</span></div>
    ${demoMarkup(term)}
    <div class="prompt-card"><div class="prompt-card-head"><span class="fact-label">COPY THIS INTO YOUR AI TOOL</span><button class="copy-button" type="button" data-action="copy" data-term="${term.id}"><span aria-hidden="true">▢</span> 复制指令</button></div><p>${term.prompt}</p><div class="scenario-line"><span>真实需求</span><span>${term.scenario}</span></div></div>
  `;
}

function showToast(message) {
  clearTimeout(toastTimer);
  toastRegion.innerHTML = `<div class="toast-card"><span class="toast-check">✓</span><span>${escapeHtml(message)}</span><button type="button" aria-label="关闭提示">×</button></div>`;
  toastRegion.querySelector("button").addEventListener("click", () => { toastRegion.innerHTML = ""; });
  toastTimer = setTimeout(() => { toastRegion.innerHTML = ""; }, 3200);
}

async function copyPrompt(id) {
  const term = terms.find((item) => item.id === id);
  if (!term) return;
  try {
    await navigator.clipboard.writeText(term.prompt);
    showToast("精准指令已复制");
  } catch {
    const field = document.createElement("textarea");
    field.value = term.prompt;
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.append(field);
    field.select();
    document.execCommand("copy");
    field.remove();
    showToast("精准指令已复制");
  }
}

function openDialog(kind) {
  const title = ({ sheet: "分享这篇文章", drawer: "订单详情", modal: "更新你的昵称", "alert-dialog": "删除这个项目？" })[kind];
  const dialogClass = ({ sheet: "live-sheet", drawer: "live-drawer", modal: "live-modal", "alert-dialog": "live-alert" })[kind];
  const body = ({
    sheet: `<p class="dialog-subtitle">选择一种分享方式</p><div class="share-options"><button data-action="toast">↗<span>复制链接</span></button><button data-action="toast">✉<span>邮件</span></button><button data-action="toast">•••<span>更多</span></button></div>`,
    drawer: `<p class="dialog-subtitle">ORD-2048 · 今天 10:42</p><div class="drawer-detail-row"><span>状态</span><strong>已发货</strong></div><div class="drawer-detail-row"><span>配送地址</span><strong>杭州市西湖区</strong></div><div class="drawer-detail-row"><span>预计送达</span><strong>11 月 2 日</strong></div>`,
    modal: `<p class="dialog-subtitle">这个名字会显示在你的个人资料中。</p><label class="dialog-field">昵称<input value="Mina Chen" /></label><div class="dialog-actions"><button data-action="close-dialog">取消</button><button class="primary" data-action="close-dialog">保存</button></div>`,
    "alert-dialog": `<p class="dialog-subtitle">删除后，项目及其所有文件都无法恢复。</p><div class="dialog-actions"><button data-action="close-dialog">取消</button><button class="destructive" data-action="confirm-delete">永久删除</button></div>`,
  })[kind];
  const dialog = document.createElement("dialog");
  dialog.className = `live-dialog ${dialogClass}`;
  dialog.setAttribute("aria-labelledby", "live-dialog-title");
  dialog.innerHTML = `<div class="live-dialog-header"><span class="sheet-grip"></span><h2 id="live-dialog-title">${title}</h2><button type="button" aria-label="关闭">×</button></div>${body}`;
  document.body.append(dialog);
  const close = () => { dialog.close(); dialog.remove(); };
  dialog.querySelector(".live-dialog-header button").addEventListener("click", close);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) { close(); return; }
    const button = event.target.closest("[data-action]");
    if (!button) return;
    if (button.dataset.action === "close-dialog") close();
    if (button.dataset.action === "confirm-delete") { close(); showToast("示例：项目已删除"); }
    if (button.dataset.action === "toast") { close(); showToast("分享方式已选择"); }
  });
  dialog.addEventListener("close", () => dialog.remove(), { once: true });
  dialog.showModal();
}

filters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  renderFilters();
  renderList();
});

list.addEventListener("click", (event) => {
  const button = event.target.closest("[data-term]");
  if (!button) return;
  selectedId = button.dataset.term;
  renderList();
  detail.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

search.addEventListener("input", renderList);
document.addEventListener("keydown", (event) => {
  if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
    event.preventDefault(); search.focus();
  }
  if (event.key === "Escape") {
    const popover = document.querySelector("#demo-popover");
    const trigger = document.querySelector(".profile-trigger");
    if (popover && !popover.hidden) { popover.hidden = true; trigger?.setAttribute("aria-expanded", "false"); trigger?.focus(); }
  }
});

detail.addEventListener("click", (event) => {
  const action = event.target.closest("[data-action]");
  if (!action) return;
  switch (action.dataset.action) {
    case "copy": copyPrompt(action.dataset.term); break;
    case "toast": showToast("操作已完成"); break;
    case "confirm-delete": showToast("示例：删除已取消"); break;
    case "modal": openDialog("modal"); break;
    case "alert-dialog": openDialog("alert-dialog"); break;
    case "close-dialog": action.closest("dialog")?.close(); break;
    case "drawer": openDialog("drawer"); break;
    case "sheet": openDialog("sheet"); break;
    case "popover": {
      const popover = detail.querySelector("#demo-popover");
      popover.hidden = !popover.hidden;
      action.setAttribute("aria-expanded", String(!popover.hidden));
      break;
    }
  }
});

document.addEventListener("click", (event) => {
  const popover = detail.querySelector("#demo-popover");
  if (!popover || popover.hidden || event.target.closest(".profile-trigger, #demo-popover")) return;
  popover.hidden = true;
  detail.querySelector(".profile-trigger")?.setAttribute("aria-expanded", "false");
});

renderFilters();
renderList();
