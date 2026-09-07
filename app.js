// Theme
const themeToggle = document.getElementById("theme-toggle");
const savedTheme = localStorage.getItem("theme") || "light";
document.documentElement.setAttribute("data-theme", savedTheme);

themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
});

// Helpers
function getStatus(p) {
  const remarks = (p.Remarks || "").toLowerCase();
  const allDone =
    p.Proposal === "Done" && p.written === "Done" && p.defence === "Done";
  if (remarks.includes("discussion") || remarks.includes("in discussion"))
    return "discussion";
  if (allDone || (p.defence === "Done" && p.Grade)) return "done";
  if (p.Title) return "in-progress";
  return "unknown";
}

function statusLabel(s) {
  return { done: "Abgeschlossen", "in-progress": "In Bearbeitung", discussion: "In Diskussion", unknown: "–" }[s] || "–";
}

function statusClass(s) {
  return { done: "tag-status-done", "in-progress": "tag-status-progress", discussion: "tag-status-discuss" }[s] || "";
}

function ratingFromEtcs(etcs) {
  if (!etcs) return null;
  const m = etcs.match(/([ABC]\*?)/i);
  return m ? m[1].toUpperCase() : null;
}

function ratingClass(r) {
  if (!r) return "";
  if (r.startsWith("A")) return "tag-rating-a";
  if (r === "B") return "tag-rating-b";
  if (r === "C") return "tag-rating-c";
  return "";
}

// Stats
function renderStats() {
  const valid = papers.filter((p) => p.Title || p.defence);
  const authors = papers.filter((p) => p["My role"] === "Author").length;
  const coauthors = papers.filter((p) => p["My role"] === "Co-Author").length;
  const done = papers.filter((p) => getStatus(p) === "done").length;
  const grades = papers.filter((p) => p.Grade === "A").length;

  document.getElementById("stats").innerHTML = `
    <div class="stat-card"><div class="num">${valid.length}</div><div class="label">Einträge</div></div>
    <div class="stat-card"><div class="num">${authors}</div><div class="label">Als Author</div></div>
    <div class="stat-card"><div class="num">${coauthors}</div><div class="label">Als Co-Author</div></div>
    <div class="stat-card"><div class="num">${done}</div><div class="label">Abgeschlossen</div></div>
    <div class="stat-card"><div class="num">${grades}</div><div class="label">Note A</div></div>
  `;
}

// Render cards
function renderPapers(list) {
  const container = document.getElementById("publications-list");
  const noResults = document.getElementById("no-results");
  const badge = document.getElementById("count-badge");

  badge.textContent = list.length;

  if (list.length === 0) {
    container.innerHTML = "";
    noResults.classList.remove("hidden");
    return;
  }
  noResults.classList.add("hidden");

  container.innerHTML = list
    .map((p) => {
      const status = getStatus(p);
      const rating = ratingFromEtcs(p.ETCS);
      const role = p["My role"];
      const title = p.Title || "(Titel noch offen)";
      const abstract = p.Abstract || "Kein Abstract verfügbar.";

      return `
      <article class="paper-card" data-id="${p["Paper No."]}">
        <div class="paper-header">
          <div class="paper-meta">
            ${role ? `<span class="tag ${role === "Author" ? "tag-role-author" : "tag-role-co"}">${role}</span>` : ""}
            ${p.Grade ? `<span class="tag tag-grade">Note ${p.Grade}</span>` : ""}
            <span class="tag ${statusClass(status)}">${statusLabel(status)}</span>
            ${rating ? `<span class="tag ${ratingClass(rating)}">${rating}-Rating</span>` : ""}
          </div>
          <span class="paper-number">#${p["Paper No."]}</span>
        </div>
        <h3 class="paper-title">${escapeHtml(title)}</h3>
        ${p.Subject ? `<div class="paper-subject">${escapeHtml(p.Subject)}</div>` : ""}
        ${p.Teacher ? `<div class="paper-teacher">Betreuung: <strong>${escapeHtml(p.Teacher)}</strong></div>` : ""}
        <p class="paper-abstract">${escapeHtml(abstract)}</p>
        <div class="paper-footer">
          ${p["Published to"] ? `<span>Ort: <strong>${escapeHtml(p["Published to"])}</strong></span>` : ""}
          ${p.at ? `<span>Datum: <strong>${escapeHtml(p.at)}</strong></span>` : ""}
          ${p.in ? `<span>${escapeHtml(p.in)}</span>` : ""}
          ${p.ETCS ? `<span>ETCS: <strong>${escapeHtml(p.ETCS)}</strong></span>` : ""}
          <button class="btn-details" data-id="${p["Paper No."]}">Details</button>
        </div>
      </article>`;
    })
    .join("");

  // Detail buttons
  container.querySelectorAll(".btn-details").forEach((btn) => {
    btn.addEventListener("click", () => openModal(btn.dataset.id));
  });
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Filter
function applyFilters() {
  const role = document.getElementById("filter-role").value;
  const status = document.getElementById("filter-status").value;
  const rating = document.getElementById("filter-rating").value;
  const search = document.getElementById("search").value.toLowerCase().trim();

  let filtered = papers.filter((p) => p.Title || p.defence || p.Subject);

  if (role !== "all") {
    filtered = filtered.filter((p) => p["My role"] === role);
  }
  if (status !== "all") {
    filtered = filtered.filter((p) => getStatus(p) === status);
  }
  if (rating !== "all") {
    filtered = filtered.filter((p) => {
      const r = ratingFromEtcs(p.ETCS);
      if (!r) return false;
      if (rating === "A") return r.startsWith("A");
      return r === rating;
    });
  }
  if (search) {
    filtered = filtered.filter((p) => {
      const hay = [
        p.Title,
        p.Abstract,
        p.Teacher,
        p.Subject,
        p.Remarks,
        p["Published to"],
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(search);
    });
  }

  renderPapers(filtered);
}

["filter-role", "filter-status", "filter-rating"].forEach((id) => {
  document.getElementById(id).addEventListener("change", applyFilters);
});
document.getElementById("search").addEventListener("input", applyFilters);

// Modal
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modal-body");

function openModal(id) {
  const p = papers.find((x) => x["Paper No."] === id);
  if (!p) return;

  const status = getStatus(p);
  const rating = ratingFromEtcs(p.ETCS);

  modalBody.innerHTML = `
    <h3>${escapeHtml(p.Title || "(Titel noch offen)")}</h3>
    <div class="meta-row">
      ${p["My role"] ? `<span class="tag ${p["My role"] === "Author" ? "tag-role-author" : "tag-role-co"}">${p["My role"]}</span>` : ""}
      ${p.Grade ? `<span class="tag tag-grade">Note ${p.Grade}</span>` : ""}
      <span class="tag ${statusClass(status)}">${statusLabel(status)}</span>
      ${rating ? `<span class="tag ${ratingClass(rating)}">${rating}-Rating</span>` : ""}
    </div>
    ${p.Abstract ? `<p class="abstract-full">${escapeHtml(p.Abstract)}</p>` : "<p class='abstract-full'>Kein Abstract vorhanden.</p>"}
    <dl class="details-grid">
      <div><dt>Fach / Subject</dt><dd>${escapeHtml(p.Subject || "–")}</dd></div>
      <div><dt>Betreuung</dt><dd>${escapeHtml(p.Teacher || "–")}</dd></div>
      <div><dt>Proposal</dt><dd>${escapeHtml(p.Proposal || "–")}</dd></div>
      <div><dt>Written</dt><dd>${escapeHtml(p.written || "–")}</dd></div>
      <div><dt>Defence</dt><dd>${escapeHtml(p.defence || "–")}</dd></div>
      <div><dt>Grade</dt><dd>${escapeHtml(p.Grade || "–")}</dd></div>
      <div><dt>Published to</dt><dd>${escapeHtml(p["Published to"] || "–")}</dd></div>
      <div><dt>Datum / Ort</dt><dd>${escapeHtml([p.at, p.in].filter(Boolean).join(" · ") || "–")}</dd></div>
      <div><dt>Conference / Journal</dt><dd>${escapeHtml(p["Conference/Journal"] || "–")}</dd></div>
      <div><dt>ETCS / Rating</dt><dd>${escapeHtml(p.ETCS || "–")}</dd></div>
      <div style="grid-column:1/-1"><dt>Remarks</dt><dd>${escapeHtml(p.Remarks || "–")}</dd></div>
    </dl>
  `;
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.add("hidden");
  document.body.style.overflow = "";
}

modal.querySelector(".modal-close").addEventListener("click", closeModal);
modal.querySelector(".modal-backdrop").addEventListener("click", closeModal);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

// Nav active state
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-link");

window.addEventListener("scroll", () => {
  let current = "";
  sections.forEach((sec) => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === "#" + current);
  });
});

// Init
renderStats();
applyFilters();
