// ====== SETTINGS ======
// Messages live in days.json. Change the year here for next time.
const YEAR = 2026;
let DAYS = [];
// =======================

const $ = id => document.getElementById(id);
let previewDay = null, seen = {};
try { seen = JSON.parse(localStorage.getItem("advent" + YEAR) || "{}"); } catch (e) { seen = {}; }

function today() {
  if (previewDay !== null) return previewDay; // 0 before, 25 after
  const n = new Date(), y = n.getFullYear(), m = n.getMonth(), d = n.getDate();
  if (y < YEAR || (y === YEAR && m < 11)) return 0;
  if (y > YEAR || d > 24) return 25;
  return d;
}

function render() {
  const t = today(), g = $("grid");
  g.innerHTML = "";
  for (let i = 1; i <= 24; i++) {
    const b = document.createElement("button");
    b.className = "door";
    b.textContent = i;
    if (i > t) { b.disabled = true; b.setAttribute("aria-label", "Day " + i + " locked"); }
    else {
      if (i === t) b.classList.add("today");
      if (seen[i]) { b.classList.add("opened"); b.dataset.e = DAYS[i - 1][0]; }
      b.onclick = () => openDay(i);
    }
    g.appendChild(b);
  }
  $("status").textContent = t === 0 ? "The calendar opens on December 1. Come back soon!"
    : t === 25 ? "All 24 doors are open. Merry Christmas!"
    : "Today is December " + t + ". Tap any unlocked door.";
}

function openDay(i) {
  const d = DAYS[i - 1];
  $("me").textContent = d[0];
  $("mt").textContent = "December " + i + ": " + d[1];
  $("mm").textContent = d[2];
  $("modal").classList.add("show");
  $("mc").focus();
  if (previewDay === null) {
    seen[i] = 1;
    try { localStorage.setItem("advent" + YEAR, JSON.stringify(seen)); } catch (e) {}
  }
  render();
}

$("mc").onclick = () => $("modal").classList.remove("show");
$("modal").onclick = e => { if (e.target === $("modal")) $("modal").classList.remove("show"); };
document.addEventListener("keydown", e => { if (e.key === "Escape") $("modal").classList.remove("show"); });

function showPreview(on) {
  $("pv").style.display = on ? "block" : "none";
  previewDay = on ? Math.max(0, Math.min(25, parseInt($("pvd").value || "0", 10))) : null;
  render();
}
$("pvd").oninput = () => showPreview(true);
// Tap the title 5 times quickly to toggle preview mode (works even when the URL hash is not passed through)
let taps = 0, tapTimer;
document.querySelector("h1").onclick = () => {
  taps++; clearTimeout(tapTimer); tapTimer = setTimeout(() => { taps = 0; }, 1500);
  if (taps >= 5) { taps = 0; showPreview($("pv").style.display !== "block"); }
};
window.addEventListener("hashchange", () => showPreview(location.hash === "#preview"));
function start() {
  render();
  if (location.hash === "#preview") showPreview(true);
  // Auto-open today's door on arrival (only during Dec 1-24)
  const t0 = today();
  if (t0 >= 1 && t0 <= 24 && location.hash !== "#preview") openDay(t0);
}

fetch("days.json")
  .then(r => r.json())
  .then(data => {
    DAYS = data.map(d => [d.emoji, d.title, d.message]);
    while (DAYS.length < 24) DAYS.push(["🎄", "Merry Christmas", "Wishing you joy today."]);
    start();
  })
  .catch(() => {
    $("status").textContent = "Couldn’t load the calendar. If you opened this file directly, view it through a web server or GitHub Pages.";
  });
