// Jalankan: npm run db:setup   (tambah --reset untuk menghapus semua tabel dulu)
// Catatan: pastikan "type": "module" sudah ada di package.json
import fs from "fs";
import pg from "pg";
import bcrypt from "bcryptjs";

const reset = process.argv.includes("--reset");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const q = (sql, p) => pool.query(sql, p);

if (reset) {
  await q(`DROP TABLE IF EXISTS recipe_spices, recipes, recipe_categories, spice_effects,
    masterclass_methods, spice_blends, spices, session_bookings, class_sessions,
    tasting_notes, certificates, comments, enrollment_progress, enrollments, contents, courses,
    categories, users CASCADE`);
  console.log("Tabel lama dihapus.");
}

await q(fs.readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8"));
console.log("Skema siap.");

const { rows: existing } = await q("SELECT COUNT(*)::int AS n FROM users");
if (existing[0].n > 0) {
  console.log("Data sudah ada, seed dilewati. Pakai --reset untuk mengulang dari nol.");
  await pool.end();
  process.exit(0);
}

const hash = (p) => bcrypt.hashSync(p, 10);

// ---------- 1. USERS ----------
const users = [
  ["Admin Niskala", "admin@niskalarasa.id", "admin123", "admin", "none", null],
  ["Spice Master Daeng", "teacher@niskalarasa.id", "teacher123", "teacher", "approved", "2026-01-01"],
  ["Calon Spice Master", "pending@niskalarasa.id", "pending123", "student", "pending", null],
  ["Aca Student", "student@niskalarasa.id", "student123", "student", "none", null],
  ["Nadia Rempah", "nadia@niskalarasa.id", "student123", "student", "none", null],
  ["Bima Dapur", "bima@niskalarasa.id", "student123", "student", "none", null],
];
const uid = {};
for (const [name, email, pw, role, status, appr] of users) {
  const r = await q(
    `INSERT INTO users (username,email,password_hash,role,teacher_status,approved_at)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    [name, email, hash(pw), role, status, appr]
  );
  uid[email] = r.rows[0].id;
}
const teacherId = uid["teacher@niskalarasa.id"];

// ---------- 2. KATEGORI KURSUS & KURIKULUM ICE MASTERCLASS ----------
const cats = [
  "Rimpang Nusantara",
  "Daun, Bunga & Biji Aromatik",
  "Rempah Dunia",
  "Peracikan & Plating",
  "Evaluasi Sensorik",
];
const catId = {};
for (const c of cats) {
  catId[c] = (await q("INSERT INTO categories (name) VALUES ($1) RETURNING id", [c])).rows[0].id;
}

const P = (...t) => t.map((x) => `<p>${x}</p>`).join("");
const L = (...t) => `<ul>${t.map((x) => `<li>${x}</li>`).join("")}</ul>`;
const courses = [
  {
    name: "Modul I: Alkimia Dasar & Anatomi Rimpang Nusantara",
    cat: "Rimpang Nusantara",
    desc: "Memahami klasifikasi rimpang utama dan teknik ekstraksi zat aktif tanpa merusak profil aromatiknya (kurikulum ICE Masterclass).",
    dates: [null, null],
    contents: [
      ["Anatomi Rimpang Utama", "<h2>Enam rimpang utama</h2>" + L("Kunyit", "Lengkuas", "Jahe", "Kencur", "Temu Kunci", "Temu Ireng") + P("Kenali bentuk, warna daging, dan aroma tiap rimpang sebelum mengolahnya.")],
      ["Profil Sensorik & Senyawa Aktif", "<h2>Empat karakter dasar</h2>" + L("<strong>Earthy</strong>: tanah, dalam", "<strong>Tajam</strong>: menusuk hidung", "<strong>Pedas hangat</strong>: menghangatkan tenggorokan", "<strong>Getir aromatik</strong>: pahit yang harum") + P("Catat kesanmu di Personal Tasting Notes pada materi ini.")],
      ["Teknik Ekstraksi Tradisional", "<h2>Empat teknik</h2>" + L("Parut", "Memarkan", "Pembakaran (charring)", "Penumisan dengan minyak (tempering/blooming)") + P("Tiap teknik mengeluarkan aroma yang berbeda dari rimpang yang sama.")],
      ["Studi Kasus: Bumbu Dasar Putih, Kuning, Merah", "<h2>Tiga bumbu dasar</h2>" + P("Bumbu dasar putih, kuning, dan merah adalah fondasi masakan tradisional Indonesia. Bandingkan komposisi rempah dan hasil rasanya.")],
    ],
  },
  {
    name: "Modul II: Kekayaan Daun Aromatik, Bunga & Biji Lokal",
    cat: "Daun, Bunga & Biji Aromatik",
    desc: "Menguasai penggunaan dedaunan aromatik, bunga, dan biji eksotis khas daerah untuk memperkaya dimensi rasa.",
    dates: [null, null],
    contents: [
      ["Dedaunan Aromatik Nusantara", "<h2>Daftar daun</h2>" + L("Daun Jeruk Purut", "Daun Salam", "Daun Kunyit", "Daun Ruku-Ruku", "Kemangi", "Pandan Wangi")],
      ["Rempah Eksotis Daerah", "<h2>Tiga bintang daerah</h2>" + L("<strong>Andaliman</strong>: sensasi kebas khas Batak", "<strong>Kecombrang</strong>: aroma bunga segar", "<strong>Kluwek</strong>: gurih pekat hasil fermentasi")],
      ["Manajemen Pasca-Petik", "<h2>Menjaga minyak atsiri</h2>" + P("Minyak atsiri pada daun dan biji mudah menguap. Pelajari cara menyimpan dan waktu yang tepat menambahkannya agar aroma tetap utuh.")],
      ["Studi Kasus: Arsik Ikan Mas, Rawon Surabaya, Ayam Betutu Bali", "<h2>Tiga hidangan</h2>" + P("Telusuri bagaimana andaliman, kluwek, dan bumbu Bali membentuk identitas masing-masing hidangan.")],
    ],
  },
  {
    name: "Modul III: Spektrum Rasa & Jalur Rempah Global (World Spices)",
    cat: "Rempah Dunia",
    desc: "Mempelajari perbandingan rempah dunia terpilih serta teknik perpaduan (fusion) lintas budaya.",
    dates: ["2026-12-01", "2027-03-31"],
    contents: [
      ["Rempah Asia & Timur Tengah", "<h2>Peta rasa</h2>" + L("India: Kapulaga Hijau &amp; Jintan", "Cina: Sichuan Pepper &amp; Star Anise", "Iran: Saffron &amp; Sumac")],
      ["Rempah Mediterania & Amerika", "<h2>Peta rasa</h2>" + L("Spanyol: Paprika Asap", "Jamaika: Allspice", "Meksiko: Achiote")],
      ["Prinsip Perpaduan (Fusion Alchemy)", "<h2>Seimbangkan, jangan hilangkan identitas</h2>" + P("Padukan rempah Nusantara dengan rempah global tanpa menghilangkan identitas aslinya. Mulai dari satu rempah global, lalu uji dengan Blend Simulator.")],
    ],
  },
  {
    name: "Modul IV: Intuisi Peracikan & Plating Berbasis Filosofi Rasa",
    cat: "Peracikan & Plating",
    desc: "Melatih peracikan bumbu secara intuitif dan penerapan pendekatan Mindful Cooking serta estetika penyajian.",
    dates: [null, null],
    contents: [
      ["Intuitif Spice Blending", "<h2>Enam pilar rasa</h2>" + L("Manis", "Asam", "Asin", "Pahit", "Pedas", "Umami") + P("Seimbangkan keenamnya tanpa takaran kaku.")],
      ["Mindful Cooking", "<h2>Memasak dengan kesadaran penuh</h2>" + P("Perhatikan perubahan tekstur dan aroma selama proses pemanasan.")],
      ["The Alchemist's Blend Simulator", "<h2>Kalkulator rasa</h2>" + P("Buka menu <strong>Simulator</strong> untuk memprediksi profil rasa gabungan rempah, lalu bandingkan dengan hasil lidahmu.")],
      ["Plating & Storytelling", "<h2>Hidangan yang bercerita</h2>" + P("Sajikan hidangan dengan narasi filosofi kuliner dan estetika visual tingkat tinggi.")],
    ],
  },
  {
    name: "Evaluasi: Uji Sensorik & Proyek Akhir Alkimia Rasa",
    cat: "Evaluasi Sensorik",
    desc: "Blind Taste Test, jurnal sensorik, dan demonstrasi peracikan bumbu orisinal menggunakan dataset resep autentik.",
    dates: [null, null],
    contents: [
      ["Personal Tasting Notes", P("Rangkum jurnal sensorikmu dari seluruh modul. Catatan bersifat privat.")],
      ["Blind Taste Test", P("Evaluasi akurasi mengenali aroma rempah secara langsung (Studio Makassar) maupun virtual.")],
      ["Proyek Akhir Alkimia Rasa", P("Demonstrasikan peracikan bumbu orisinal menggunakan dataset resep autentik, lalu tuliskan filosofi di balik racikanmu pada kolom diskusi.")],
    ],
  },
];

const courseIds = [];
const contentIds = [];
for (const c of courses) {
  const r = await q(
    `INSERT INTO courses (name,description,category_id,teacher_id,start_date,end_date)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    [c.name, c.desc, catId[c.cat], teacherId, c.dates[0], c.dates[1]]
  );
  courseIds.push(r.rows[0].id);
  const ids = [];
  let i = 1;
  for (const [title, body] of c.contents) {
    const cr = await q(
      "INSERT INTO contents (course_id,title,body,order_index) VALUES ($1,$2,$3,$4) RETURNING id",
      [r.rows[0].id, title, body, i++]
    );
    ids.push(cr.rows[0].id);
  }
  contentIds.push(ids);
}

// ---------- 3. ENROLLMENT & JADWAL HYBRID (MAKASSAR & ONLINE) ----------
const enroll = async (email, ci, doneCount) => {
  const e = await q("INSERT INTO enrollments (user_id,course_id) VALUES ($1,$2) RETURNING id", [uid[email], courseIds[ci]]);
  for (let k = 0; k < doneCount; k++) {
    await q("INSERT INTO enrollment_progress (enrollment_id,content_id) VALUES ($1,$2)", [e.rows[0].id, contentIds[ci][k]]);
  }
};
await enroll("student@niskalarasa.id", 0, 2);
await enroll("student@niskalarasa.id", 1, 1);
await enroll("nadia@niskalarasa.id", 0, 4);
await enroll("nadia@niskalarasa.id", 3, 1);
await enroll("bima@niskalarasa.id", 0, 1);
await enroll("bima@niskalarasa.id", 2, 0);
await enroll("bima@niskalarasa.id", 1, 0);

const sess = [
  [0, "Live: Mengenal Enam Rimpang", "online", "2 days", null, "https://example.com/live/rimpang", null, 0],
  [0, "Praktikum Tatap Muka: Charring & Blooming", "offline", "5 days", "Studio Utama Niskala Rasa, Makassar", null, null, 12],
  [1, "Praktikum Tatap Muka: Andaliman & Kluwek", "offline", "9 days", "Studio Utama Niskala Rasa, Makassar", null, null, 2],
  [3, "Live: Plating & Storytelling", "online", "12 days", null, "https://example.com/live/plating", null, 0],
  [0, "Arsip: Live Anatomi Rimpang (rekaman)", "online", "-3 days", null, null, "https://example.com/rekaman/anatomi-rimpang", 0],
];
const sessIds = [];
for (const [ci, title, mode, offset, loc, stream, rec, quota] of sess) {
  const r = await q(
    `INSERT INTO class_sessions (course_id,title,mode,starts_at,location,stream_url,recording_url,quota)
     VALUES ($1,$2,$3, now() + $4::interval, $5,$6,$7,$8) RETURNING id`,
    [courseIds[ci], title, mode, offset, loc, stream, rec, quota]
  );
  sessIds.push(r.rows[0].id);
}
await q("INSERT INTO session_bookings (session_id,user_id,status) VALUES ($1,$2,'booked'),($1,$3,'booked')", [
  sessIds[2], uid["nadia@niskalarasa.id"], uid["bima@niskalarasa.id"],
]);

// ---------- 4. ENSIKLOPEDIA REMPAH ICE MASTERCLASS ----------
// Kolom: [code, name, short_name, botanical_name, plant_part, type, origin, lat, lng,
//         aroma_compounds, profile, activation_tech, pairing_spices, blending_ratio, storage_notes,
//         dominant_pillar, [manis, asam, asin, pahit, pedas, umami]]
const spices = [
  ["SP-01", "Kunyit", "Kunyit", "Curcuma longa", "Rimpang (Rhizome)", "rimpang", "Indonesia", -2.5, 118.0,
   "Curcumin, Turmerone, Zingiberene", "Earthy, getir aromatik, hangat",
   "Blooming minyak suhu sedang (140-160°C) atau sangrai ringan",
   "Lengkuas, Jahe, Ketumbar, Daun Jeruk", "2:1 (Kunyit : Ketumbar)",
   "Simpan di tempat sejuk, kering, dan kedap udara; hindari kelembapan tinggi",
   "pahit", [1, 0, 0, 6, 2, 0]],
  ["SP-02", "Lengkuas", "Lengkuas", "Alpinia galanga", "Rimpang (Rhizome)", "rimpang", "Indonesia", -7.0, 110.0,
   "1,8-Cineole, Galangin, Acetoxychavicol acetate", "Tajam, segar, pedas hangat ringan",
   "Memarkan atau iris tipis lalu tumis bersama bumbu dasar",
   "Serai, Daun Salam, Kunyit, Jahe", "1:1 (Lengkuas : Serai)",
   "Gunakan segar atau bekukan irisan/parutan dalam wadah kedap udara",
   "pedas", [0, 1, 0, 2, 4, 0]],
  ["SP-03", "Jahe", "Jahe", "Zingiber officinale", "Rimpang (Rhizome)", "rimpang", "Indonesia", -6.2, 106.8,
   "Gingerol, Shogaol, Zingiberene", "Pedas hangat, segar, tajam",
   "Parut, geprek, atau charring ringan untuk mengubah gingerol menjadi shogaol",
   "Bawang Putih, Serai, Kunyit, Kayu Manis", "1:1 (Jahe : Bawang Putih)",
   "Simpan jahe segar di kulkas dalam kertas/wadah kering atau olah menjadi pasta",
   "pedas", [1, 0, 0, 1, 7, 0]],
  ["SP-04", "Kencur", "Kencur", "Kaempferia galanga", "Rimpang (Rhizome)", "rimpang", "Indonesia", -7.8, 110.4,
   "Ethyl p-methoxycinnamate, Camphene", "Earthy, kamper, pedas ringan",
   "Ulek mentah untuk sambal/urap atau tumis singkat agar aroma kamper terjaga",
   "Daun Jeruk Purut, Cabai Rawit, Terasi, Gula Aren", "2:1 (Kencur : Daun Jeruk)",
   "Simpan di tempat sejuk berventilasi atau balut tisu kering di kulkas",
   "pedas", [1, 0, 0, 3, 3, 0]],
  ["SP-05", "Temu Kunci", "Temu Kunci", "Boesenbergia rotunda", "Rimpang (Rhizome)", "rimpang", "Indonesia", -6.9, 107.6,
   "Pinostrobin, Pinocembrin, Geraniol", "Earthy, tajam, aroma menyegarkan",
   "Iris korek api lalu masukkan menjelang akhir perebusan kuah bening/sayur",
   "Daun Salam, Bawang Putih, Kemiri, Kunyit", "1:2 (Temu Kunci : Bawang Putih)",
   "Simpan segar di kulkas dan gunakan dalam 5-7 hari untuk aroma optimal",
   "pedas", [0, 0, 0, 3, 3, 0]],
  ["SP-06", "Temu Ireng", "Temu Ireng", "Curcuma aeruginosa", "Rimpang (Rhizome)", "rimpang", "Indonesia", -7.5, 112.7,
   "Curzerenone, Germacrone, Camphor", "Getir pekat, earthy",
   "Rebus perlahan atau sangrai kering dengan takaran sangat terukur",
   "Kunyit, Jahe, Jintan, Asam Jawa", "1:3 (Temu Ireng : Kunyit)",
   "Simpan di ruang kering dan gelap; hindari paparan sinar matahari langsung",
   "pahit", [0, 0, 0, 7, 1, 0]],
  ["SP-07", "Daun Jeruk Purut", "Daun Jeruk", "Citrus hystrix", "Daun Aromatik", "daun", "Indonesia", -6.9, 107.6,
   "Citronellal, Limonene, Sabinene", "Sitrus segar, tajam",
   "Buang tulang daun tengah, sobek atau iris halus, masukkan di fase akhir pemasakan",
   "Serai, Lengkuas, Jahe, Kencur", "3:1 (Daun Jeruk : Serai)",
   "Simpan di kulkas dalam plastik klip kedap udara atau bekukan",
   "asam", [1, 4, 0, 1, 0, 0]],
  ["SP-08", "Daun Salam", "Daun Salam", "Syzygium polyanthum", "Daun Aromatik", "daun", "Indonesia", -7.3, 112.0,
   "Citral, Eugenol, Octanal", "Herbal lembut, sedikit getir",
   "Rebus atau tumis utuh sejak awal proses memasak untuk ekstraksi perlahan",
   "Lengkuas, Serai, Bawang Merah, Bawang Putih", "2:1 (Daun Salam : Lengkuas)",
   "Simpan daun segar di kulkas atau keringkan dan simpan di toples kedap udara",
   "pahit", [1, 0, 0, 2, 0, 1]],
  ["SP-09", "Daun Kunyit", "Daun Kunyit", "Curcuma longa (leaf)", "Daun Aromatik", "daun", "Indonesia", -2.5, 118.0,
   "1,8-Cineole, Terpinolene, Curcuminoid", "Earthy lembut, harum",
   "Simpulkan atau iris tipis dan masukkan saat proses pengentalan santan/gulai",
   "Kunyit, Serai, Asam Kandis, Santan", "1:1 (Daun Kunyit : Serai)",
   "Simpan segar di kulkas atau bekukan untuk mempertahankan minyak atsiri",
   "pahit", [1, 0, 0, 3, 0, 0]],
  ["SP-10", "Daun Ruku-Ruku", "Ruku-Ruku", "Ocimum tenuiflorum", "Daun Aromatik", "daun", "Indonesia", -0.5, 101.4,
   "Eugenol, Methyl eugenol, Caryophyllene", "Harum seperti kemangi dan cengkih",
   "Tambahkan di akhir pemasakan gulai/ikan agar tidak layu berlebih",
   "Kunyit, Asam Kandis, Cabai Rawit, Serai", "2:1 (Ruku-Ruku : Kemangi)",
   "Gunakan segar secepatnya atau simpan di kulkas dengan tisu lembap ringan",
   "pedas", [1, 0, 0, 2, 2, 0]],
  ["SP-11", "Kemangi", "Kemangi", "Ocimum basilicum", "Daun Aromatik", "daun", "Indonesia", -6.2, 106.8,
   "Linalool, Estragole, Eugenol", "Segar, anisat, manis herbal",
   "Masukkan tepat sebelum api dimatikan atau sajikan mentah sebagai lalapan",
   "Cabai Rawit, Jahe, Serai, Jeruk Limau", "3:1 (Kemangi : Cabai Rawit)",
   "Simpan segar pada suhu ruang berair atau kulkas bagian sayur selama 2-3 hari",
   "manis", [3, 0, 0, 1, 0, 0]],
  ["SP-12", "Pandan Wangi", "Pandan", "Pandanus amaryllifolius", "Daun Aromatik", "daun", "Indonesia", -7.3, 112.7,
   "2-Acetyl-1-pyrroline (2AP)", "Manis floral, wangi",
   "Simpulkan daun pandan dan rebus bersama santan, beras, atau gula aren",
   "Gula Aren, Santan, Kayu Manis, Kapulaga", "2:1 (Pandan : Gula Aren)",
   "Simpan di kulkas dalam wadah tertutup atau bekukan irisan daunnya",
   "manis", [5, 0, 0, 0, 0, 0]],
  ["SP-13", "Andaliman", "Andaliman", "Zanthoxylum acanthopodium", "Biji / Buah Rempah", "biji", "Sumatera Utara", 2.3, 99.0,
   "Sanshool, Citronellal, Limonene", "Kebas sitrus, pedas tajam",
   "Giling kasar atau ulek bersama bumbu dan tambahkan menjelang matang agar efek kebas bertahan",
   "Kecombrang, Kunyit, Bawang Putih, Cabai Rawit", "1:2 (Andaliman : Cabai)",
   "Simpan dalam toples kedap udara di tempat sejuk/freezer untuk menjaga efek kebas",
   "pedas", [0, 2, 0, 1, 7, 0]],
  ["SP-14", "Kecombrang", "Kecombrang", "Etlingera elatior", "Bunga Rempah", "bunga", "Sumatera & Jawa", -2.0, 105.0,
   "Dodecanal, Dodecanol, Pinene", "Bunga segar, asam segar",
   "Iris tipis mentah untuk sambal/sambal matah atau tumis singkat di akhir masakan",
   "Serai, Bawang Merah, Cabai Rawit, Andaliman", "2:1 (Kecombrang : Serai)",
   "Simpan utuh di kulkas dan potong sesaat sebelum digunakan agar tidak menghitam",
   "asam", [1, 4, 0, 1, 1, 0]],
  ["SP-15", "Kluwek", "Kluwek", "Pangium edule", "Biji Fermentasi", "biji", "Jawa Timur", -7.5, 112.5,
   "Pyrazines, Aldehydes, Organic acids", "Gurih pekat fermentasi, earthy",
   "Uji rasa setiap butir sebelum diolah, sangrai/kukus dan haluskan lalu tumis hingga matang",
   "Ketumbar, Kencur, Lengkuas, Daun Jeruk", "3:1 (Kluwek : Ketumbar)",
   "Simpan daging buah kluwek yang sudah dihaluskan di kulkas/freezer dalam wadah kedap",
   "umami", [0, 0, 1, 3, 0, 9]],
  ["SP-16", "Kapulaga Hijau", "Kapulaga", "Elettaria cardamomum", "Biji / Polong Rempah", "global", "India", 20.6, 78.9,
   "1,8-Cineole, alpha-Terpinyl acetate", "Manis harum, sitrus, mentol",
   "Memarkan polong atau sangrai kering sebentar lalu giling sebelum masuk ke kuah/kari",
   "Kayu Manis, Cengkeh, Jintan, Saffron", "1:2 (Kapulaga : Kayu Manis)",
   "Simpan polong utuh dalam wadah kedap udara dan giling hanya saat akan dipakai",
   "manis", [5, 0, 0, 1, 1, 0]],
  ["SP-17", "Jintan", "Jintan", "Cuminum cyminum", "Biji Rempah", "global", "India", 22.0, 79.0,
   "Cuminaldehyde, gamma-Terpinene", "Earthy hangat, sedikit getir",
   "Sangrai kering (dry roasting) hingga harum sebelum digiling halus",
   "Ketumbar, Kunyit, Kapulaga, Kayu Manis", "1:2 (Jintan : Ketumbar)",
   "Simpan biji utuh di tempat kering dan kedap udara; hindari panas berlebih saat menyimpan",
   "pahit", [0, 0, 0, 4, 2, 1]],
  ["SP-18", "Sichuan Pepper", "Lada Sichuan", "Zanthoxylum simulans", "Biji / Kulit Buah", "global", "Cina", 30.6, 104.1,
   "Hydroxy-alpha-sanshool, Limonene", "Kebas, sitrus, floral",
   "Sangrai kering sebentar, tumbuk kasar, dan taburkan di akhir agar efek mala tetap terasa",
   "Bunga Lawang, Jahe, Cabai Kering, Doubanjiang", "1:2 (Sichuan Pepper : Cabai)",
   "Simpan di wadah kedap udara jauh dari kelembapan agar aroma sitrus-kebas tidak pudar",
   "pedas", [0, 2, 0, 1, 7, 0]],
  ["SP-19", "Star Anise", "Bunga Lawang", "Illicium verum", "Bunga / Buah Rempah", "global", "Cina", 23.1, 108.3,
   "trans-Anethole, Limonene", "Manis licorice, hangat",
   "Rebus perlahan dalam kaldu/braising atau sangrai ringan bersama rempah utuh lain",
   "Kayu Manis, Cengkeh, Jahe, Lada Sichuan", "1:2 (Star Anise : Kayu Manis)",
   "Simpan kelopak utuh di toples kedap udara pada suhu ruang yang sejuk dan kering",
   "manis", [6, 0, 0, 1, 0, 0]],
  ["SP-20", "Saffron", "Saffron", "Crocus sativus", "Bunga (Stigma)", "global", "Iran", 32.4, 53.7,
   "Safranal, Crocin, Picrocrocin", "Floral, madu, sedikit getir",
   "Infuskan putik saffron dalam air hangat atau kaldu selama 10-15 menit sebelum dituang",
   "Kapulaga, Kayu Manis, Lemon, Beras Basmati", "0.2:100 (Saffron : Bahan Utama)",
   "Simpan benang saffron di wadah gelap dan kedap udara; hindari cahaya dan udara",
   "manis", [4, 0, 0, 3, 0, 1]],
  ["SP-21", "Sumac", "Sumac", "Rhus coriaria", "Buah Kering", "global", "Iran", 35.7, 51.4,
   "Malic acid, Citric acid, Pinene", "Asam segar seperti lemon",
   "Taburkan langsung di akhir penyajian atau campur ke marinasi/salad tanpa pemanasan tinggi",
   "Jintan, Mint Kering, Bawang Putih, Minyak Zaitun", "2:1 (Sumac : Jintan)",
   "Simpan bubuk sumac di tempat kedap udara, sejuk, dan terlindung dari cahaya",
   "asam", [0, 8, 1, 1, 0, 0]],
  ["SP-22", "Paprika Asap", "Paprika Asap", "Capsicum annuum", "Buah Kering Asap", "global", "Spanyol", 40.4, -3.7,
   "Capsaicin, Guaiacol, Syringol", "Asap, manis hangat",
   "Tumis singkat dengan minyak/kaldu hangat dan jangan gosongkan agar tidak pahit",
   "Bawang Putih, Jintan, Saffron, Rosemary", "2:1 (Paprika Asap : Jintan)",
   "Simpan di tempat sejuk dan gelap; ganti bila warna dan aroma asap memudar",
   "manis", [4, 0, 0, 1, 1, 2]],
  ["SP-23", "Allspice", "Allspice", "Pimenta dioica", "Buah Kering", "global", "Jamaika", 18.1, -77.3,
   "Eugenol, Methyl eugenol, Cineole", "Campuran cengkih, kayu manis, pala",
   "Giling segar untuk bumbu marinasi/jerk atau rebus utuh dalam kaldu dan saus",
   "Scotch Bonnet, Thyme, Kayu Manis, Pala", "1:1 (Allspice : Thyme)",
   "Simpan beri utuh di toples kedap udara; giling secukupnya saat dibutuhkan",
   "manis", [4, 0, 0, 1, 2, 0]],
  ["SP-24", "Achiote", "Achiote", "Bixa orellana", "Biji (Annatto)", "global", "Meksiko", 23.6, -102.5,
   "Bixin, Norbixin, Ishwarane", "Earthy, kacang, warna merah oranye",
   "Ekstrak ke dalam minyak hangat atau haluskan menjadi pasta bersama jeruk nipis & oregano",
   "Oregano Meksiko, Jintan, Bawang Putih, Jeruk Nipis", "2:1 (Achiote : Oregano)",
   "Simpan biji/pasta achiote di wadah tertutup rapat pada tempat sejuk dan kering",
   "pahit", [1, 0, 0, 3, 0, 1]],
  ["SP-25", "Kayu Manis", "Kayu Manis", "Cinnamomum verum", "Kulit Batang", "global", "Indonesia / Sri Lanka", -1.8, 101.5,
   "Cinnamaldehyde, Eugenol, Linalool", "Manis hangat berkayu, lembut",
   "Rebus batang utuh dalam kuah/kaldu atau sangrai dan giling halus untuk blend rempah",
   "Cengkeh, Kapulaga, Bunga Lawang, Pala", "2:1 (Kayu Manis : Cengkeh)",
   "Simpan gulungan batang kayu manis di wadah kedap udara pada suhu ruang yang kering",
   "manis", [5, 0, 0, 1, 1, 0]],
];

const spiceId = {};
for (const [code, name, shortName, botName, part, type, origin, lat, lng, aroma, profile, actTech, pairing, ratio, storage, domPillar, s] of spices) {
  const r = await q(
    `INSERT INTO spices (code,name,short_name,botanical_name,plant_part,type,origin,lat,lng,
      aroma_compounds,profile,activation_tech,pairing_spices,blending_ratio,storage_notes,
      dominant_pillar,manis,asam,asin,pahit,pedas,umami)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
     RETURNING id`,
    [code, name, shortName, botName, part, type, origin, lat, lng, aroma, profile, actTech, pairing, ratio, storage, domPillar, ...s]
  );
  spiceId[name] = r.rows[0].id;
}

// ---------- 5. FORMULA SPICE BLENDING ICE MASTERCLASS ----------
const blends = [
  ["BLD-01", "Basa Genep Bali Modern", "Nusantara & Regional",
   "Kunyit 25%, Kencur 20%, Lengkuas 15%, Jahe 15%, Serai 15%, Daun Jeruk 10%",
   "Sangrai kering biji/rempah sangrai, haluskan pasta dengan minyak kelapa, lalu blooming suhu sedang",
   "Kompleks, hangat-segar, sitrus-earthy dengan keseimbangan pedas dan asam",
   "Ayam Betutu, Sate Lilit, Ikan Bakar Jimbaran"],
  ["BLD-02", "Garam Masala Klasik", "Global Spice Blends",
   "Ketumbar 35%, Jintan 25%, Kapulaga Hijau 15%, Kayu Manis 15%, Cengkeh 10%",
   "Dry roasting bertahap hingga beraroma, dinginkan, giling halus, dan tambahkan di akhir masakan",
   "Hangat, manis aromatik, sedikit getir dengan lapisan kompleksitas tinggi",
   "Chicken Tikka Masala, Chicken Biryani, Butter Chicken"],
  ["BLD-03", "Five-Spice Timur (Wu Xiang Fen)", "Global Spice Blends",
   "Bunga Lawang 30%, Kayu Manis 25%, Lada Sichuan 20%, Adas/Jintan 15%, Cengkeh 10%",
   "Sangrai ringan tanpa menghanguskan, giling halus, lalu tumis cepat dengan minyak/kaldu",
   "Manis licorice, kebas lembut, hangat dan dalam untuk hidangan panggang/braised",
   "Red Braised Pork Belly, Peking Duck, Beef Noodle Soup"],
  ["BLD-04", "Ras el Hanout Maghrebi", "Global Spice Blends",
   "Jintan 25%, Ketumbar 20%, Kayu Manis 15%, Jahe 15%, Kapulaga 10%, Saffron/Paprika 15%",
   "Blooming perlahan dalam minyak zaitun sebelum memasukkan protein dan cairan kaldu",
   "Eksotis, floral-hangat, manis-earthy dengan aroma lapisan rempah yang kaya",
   "Moroccan Lamb Tagine, Spiced Couscous, hidangan panggang"],
  ["BLD-05", "Jamaica Jerk Marinade Blend", "Global Spice Blends",
   "Allspice 35%, Thyme/Oregano 25%, Pala & Kayu Manis 15%, Cabai Pedas 15%, Bawang & Jeruk 10%",
   "Haluskan menjadi pasta marinasi basah, diamkan minimal 4 jam, lalu panggang dengan efek asap",
   "Pedas hangat, aromatik kayu manis-cengkih, segar asam dan berasap",
   "Jamaican Jerk Chicken, iga panggang, sayuran bakar"],
  ["BLD-06", "Bumbu Rendang & Kalio Nusantara", "Nusantara & Regional",
   "Lengkuas 25%, Kunyit & Daun Kunyit 20%, Serai 15%, Pala & Cengkeh 15%, Cabai & Kemiri 25%",
   "Tumis bumbu halus hingga pecah minyak, masak perlahan bersama santan hingga mengering",
   "Kaya umami-manis-pedas, wangi daun aromatik dan rempah hangat yang pekat",
   "Rendang Daging Minang, Gulai/Kalio, olahan daging berkuah kental"],
];

for (const [code, name, cat, ratio, method, sensory, apps] of blends) {
  await q(
    `INSERT INTO spice_blends (code,name,curriculum_cat,composition_ratio,prep_method_ice,sensory_profile,dish_applications)
     VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (code) DO NOTHING`,
    [code, name, cat, ratio, method, sensory, apps]
  );
}

// ---------- 6. METODE MASTERCLASS ICE ----------
const methods = [
  ["Tahap 1: Persiapan & Anatomi", "Kontrol Ukuran Partikel & Kesegaran",
   "Menentukan luas permukaan kontak rempah melalui pemotongan, pengirisan, atau penggilingan sesuai tingkat kekerasan jaringan.",
   "Mengiris tipis lengkuas dan jahe untuk kaldu bening vs menghaluskan bumbu dasar untuk rendang/rawon."],
  ["Tahap 2: Aktivasi Termal", "Toasting, Blooming & Charring Terkendali",
   "Mengatur suhu dan durasi pemanasan untuk melarutkan senyawa volatil dan minyak atsiri tanpa memicu rasa pahit gosong.",
   "Menyangrai ketumbar dan jintan sebelum digiling atau melakukan blooming bumbu halus dalam minyak hangat."],
  ["Tahap 3: Arsitektur Keseimbangan Rasa", "Pemetaan 6 Pilar Dominan Rasa",
   "Menyeimbangkan dominan rasa (manis, asam, asin, pahit, pedas, umami) agar satu komponen tidak menenggelamkan yang lain.",
   "Menambahkan asam jawa/jeruk nipis untuk memotong lemak santan pada gulai atau soto."],
  ["Tahap 4: Waktu Penambahan (Timing)", "Fase Awal, Tengah & Finishing",
   "Membedakan rempah tahan panas lama (akar, kulit kayu, biji kering) dengan rempah aromatik rapuh (daun segar, kemangi, sumac).",
   "Memasukkan daun salam sejak awal rebusan, sedangkan kemangi dan perasan jeruk nipis ditambahkan menjelang saji."],
  ["Tahap 5: Evaluasi Sensorik & Plating", "Blind Tasting & Narasi Penyajian",
   "Menguji konsistensi aroma, keseimbangan rasa, serta estetika visual dan cerita asal-usul rempah di piring saji.",
   "Mencatat profil aroma pada Tasting Notes dan menata garnis rempah segar secara proporsional."],
];

for (const [stage, tech, desc, ex] of methods) {
  await q(
    `INSERT INTO masterclass_methods (curriculum_stage,technique_name,technical_desc,practical_example)
     VALUES ($1,$2,$3,$4)`,
    [stage, tech, desc, ex]
  );
}

// ---------- 7. KATALOG 100 RESEP & DOMINAN RASA (db/recipes.json) ----------
const data = JSON.parse(fs.readFileSync(new URL("../db/recipes.json", import.meta.url), "utf8"));
const rcat = {};
for (const c of data.categories) {
  rcat[c.slug] = (
    await q("INSERT INTO recipe_categories (slug,name,blurb) VALUES ($1,$2,$3) RETURNING id", [c.slug, c.name, c.blurb])
  ).rows[0].id;
}

const VALID_TASTES = new Set(["manis", "asam", "asin", "pahit", "pedas", "umami"]);
const inferTaste = (taste, spicesArr) => {
  if (taste && VALID_TASTES.has(String(taste).toLowerCase())) {
    return String(taste).toLowerCase();
  }
  const joined = (spicesArr || []).join(" ").toLowerCase();
  if (/asam|jeruk|lemon|cuka|sumac|belimbing|kecombrang|serai/.test(joined)) return "asam";
  if (/cabai|lada|jahe|lengkuas|kencur|andaliman|sichuan|szechuan|cengkeh/.test(joined)) return "pedas";
  if (/gula|kayu manis|pala|bunga lawang|star anise|kapulaga|saffron|paprika|manis/.test(joined)) return "manis";
  if (/kunyit|jintan|salam|oregano|achiote|annatto/.test(joined)) return "pahit";
  return "umami";
};

const norm = (t) => String(t || "").toLowerCase().replace(/[^a-z\s]/g, " ");
let linked = 0;

for (const r of data.recipes) {
  const spicesArr = Array.isArray(r.spices) ? r.spices : [];
  const domTaste = inferTaste(r.dominant_taste, spicesArr);
  const ins = await q(
    `INSERT INTO recipes (dataset_id,name,category_id,region,country,minutes,difficulty,dominant_taste,
      spices_text,description,tools,ingredients,steps,overview,authenticity,image_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING id`,
    [
      r.dataset_id,
      r.name,
      rcat[r.category] ?? null,
      r.region,
      r.country,
      r.minutes,
      r.difficulty,
      domTaste,
      spicesArr.join(", "),
      r.description,
      r.tools,
      r.ingredients,
      r.steps,
      r.overview,
      r.authenticity,
      r.image,
    ]
  );

  const text = " " + norm(spicesArr.join(" ")) + " ";
  for (const [name, id] of Object.entries(spiceId)) {
    const cleanName = norm(name).trim();
    if (cleanName && text.includes(" " + cleanName + " ")) {
      await q("INSERT INTO recipe_spices (recipe_id,spice_id) VALUES ($1,$2) ON CONFLICT DO NOTHING", [ins.rows[0].id, id]);
      linked++;
    }
  }
}
console.log(`${data.recipes.length} resep diimpor (dengan dominant_taste), ${linked} relasi resep-rempah.`);

// ---------- 8. PENGARUH REMPAH PADA MASAKAN ----------
const effects = [
  ["serai", "asam", "Memberi aroma sitrus segar dan menyeimbangkan kuah berlemak."],
  ["jahe", "pedas", "Menghangatkan dan menajamkan rasa, sekaligus menetralkan bau amis atau prengus."],
  ["lengkuas", "pedas", "Memberi aroma tajam-segar dan karakter pedas hangat yang bertahan saat dimasak lama."],
  ["kunyit", "pahit", "Memberi warna kuning, aroma earthy, dan sedikit getir yang membulatkan bumbu dasar."],
  ["kencur", "pedas", "Aroma kamper segar dengan rasa pedas ringan yang khas pada masakan Jawa."],
  ["ketumbar", "manis", "Aroma hangat, sedikit manis-sitrus; fondasi banyak bumbu halus."],
  ["jintan", "pahit", "Earthy hangat dengan sedikit getir; memberi kedalaman pada kari dan gulai."],
  ["kayu manis", "manis", "Manis hangat beraroma kayu; melembutkan kuah santan dan daging."],
  ["cengkeh", "pedas", "Aroma tajam menyengat; sedikit saja sudah memberi karakter hangat yang dominan."],
  ["pala", "manis", "Manis hangat dan sedikit pahit; memperkaya kuah daging dan santan."],
  ["kemiri", "umami", "Memberi tekstur kental dan rasa gurih berlemak pada bumbu halus."],
  ["bunga lawang", "manis", "Manis beraroma adas manis (licorice); memberi kedalaman pada kuah dan daging."],
  ["star anise", "manis", "Manis beraroma licorice; khas pada braising dan kuah kaldu Asia Timur."],
  ["daun jeruk", "asam", "Aroma sitrus tajam; mengangkat kesegaran masakan bersantan atau berlemak."],
  ["daun salam", "pahit", "Herbal lembut dengan sedikit getir; memberi aroma dasar pada tumisan dan kuah."],
  ["daun kunyit", "pahit", "Aroma earthy-harum yang lembut; khas pada rendang dan gulai."],
  ["kemangi", "manis", "Segar dan anisat; ditambahkan di akhir agar aroma tidak hilang."],
  ["pandan", "manis", "Manis floral yang wangi; menambah aroma pada nasi, kuah, dan kudapan."],
  ["cabai", "pedas", "Sumber rasa pedas; tingkat kepedasan mengubah karakter seluruh hidangan."],
  ["terasi", "umami", "Umami fermentasi yang pekat; menambah kedalaman rasa dan aroma khas."],
  ["asam jawa", "asam", "Asam segar yang memotong rasa berlemak dan menyeimbangkan manis-pedas."],
  ["asam kandis", "asam", "Asam tajam beraroma khas; khas pada masakan Sumatera."],
  ["gula aren", "manis", "Manis karamel yang lembut; membulatkan bumbu pedas dan gurih."],
  ["kecap", "manis", "Manis-gurih pekat; memberi warna dan lapisan umami."],
  ["santan", "manis", "Gurih berlemak yang membawa dan melembutkan aroma rempah."],
  ["kluwek", "umami", "Gurih pekat berwarna hitam hasil fermentasi; jiwa dari rawon."],
  ["kecombrang", "asam", "Aroma bunga segar dengan asam lembut; mengangkat masakan ikan dan sambal."],
  ["andaliman", "pedas", "Memberi sensasi kebas citrus yang unik, khas masakan Batak."],
  ["sichuan", "pedas", "Sensasi kebas (mala) dengan aroma sitrus-floral yang kuat."],
  ["saffron", "manis", "Aroma floral-madu dan warna emas; sedikit helai sudah mengubah karakter hidangan."],
  ["paprika", "manis", "Manis hangat dengan sentuhan asap; memberi warna merah dan kedalaman."],
  ["garam masala", "pedas", "Campuran rempah hangat yang memberi lapisan aroma kompleks pada kari."],
  ["kapulaga", "manis", "Manis harum dengan sentuhan mentol; menyegarkan kuah dan nasi berbumbu."],
  ["lada", "pedas", "Pedas tajam yang berbeda dari cabai; menghangatkan di akhir suapan."],
  ["bawang putih", "umami", "Aroma gurih tajam yang menjadi fondasi hampir semua bumbu dasar."],
  ["bawang merah", "manis", "Manis gurih ketika ditumis; membangun dasar rasa bumbu halus."],
  ["jeruk nipis", "asam", "Asam segar yang mencerahkan dan menyeimbangkan rasa di akhir."],
  ["lemon", "asam", "Asam segar beraroma sitrus; mencerahkan daging dan marinasi."],
  ["oregano", "pahit", "Herbal hangat sedikit pahit; khas masakan Mediterania dan Meksiko."],
  ["achiote", "pahit", "Earthy beraroma kacang dengan warna merah-oranye; khas masakan Meksiko."],
  ["annatto", "pahit", "Earthy beraroma kacang dengan warna merah-oranye; khas masakan Meksiko."],
  ["allspice", "manis", "Perpaduan aroma cengkih, kayu manis, dan pala; khas jerk Jamaika."],
  ["sumac", "asam", "Asam segar seperti lemon tanpa air; dipakai untuk menaburi di akhir."],
  ["mirin", "manis", "Manis lembut khas Jepang; membulatkan rasa asin-umami."],
  ["shoyu", "umami", "Asin-umami fermentasi yang menjadi dasar rasa masakan Jepang."],
  ["kecap asin", "asin", "Asin-umami fermentasi; menguatkan rasa gurih tanpa banyak garam."],
];
for (const [k, p, e] of effects) {
  await q("INSERT INTO spice_effects (keyword,pillar,effect) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING", [k, p, e]);
}

console.log("Seed selesai. Akun demo:");
console.log("  admin@niskalarasa.id / admin123");
console.log("  teacher@niskalarasa.id / teacher123");
console.log("  student@niskalarasa.id / student123");
console.log("  pending@niskalarasa.id / pending123 (pendaftar Teacher, status pending)");
await pool.end();
