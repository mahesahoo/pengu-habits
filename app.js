/* ============ Pengu — soft habit buddy ============ */
"use strict";

const STORAGE_KEY = "pengu-habits-v1";

const THEMES = [
  { id: "blush", label: "blush", bg: "linear-gradient(135deg,#ffb7c5,#ffd6e8)" },
  { id: "lavender", label: "lavender", bg: "linear-gradient(135deg,#c9b6f0,#e7dcf8)" },
  { id: "peach", label: "peach", bg: "linear-gradient(135deg,#ffc9b9,#ffe0cc)" },
  { id: "mint", label: "mint", bg: "linear-gradient(135deg,#b8e0d2,#d9efe6)" },
];

const EMOJIS = ["🎀","💖","🌸","🍓","🥛","☁️","🧸","🧴","📖","🎧","🌙","💧","🥗","🧘‍♀️","🏃‍♀️","✨","🍒","🫧","💅","🎨","☀️","🪴","🐧","🍵"];

const COLORS = ["#FFB7C5","#C9B6F0","#FFD6A5","#B8E0D2","#B8D8F0","#FFE5A3","#F8C8DC","#E0BBE4"];

const ENCOURAGE = [
  "one tiny thing at a time 🌷",
  "you're doing amazing, sweetie ✨",
  "small steps, soft heart 💗",
  "don't forget to be kind to yourself 🎀",
  "every check is a little win 🌸",
  "glow at your own pace ☁️",
];

const DONE_MSGS = [
  "all done! you're glowing 🌟",
  "perfect day, angel 💖",
  "everything checked off — proud of you 🎀",
  "you did it all, sweetheart ✨",
];

let state = load();
let editingId = null;
let pickEmoji = EMOJIS[0];
let pickColor = COLORS[0];
let notifiedToday = new Set();

/* ---------- data ---------- */
function defaultState() {
  return { version: 1, name: "", theme: "blush", habits: [] };
}
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return Object.assign(defaultState(), parsed);
    }
  } catch (e) { /* ignore */ }
  return defaultState();
}
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
function dateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function todayKey() { return dateKey(new Date()); }

function computeStreak(completions) {
  let streak = 0;
  const d = new Date();
  if (!completions[todayKey()]) d.setDate(d.getDate() - 1); // streak still alive if not yet done today
  while (completions[dateKey(d)]) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

/* ---------- helpers ---------- */
function $(sel) { return document.querySelector(sel); }
function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}
function toast(msg, ms = 2400) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.remove("hidden");
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.add("hidden"), ms);
}

function celebrate(msgs) {
  confetti();
  const mascot = $("#mascot");
  mascot.classList.remove("happy");
  void mascot.offsetWidth;
  mascot.classList.add("happy");
  if (msgs && msgs.length) toast(msgs[Math.floor(Math.random() * msgs.length)]);
}

function confetti() {
  const box = $("#confetti");
  const colors = ["#ffb7c5","#c9b6f0","#ffd6a5","#b8e0d2","#ffe5a3","#f8c8dc","#e0bbe4","#ffd700"];
  const shapes = ["●","♥","✦","■","●","♥","✦"];
  for (let i = 0; i < 40; i++) {
    const p = document.createElement("div");
    p.className = "confetti-piece";
    p.textContent = shapes[i % shapes.length];
    p.style.left = Math.random() * 100 + "%";
    p.style.color = colors[i % colors.length];
    p.style.fontSize = (8 + Math.random() * 10) + "px";
    p.style.animationDuration = (2 + Math.random() * 2) + "s";
    p.style.animationDelay = (Math.random() * 0.4) + "s";
    box.appendChild(p);
    setTimeout(() => p.remove(), 4500);
  }
}

function spawnSparkles() {
  const box = $("#sparkles");
  const glyphs = ["✦","✧","⋆","☁︎","✿","♡"];
  for (let i = 0; i < 16; i++) {
    const s = document.createElement("span");
    s.textContent = glyphs[i % glyphs.length];
    s.style.left = Math.random() * 100 + "%";
    s.style.top = Math.random() * 100 + "%";
    s.style.animationDelay = (Math.random() * 6) + "s";
    s.style.fontSize = (10 + Math.random() * 10) + "px";
    box.appendChild(s);
  }
}

/* ---------- theme & greeting ---------- */
function applyTheme(id) {
  state.theme = id;
  document.body.dataset.theme = id;
  $("#theme-color").setAttribute("content", id === "lavender" ? "#efe8ff" : id === "peach" ? "#ffede2" : id === "mint" ? "#e7f7ef" : "#ffd6e8");
  renderThemePickers();
}

function renderThemePickers() {
  document.querySelectorAll("[data-theme-picker]").forEach((grid) => {
    grid.innerHTML = "";
    THEMES.forEach((th) => {
      const o = el(`<div class="theme-opt ${th.id === state.theme ? "active" : ""}" data-id="${th.id}" style="--t-bg:${th.bg}" title="${th.label}"></div>`);
      o.addEventListener("click", () => { applyTheme(th.id); save(); renderAll(); });
      grid.appendChild(o);
    });
  });
}

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "up late, cutie 🌙";
  if (h < 12) return "good morning ☀️";
  if (h < 17) return "good afternoon 🌷";
  if (h < 21) return "good evening 🌆";
  return "wind down, sweet 🌙";
}

/* ---------- rendering ---------- */
function renderAll() {
  renderGreeting();
  renderProgress();
  renderHabits();
  renderMonth();
  renderWeek();
  renderStats();
  renderSettings();
}

function renderGreeting() {
  const name = state.name ? `, ${state.name}` : "";
  $("#greeting").textContent = greeting() + name;
  const now = new Date();
  const opts = { weekday: "long", month: "long", day: "numeric" };
  $("#date-line").textContent = now.toLocaleDateString(undefined, opts) + " ✨";
}

function renderProgress() {
  const total = state.habits.length;
  const done = state.habits.filter((h) => h.completions[todayKey()]).length;
  const frac = total ? done / total : 0;

  $("#ring-num").textContent = `${done}/${total}`;
  const c = 2 * Math.PI * 52;
  const fg = $("#ring-fg");
  fg.style.strokeDasharray = c;
  fg.style.strokeDashoffset = c * (1 - frac);

  if (total === 0) {
    $("#progress-msg").textContent = "let's add your first habit 🎀";
    $("#progress-sub").textContent = "tap the + button below";
  } else if (done === total) {
    $("#progress-msg").textContent = DONE_MSGS[Math.floor(Math.random() * DONE_MSGS.length)];
    $("#progress-sub").textContent = "every single one. so proud 💗";
  } else if (done === 0) {
    $("#progress-msg").textContent = ENCOURAGE[Math.floor(Math.random() * ENCOURAGE.length)];
    $("#progress-sub").textContent = `${total - done} little thing${total - done === 1 ? "" : "s"} left today`;
  } else {
    $("#progress-msg").textContent = ENCOURAGE[Math.floor(Math.random() * ENCOURAGE.length)];
    $("#progress-sub").textContent = `${done} done, ${total - done} to go — you've got this`;
  }
}

function renderHabits() {
  const list = $("#habit-list");
  const empty = $("#empty-state");
  list.innerHTML = "";

  const today = todayKey();
  const habits = state.habits.slice();

  if (habits.length === 0) {
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");

  habits.forEach((h, i) => {
    const done = !!h.completions[today];
    const streak = computeStreak(h.completions);
    const remind = h.reminder && !done && isPastReminder(h.reminder);

    const item = el(`
      <div class="habit ${done ? "done" : ""}" style="animation-delay:${i * 40}ms" data-id="${h.id}">
        <div class="habit-emoji" style="background:${h.color}33">${h.emoji}</div>
        <div class="habit-body">
          <div class="habit-name">${escapeHtml(h.name)}</div>
          <div class="habit-meta">
            ${streak > 0 ? `<span class="streak-badge">🔥 ${streak}</span>` : ""}
            ${remind ? `<span class="nudge">🌸 don't forget</span>` : ""}
          </div>
        </div>
        <div class="check">✓</div>
      </div>
    `);

    item.addEventListener("click", () => {
      toggleHabit(h.id);
    });
    item.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      openModal(h);
    });
    // long-press to edit
    let pressTimer = null;
    item.addEventListener("touchstart", () => {
      pressTimer = setTimeout(() => openModal(h), 500);
    });
    ["touchend", "touchmove", "touchcancel"].forEach((ev) =>
      item.addEventListener(ev, () => clearTimeout(pressTimer))
    );

    list.appendChild(item);
  });
}

function renderMonth() {
  const grid = $("#month-grid");
  grid.innerHTML = "";
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay();
  const today = todayKey();

  const dows = ["S","M","T","W","T","F","S"];
  dows.forEach((d) => grid.appendChild(el(`<div class="day-cell dow">${d}</div>`)));

  for (let i = 0; i < firstDow; i++) grid.appendChild(el(`<div class="day-cell"></div>`));

  for (let day = 1; day <= daysInMonth; day++) {
    const key = dateKey(new Date(year, month, day));
    const total = state.habits.length;
    const done = total ? state.habits.filter((h) => h.completions[key]).length : 0;
    let cls = "day-cell";
    if (key > today) cls += " future";
    else if (done > 0 && total > 0) cls += done >= total ? " lvl3" : " lvl1";
    if (key === today) cls += " today";
    const cell = el(`<div class="${cls}">${day}</div>`);
    if (key === today) cell.style.boxShadow = "0 0 0 2px var(--accent)";
    grid.appendChild(cell);
  }
}

function renderWeek() {
  const strip = $("#week-strip");
  strip.innerHTML = "";
  const keys = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    keys.push(dateKey(d));
  }
  state.habits.forEach((h) => {
    const dots = keys.map((k) => `<i class="${h.completions[k] ? "on" : ""}"></i>`).join("");
    strip.appendChild(el(`
      <div class="week-row">
        <span class="wr-emoji">${h.emoji}</span>
        <span class="wr-name">${escapeHtml(h.name)}</span>
        <span class="wr-dots">${dots}</span>
      </div>
    `));
  });
  if (state.habits.length === 0) {
    strip.innerHTML = `<p class="empty" style="padding:12px">add a habit to see your week 🌸</p>`;
  }
}

function renderStats() {
  const grid = $("#stats-grid");
  const habits = state.habits.length;
  const totalChecks = state.habits.reduce((sum, h) => sum + Object.keys(h.completions).length, 0);
  const bestStreak = state.habits.reduce((max, h) => Math.max(max, computeStreak(h.completions)), 0);

  // perfect days in the last 30 days
  let perfect = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const k = dateKey(d);
    if (habits > 0 && state.habits.every((h) => h.completions[k])) perfect++;
  }

  grid.innerHTML = `
    <div class="stat-card"><div class="stat-emoji">🎀</div><div class="stat-num">${habits}</div><div class="stat-label">habits</div></div>
    <div class="stat-card"><div class="stat-emoji">🔥</div><div class="stat-num">${bestStreak}</div><div class="stat-label">best streak</div></div>
    <div class="stat-card"><div class="stat-emoji">✨</div><div class="stat-num">${totalChecks}</div><div class="stat-label">total check-ins</div></div>
    <div class="stat-card"><div class="stat-emoji">🌷</div><div class="stat-num">${perfect}</div><div class="stat-label">perfect days (30d)</div></div>
  `;
}

function renderSettings() {
  $("#set-name").value = state.name;
}

/* ---------- habits CRUD ---------- */
function toggleHabit(id) {
  const h = state.habits.find((x) => x.id === id);
  if (!h) return;
  const today = todayKey();
  const wasDone = !!h.completions[today];
  if (wasDone) {
    delete h.completions[today];
  } else {
    h.completions[today] = true;
    const streak = computeStreak(h.completions);
    if ([7, 30, 100, 365].includes(streak)) {
      celebrate([`${streak} day streak!! you're a star 🌟`]);
    } else {
      toast(`${h.emoji} ${escapeHtml(h.name)} — nice! 💗`, 1500);
    }
    // check if this completes the day
    const total = state.habits.length;
    const done = state.habits.filter((x) => x.completions[today]).length;
    if (total > 0 && done === total) {
      setTimeout(() => celebrate(DONE_MSGS), 350);
    }
  }
  save();
  renderAll();
}

function openModal(habit) {
  editingId = habit ? habit.id : null;
  pickEmoji = habit ? habit.emoji : EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
  pickColor = habit ? habit.color : COLORS[0];

  $("#modal-title").textContent = habit ? "edit habit" : "new habit";
  $("#habit-name").value = habit ? habit.name : "";
  $("#habit-reminder").value = habit ? (habit.reminder || "") : "";
  $("#modal-delete").hidden = !habit;
  renderEmojiPicker();
  renderColorPicker();
  $("#modal").classList.remove("hidden");
  setTimeout(() => $("#habit-name").focus(), 50);
}

function closeModal() {
  $("#modal").classList.add("hidden");
  editingId = null;
}

function saveHabit() {
  const name = $("#habit-name").value.trim();
  if (!name) { toast("give it a little name first 🎀"); return; }
  const reminder = $("#habit-reminder").value || "";

  if (editingId) {
    const h = state.habits.find((x) => x.id === editingId);
    if (h) Object.assign(h, { name, emoji: pickEmoji, color: pickColor, reminder });
    toast("updated 💖");
  } else {
    state.habits.push({
      id: uid(),
      name,
      emoji: pickEmoji,
      color: pickColor,
      reminder,
      createdAt: Date.now(),
      completions: {},
    });
    toast(`${pickEmoji} added! you've got this ✨`);
  }
  save();
  closeModal();
  renderAll();
}

function deleteHabit() {
  if (!editingId) return;
  state.habits = state.habits.filter((x) => x.id !== editingId);
  save();
  closeModal();
  renderAll();
  toast("removed 🌱");
}

function renderEmojiPicker() {
  const grid = $("#emoji-grid");
  grid.innerHTML = "";
  EMOJIS.forEach((e) => {
    const o = el(`<button type="button" class="emoji-opt ${e === pickEmoji ? "active" : ""}">${e}</button>`);
    o.addEventListener("click", () => { pickEmoji = e; renderEmojiPicker(); });
    grid.appendChild(o);
  });
}
function renderColorPicker() {
  const grid = $("#color-grid");
  grid.innerHTML = "";
  COLORS.forEach((c) => {
    const o = el(`<button type="button" class="color-opt ${c === pickColor ? "active" : ""}" style="background:${c}"></button>`);
    o.addEventListener("click", () => { pickColor = c; renderColorPicker(); });
    grid.appendChild(o);
  });
}

/* ---------- reminders ---------- */
function isPastReminder(t) {
  if (!t) return false;
  const now = new Date();
  const [hh, mm] = t.split(":").map(Number);
  return (now.getHours() > hh) || (now.getHours() === hh && now.getMinutes() >= mm);
}
function checkReminders() {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const today = todayKey();
  state.habits.forEach((h) => {
    if (!h.reminder) return;
    const now = new Date();
    const [hh, mm] = h.reminder.split(":").map(Number);
    if (now.getHours() === hh && now.getMinutes() === mm) {
      const key = `${today}:${h.id}`;
      if (h.completions[today] || notifiedToday.has(key)) return;
      notifiedToday.add(key);
      try {
        new Notification(`${h.emoji} time for "${h.name}"`, {
          body: "a tiny nudge from Pengu 🐧✨",
        });
      } catch (e) { /* ignore */ }
    }
  });
}

/* ---------- export / import / reset ---------- */
function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "pengu-backup.json";
  a.click();
  URL.revokeObjectURL(a.href);
  toast("saved your data 💾");
}
function importData(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!parsed || !Array.isArray(parsed.habits)) throw new Error("bad");
      state = Object.assign(defaultState(), parsed);
      save();
      applyTheme(state.theme);
      renderAll();
      toast("restored! welcome back 💗");
    } catch (e) {
      toast("hmm, that file didn't look right 🌧️");
    }
  };
  reader.readAsText(file);
}
function resetAll() {
  if (!confirm("start over? this clears everything 🌱")) return;
  state = defaultState();
  save();
  location.reload();
}

/* ---------- tabs ---------- */
function showTab(name) {
  ["tab-week", "tab-stats", "tab-settings"].forEach((id) => {
    $(`#${id}`).classList.add("hidden");
  });
  $("#habit-list").classList.remove("hidden");
  $("#empty-state").classList.add("hidden");
  $(".habits-section").classList.remove("hidden");
  $(".progress-card").classList.remove("hidden");

  if (name !== "today") {
    $(".habits-section").classList.add("hidden");
    $(".progress-card").classList.add("hidden");
    if (name === "week") $("#tab-week").classList.remove("hidden");
    if (name === "stats") $("#tab-stats").classList.remove("hidden");
    if (name === "settings") $("#tab-settings").classList.remove("hidden");
  }
  document.querySelectorAll(".tab").forEach((t) => {
    t.classList.toggle("active", t.dataset.tab === name);
  });
}

/* ---------- util ---------- */
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

/* ---------- boot ---------- */
function boot() {
  spawnSparkles();

  // reveal the app once fonts are ready (avoids the font-swap flash)
  function reveal() { document.body.classList.add("fonts-ready"); }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(reveal).catch(reveal);
  } else {
    reveal();
  }
  setTimeout(reveal, 600); // safety net so it never stays blank

  // service worker (offline + installable)
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }

  // theme picker containers
  $("#ob-themes").setAttribute("data-theme-picker", "");
  $("#set-themes").setAttribute("data-theme-picker", "");

  applyTheme(state.theme);

  // onboarding vs app
  if (!state.name) {
    $("#onboarding").classList.remove("hidden");
    $("#app").classList.add("hidden");
    $("#ob-start").addEventListener("click", () => {
      const name = $("#ob-name").value.trim();
      if (!name) { toast("tell me your name cutie 🎀"); return; }
      state.name = name;
      save();
      $("#onboarding").classList.add("hidden");
      $("#app").classList.remove("hidden");
      renderAll();
      setTimeout(() => toast(`hi ${name}! i'm so happy you're here 💗`), 300);
    });
    $("#ob-name").addEventListener("keydown", (e) => {
      if (e.key === "Enter") $("#ob-start").click();
    });
  } else {
    $("#onboarding").classList.add("hidden");
    $("#app").classList.remove("hidden");
    renderAll();
  }

  // header settings button -> settings tab
  $("#btn-settings").addEventListener("click", () => showTab("settings"));

  // tab bar
  document.querySelectorAll(".tab").forEach((t) => {
    t.addEventListener("click", () => showTab(t.dataset.tab));
  });

  // add button
  $("#btn-add").addEventListener("click", () => openModal(null));

  // modal
  $("#modal-cancel").addEventListener("click", closeModal);
  $("#modal-delete").addEventListener("click", deleteHabit);
  $("#modal-save").addEventListener("click", saveHabit);
  $("#modal").addEventListener("click", (e) => {
    if (e.target === $("#modal")) closeModal();
  });

  // settings
  $("#set-name").addEventListener("change", (e) => {
    state.name = e.target.value.trim() || state.name;
    save(); renderAll();
  });

  // export / import / reset
  $("#btn-export").addEventListener("click", exportData);
  $("#btn-import").addEventListener("click", () => $("#import-file").click());
  $("#import-file").addEventListener("change", (e) => {
    if (e.target.files[0]) importData(e.target.files[0]);
    e.target.value = "";
  });
  $("#btn-reset").addEventListener("click", resetAll);

  // notification permission (gentle)
  if ("Notification" in window && Notification.permission === "default") {
    // only ask after a real interaction to be polite
    document.addEventListener("click", function once() {
      Notification.requestPermission();
      document.removeEventListener("click", once);
    }, { once: true });
  }

  // reminder polling
  checkReminders();
  setInterval(() => {
    checkReminders();
    renderHabits(); // refresh "don't forget" nudges
  }, 60000);
}

document.addEventListener("DOMContentLoaded", boot);
