const ROOMS = {
  tao: {
    name: "TAO",
    subtitle: "Sala 1",
    tasks: [
      "Sala GM: Revisar estado atrezzo",
      "Estantería maniquí: Revisar estado general / polvo",
      "Maderas paredes y puerta",
      "YingYang: Estado general y necesidad de pintura",
      "Cama elástica: Revisar muelles, estructura y parte inferior",
      "Interruptores del túnel del Yokai",
      "Tapa primera katana: comprobar barniz",
      "Pétalos",
      "Piedras área música bambú",
      "Agua pecera",
      "Colores pulsera de pecera",
      "Debajo de la cama elástica: ventiladores y suelo limpios",
      "Palos espuma",
      "Manos"
    ]
  },
  roomions: {
    name: "ROOMIONS",
    subtitle: "Sala 2",
    tasks: [
      "Bombillas",
      "Plátanos",
      "Cajas de almacenaje del puzzle",
      "Alas",
      "Imanes",
      "Tiras LED",
      "Mancha",
      "Endoscopio",
      "Muñecos Minions",
      "Guantes de látex"
    ]
  },
  velatoria: {
    name: "VELATORIA",
    subtitle: "Sala 3",
    tasks: [
      "Velas",
      "Revisar ataúd",
      "Stock de huesitos",
      "Estado de disfraces",
      "Máquina de humo"
    ]
  }
};

const STATUS = {
  ok: { label: "Correcto", mark: "VERDE" },
  bad: { label: "Incidencia", mark: "ROJO" },
  na: { label: "No revisado", mark: "GRIS" }
};

const REVIEW_TYPES = {
  daily: "Revisión diaria",
  weekly: "Revisión semanal",
  fault: "Avería detectada"
};

const STORAGE_KEY = "escape-room-maintenance-v3";
const OLD_STORAGE_KEY = "escape-room-maintenance-v1";
const BOSS_PIN = "1234";

const today = new Date().toISOString().slice(0, 10);
let activeRoom = "tao";
let state = loadState();

const checklist = document.querySelector("#checklist");
const roomTitle = document.querySelector("#roomTitle");
const roomProgress = document.querySelector("#roomProgress");
const reviewDate = document.querySelector("#reviewDate");
const reviewType = document.querySelector("#reviewType");
const reviewerName = document.querySelector("#reviewerName");
const roomNotes = document.querySelector("#roomNotes");
const toast = document.querySelector("#toast");
const exportDialog = document.querySelector("#exportDialog");
const exportText = document.querySelector("#exportText");
const bossDialog = document.querySelector("#bossDialog");
const bossLogin = document.querySelector("#bossLogin");
const bossSummary = document.querySelector("#bossSummary");
const bossPassword = document.querySelector("#bossPassword");
const globalProgress = document.querySelector("#globalProgress");
const globalIssues = document.querySelector("#globalIssues");
const globalReviewed = document.querySelector("#globalReviewed");

function defaultState() {
  return {
    reviewDate: today,
    reviewType: "daily",
    reviewerName: "",
    history: [],
    rooms: Object.fromEntries(
      Object.entries(ROOMS).map(([roomId, room]) => [
        roomId,
        {
          lastReview: "",
          notes: "",
          items: room.tasks.map((text) => ({ text, status: "na", note: "", photoName: "" }))
        }
      ])
    )
  };
}

function normalizeState(saved) {
  const fallback = defaultState();
  if (!saved) return fallback;

  const next = {
    ...fallback,
    ...saved,
    reviewType: saved.reviewType || "daily",
    history: Array.isArray(saved.history) ? saved.history : []
  };

  next.rooms = Object.fromEntries(
    Object.entries(ROOMS).map(([roomId, room]) => {
      const savedRoom = saved.rooms?.[roomId] || {};
      const savedItems = Array.isArray(savedRoom.items) ? savedRoom.items : [];
      return [
        roomId,
        {
          lastReview: savedRoom.lastReview || "",
          notes: savedRoom.notes || "",
          items: room.tasks.map((text, index) => {
            const item = savedItems[index] || {};
            return {
              text,
              status: item.status || "na",
              note: item.note || "",
              photoName: item.photoName || ""
            };
          })
        }
      ];
    })
  );

  return next;
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || localStorage.getItem(OLD_STORAGE_KEY));
    return normalizeState(saved);
  } catch {
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 1800);
}

function escapeAttribute(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;");
}

function countRoom(roomId) {
  const items = state.rooms[roomId].items;
  const ok = items.filter((item) => item.status === "ok").length;
  const bad = items.filter((item) => item.status === "bad").length;
  const gray = items.filter((item) => item.status === "na").length;
  const completed = ok + bad;
  const percent = Math.round((completed / items.length) * 100);
  const health = bad > 0 ? "Rojo" : gray > 0 ? "Amarillo" : "Verde";
  return { total: items.length, ok, bad, gray, completed, percent, health };
}

function countGlobal() {
  const counts = Object.keys(ROOMS).map(countRoom);
  const total = counts.reduce((sum, room) => sum + room.total, 0);
  const completed = counts.reduce((sum, room) => sum + room.completed, 0);
  const bad = counts.reduce((sum, room) => sum + room.bad, 0);
  return { total, completed, bad, percent: Math.round((completed / total) * 100) };
}

function updateStats() {
  const global = countGlobal();
  globalProgress.textContent = `${global.percent}%`;
  globalIssues.textContent = global.bad;
  globalReviewed.textContent = `${global.completed}/${global.total}`;

  const room = countRoom(activeRoom);
  roomProgress.textContent = `${room.completed}/${room.total}`;
}

function renderTabs() {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.room === activeRoom);
  });
}

function renderChecklist() {
  const room = ROOMS[activeRoom];
  const roomState = state.rooms[activeRoom];
  roomTitle.textContent = `${room.name} · ${room.subtitle}`;
  roomNotes.value = roomState.notes;
  checklist.innerHTML = "";

  room.tasks.forEach((title, index) => {
    const item = roomState.items[index];
    const article = document.createElement("article");
    article.className = "check-item";
    article.innerHTML = `
      <div class="check-top">
        <div>
          <p class="check-title">${title}</p>
          <p class="check-meta">${STATUS[item.status].label}</p>
        </div>
        <div class="status-group" role="group" aria-label="${title}">
          ${Object.keys(STATUS)
            .map(
              (status) => `
                <button
                  class="status-btn status-${status} ${item.status === status ? "is-selected" : ""}"
                  type="button"
                  data-index="${index}"
                  data-status="${status}"
                  aria-label="${STATUS[status].label}"
                  title="${STATUS[status].label}"
                ></button>`
            )
            .join("")}
        </div>
      </div>
      <input class="item-note" data-note-index="${index}" type="text" value="${escapeAttribute(item.note)}" placeholder="Comentario opcional" />
      <label class="photo-picker">
        <span>${item.photoName ? escapeAttribute(item.photoName) : "Adjuntar foto"}</span>
        <input data-photo-index="${index}" type="file" accept="image/*" />
      </label>
    `;
    checklist.append(article);
  });

  updateStats();
}

function switchRoom(roomId) {
  activeRoom = roomId;
  renderTabs();
  renderChecklist();
}

function buildExportText() {
  const lines = [
    "CHECKLIST MANTENIMIENTO ESCAPE ROOMS",
    "=====================================",
    `Fecha: ${state.reviewDate || "Sin fecha"}`,
    `Tipo: ${REVIEW_TYPES[state.reviewType] || "Sin tipo"}`,
    `GM: ${state.reviewerName || "Sin indicar"}`,
    ""
  ];

  Object.entries(ROOMS).forEach(([roomId, room]) => {
    const roomState = state.rooms[roomId];
    const counts = countRoom(roomId);
    lines.push(`${room.subtitle} - ${room.name}`);
    lines.push(`Estado general: ${counts.health}`);
    lines.push(`Completado: ${counts.percent}% | Incidencias: ${counts.bad}`);
    lines.push("-------------------------------------");
    roomState.items.forEach((item) => {
      lines.push(`[${STATUS[item.status].mark}] ${item.text}`);
      if (item.note) lines.push(`  Nota: ${item.note}`);
      if (item.photoName) lines.push(`  Foto adjunta: ${item.photoName}`);
    });
    if (roomState.notes) lines.push(`Notas sala: ${roomState.notes}`);
    lines.push("");
  });

  return lines.join("\n").trim();
}

function openExport() {
  exportText.value = buildExportText();
  exportDialog.showModal();
}

async function copyExport() {
  await navigator.clipboard.writeText(exportText.value);
  showToast("Checklist copiado");
}

async function shareExport() {
  const text = exportText.value;
  if (navigator.share) {
    await navigator.share({ title: "Checklist escape rooms", text });
    return;
  }
  await navigator.clipboard.writeText(text);
  showToast("No se puede enviar aquí. Lo he copiado.");
}

function saveReview() {
  const snapshot = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    date: state.reviewDate,
    type: REVIEW_TYPES[state.reviewType],
    reviewerName: state.reviewerName || "Sin GM asignado",
    createdAt: new Date().toLocaleString("es-ES"),
    global: countGlobal()
  };
  state.history = [snapshot, ...state.history].slice(0, 10);
  Object.keys(ROOMS).forEach((roomId) => {
    state.rooms[roomId].lastReview = state.reviewDate;
  });
  saveState();
  showToast("Revisión guardada");
}

function renderBossSummary() {
  const roomRows = Object.entries(ROOMS)
    .map(([roomId, room]) => {
      const counts = countRoom(roomId);
      const warning = counts.bad ? `${counts.bad} en rojo` : "Sin rojos";
      return `
        <div class="summary-row">
          <div>
            <strong>${room.name}</strong>
            <span>${counts.completed}/${counts.total} marcado · ${warning} · Estado ${counts.health}</span>
          </div>
          <span>${counts.percent}%</span>
        </div>
      `;
    })
    .join("");

  const historyRows = state.history.length
    ? state.history
        .map(
          (entry) => `
            <div class="summary-row">
              <div>
                <strong>${entry.date}</strong>
                <span>${entry.type} · ${entry.reviewerName} · ${entry.createdAt}</span>
              </div>
              <span>${entry.global.percent}%</span>
            </div>
          `
        )
        .join("")
    : `<p class="empty-state">Todavía no hay revisiones guardadas.</p>`;

  bossSummary.innerHTML = `
    <p class="summary-title">Estado actual</p>
    ${roomRows}
    <p class="summary-title">Historial reciente</p>
    ${historyRows}
  `;
}

function openBossDialog() {
  bossPassword.value = "";
  bossLogin.hidden = false;
  bossSummary.hidden = true;
  bossDialog.showModal();
  bossPassword.focus();
}

function bossLoginAttempt() {
  if (bossPassword.value !== BOSS_PIN) {
    showToast("Clave incorrecta");
    return;
  }
  renderBossSummary();
  bossLogin.hidden = true;
  bossSummary.hidden = false;
}

function resetActiveRoom() {
  const accepted = confirm(`¿Limpiar todos los datos de ${ROOMS[activeRoom].name}?`);
  if (!accepted) return;
  state.rooms[activeRoom] = defaultState().rooms[activeRoom];
  saveState();
  renderChecklist();
  showToast("Sala limpiada");
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => switchRoom(tab.dataset.room));
});

checklist.addEventListener("click", (event) => {
  const button = event.target.closest("[data-status]");
  if (!button) return;
  const item = state.rooms[activeRoom].items[Number(button.dataset.index)];
  item.status = button.dataset.status;
  state.rooms[activeRoom].lastReview = state.reviewDate;
  saveState();
  renderChecklist();
});

checklist.addEventListener("input", (event) => {
  const input = event.target.closest("[data-note-index]");
  if (!input) return;
  state.rooms[activeRoom].items[Number(input.dataset.noteIndex)].note = input.value;
  saveState();
});

checklist.addEventListener("change", (event) => {
  const input = event.target.closest("[data-photo-index]");
  if (!input) return;
  const file = input.files?.[0];
  state.rooms[activeRoom].items[Number(input.dataset.photoIndex)].photoName = file ? file.name : "";
  saveState();
  renderChecklist();
});

reviewDate.addEventListener("input", () => {
  state.reviewDate = reviewDate.value;
  saveState();
});

reviewType.addEventListener("change", () => {
  state.reviewType = reviewType.value;
  saveState();
});

reviewerName.addEventListener("input", () => {
  state.reviewerName = reviewerName.value;
  saveState();
});

roomNotes.addEventListener("input", () => {
  state.rooms[activeRoom].notes = roomNotes.value;
  saveState();
});

document.querySelector("#resetRoomBtn").addEventListener("click", resetActiveRoom);
document.querySelector("#saveReviewBtn").addEventListener("click", saveReview);
document.querySelector("#exportBtn").addEventListener("click", openExport);
document.querySelector("#copyExportBtn").addEventListener("click", copyExport);
document.querySelector("#shareExportBtn").addEventListener("click", shareExport);
document.querySelector("#bossModeBtn").addEventListener("click", openBossDialog);
document.querySelector("#bossLoginBtn").addEventListener("click", bossLoginAttempt);
bossPassword.addEventListener("keydown", (event) => {
  if (event.key === "Enter") bossLoginAttempt();
});

reviewDate.value = state.reviewDate;
reviewType.value = state.reviewType;
reviewerName.value = state.reviewerName;
renderTabs();
renderChecklist();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // La app sigue funcionando si el navegador no permite registrar el service worker.
    });
  });
}
