/* ================= CONFIG — edit these ================= */
const PASSCODE = "2006";               // 4-digit secret code
const COUNTDOWN_SECONDS = 4;           // curtain clock time before it opens

// Put your own sticker/photo files in assets/stickers/ and set the path here.
// Leave as null to use the built-in drawn placeholders.
const STICKERS = {
  birthday: null,   // passcode screen photo   e.g. "assets/stickers/birthday.png"
  wrong:    null,   // wrong-passcode "X" sign
  proud:    null,   // "Do you wanna see it?"
  sure:     null,   // "Are you sure?"
  blush:    null,   // "Are you really excited?"
  mystery:  null,   // mystery box (bandana)
  letter:   null,   // letter-screen photo
  wishKid:  null    // small kid beside the cake
};
const MEMORIES = [   // add/remove freely: [image or null, caption]
  [null, "Make Make Cake! 🎂"],
  [null, "Best Peanuts & Gift 🎁"],
  [null, "Best Friend Dinners 💗"],
  [null, "Make A Wish ✨"],
  [null, "Secret Agent & Pup 🐶"]
];
const LETTER = [
  "Happy birthday to my favourite person! 🤍",
  "I hope this year brings you everything you've been wishing for and so much more. Thank you for making my days happier, my bad days easier, and my life a little more beautiful just by being in it. 🥺💗",
  "I'm so lucky to have you, and I can't wait to make a million more memories with you. Here's to you, your dreams, and all the happiness you deserve.",
  "Happy birthday, my love. I love you more than you know. 🫶🧸💗"
].join("\n\n");
/* ======================================================= */

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

/* ---------- placeholder sticker generator (original drawings) ---------- */
function drawKid(mood, extra = "") {
  const eyes = {
    happy: '<circle cx="42" cy="52" r="7" fill="#fff" stroke="#222" stroke-width="2"/><circle cx="78" cy="52" r="7" fill="#fff" stroke="#222" stroke-width="2"/><circle cx="42" cy="53" r="3" fill="#222"/><circle cx="78" cy="53" r="3" fill="#222"/>',
    wow: '<circle cx="42" cy="52" r="10" fill="#fff" stroke="#222" stroke-width="2"/><circle cx="78" cy="52" r="10" fill="#fff" stroke="#222" stroke-width="2"/><circle cx="42" cy="52" r="3" fill="#222"/><circle cx="78" cy="52" r="3" fill="#222"/>',
    shy: '<path d="M33 54q9-9 18 0M69 54q9-9 18 0" stroke="#222" stroke-width="3" fill="none"/><circle cx="34" cy="68" r="7" fill="#ff9aa8" opacity=".7"/><circle cx="86" cy="68" r="7" fill="#ff9aa8" opacity=".7"/>'
  }[mood] || "";
  const mouth = mood === "wow" ? '<ellipse cx="60" cy="82" rx="7" ry="9" fill="#7a1f2a"/>' : '<path d="M44 78q16 16 32 0z" fill="#7a1f2a"/>';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 150"><rect width="120" height="150" fill="${mood==="wow"?"#d7efe0":"#fff"}"/>
  <path d="M14 150q6-40 46-40t46 40z" fill="#e8262d"/><circle cx="60" cy="58" r="40" fill="#ffd9b8" stroke="#222" stroke-width="2"/>
  <path d="M20 46q4-34 40-34t40 34q-40-18-80 0z" fill="#161616"/>
  <path d="M30 38q12-6 22 0M68 38q12-6 22 0" stroke="#161616" stroke-width="5" fill="none"/>${eyes}${mouth}${extra}</svg>`;
}
const EXTRAS = {
  birthday: '<path d="M60 -2L44 22h32z" fill="#7ec8e3" stroke="#222" stroke-width="2"/><rect x="34" y="118" width="52" height="26" rx="4" fill="#fff" stroke="#aaa"/><g fill="#ff5d9b"><rect x="42" y="104" width="3" height="14"/><rect x="58" y="104" width="3" height="14"/><rect x="74" y="104" width="3" height="14"/></g>',
  wrong: '<g transform="rotate(-10 96 80)"><rect x="70" y="40" width="46" height="46" fill="#fff" stroke="#222" stroke-width="3"/><path d="M80 50l26 26M106 50l-26 26" stroke="#2438c4" stroke-width="7"/></g>',
  mystery: '<path d="M16 44q44-44 88 0q-44 -10 -88 0z" fill="#c8102e"/><g fill="#fff"><circle cx="40" cy="30" r="5"/><circle cx="62" cy="24" r="5"/><circle cx="84" cy="30" r="5"/></g>'
};
const svgURI = s => "data:image/svg+xml;utf8," + encodeURIComponent(s);
const MOODS = { birthday: "happy", wrong: "shy", proud: "happy", sure: "wow", blush: "shy", mystery: "happy", letter: "happy", wishKid: "happy" };
function stickerSrc(key) {
  return STICKERS[key] || svgURI(drawKid(MOODS[key], EXTRAS[key] || ""));
}
function polaroidSrc(i) {
  const c = ["#ffd1e0", "#ffe9a8", "#c9f0dd", "#cfe3ff", "#e6d2ff"][i % 5];
  return svgURI(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="${c}"/><circle cx="30" cy="30" r="14" fill="#fff8"/><circle cx="95" cy="85" r="18" fill="#fff8"/><text x="60" y="72" font-size="40" text-anchor="middle">${["🎂","🎁","🍽️","🌟","🐶"][i % 5]}</text></svg>`);
}
function setStickers() {
  $("#lockImg").src = stickerSrc("birthday");
  $("#askImg").src = stickerSrc("proud");
  $("#mysteryImg").src = stickerSrc("mystery");
  $("#letterImg").src = stickerSrc("letter");
  $("#wishKid").src = stickerSrc("wishKid");
}

/* ---------- scene helper ---------- */
function show(id) {
  $$(".scene").forEach(s => s.classList.toggle("active", s.id === id));
  $$(".modal").forEach(m => m.classList.remove("open"));
}

/* ---------- confetti ---------- */
const cv = $("#confetti"), cx = cv.getContext("2d");
let bits = [], running = false;
function fit() { cv.width = innerWidth; cv.height = innerHeight; }
addEventListener("resize", fit); fit();
function confetti(n = 120, fromTop = true) {
  const cols = ["#ff5d9b", "#ffd24a", "#34d3c0", "#ff7a3d", "#7b5cff", "#e8262d"];
  for (let i = 0; i < n; i++) bits.push({
    x: Math.random() * cv.width, y: fromTop ? -10 : cv.height / 2,
    vx: (Math.random() - .5) * 3, vy: fromTop ? Math.random() * 3 + 1 : -Math.random() * 8 - 2,
    r: Math.random() * 3 + 2, c: cols[i % cols.length], life: 220 + Math.random() * 80
  });
  if (!running) { running = true; requestAnimationFrame(tick); }
}
function tick() {
  cx.clearRect(0, 0, cv.width, cv.height);
  bits = bits.filter(b => b.life-- > 0);
  bits.forEach(b => { b.x += b.vx; b.y += b.vy; b.vy += .06; cx.fillStyle = b.c; cx.beginPath(); cx.arc(b.x, b.y, b.r, 0, 7); cx.fill(); });
  if (bits.length) requestAnimationFrame(tick); else running = false;
}

/* ---------- 1. curtain + clock ---------- */
let remaining = COUNTDOWN_SECONDS, curtainDone = false;
function tickClock() {
  const d = new Date(), s = d.getSeconds() + d.getMilliseconds() / 1000, m = d.getMinutes() + s / 60, h = (d.getHours() % 12) + m / 60;
  $(".clock .s").style.transform = `rotate(${s * 6}deg)`;
  $(".clock .m").style.transform = `rotate(${m * 6}deg)`;
  $(".clock .h").style.transform = `rotate(${h * 30}deg)`;
  if (!curtainDone) requestAnimationFrame(tickClock);
}
function openCurtain() {
  if (curtainDone) return; curtainDone = true;
  $("#curtain").classList.add("open"); confetti(80);
  setTimeout(() => show("lock"), 2600);
}
tickClock();
const cd = setInterval(() => {
  remaining--;
  const t = Math.max(remaining, 0);
  $("#cd").textContent = "12:00:" + String(t).padStart(2, "0");
  if (remaining < 0) { clearInterval(cd); openCurtain(); }
}, 1000);
$("#curtain").addEventListener("click", openCurtain);

/* ---------- 2. passcode ---------- */
let code = "";
$("#keys").innerHTML = ["1","2","3","4","5","6","7","8","9","⌫","0","💗"].map(k => `<button data-k="${k}">${k}</button>`).join("");
function paint() {
  $$("#boxes span").forEach((b, i) => { b.textContent = code[i] ? code[i] : ""; b.classList.toggle("cur", i === code.length); });
}
function resetLock() {
  code = ""; paint();
  $("#lock").classList.remove("wrong");
  $("#lockImg").src = stickerSrc("birthday");
  $("#lockMsg").textContent = "Enter the 4-digit secret passcode 💘";
}
function submitCode() {
  if (code.length < 4) return;
  if (code === PASSCODE) { confetti(100); show("ask"); return; }
  $("#lock").classList.add("wrong");
  $("#lockImg").src = stickerSrc("wrong");
  $("#lockMsg").textContent = "Oops! Wrong Passcode! Try again, cutie! 😘";
  $("#boxes").classList.add("shake"); setTimeout(() => $("#boxes").classList.remove("shake"), 500);
}
$("#keys").addEventListener("click", e => {
  const k = e.target.dataset.k; if (!k) return;
  if (k === "⌫") code = code.slice(0, -1);
  else if (k === "💗") return submitCode();
  else if (code.length < 4) code += k;
  paint();
  if (code.length === 4 && k !== "⌫") setTimeout(submitCode, 250);
});
addEventListener("keydown", e => {
  if (!$("#lock").classList.contains("active") || $("#lock").classList.contains("wrong")) return;
  if (/^\d$/.test(e.key) && code.length < 4) { code += e.key; paint(); if (code.length === 4) setTimeout(submitCode, 250); }
  else if (e.key === "Backspace") { code = code.slice(0, -1); paint(); }
});
$("#retry").addEventListener("click", resetLock);
paint();

/* ---------- 3 & 4. ask / excited ---------- */
let stage = "ask";
$("#yes").addEventListener("click", () => {
  confetti(60);
  if (stage === "ask" || stage === "sure") {
    stage = "excited";
    $("#askTitle").textContent = "Are you really excited?";
    $("#askImg").src = stickerSrc("blush");
    $("#askMsg").classList.add("hide");
    $("#no").textContent = "YES";
  } else show("gifts");
});
$("#no").addEventListener("click", () => {
  if (stage === "excited") { confetti(60); return show("gifts"); }
  stage = "sure";
  $("#askImg").src = stickerSrc("sure");
  $("#askMsg").textContent = "Are you sure? 🥺 Please say YES! 💗";
});
$("#no").addEventListener("mouseenter", () => {      // NO shyly dodges
  if (stage !== "sure") return;
  $("#no").style.transform = `translate(${(Math.random() - .5) * 160}px,${(Math.random() - .5) * 80}px)`;
});

/* ---------- 5. gifts ---------- */
$("#hearts").innerHTML = [0, 1, 2].map(i => `<div class="heart" data-i="${i}"><svg viewBox="0 0 100 100">
  <path d="M50 92C10 62 4 36 22 22c12-9 24-3 28 8 4-11 16-17 28-8 18 14 12 40-28 70z" fill="#7d0b22"/>
  <path d="M50 84C14 58 9 36 24 24c11-8 22-2 26 8 4-10 15-16 26-8 15 12 10 34-26 60z" fill="#d4122f"/>
  <path d="M50 50q-18-14-26 0q10 4 26 0q16 4 26 0q-8-14-26 0z" fill="none" stroke="#ffd9e0" stroke-width="3" stroke-linecap="round"/></svg></div>`).join("");
$("#hearts").addEventListener("click", e => {
  const h = e.target.closest(".heart"); if (!h) return;
  confetti(40);
  [openMemories, openLetter, openWish][h.dataset.i]();
});
function openModal(id) { $("#" + id).classList.add("open"); }
$$("[data-close]").forEach(b => b.addEventListener("click", () => { $$(".modal").forEach(m => m.classList.remove("open")); typing && clearInterval(typing); }));

/* ---------- 6. memories ---------- */
const bannerColors = ["#8a0f2a", "#c8102e", "#e8501f", "#b5123e", "#d9457d", "#f2a65a", "#7a1030", "#a3112c"];
$("#banner").innerHTML = "MEMORIES".split("").map((c, i) => `<span style="background:${bannerColors[i]};--r:${(i % 3 - 1) * 4}deg">${c}</span>`).join("");
$("#track").innerHTML = MEMORIES.map((m, i) => `<div class="polaroid" style="--r:${(i % 3 - 1) * 3}deg"><img src="${m[0] || polaroidSrc(i)}" alt=""><p>${m[1]}</p></div>`).join("");
let pos = 0;
function slide() { $("#track").style.transform = `translateX(${-pos * 176}px)`; }
$("#next").addEventListener("click", () => { pos = Math.min(pos + 1, MEMORIES.length - 3 > 0 ? MEMORIES.length - 3 : 0); slide(); });
$("#prev").addEventListener("click", () => { pos = Math.max(pos - 1, 0); slide(); });
$("#track").addEventListener("click", e => { const p = e.target.closest(".polaroid"); if (p) { p.classList.add("gone"); confetti(20); } });
function openMemories() { pos = 0; slide(); $$(".polaroid").forEach(p => p.classList.remove("gone")); openModal("memories"); }

/* ---------- 7. letter ---------- */
let typing;
function openLetter() {
  openModal("letter"); confetti(80);
  const el = $("#typed"); el.textContent = ""; let i = 0;
  clearInterval(typing);
  typing = setInterval(() => { el.textContent = LETTER.slice(0, ++i); if (i >= LETTER.length) clearInterval(typing); }, 28);
}

/* ---------- 8. wish ---------- */
function lightCandles() {
  $("#candles").innerHTML = '<div class="candle"></div>'.repeat(7);
  $("#wishTitle").textContent = "MAKE A WISH";
  $("#wishBar").classList.add("hide"); $("#wishHint").classList.remove("hide");
}
function checkOut() {
  if ($$(".candle:not(.out)").length === 0) {
    $("#wishTitle").textContent = "HAPPY BIRTHDAY! 🎉";
    $("#wishBar").classList.remove("hide"); $("#wishHint").classList.add("hide");
    confetti(200);
  }
}
$("#candles").addEventListener("click", e => { if (e.target.classList.contains("candle")) { e.target.classList.add("out"); checkOut(); } });
$(".cake").addEventListener("click", e => { if (e.target.closest("#candles")) return; $$(".candle").forEach(c => c.classList.add("out")); checkOut(); });
$("#relight").addEventListener("click", lightCandles);
function openWish() { lightCandles(); openModal("wish"); }

setStickers();
