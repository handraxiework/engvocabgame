
// Vocabulary — loaded from vocabulary.txt at runtime
let VOCAB = { easy: [], medium: [], hard: [] };

const FALLBACK = [
    { emoji: "🐱", en: "CAT", phonetic: "/kæt/", id: "Kucing" },
    { emoji: "🐶", en: "DOG", phonetic: "/dɒg/", id: "Anjing" },
    { emoji: "🐠", en: "FISH", phonetic: "/fɪʃ/", id: "Ikan" },
    { emoji: "🌸", en: "FLOWER", phonetic: "/ˈflaʊər/", id: "Bunga" },
    { emoji: "🌳", en: "TREE", phonetic: "/triː/", id: "Pohon" },
    { emoji: "📚", en: "BOOK", phonetic: "/bʊk/", id: "Buku" },
    { emoji: "🏡", en: "HOUSE", phonetic: "/haʊs/", id: "Rumah" },
    { emoji: "🌈", en: "RAINBOW", phonetic: "/ˈreɪnboʊ/", id: "Pelangi" },
    { emoji: "⭐", en: "STAR", phonetic: "/stɑːr/", id: "Bintang" },
    { emoji: "🌙", en: "MOON", phonetic: "/muːn/", id: "Bulan" },
    { emoji: "☀️", en: "SUN", phonetic: "/sʌn/", id: "Matahari" },
    { emoji: "🍎", en: "APPLE", phonetic: "/ˈæpl/", id: "Apel" },
];

// ===================== VOCAB LOADER =====================
function parseVocabTxt(text) {
    const result = { easy: [], medium: [], hard: [] };
    const lines = text.split("\n");
    for (let raw of lines) {
        const line = raw.trim();
        if (!line || line.startsWith("#")) continue;      // skip comments & blanks
        const parts = line.split("|").map(p => p.trim());
        if (parts.length < 5) continue;                   // skip malformed lines
        const [level, emoji, en, phonetic, id] = parts;
        const key = level.toLowerCase();
        if (!result[key]) continue;                       // skip unknown levels
        result[key].push({ emoji, en, phonetic, id });
    }
    return result;
}

async function loadVocab() {
    try {
        const res = await fetch("vocabulary.txt");
        if (!res.ok) throw new Error("File tidak ditemukan");
        const text = await res.text();
        VOCAB = parseVocabTxt(text);
        // Validate minimum 9 words per level
        for (const level of ["easy", "medium", "hard"]) {
            if (VOCAB[level].length < 9) {
                console.warn(`⚠️ Level "${level}" hanya punya ${VOCAB[level].length} kata (minimal 9)`);
            }
        }
        console.log(`✅ Kosakata dimuat: easy=${VOCAB.easy.length}, medium=${VOCAB.medium.length}, hard=${VOCAB.hard.length}`);
    } catch (err) {
        console.error("Gagal memuat vocabulary.txt:", err);
        VOCAB.easy = FALLBACK;
        showVocabLoadError();
    }
}

function showVocabLoadError() {
    // Show a friendly warning banner on the intro screen
    const banner = document.createElement("div");
    banner.style.cssText = `
    position:fixed; bottom:16px; left:50%; transform:translateX(-50%);
    background:#FF4757; color:white; padding:12px 20px; border-radius:12px;
    font-family:'Nunito',sans-serif; font-weight:800; font-size:0.85rem;
    z-index:999; text-align:center; box-shadow:0 4px 16px rgba(255,71,87,0.4);
    max-width:90vw;
  `;
    banner.textContent = "⚠️ File vocabulary.txt tidak ditemukan! Pastikan file ada di folder yang sama dengan vocabulary-game.html";
    document.body.appendChild(banner);
    setTimeout(() => banner.remove(), 8000);
}
