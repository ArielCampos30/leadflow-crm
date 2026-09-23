const STORAGE_KEYS = {
  leads: "leadflow_demo_leads_v1",
  tasks: "leadflow_demo_tasks_v1"
};

const STAGES = [
  { id: "new", label: "Nuevo" },
  { id: "contacted", label: "Contactado" },
  { id: "proposal", label: "Presupuesto" },
  { id: "negotiation", label: "Negociación" },
  { id: "won", label: "Ganado" }
];

const stageLabels = {
  new: "Nuevo",
  contacted: "Contactado",
  proposal: "Presupuesto",
  negotiation: "Negociación",
  won: "Ganado",
  lost: "Perdido"
};

const seedLeads = [
  { id: "L-1001", name: "Sofía Herrera", company: "Estudio Sur", email: "sofia@estudiosur.demo", phone: "+54 9 351 555 0101", amount: 420000, stage: "new", source: "Web", nextAction: "Llamar y validar necesidad", dueDate: offsetDate(1), createdAt: offsetDate(-1) },
  { id: "L-1002", name: "Martín Acosta", company: "Acosta Servicios", email: "martin@acosta.demo", phone: "+54 9 3548 555 022", amount: 680000, stage: "contacted", source: "Referido", nextAction: "Enviar resumen de alcance", dueDate: offsetDate(2), createdAt: offsetDate(-3) },
  { id: "L-1003", name: "Camila Vega", company: "Vega Deco", email: "camila@vegadeco.demo", phone: "+54 9 11 5555 0310", amount: 950000, stage: "proposal", source: "Instagram", nextAction: "Revisar propuesta enviada", dueDate: offsetDate(3), createdAt: offsetDate(-5) },
  { id: "L-1004", name: "Lucas Benítez", company: "LB Ingeniería", email: "lucas@lbingenieria.demo", phone: "+54 9 351 555 0404", amount: 1200000, stage: "negotiation", source: "Contacto directo", nextAction: "Definir condiciones finales", dueDate: offsetDate(1), createdAt: offsetDate(-8) },
  { id: "L-1005", name: "Julieta Ríos", company: "Ríos Studio", email: "julieta@riosstudio.demo", phone: "+54 9 351 555 0505", amount: 760000, stage: "won", source: "Google Ads", nextAction: "Coordinar onboarding", dueDate: offsetDate(4), createdAt: offsetDate(-10) },
  { id: "L-1006", name: "Federico Luna", company: "Luna Climatización", email: "federico@lunaclimatizacion.demo", phone: "+54 9 3548 555 066", amount: 510000, stage: "contacted", source: "Web", nextAction: "Agendar segunda llamada", dueDate: offsetDate(5), createdAt: offsetDate(-2) },
  { id: "L-1007", name: "Agustina Molina", company: "Molina Arquitectura", email: "agustina@molina.demo", phone: "+54 9 351 555 0707", amount: 830000, stage: "proposal", source: "Referido", nextAction: "Responder dudas comerciales", dueDate: offsetDate(2), createdAt: offsetDate(-6) },
  { id: "L-1008", name: "Nicolás Duarte", company: "Duarte Muebles", email: "nicolas@duarte.demo", phone: "+54 9 351 555 0808", amount: 390000, stage: "lost", source: "Instagram", nextAction: "Registrar motivo de pérdida", dueDate: offsetDate(7), createdAt: offsetDate(-12) }
];

const seedTasks = [
  { id: "T-1", title: "Llamar a Sofía Herrera", date: offsetDate(1), priority: "high", completed: false },
  { id: "T-2", title: "Revisar propuesta de Vega Deco", date: offsetDate(2), priority: "medium", completed: false },
  { id: "T-3", title: "Preparar onboarding de Ríos Studio", date: offsetDate(3), priority: "low", completed: false },
  { id: "T-4", title: "Actualizar notas de LB Ingeniería", date: offsetDate(0), priority: "high", completed: true }
];

let leads = loadData(STORAGE_KEYS.leads, seedLeads);
let tasks = loadData(STORAGE_KEYS.tasks, seedTasks);
let currentSearch = "";
let currentStageFilter = "all";
let draggedLeadId = null;

const els = {
  today: document.querySelector("#today-label"),
  kpis: document.querySelector("#kpi-grid"),
  miniPipeline: document.querySelector("#mini-pipeline"),
  recentLeads: document.querySelector("#recent-leads-body"),
  dashboardTasks: document.querySelector("#dashboard-task-list"),
  pipelineBoard: document.querySelector("#pipeline-board"),
  pipelineSummary: document.querySelector("#pipeline-summary"),
  allLeads: document.querySelector("#all-leads-body"),
  leadsEmpty: document.querySelector("#leads-empty"),
  taskBoard: document.querySelector("#task-board"),
  globalSearch: document.querySelector("#global-search"),
  stageFilter: document.querySelector("#stage-filter"),
  leadModal: document.querySelector("#lead-modal"),
  taskModal: document.querySelector("#task-modal"),
  leadForm: document.querySelector("#lead-form"),
  taskForm: document.querySelector("#task-form"),
  sidebar: document.querySelector("#sidebar"),
  mobileMenu: document.querySelector("#mobile-menu"),
  toast: document.querySelector("#toast")
};

init();

function init() {
  els.today.textContent = new Intl.DateTimeFormat("es-AR", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
  bindNavigation();
  bindModals();
  bindSearchAndFilters();
  bindForms();
  renderAll();
}

function bindNavigation() {
  document.querySelectorAll("[data-view]").forEach(button => {
    button.addEventListener("click", () => switchView(button.dataset.view));
  });

  document.querySelectorAll("[data-go-view]").forEach(button => {
    button.addEventListener("click", () => switchView(button.dataset.goView));
  });

  els.mobileMenu.addEventListener("click", () => {
    const isOpen = els.sidebar.classList.toggle("open");
    els.mobileMenu.setAttribute("aria-expanded", String(isOpen));
  });
}

function switchView(view) {
  document.querySelectorAll("[data-view-panel]").forEach(panel => panel.classList.toggle("active", panel.dataset.viewPanel === view));
  document.querySelectorAll("[data-view]").forEach(item => item.classList.toggle("active", item.dataset.view === view));
  els.sidebar.classList.remove("open");
  els.mobileMenu.setAttribute("aria-expanded", "false");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function bindModals() {
  document.querySelector("#open-lead-modal").addEventListener("click", () => openModal("lead-modal"));
  document.querySelector("#open-task-modal").addEventListener("click", () => openModal("task-modal"));
  document.querySelector("#add-task-btn").addEventListener("click", () => openModal("task-modal"));

  document.querySelectorAll("[data-close-modal]").forEach(button => {
    button.addEventListener("click", () => closeModal(button.dataset.closeModal));
  });

  [els.leadModal, els.taskModal].forEach(modal => {
    modal.addEventListener("click", event => {
      if (event.target === modal) closeModal(modal.id);
    });
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeModal("lead-modal");
      closeModal("task-modal");
    }
  });
}

function openModal(id) {
  const modal = document.getElementById(id);
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  const firstInput = modal.querySelector("input, select, button");
  firstInput?.focus();
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (!modal || modal.hidden) return;
  modal.hidden = true;
  document.body.style.overflow = "";
}

function bindSearchAndFilters() {
  els.globalSearch.addEventListener("input", event => {
    currentSearch = event.target.value.trim().toLowerCase();
    renderLeadTable();
  });

  els.stageFilter.addEventListener("change", event => {
    currentStageFilter = event.target.value;
    renderLeadTable();
  });
}

function bindForms() {
  els.leadForm.addEventListener("submit", event => {
    event.preventDefault();
    const data = new FormData(els.leadForm);
    const newLead = {
      id: `L-${Date.now().toString().slice(-5)}`,
      name: data.get("name").trim(),
      company: data.get("company").trim(),
      email: data.get("email").trim(),
      phone: data.get("phone").trim(),
      amount: Number(data.get("amount")) || 0,
      source: data.get("source"),
      stage: data.get("stage"),
      nextAction: data.get("nextAction").trim(),
      dueDate: data.get("dueDate"),
      createdAt: isoDate(new Date())
    };

    leads.unshift(newLead);
    persistLeads();
    els.leadForm.reset();
    closeModal("lead-modal");
    renderAll();
    showToast("Lead agregado correctamente");
  });

  els.taskForm.addEventListener("submit", event => {
    event.preventDefault();
    const data = new FormData(els.taskForm);
    tasks.unshift({
      id: `T-${Date.now().toString().slice(-5)}`,
      title: data.get("title").trim(),
      date: data.get("date"),
      priority: data.get("priority"),
      completed: false
    });
    persistTasks();
    els.taskForm.reset();
    closeModal("task-modal");
    renderAll();
    showToast("Tarea creada");
  });
}

function renderAll() {
  renderKpis();
  renderMiniPipeline();
  renderRecentLeads();
  renderDashboardTasks();
  renderPipeline();
  renderLeadTable();
  renderTaskBoard();
}

function renderKpis() {
  const activeLeads = leads.filter(lead => !["won", "lost"].includes(lead.stage));
  const pipelineValue = activeLeads.reduce((sum, lead) => sum + lead.amount, 0);
  const won = leads.filter(lead => lead.stage === "won");
  const wonValue = won.reduce((sum, lead) => sum + lead.amount, 0);
  const totalClosed = leads.filter(lead => ["won", "lost"].includes(lead.stage)).length;
  const conversion = totalClosed ? Math.round((won.length / totalClosed) * 100) : 0;
  const pendingTasks = tasks.filter(task => !task.completed).length;

  const cards = [
    { label: "Oportunidades activas", value: activeLeads.length, note: "Leads en seguimiento", cls: "info" },
    { label: "Valor del pipeline", value: money(pipelineValue), note: "Monto potencial", cls: "warning" },
    { label: "Ventas ganadas", value: money(wonValue), note: `${conversion}% de conversión cerrada`, cls: "success" },
    { label: "Tareas pendientes", value: pendingTasks, note: "Próximas acciones", cls: "" }
  ];

  els.kpis.innerHTML = cards.map(card => `
    <article class="kpi-card ${card.cls}">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(String(card.value))}</strong>
      <small>${escapeHtml(card.note)}</small>
    </article>
  `).join("");
}

function renderMiniPipeline() {
  els.miniPipeline.innerHTML = STAGES.map(stage => {
    const stageLeads = leads.filter(lead => lead.stage === stage.id);
    const total = stageLeads.reduce((sum, lead) => sum + lead.amount, 0);
    return `
      <div class="mini-stage">
        <div class="mini-stage-head"><span>${escapeHtml(stage.label)}</span><b>${stageLeads.length}</b></div>
        <strong>${money(total)}</strong>
        <small>valor estimado</small>
      </div>
    `;
  }).join("");
}

function renderRecentLeads() {
  const recent = [...leads].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  els.recentLeads.innerHTML = recent.map(lead => leadRow(lead, false)).join("");
}

function renderDashboardTasks() {
  const ordered = [...tasks].sort((a, b) => Number(a.completed) - Number(b.completed) || new Date(a.date) - new Date(b.date)).slice(0, 5);
  els.dashboardTasks.innerHTML = ordered.length ? ordered.map(task => `
    <label class="task-item ${task.completed ? "completed" : ""}">
      <input class="task-check" type="checkbox" ${task.completed ? "checked" : ""} data-task-toggle="${task.id}">
      <span class="task-copy"><strong>${escapeHtml(task.title)}</strong><span>${formatDate(task.date)}</span></span>
      <span class="priority-dot ${task.priority}" title="Prioridad ${task.priority}"></span>
    </label>
  `).join("") : `<div class="empty-state"><strong>Todo al día.</strong><span>No hay tareas pendientes.</span></div>`;

  els.dashboardTasks.querySelectorAll("[data-task-toggle]").forEach(input => {
    input.addEventListener("change", () => toggleTask(input.dataset.taskToggle));
  });
}

function renderPipeline() {
  const activePipelineValue = leads.filter(lead => !["won", "lost"].includes(lead.stage)).reduce((sum, lead) => sum + lead.amount, 0);
  els.pipelineSummary.innerHTML = `<strong>${money(activePipelineValue)}</strong><span>pipeline activo</span>`;

  els.pipelineBoard.innerHTML = STAGES.map(stage => {
    const stageLeads = leads.filter(lead => lead.stage === stage.id);
    const value = stageLeads.reduce((sum, lead) => sum + lead.amount, 0);
    return `
      <section class="pipeline-column" data-stage-drop="${stage.id}">
        <div class="pipeline-column-head"><strong>${escapeHtml(stage.label)}</strong><span>${stageLeads.length}</span></div>
        <div class="pipeline-column-value">${money(value)}</div>
        <div class="pipeline-cards">
          ${stageLeads.map(lead => dealCard(lead)).join("")}
        </div>
      </section>
    `;
  }).join("");

  bindPipelineInteractions();
}

function dealCard(lead) {
  const currentIndex = STAGES.findIndex(stage => stage.id === lead.stage);
  const canAdvance = currentIndex >= 0 && currentIndex < STAGES.length - 1;
  return `
    <article class="deal-card" draggable="true" data-lead-id="${lead.id}">
      <span class="deal-card-company">${escapeHtml(lead.company)}</span>
      <h3>${escapeHtml(lead.name)}</h3>
      <div class="deal-card-email">${escapeHtml(lead.email)}</div>
      <div class="deal-card-footer">
        <strong>${money(lead.amount)}</strong>
        ${canAdvance ? `<button class="advance-btn" type="button" data-advance="${lead.id}" aria-label="Avanzar etapa">→</button>` : ""}
      </div>
    </article>
  `;
}

function bindPipelineInteractions() {
  document.querySelectorAll(".deal-card").forEach(card => {
    card.addEventListener("dragstart", () => {
      draggedLeadId = card.dataset.leadId;
      card.classList.add("dragging");
    });
    card.addEventListener("dragend", () => {
      draggedLeadId = null;
      card.classList.remove("dragging");
      document.querySelectorAll(".pipeline-column").forEach(col => col.classList.remove("drag-over"));
    });
  });

  document.querySelectorAll("[data-stage-drop]").forEach(column => {
    column.addEventListener("dragover", event => {
      event.preventDefault();
      column.classList.add("drag-over");
    });
    column.addEventListener("dragleave", () => column.classList.remove("drag-over"));
    column.addEventListener("drop", event => {
      event.preventDefault();
      column.classList.remove("drag-over");
      if (draggedLeadId) moveLeadToStage(draggedLeadId, column.dataset.stageDrop);
    });
  });

  document.querySelectorAll("[data-advance]").forEach(button => {
    button.addEventListener("click", () => advanceLead(button.dataset.advance));
  });
}

function moveLeadToStage(id, stage) {
  const lead = leads.find(item => item.id === id);
  if (!lead || lead.stage === stage) return;
  lead.stage = stage;
  persistLeads();
  renderAll();
  showToast(`Oportunidad movida a ${stageLabels[stage]}`);
}

function advanceLead(id) {
  const lead = leads.find(item => item.id === id);
  if (!lead) return;
  const index = STAGES.findIndex(stage => stage.id === lead.stage);
  if (index < 0 || index >= STAGES.length - 1) return;
  moveLeadToStage(id, STAGES[index + 1].id);
}

function renderLeadTable() {
  const filtered = leads.filter(lead => {
    const haystack = `${lead.name} ${lead.company} ${lead.email} ${lead.phone}`.toLowerCase();
    const searchMatch = !currentSearch || haystack.includes(currentSearch);
    const stageMatch = currentStageFilter === "all" || lead.stage === currentStageFilter;
    return searchMatch && stageMatch;
  });

  els.allLeads.innerHTML = filtered.map(lead => leadRow(lead, true)).join("");
  els.leadsEmpty.hidden = filtered.length > 0;

  els.allLeads.querySelectorAll("[data-advance-row]").forEach(button => {
    button.addEventListener("click", () => advanceLead(button.dataset.advanceRow));
  });
}

function leadRow(lead, withAction) {
  const initials = lead.name.split(" ").map(part => part[0]).slice(0,2).join("").toUpperCase();
  const currentIndex = STAGES.findIndex(stage => stage.id === lead.stage);
  const canAdvance = currentIndex >= 0 && currentIndex < STAGES.length - 1;
  return `
    <tr>
      <td>
        <div class="contact-cell">
          <span class="contact-avatar">${escapeHtml(initials)}</span>
          <span><strong>${escapeHtml(lead.name)}</strong><span>${escapeHtml(lead.email)}</span></span>
        </div>
      </td>
      <td>${escapeHtml(lead.company)}</td>
      ${withAction ? `<td>${escapeHtml(lead.source)}</td>` : ""}
      <td><span class="stage-badge stage-${lead.stage}">${escapeHtml(stageLabels[lead.stage] || lead.stage)}</span></td>
      <td class="money">${money(lead.amount)}</td>
      <td class="next-step">${escapeHtml(lead.nextAction)} · ${formatDate(lead.dueDate)}</td>
      ${withAction ? `<td>${canAdvance ? `<button class="row-action" type="button" data-advance-row="${lead.id}">Avanzar</button>` : ""}</td>` : ""}
    </tr>
  `;
}

function renderTaskBoard() {
  const now = new Date();
  now.setHours(0,0,0,0);
  const today = isoDate(now);
  const groups = [
    { title: "Hoy / vencidas", key: "today", filter: task => !task.completed && task.date <= today },
    { title: "Próximas", key: "upcoming", filter: task => !task.completed && task.date > today },
    { title: "Completadas", key: "completed", filter: task => task.completed }
  ];

  els.taskBoard.innerHTML = groups.map(group => {
    const groupTasks = tasks.filter(group.filter).sort((a,b) => new Date(a.date) - new Date(b.date));
    return `
      <section class="task-column">
        <div class="task-column-head"><h2>${group.title}</h2><span>${groupTasks.length}</span></div>
        ${groupTasks.length ? groupTasks.map(task => `
          <label class="task-card">
            <input class="task-check" type="checkbox" ${task.completed ? "checked" : ""} data-task-toggle-board="${task.id}">
            <span><strong>${escapeHtml(task.title)}</strong><small>${formatDate(task.date)} · prioridad ${priorityLabel(task.priority)}</small></span>
          </label>
        `).join("") : `<div class="empty-state"><span>Sin tareas en esta sección.</span></div>`}
      </section>
    `;
  }).join("");

  els.taskBoard.querySelectorAll("[data-task-toggle-board]").forEach(input => {
    input.addEventListener("change", () => toggleTask(input.dataset.taskToggleBoard));
  });
}

function toggleTask(id) {
  const task = tasks.find(item => item.id === id);
  if (!task) return;
  task.completed = !task.completed;
  persistTasks();
  renderAll();
}

function persistLeads() {
  localStorage.setItem(STORAGE_KEYS.leads, JSON.stringify(leads));
}

function persistTasks() {
  localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
}

function loadData(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : structuredClone(fallback);
  } catch {
    return structuredClone(fallback);
  }
}

function money(value) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value || 0);
}

function formatDate(value) {
  if (!value) return "Sin fecha";
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short" }).format(new Date(year, month - 1, day));
}

function offsetDate(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return isoDate(date);
}

function isoDate(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function priorityLabel(priority) {
  return ({ high: "alta", medium: "media", low: "baja" })[priority] || priority;
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => els.toast.classList.remove("show"), 2200);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}