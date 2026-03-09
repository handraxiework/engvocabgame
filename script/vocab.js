// Vocabulary — loaded from vocabulary.txt at runtime
// Supports both legacy (easy/medium/hard) and new (kelas1–kelas6) format

let VOCAB = { 
  easy: [], medium: [], hard: [],
  kelas1: [], kelas2: [], kelas3: [], kelas4: [], kelas5: [], kelas6: []
};

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
    const result = { 
        easy: [], medium: [], hard: [],
        kelas1: [], kelas2: [], kelas3: [], kelas4: [], kelas5: [], kelas6: []
    };
    const lines = text.split("\n");
    for (let raw of lines) {
        const line = raw.trim();
        if (!line || line.startsWith("#")) continue;      // skip comments & blanks
        const parts = line.split("|").map(p => p.trim());
        if (parts.length < 5) continue;                   // skip malformed lines
        const [level, emoji, en, phonetic, id] = parts;
        // Normalize: "KELAS1" -> "kelas1", "easy" -> "easy"
        const key = level.toLowerCase().replace(/\s+/g, '');
        if (result[key] !== undefined) {
            result[key].push({ emoji, en, phonetic, id });
        } else {
            console.warn(`Unknown level key: "${level}"`);
        }
    }
    return result;
}

async function loadVocab() {
    try {
        const res = await fetch("vocabulary.txt");
        if (!res.ok) throw new Error("File tidak ditemukan");
        const text = await res.text();
        const parsed = parseVocabTxt(text);
        VOCAB = parsed;

        // Validate minimum words
        const kelasList = ["kelas1","kelas2","kelas3","kelas4","kelas5","kelas6"];
        const legacyList = ["easy","medium","hard"];
        const hasKelas = kelasList.some(k => VOCAB[k].length > 0);
        const hasLegacy = legacyList.some(k => VOCAB[k].length > 0);

        if (hasKelas) {
            kelasList.forEach(k => {
                if (VOCAB[k].length < 10) {
                    console.warn(`⚠️ Level "${k}" hanya punya ${VOCAB[k].length} kata (minimal 10 untuk 1 stage)`);
                }
            });
            console.log(`✅ Kosakata dimuat (format kelas):`,
                kelasList.map(k => `${k}=${VOCAB[k].length}`).join(', '));
        } else if (hasLegacy) {
            // Backward compatibility: map easy→kelas1, medium→kelas2, hard→kelas3
            VOCAB.kelas1 = VOCAB.easy;
            VOCAB.kelas2 = VOCAB.medium;
            VOCAB.kelas3 = VOCAB.hard;
            console.warn("⚠️ Menggunakan format lama (easy/medium/hard). Disarankan migrasi ke format KELAS1-6.");
            legacyList.forEach(k => {
                if (VOCAB[k].length < 9) {
                    console.warn(`⚠️ Level "${k}" hanya punya ${VOCAB[k].length} kata (minimal 9)`);
                }
            });
            console.log(`✅ Kosakata dimuat (format lama): easy=${VOCAB.easy.length}, medium=${VOCAB.medium.length}, hard=${VOCAB.hard.length}`);
        } else {
            throw new Error("Tidak ada kata yang berhasil dimuat");
        }
    } catch (err) {
        console.error("Gagal memuat vocabulary.txt:", err);
        VOCAB.easy = FALLBACK;
        VOCAB.kelas1 = FALLBACK;
        showVocabLoadError();
    }
}

function showVocabLoadError() {
    const banner = document.createElement("div");
    banner.style.cssText = `
    position:fixed; bottom:16px; left:50%; transform:translateX(-50%);
    background:#FF4757; color:white; padding:12px 20px; border-radius:12px;
    font-family:'Nunito',sans-serif; font-weight:800; font-size:0.85rem;
    z-index:999; text-align:center; box-shadow:0 4px 16px rgba(255,71,87,0.4);
    max-width:90vw;
  `;
    banner.textContent = "⚠️ File vocabulary.txt tidak ditemukan! Menggunakan kata bawaan. Pastikan format: KELAS1 | 🎨 | Color | /ˈkʌl.ər/ | Warna";
    document.body.appendChild(banner);
    setTimeout(() => banner.remove(), 10000);
}
