"use strict";

/* =========================================================
   EDIT ME: everything she reads lives here
   ========================================================= */
const CONFIG = {
  sealInitial: "L",                                 // your initial on the wax seal
  signature: "Loki",
  eventDate: "2026-10-10T20:00:00+02:00",           // drives the countdown
  dateLabel: "Saturday, the tenth of October",

  // Venues stay secret: only times and cryptic hints
  programme: [
    { time: "Eight o'clock",      act: "Act I",     title: "Supper",     hint: "Where the river keeps an old secret." },
    { time: "A quarter to ten",   act: "Interlude", title: "A Walk",     hint: "Old stones, city lights." },
    { time: "A quarter past ten", act: "Act II",    title: "A Drink",    hint: "Behind a door with no name." },
    { time: "Half past eleven",   act: "Act III",   title: "The Finale", hint: "Where the night keeps its music." },
  ],

  dressCode: "Elegant. Something you would wear to a gallery opening.",

  // Optional: get an email when she accepts (same EmailJS setup as the dinner site)
  emailjs: {
    enabled: true,
    publicKey: "P0N1mVYMaYicQ25OA",
    serviceId: "service_b73vtwk",
    templateId: "contact",
  },
};

/* =========================================================
   Elements & data
   ========================================================= */
const $ = (id) => document.getElementById(id);

const stage = $("stage");
const bookcase = $("bookcase");
const shelvesEl = $("shelves");
const room = $("room");
const card = $("card");
const intro = $("intro");
const whisperEl = $("whisper");
const acceptBtn = $("acceptBtn");
const seal = $("seal");

const PALETTE = [
  "#5a1f24", "#3d1416", "#1f3a2e", "#163028", "#1d2a44",
  "#14203a", "#6b4a2b", "#4a3220", "#2b2420", "#5c4630", "#7a5a36",
];

const TITLES = [
  "Letters", "Atlas", "Odes", "Sonnets", "Voyages", "Memoirs", "Essays",
  "Histories", "Fables", "Tides", "Vol. II", "Vol. III", "Maps", "Verse",
  "Gardens", "Chronicle", "Studies", "Etudes",
];

const WRONG_LINES = [
  "Not this one.",
  "A fine read. Not tonight.",
  "Close, but no.",
  "That one is about tax law.",
  "Keep looking.",
  "Warmer... no, colder.",
  "Wrong shelf, perhaps.",
];

let opened = false;
let wrongClicks = 0;
let whisperTimer = null;

const rand = (min, max) => Math.random() * (max - min) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/* =========================================================
   Build the bookcase
   ========================================================= */
function buildShelves() {
  shelvesEl.innerHTML = "";

  const small = window.innerWidth < 600;
  const targetShelfH = small ? 104 : 132;
  const totalH = shelvesEl.clientHeight;
  const rows = Math.max(3, Math.round(totalH / targetShelfH));
  const shelfH = totalH / rows;

  const LEDGE = 14;
  const headroom = small ? 14 : 18;
  const usableH = shelfH - LEDGE - headroom;
  const chosenRow = Math.floor(rows / 2);

  for (let r = 0; r < rows; r++) {
    const shelf = document.createElement("div");
    shelf.className = "shelf";
    shelf.style.height = `${shelfH}px`;
    shelvesEl.appendChild(shelf);

    const isChosenRow = r === chosenRow;
    const reserve = isChosenRow ? 40 : 0;            // room for the wider book
    const innerW = shelf.clientWidth - 20 - 6 - reserve;

    const widths = [];
    let used = 0;
    while (true) {
      const w = Math.round(small ? rand(13, 24) : rand(16, 32));
      if (used + w + 1 > innerW) break;
      widths.push(w);
      used += w + 1;
    }

    const chosenIndex = isChosenRow ? Math.floor(widths.length * rand(0.35, 0.65)) : -1;

    widths.forEach((w, i) => {
      const isChosen = i === chosenIndex;
      const width = isChosen ? Math.max(w, small ? 26 : 36) : w;
      shelf.appendChild(makeBook(width, usableH, isChosen));
    });
  }
}

function makeBook(width, usableH, isChosen) {
  const book = document.createElement("button");
  book.type = "button";
  book.className = "book";

  const height = isChosen ? usableH * 0.95 : usableH * rand(0.66, 0.96);
  book.style.setProperty("--w", `${width}px`);
  book.style.setProperty("--h", `${height}px`);
  book.style.setProperty("--c", isChosen ? "#1f3a2e" : pick(PALETTE));

  const showTitle = isChosen || (width >= 20 && Math.random() < 0.45);
  if (showTitle) {
    const title = document.createElement("span");
    title.textContent = isChosen ? "Saturday" : pick(TITLES);
    book.appendChild(title);
  }

  if (isChosen) {
    book.classList.add("chosen");
    book.setAttribute("aria-label", "A book titled Saturday");
    book.addEventListener("click", () => openLibrary(book));
  } else {
    book.setAttribute("aria-label", "A book");
    book.addEventListener("click", () => wrongBook(book));
  }

  return book;
}

/* =========================================================
   Interactions
   ========================================================= */
function whisper(text) {
  whisperEl.textContent = text;
  whisperEl.classList.add("show");
  clearTimeout(whisperTimer);
  whisperTimer = setTimeout(() => whisperEl.classList.remove("show"), 2200);
}

function wrongBook(book) {
  if (opened) return;

  // restart the nudge animation even on repeat clicks
  book.classList.remove("nudge");
  void book.offsetWidth;
  book.classList.add("nudge");

  wrongClicks++;
  if (wrongClicks % 3 === 0) {
    document.querySelector(".book.chosen")?.classList.add("hint");
    whisper("Look for the one that doesn't quite fit.");
  } else {
    whisper(pick(WRONG_LINES));
  }
}

function openLibrary(book) {
  if (opened) return;
  opened = true;

  whisperEl.classList.remove("show");
  book.classList.add("pulled");

  setTimeout(() => stage.classList.add("rumble"), 650);

  setTimeout(() => {
    bookcase.classList.add("open");
    intro.classList.add("gone");
    room.setAttribute("aria-hidden", "false");
  }, 1250);

  setTimeout(() => {
    card.classList.add("show");
    card.focus({ preventScroll: true });
  }, 2700);
}

acceptBtn.addEventListener("click", () => {
  acceptBtn.disabled = true;
  acceptBtn.textContent = "Then it is settled.";
  seal.classList.add("stamp");
  // the card is taller than most screens, so bring the seal into view
  seal.scrollIntoView({ behavior: "smooth", block: "center" });
  if (CONFIG.emailjs.enabled) sendNotice();
});

/* =========================================================
   Card content & countdown
   ========================================================= */
function textSpan(className, text) {
  const s = document.createElement("span");
  s.className = className;
  s.textContent = text;
  return s;
}

function fillCard() {
  $("cardDate").textContent = CONFIG.dateLabel;
  $("dressCode").textContent = CONFIG.dressCode;
  $("signature").textContent = CONFIG.signature;
  $("sealInitial").textContent = CONFIG.sealInitial;

  const list = $("programme");
  CONFIG.programme.forEach((item) => {
    const li = document.createElement("li");
    li.append(
      textSpan("p-time", item.time),
      textSpan("p-act", `${item.act} · ${item.title}`),
      textSpan("p-hint", item.hint),
    );
    list.appendChild(li);
  });
}

function plural(n, word) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

function updateCountdown() {
  const el = $("countdown");
  const diff = new Date(CONFIG.eventDate) - new Date();

  if (diff <= 0) {
    el.textContent = "The evening has begun.";
    return;
  }

  const totalMin = Math.floor(diff / 60000);
  const days = Math.floor(totalMin / 1440);
  const hours = Math.floor((totalMin % 1440) / 60);
  const mins = totalMin % 60;

  const parts = [];
  if (days) parts.push(plural(days, "day"));
  if (hours) parts.push(plural(hours, "hour"));
  if (!days) parts.push(plural(mins, "minute"));

  el.textContent = `In ${parts.join(", ")}.`;
}

/* =========================================================
   Optional: EmailJS notice when she accepts
   ========================================================= */
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

async function sendNotice() {
  try {
    await loadScript("https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js");
    emailjs.init({ publicKey: CONFIG.emailjs.publicKey });
    // variable names match the existing template: {{name}}, {{time}}, {{message}}
    await emailjs.send(CONFIG.emailjs.serviceId, CONFIG.emailjs.templateId, {
      name: "The Secret Library",
      time: new Date().toLocaleString(),
      message: "She opened the library and accepted. Saturday is on.",
    });
  } catch (err) {
    console.warn("EmailJS notice failed:", err);
  }
}

/* =========================================================
   Atmosphere: floating dust in candlelight
   ========================================================= */
function makeDust() {
  const box = $("dust");
  const count = window.innerWidth < 600 ? 16 : 30;

  for (let i = 0; i < count; i++) {
    const p = document.createElement("span");
    p.style.setProperty("--x", `${rand(0, 100)}vw`);
    p.style.setProperty("--s", `${rand(1.5, 3.5)}px`);
    p.style.setProperty("--d", `${rand(14, 28)}s`);
    p.style.setProperty("--delay", `${-rand(0, 28)}s`);
    p.style.setProperty("--drift", `${rand(-60, 60)}px`);
    box.appendChild(p);
  }
}

/* =========================================================
   Init
   ========================================================= */
fillCard();
buildShelves();
makeDust();
updateCountdown();
setInterval(updateCountdown, 30000);

// Rebuild shelves on real width changes only (mobile URL bars change height constantly)
let lastWidth = window.innerWidth;
let resizeTimer;
window.addEventListener("resize", () => {
  if (opened || window.innerWidth === lastWidth) return;
  lastWidth = window.innerWidth;
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(buildShelves, 200);
});