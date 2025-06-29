// ========== NEON MIND – RANDOM POSTER GENERATOR ==========

// ---- DATA ----
const unsplashKeywords = [
  "neon+city+night", "abstract+neon", "cyberpunk+street", "night+lights",
  "urban+neon", "minimal+neon", "colorful+gradient", "neon+aesthetic"
];
let quotes = [
  { text: "Hidup adalah perjalanan menemukan makna.", author: "Anonim" },
  { text: "Ketenangan batin adalah rumah bagi kebijaksanaan.", author: "Laozi" },
  { text: "Jangan takut berjalan lambat, takutlah jika hanya diam.", author: "Pepatah Tiongkok" },
  { text: "Kebahagiaan datang ketika kita selaras dengan diri sendiri.", author: "Aristoteles" },
  { text: "Pikiran adalah kunci dari segala realita.", author: "Marcus Aurelius" },
  { text: "Jadilah sinar di tengah gelap dunia.", author: "Rumi" },
  { text: "Kesederhanaan adalah puncak kecanggihan.", author: "Leonardo da Vinci" },
  { text: "Segala sesuatu diciptakan dua kali: di pikiran dan di kenyataan.", author: "Stephen Covey" },
  { text: "Kita tidak bisa mengendalikan angin, tapi bisa menyesuaikan layar.", author: "Pepatah" }
];

// ---- FAVORITES & HISTORY (localStorage) ----
let favorites = JSON.parse(localStorage.getItem("neonmind_favorites") || "[]");
let historyPosters = JSON.parse(localStorage.getItem("neonmind_history") || "[]");

// ---- DOM SELECTORS ----
const posterCard = document.getElementById("posterCard");
const posterBg = document.getElementById("posterBg");
const quoteText = document.getElementById("quoteText");
const quoteAuthor = document.getElementById("quoteAuthor");
const generateBtn = document.getElementById("generateBtn");
const downloadBtn = document.getElementById("downloadBtn");
const copyBtn = document.getElementById("copyBtn");
const favoriteBtn = document.getElementById("favoriteBtn");
const favoriteList = document.getElementById("favoriteList");
const addQuoteForm = document.getElementById("addQuoteForm");
const newQuote = document.getElementById("newQuote");
const newAuthor = document.getElementById("newAuthor");
const fontSelect = document.getElementById("fontSelect");
const shareBtn = document.getElementById("shareBtn");
const resetBtn = document.getElementById("resetBtn");
const themeSwitcher = document.getElementById("themeSwitcher");
const clickSound = document.getElementById("clickSound");
const grad1 = document.getElementById("gradient1");
const grad2 = document.getElementById("gradient2");
const grad3 = document.getElementById("gradient3");
const applyGradient = document.getElementById("applyGradient");
const autoRefreshToggle = document.getElementById("autoRefreshToggle");
const autoRefreshInput = document.getElementById("autoRefreshInterval");
const searchQuote = document.getElementById("searchQuote");
const searchBtn = document.getElementById("searchBtn");
const exportFavBtn = document.getElementById("exportFavBtn");
const importFavBtn = document.getElementById("importFavBtn");
const importFavInput = document.getElementById("importFavInput");
const posterHistory = document.getElementById("posterHistory");
const generateQRBtn = document.getElementById("generateQRBtn");
const qrPreview = document.getElementById("qrPreview");
const stickerList = document.getElementById("stickerList");
const audioBgToggle = document.getElementById("audioBgToggle");
const audioBg = document.getElementById("audioBg");

// ---- UTILS ----
function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function playSound() {
  clickSound.currentTime = 0;
  clickSound.volume = 0.18;
  clickSound.play();
}
function getCurrentQuoteObj() {
  return {
    text: quoteText.textContent,
    author: quoteAuthor.textContent.replace(/^- /, "")
  };
}

// ---- POSTER GENERATION ----
let lastPosterImgUrl = "";
async function setRandomPoster(showTransition = true) {
  playSound();
  // Random quote
  const q = randomFrom(quotes);
  // Random Unsplash
  const keyword = randomFrom(unsplashKeywords);
  const url = `https://source.unsplash.com/600x800/?${keyword}&sig=${Date.now() % 10000}`;
  lastPosterImgUrl = url;

  // Set background
  posterBg.style.opacity = 0;
  setTimeout(() => {
    posterBg.style.backgroundImage = `url('${url}')`;
    posterBg.style.opacity = 0.32;
  }, 330);

  // Animate card & quote in
  if (showTransition) {
    posterCard.style.animation = "cardFadeIn 0.8s";
    quoteText.style.animation = "fadein 0.8s";
    setTimeout(() => {
      posterCard.style.animation = "";
      quoteText.style.animation = "";
    }, 900);
  }

  // Set quote
  quoteText.textContent = q.text;
  quoteAuthor.textContent = q.author ? `- ${q.author}` : "";
  // Remove active favorite
  favoriteBtn.classList.remove("active", "favorited");
  // Cek kalau quote ini sudah difavoritkan
  if (isInFavorite(q)) favoriteBtn.classList.add("active", "favorited");

  // Add to history
  setTimeout(() => addToHistory(lastPosterImgUrl, q.text, q.author), 800);
}

// ---- FAVORITE ----
function isInFavorite(q) {
  return favorites.some(
    (f) => f.text === q.text && f.author === q.author
  );
}
function updateFavoriteList() {
  favoriteList.innerHTML = "";
  if (!favorites.length) {
    favoriteList.innerHTML = "<li>(Belum ada favorit...)</li>";
    return;
  }
  favorites.forEach((q, i) => {
    const li = document.createElement("li");
    li.innerHTML =
      `<span>${q.text}</span> <span class="author">${q.author ? "- " + q.author : ""}</span>
      <button class="remove" title="Hapus" data-idx="${i}">✖</button>`;
    favoriteList.appendChild(li);
  });
}
favoriteList.addEventListener("click", (e) => {
  if (e.target.classList.contains("remove")) {
    playSound();
    favorites.splice(Number(e.target.dataset.idx), 1);
    localStorage.setItem("neonmind_favorites", JSON.stringify(favorites));
    updateFavoriteList();
  }
});

// ---- FAVORITE BUTTON EVENTS ----
favoriteBtn.addEventListener("click", () => {
  playSound();
  const q = getCurrentQuoteObj();
  if (!isInFavorite(q)) {
    favorites.unshift(q);
    favoriteBtn.classList.add("active", "favorited");
  }
  localStorage.setItem("neonmind_favorites", JSON.stringify(favorites));
  updateFavoriteList();
});

// ---- ADD TO HISTORY ----
function addToHistory(imgUrl, quote, author) {
  if (!imgUrl || !quote) return;
  historyPosters.unshift({ img: imgUrl, quote, author, time: Date.now() });
  historyPosters = historyPosters.slice(0, 20);
  localStorage.setItem("neonmind_history", JSON.stringify(historyPosters));
  renderPosterHistory();
}
function renderPosterHistory() {
  if (!posterHistory) return;
  posterHistory.innerHTML = "";
  if (!historyPosters.length) {
    posterHistory.innerHTML = "<div style='color:#777'>Belum ada riwayat poster...</div>";
    return;
  }
  historyPosters.forEach(({ img, quote, author }) => {
    const d = document.createElement("div");
    d.className = "mini-poster";
    d.innerHTML = `<img src="${img}" alt="poster"/><div style="font-size:.9em;color:${author ? '#a259ff' : '#fff'};padding:3px 7px;">${quote} <br><span style="font-size:.8em">${author || ""}</span></div>`;
    d.onclick = () => {
      quoteText.textContent = quote;
      quoteAuthor.textContent = author ? `- ${author}` : "";
      posterBg.style.backgroundImage = `url('${img}')`;
      playSound();
    }
    posterHistory.appendChild(d);
  });
}
setTimeout(renderPosterHistory, 400);

// ---- AUTO REFRESH ----
let autoRefreshIntervalId = null;
function startAutoRefreshPoster() {
  let interval = Math.max(Number(autoRefreshInput.value) || 10, 3);
  if (autoRefreshIntervalId) clearInterval(autoRefreshIntervalId);
  autoRefreshIntervalId = setInterval(() => setRandomPoster(true), interval * 1000);
}
autoRefreshToggle.addEventListener("change", () => {
  if (autoRefreshToggle.checked) startAutoRefreshPoster();
  else if (autoRefreshIntervalId) clearInterval(autoRefreshIntervalId);
});
autoRefreshInput.addEventListener("input", () => {
  if (autoRefreshToggle.checked) startAutoRefreshPoster();
});

// ---- POSTER CONTROLS ----
generateBtn.addEventListener("click", () => setRandomPoster());
copyBtn.addEventListener("click", () => {
  playSound();
  const text = `${quoteText.textContent} ${quoteAuthor.textContent}`;
  navigator.clipboard.writeText(text);
  copyBtn.textContent = "✔ Copied!";
  setTimeout(() => (copyBtn.textContent = "📋 Copy Quote"), 1100);
});
downloadBtn.addEventListener("click", async () => {
  playSound();
  // Use html2canvas
  if (typeof html2canvas === "undefined") {
    alert("html2canvas belum dimuat. Coba reload.");
    return;
  }
  // Remove all stickers' pointer-events so html2canvas can see them
  posterCard.querySelectorAll('.stickerOnPoster').forEach(s => s.style.pointerEvents = "none");
  const canvas = await html2canvas(posterCard, { useCORS: true });
  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = "neon-mind-poster.png";
  a.click();
});

// ---- ADD QUOTE FORM ----
addQuoteForm.addEventListener("submit", (e) => {
  e.preventDefault();
  playSound();
  if (newQuote.value.trim().length < 4) return;
  const newQ = {
    text: newQuote.value.trim(),
    author: newAuthor.value.trim()
  };
  quotes.unshift(newQ);
  setRandomPoster();
  addQuoteForm.reset();
});

// ---- FONT STYLE SWITCHER ----
fontSelect.addEventListener("change", () => {
  playSound();
  document.body.classList.remove("font-poppins", "font-playfair", "font-spacegrotesk");
  if (fontSelect.value === "poppins") document.body.classList.add("font-poppins");
  if (fontSelect.value === "playfair") document.body.classList.add("font-playfair");
  if (fontSelect.value === "spacegrotesk") document.body.classList.add("font-spacegrotesk");
});

// ---- THEME TOGGLE ----
let themeState = "neon";
themeSwitcher.addEventListener("click", () => {
  playSound();
  if (themeState === "neon") {
    document.documentElement.style.setProperty("--bg-neon", "#1a1b23");
    document.documentElement.style.setProperty("--card-bg", "#24243e");
    document.documentElement.style.setProperty("--text-light", "#f0f0f0");
    themeSwitcher.textContent = "🌞";
    themeState = "dark";
  } else {
    document.documentElement.style.setProperty("--bg-neon", "linear-gradient(135deg, #232447 60%, #2b1450 100%)");
    document.documentElement.style.setProperty("--card-bg", "rgba(24, 25, 50, 0.88)");
    document.documentElement.style.setProperty("--text-light", "#f9f9fa");
    themeSwitcher.textContent = "🌙";
    themeState = "neon";
  }
});

// ---- STICKER PICKER ----
stickerList && stickerList.addEventListener("click", (e) => {
  if (e.target.classList.contains("sticker-btn")) {
    let sticker = e.target.textContent;
    let s = document.createElement("span");
    s.textContent = sticker;
    s.className = "stickerOnPoster";
    s.style.position = "absolute";
    s.style.left = Math.random() * 70 + 10 + "%";
    s.style.top = Math.random() * 60 + 10 + "%";
    s.style.fontSize = "2.1em";
    s.style.textShadow = "0 0 12px var(--neon-pink)";
    posterCard.appendChild(s);
    playSound();
    setTimeout(() => s.remove(), 10000);
  }
});

// ---- CUSTOM GRADIENT ----
applyGradient && applyGradient.addEventListener("click", () => {
  const g = `linear-gradient(135deg, ${grad1.value} 0%, ${grad2.value} 60%, ${grad3.value} 100%)`;
  document.documentElement.style.setProperty("--bg-neon", g);
  playSound();
});

// ---- QUOTE SEARCH ----
searchBtn && searchBtn.addEventListener("click", () => {
  let s = (searchQuote.value || "").toLowerCase();
  if (!s) return;
  const found = quotes.find(q => q.text.toLowerCase().includes(s) || (q.author||"").toLowerCase().includes(s));
  if (found) {
    quoteText.textContent = found.text;
    quoteAuthor.textContent = found.author ? `- ${found.author}` : "";
    playSound();
  } else {
    alert("Quote tidak ditemukan!");
  }
});

// ---- EXPORT/IMPORT FAVORIT ----
exportFavBtn && exportFavBtn.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(favorites)], {type: "application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "neon_mind_favorites.json";
  a.click();
});
importFavBtn && importFavBtn.addEventListener("click", () => {
  importFavInput.click();
});
importFavInput && importFavInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    try {
      const arr = JSON.parse(ev.target.result);
      if (Array.isArray(arr)) {
        arr.forEach(q => {
          if (!favorites.some(f => f.text === q.text && f.author === q.author)) favorites.push(q);
        });
        localStorage.setItem("neonmind_favorites", JSON.stringify(favorites));
        updateFavoriteList();
        playSound();
        alert("Berhasil import favorit!");
      }
    } catch { alert("File tidak valid!"); }
  };
  reader.readAsText(file);
});

// ---- QR GENERATOR ----
generateQRBtn && generateQRBtn.addEventListener("click", () => {
  if (typeof QRious === "undefined") {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/qrious@4.0.2/dist/qrious.min.js";
    s.onload = () => makeQR();
    document.body.appendChild(s);
  } else makeQR();
  function makeQR() {
    qrPreview.innerHTML = "";
    const qr = new QRious({
      element: document.createElement('canvas'),
      value: `${quoteText.textContent} ${quoteAuthor.textContent}`,
      size: 160,
      background: "#fff", foreground: "#a259ff"
    });
    qrPreview.appendChild(qr.element);
    playSound();
  }
});

// ---- AUDIO BACKGROUND ----
audioBgToggle && audioBgToggle.addEventListener("change", () => {
  if (audioBgToggle.checked) {
    audioBg.volume = 0.18; audioBg.play();
  } else { audioBg.pause(); }
});

// ---- SHARE BUTTON ----
shareBtn.addEventListener("click", async () => {
  playSound();
  const text = `${quoteText.textContent}\n${quoteAuthor.textContent}\n#NeonMind #PosterFilosofi`;
  const shareData = {
    title: "Neon Mind Poster",
    text,
    url: window.location.href
  };
  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch { /* ignore */ }
  } else {
    prompt("Copy & share kutipan ini:", text);
  }
});

// ---- RESET ----
resetBtn.addEventListener("click", () => {
  playSound();
  if (confirm("Hapus semua favorit, riwayat, dan quote manual?")) {
    favorites = [];
    historyPosters = [];
    localStorage.removeItem("neonmind_favorites");
    localStorage.removeItem("neonmind_history");
    updateFavoriteList();
    renderPosterHistory();
    quotes = quotes.slice(0, 9); // reset manual quotes
    setRandomPoster();
  }
});

// ---- INSTANT CHAT ----
const instantChat = document.getElementById("instantChat");
const openChat = document.getElementById("openChat");
const closeChat = document.getElementById("closeChat");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatBody = document.getElementById("chatBody");
openChat.onclick = () => {
  instantChat.style.display = "flex";
  openChat.style.display = "none";
  playSound();
  setTimeout(() => chatInput.focus(), 300);
};
closeChat.onclick = () => {
  instantChat.style.display = "none";
  openChat.style.display = "block";
  playSound();
};
chatForm.onsubmit = (e) => {
  e.preventDefault();
  const msg = chatInput.value.trim();
  if (!msg) return;
  playSound();
  const userDiv = document.createElement("div");
  userDiv.className = "chat-msg user";
  userDiv.textContent = msg;
  chatBody.appendChild(userDiv);
  chatBody.scrollTop = chatBody.scrollHeight;
  chatInput.value = "";
  setTimeout(() => {
    const botDiv = document.createElement("div");
    botDiv.className = "chat-msg bot";
    botDiv.textContent =
      ["Menarik! Ada yang lain?", "Mantap, noted!", "😊 Siap bantu!", "Bisa dijelaskan lagi?"][Math.floor(Math.random()*4)];
    chatBody.appendChild(botDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
    playSound();
  }, 700);
};

// ---- INIT ----
function init() {
  setRandomPoster(false);
  updateFavoriteList();
  renderPosterHistory();
  document.body.classList.add("font-poppins");
}
window.addEventListener("DOMContentLoaded", init);

// ---- LOAD html2canvas ----
(function loadHtml2Canvas() {
  if (!window.html2canvas) {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js";
    s.async = true;
    document.body.appendChild(s);
  }
})();