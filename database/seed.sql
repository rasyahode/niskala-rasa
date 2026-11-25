-- 1. Bersihkan data lama agar bersih & tidak duplikat saat seed ulang
TRUNCATE TABLE
  lesson_progress,
  enrollments,
  recipes,
  classes,
  students,
  teachers,
  admins,
  users
RESTART IDENTITY CASCADE;

-- 2. Akun Awal Pengguna (Admin, 5 Teacher, 1 Student)
INSERT INTO users (full_name, email, password_hash, role, status, is_approved) VALUES
  ('Admin Utama Niskala Rasa Indonesia', 'admin@gmail.com', 'admin123', 'admin', 'approved', TRUE),
  ('Raka Pratama Wijaya Kusuma Putra', 'raka@gmail.com', 'Raka123', 'teacher', 'approved', TRUE),
  ('Sari Dewi Lestari Putri Andini', 'sari@gmail.com', 'Sari123', 'teacher', 'approved', TRUE),
  ('Dimas Aditya Nugraha Pratama Jaya', 'dimas@gmail.com', 'dimas123', 'teacher', 'approved', TRUE),
  ('Maya Kartika Sari Dewi Permata', 'maya@gmail.com', 'maya123', 'teacher', 'approved', TRUE),
  ('Tari Rahmawati Putri Kusuma Ningrum', 'tari@gmail.com', 'tari123', 'teacher', 'approved', TRUE),
  ('Putri Lestari Kusuma Wardani', 'putri@gmail.com', 'putri123', 'student', 'approved', TRUE);

INSERT INTO admins (user_id)
SELECT id FROM users WHERE email = 'admin@gmail.com';

INSERT INTO teachers (user_id, specialization, teacher_tier, verified_at)
SELECT id, 'Makanan Berkuah', 'Senior', CURRENT_TIMESTAMP FROM users WHERE email = 'raka@gmail.com'
UNION ALL
SELECT id, 'Makanan Tidak Berkuah', 'Senior', CURRENT_TIMESTAMP FROM users WHERE email = 'sari@gmail.com'
UNION ALL
SELECT id, 'Camilan Kering', 'Senior', CURRENT_TIMESTAMP FROM users WHERE email = 'dimas@gmail.com'
UNION ALL
SELECT id, 'Minuman Tradisional', 'Senior', CURRENT_TIMESTAMP FROM users WHERE email = 'maya@gmail.com'
UNION ALL
SELECT id, 'Camilan Basah', 'Senior', CURRENT_TIMESTAMP FROM users WHERE email = 'tari@gmail.com';

INSERT INTO students (user_id, skill_level)
SELECT id, 'Murid Terdaftar' FROM users WHERE email = 'putri@gmail.com';

-- 3. 5 Kategori Kelas (dish_type & teacher_id mengarah ke teachers.id)
INSERT INTO classes (category_name, dish_type, title, recipe_description, teacher_id, status)
SELECT 'Makanan Berkuah', 'berkuah', 'Kelas Makanan Berkuah', 'Pembelajaran masakan berkuah Nusantara dan teknik pengolahan bumbu/rempah.', t.id, 'active'
FROM teachers t JOIN users u ON t.user_id = u.id WHERE u.email = 'raka@gmail.com'
UNION ALL
SELECT 'Makanan Tidak Berkuah', 'tidak_berkuah', 'Kelas Makanan Tidak Berkuah', 'Pembelajaran masakan tumis, goreng, bakar, dan sambal Nusantara.', t.id, 'active'
FROM teachers t JOIN users u ON t.user_id = u.id WHERE u.email = 'sari@gmail.com'
UNION ALL
SELECT 'Camilan Kering', 'camilan_kering', 'Kelas Camilan Kering', 'Pembelajaran camilan kering dan kue kering berbumbu/rempah Nusantara.', t.id, 'active'
FROM teachers t JOIN users u ON t.user_id = u.id WHERE u.email = 'dimas@gmail.com'
UNION ALL
SELECT 'Minuman', 'minuman', 'Kelas Minuman Tradisional', 'Pembelajaran wedang, jamu, dan minuman rempah tradisional Nusantara.', t.id, 'active'
FROM teachers t JOIN users u ON t.user_id = u.id WHERE u.email = 'maya@gmail.com'
UNION ALL
SELECT 'Camilan Basah', 'camilan_basah', 'Kelas Camilan Basah', 'Pembelajaran jajanan dan camilan basah tradisional Nusantara.', t.id, 'active'
FROM teachers t JOIN users u ON t.user_id = u.id WHERE u.email = 'tari@gmail.com';

-- 4. 50 Resep Lengkap (10 per Kategori)
INSERT INTO recipes (
  title, dish_type, portion_estimate, dominant_taste, key_spice,
  summary, spice_technique, ingredients, instructions, video_url, image_url
) VALUES
-- KATEGORI I: MAKANAN BERKUAH (1-10)
(
  'Gulai Kambing Bumbu Adas', 'berkuah', '4–5 Porsi', 'Manis', 'Adas (Foeniculum vulgare)',
  'Olahan gulai kambing berkuah santan gurih beraroma manis hangat biji adas sangrai.',
  'Sangrai biji adas kering di wajan tanpa minyak dengan api sangat kecil selama 1–2 menit hingga tercium aroma manis seperti licorice dan warnanya sedikit kecokelatan, lalu haluskan bersama bumbu lain agar minyak atsirinya keluar maksimal dan tidak langu.',
  '500 gr daging kambing (potong dadu 3x3 cm), 1 sdm biji adas kering (sangrai, haluskan), 500 ml santan sedang, 250 ml air kaldu, Bumbu Halus: 7 bawang merah, 4 bawang putih, 3 kemiri sangrai, 3 cm kunyit bakar, 2 cm jahe, 1/2 sdt ketumbar sangrai, 1/2 sdt lada putih. Bumbu Aromatik: 1 serai memar, 3 cm lengkuas memar, 2 daun salam, 3 daun jeruk, 2 cm kayu manis, 2 cengkeh, 1.5 sdt garam, 1 sdt gula merah sisir, 3 sdm minyak goreng.',
  '1. Tumis bumbu halus bersama biji adas halus, serai, lengkuas, daun salam, daun jeruk, kayu manis, dan cengkeh selama 5–7 menit hingga matang dan pecah minyak. 2. Masukkan daging kambing, aduk 5 menit hingga berubah warna. 3. Tuang 250 ml air, tutup panci dan masak api kecil 20 menit. 4. Tuang 500 ml santan, garam, dan gula merah; masak sambil sesekali diaduk perlahan selama 15–20 menit hingga empuk.',
  'https://youtu.be/T0F0vClQaWI?si=wyDA01K9RxAf2lLE', '/images/recipes/01.jpg'
),
(
  'Gulai Ikan Kakap Asam Gelugur', 'berkuah', '4 Porsi', 'Asam', 'Asam Gelugur (Garcinia atroviridis)',
  'Gulai ikan kakap kuah santan kuning dengan kesegaran khas kepingan asam gelugur.',
  'Bilas kepingan asam gelugur kering dengan air hangat bersih sebelum dimasukkan ke kuah. Masukkan 3 keping utuh pada pertengahan proses memasak santan agar rasa asam segarnya keluar perlahan tanpa membuat santan pecah.',
  '500 gr ikan kakap segar (potong 4 bagian, lumuri jeruk nipis & garam), 3 keping asam gelugur kering, 500 ml santan sedang, Bumbu Halus: 8 cabai merah keriting, 4 cabai rawit merah, 7 bawang merah, 3 bawang putih, 3 cm kunyit bakar, 2 cm jahe, 2 kemiri sangrai. Bumbu Cemplung: 1 lembar daun kunyit, 1 serai memar, 2 cm lengkuas memar, 3 daun jeruk, 1.5 sdt garam, 1/2 sdt gula pasir, 2 sdm minyak goreng.',
  '1. Tumis bumbu halus bersama serai, lengkuas, daun kunyit, dan daun jeruk selama 4–5 menit hingga matang. 2. Tuang santan, aduk terus perlahan hingga mendidih agar tidak pecah. 3. Masukkan asam gelugur, garam, dan gula pasir, masak 3 menit. 4. Masukkan potongan ikan kakap, masak api kecil 10–12 menit sambil disiram kuah hingga matang lembut.',
  'https://youtu.be/RERKkrD_mnc?si=3Qj1HsmKaeTmIlCR', '/images/recipes/02.jpg'
),
(
  'Sayur Asem Segar Khas Nusantara', 'berkuah', '5–6 Porsi', 'Asam', 'Asam Jawa (Tamarindus indica)',
  'Sayur berkuah bening menyegarkan dengan perpaduan rasa asam jawa, manis gula merah, dan gurih terasi.',
  'Remas 3 sdm daging buah asam jawa dengan 100 ml air panas, lalu saring menggunakan saringan kawat halus sambil ditekan-tekan agar sarinya keluar maksimal dan biji/seratnya tidak ikut masuk ke kuah.',
  '3 sdm daging asam jawa (seduh 100 ml air panas, saring), 1.5 liter air, 100 gr buah & daun melinjo, 1 jagung manis potong, 1 labu siam potong dadu, 6 lonjor kacang panjang, 50 gr kacang tanah, Bumbu Halus: 6 bawang merah, 3 bawang putih, 4 cabai merah keriting, 1 sdt terasi bakar, 2 kemiri sangrai, 2 cm lengkuas memar, 3 daun salam, 25 gr gula merah sisir, 2 sdt garam.',
  '1. Didihkan 1.5 liter air bersama kacang tanah, buah melinjo, lengkuas, dan daun salam selama 15 menit hingga empuk. 2. Masukkan jagung manis dan bumbu halus, masak 5 menit. 3. Masukkan labu siam selama 4 menit. 4. Tuang air asam jawa, gula merah, garam, kacang panjang, dan daun melinjo; masak 3–4 menit hingga matang segar.',
  'https://youtu.be/CtOX0FLu45c?si=F_1CSEqhCH5Fi9TC', '/images/recipes/03.jpg'
),
(
  'Asam Padeh Ikan Tongkol Khas Minang', 'berkuah', '4 Porsi', 'Asam', 'Asam Kandis (Garcinia xanthochymus)',
  'Masakan ikan berkuah merah pedas-asam autentik Minang tanpa santan dan tanpa minyak tumis.',
  'Bilas kepingan asam kandis kering dan masukkan utuh ke kuah rebusan bumbu. Asam kandis memberi rasa asam pekat yang tajam namun menjaga warna merah kuah tetap bening cerah tanpa keruh.',
  '500 gr ikan tongkol segar (potong 4–5 bagian), 3 keping asam kandis kering, 750 ml air, Bumbu Halus: 100 gr cabai merah keriting giling, 8 bawang merah, 4 bawang putih, 3 cm jahe, 2 cm kunyit. Bumbu Aromatik: 1 lembar daun kunyit simpul, 1 serai memar, 3 cm lengkuas memar, 4 daun jeruk purut, 1 buah tomat merah belah 4, 1.5 sdt garam.',
  '1. Masukkan 750 ml air ke wajan bersama bumbu halus, serai, lengkuas, daun kunyit, daun jeruk, dan asam kandis. 2. Masak api sedang hingga mendidih dan kuah matang mengental selama 10 menit agar bau langu cabai hilang. 3. Masukkan ikan tongkol, garam, dan tomat; kecilkan api dan masak 12–15 menit hingga kuah menyusut mengental.',
  'https://youtu.be/7suVgaHVjZQ?si=g6qdmSAogSyr1qm8', '/images/recipes/04.jpg'
),
(
  'Kuah Masam Keu-eung Ikan Khas Aceh', 'berkuah', '4 Porsi', 'Asam', 'Asam Sunti (Averrhoa bilimbi)',
  'Hidangan ikan berkuah kuning kemerahan khas Aceh dengan cita rasa asam gurih belimbing wuluh fermentasi.',
  'Haluskan asam sunti bersama cabai dan bawang hingga benar-benar lumat. Karena asam sunti adalah belimbing wuluh yang difermentasi dengan garam, tambahkan garam pada kuah di tahap akhir setelah dicicipi agar tidak keasinan.',
  '500 gr ikan bandeng/tongkol segar (potong 4 bagian), 8 buah asam sunti khas Aceh, 650 ml air, Bumbu Halus: 10 cabai rawit, 5 cabai merah keriting, 6 bawang merah, 2 bawang putih, 2.5 cm kunyit, 1/2 sdt ketumbar. Bumbu Cemplung: 1 serai memar, 2 tangkai daun kari/temurui, 3 belimbing wuluh segar, 1/2–1 sdt garam, 1/2 sdt gula pasir.',
  '1. Haluskan asam sunti bersama cabai rawit, cabai merah, bawang merah, bawang putih, kunyit, dan ketumbar. 2. Lumuri ikan dengan setengah bumbu halus selama 10 menit. 3. Tuang 650 ml air, sisa bumbu, serai, dan daun kari ke panci ikan; masak hingga mendidih dan ikan matang selama 12 menit. 4. Masukkan belimbing wuluh, gula, dan garam; masak 2 menit.',
  'https://youtu.be/1RUTNF7CAxY?si=jikz1DALIIMqTiER', '/images/recipes/05.jpg'
),
(
  'Semur Daging Sapi Bunga Lawang', 'berkuah', '5 Porsi', 'Manis', 'Bunga Lawang / Pekak (Illicium verum)',
  'Semur daging sapi empuk berkuah kecap kental dengan keharuman bunga lawang, kayu manis, dan pala.',
  'Gunakan 2 kuntum bunga lawang utuh per 500 gr daging karena aromanya sangat kuat. Tumis bunga lawang bersama bumbu halus di awal agar aroma manis hangat mirip adas larut ke dalam minyak tumisan.',
  '500 gr daging sapi has dalam/sengkel, 2 kuntum bunga lawang utuh, 2 kentang potong goreng setengah matang, 6 sdm kecap manis, 750 ml air kaldu, Bumbu Halus: 8 bawang merah, 4 bawang putih, 3 kemiri sangrai, 1/2 sdt pala parut, 1/2 sdt lada putih, 1 cm jahe. Bumbu Aromatik: 3 cm kayu manis, 3 cengkeh, 2 daun salam, 1 tomat merah potong dadu, 1.5 sdt garam, 1 sdt gula merah, 3 sdm minyak goreng.',
  '1. Tumis bumbu halus bersama bunga lawang, kayu manis, cengkeh, dan daun salam hingga harum. 2. Masukkan daging sapi, aduk hingga berubah warna. 3. Tuang kecap manis dan tomat, aduk hingga berbuih karamel. 4. Tuang 750 ml air, garam, dan gula merah; masak api kecil 40 menit hingga empuk lalu masukkan kentang goreng selama 10 menit.',
  'https://youtu.be/jkjBwpIuc0U?si=Wg3tPlKau7tEt_9_', '/images/recipes/06.jpg'
),
(
  'Soto Ayam Kuah Kuning Segar', 'berkuah', '5–6 Porsi', 'Asam', 'Jeruk Nipis (Citrus aurantiifolia) & Kunyit',
  'Soto ayam kuah bening kuning keemasan yang kaya rempah dan segar dengan kucuran jeruk nipis.',
  'Bakar kunyit utuh di atas api kompor sebelum dikupas dan dihaluskan agar warna kuningnya cerah bersih dan tidak langu. Gelindingkan buah jeruk nipis sebelum dipotong, lalu peras langsung ke mangkuk sesaat sebelum disantap.',
  '500 gr ayam bertulang, 2 buah jeruk nipis segar, 1.7 liter air, Bumbu Halus: 7 bawang merah, 5 bawang putih, 3.5 cm kunyit bakar, 2 cm jahe, 4 kemiri sangrai, 1 sdt ketumbar sangrai, 1/2 sdt lada putih. Bumbu Aromatik: 2 serai memar, 3 cm lengkuas memar, 4 daun jeruk, 2 daun salam, 2 sdt garam, 1 sdt gula pasir, 3 sdm minyak goreng. Pelengkap: soun, kol iris, daun bawang, seledri, telur rebus, bawang goreng.',
  '1. Rebus ayam dalam 1.7 liter air selama 25 menit hingga empuk; angkat ayam, goreng sebentar lalu suwir. 2. Tumis bumbu halus bersama serai, lengkuas, daun jeruk, dan daun salam hingga tanak, lalu masukkan ke kaldu ayam dan didihkan 10 menit. 3. Tata pelengkap dan suwiran ayam di mangkuk, siram kuah panas, dan kucuri jeruk nipis.',
  'https://youtu.be/pJ-PMDJ0x38?si=34P0zJlrwhoc5-9-', '/images/recipes/07.jpg'
),
(
  'Soto Betawi Kuah Santan Kapulaga', 'berkuah', '5 Porsi', 'Manis', 'Kapulaga (Amomum compactum)',
  'Soto daging sapi khas Betawi berkuah santan gurih creamy dengan aroma khas polong kapulaga.',
  'Memarkan pelan polong kapulaga kering hingga sedikit retak terbuka (jangan hancur berkeping-keping) agar biji-biji kecil di dalamnya melepaskan aroma kamper manis yang hangat tanpa membuat kuah berpasir.',
  '500 gr daging sapi & sandung lamur (rebus empuk, potong dadu, sisihkan 1 liter kaldu), 4 butir kapulaga Jawa (memarkan pelan), 500 ml santan sedang, Bumbu Halus: 8 bawang merah, 4 bawang putih, 3 kemiri sangrai, 2 cm jahe, 1/2 sdt jintan sangrai, 1/2 sdt lada putih. Aromatik: 3 cengkeh, 3 cm kayu manis, 2 serai, 3 cm lengkuas, 3 daun salam, 3 daun jeruk, 2 sdt garam, 1 sdt gula, 3 sdm minyak samin/goreng. Pelengkap: kentang goreng, tomat, emping, jeruk limau.',
  '1. Tumis bumbu halus bersama kapulaga memar, cengkeh, kayu manis, serai, lengkuas, daun salam, dan daun jeruk hingga harum. 2. Masukkan tumisan ke 1 liter kaldu dan potongan daging, didihkan 10 menit. 3. Tuang santan, garam, dan gula; masak sambil diaduk perlahan hingga mendidih. 4. Sajikan bersama kentang goreng, tomat, emping, dan jeruk limau.',
  'https://youtu.be/YkZpAQ0AR0c?si=uYPsAJQ6lRQ3DEmZ', '/images/recipes/08.jpg'
),
(
  'Rawon Daging Sapi Khas Jawa Timur', 'berkuah', '5–6 Porsi', 'Pahit', 'Kluwek / Kepayang (Pangium edule)',
  'Sup daging sapi berkuah hitam pekat dan gurih earthy khas Jawa Timur dari fermentasi biji kluwek.',
  'Pilih buah kluwek yang terasa berat dan tidak berbunyi saat dikocok. Pecahkan cangkangnya, cicipi sedikit daging hitamnya untuk memastikan rasanya gurih (tidak pahit/tengik), lalu rendam dalam 100 ml air panas selama 15 menit sebelum dihaluskan.',
  '500 gr daging sapi sandung lamur (rebus empuk, potong dadu, sisihkan 1.5 liter kaldu), 5 buah kluwek tua (rendam 100 ml air panas), Bumbu Halus: kluwek rendam beserta airnya, 8 bawang merah, 5 bawang putih, 4 kemiri sangrai, 2 cm kunyit bakar, 2 cm jahe, 1 sdt ketumbar sangrai, 1/2 sdt terasi bakar, 1/2 sdt lada putih. Aromatik: 2 serai, 3 cm lengkuas, 5 daun jeruk, 2 daun salam, 2 sdt garam, 1 sdt gula merah, 4 sdm minyak. Pelengkap: tauge pendek, telur asin, sambal.',
  '1. Haluskan kluwek beserta air rendamannya dan seluruh bumbu halus menjadi pasta hitam. 2. Tumis pasta bumbu bersama serai, lengkuas, daun jeruk, dan daun salam selama 7–8 menit hingga matang berminyak. 3. Masukkan daging sapi rebus ke tumisan bumbu, aduk 3 menit lalu tuang ke panci kaldu; masak api kecil 20 menit. 4. Sajikan panas dengan tauge pendek dan telur asin.',
  'https://youtu.be/FiuBgHU0N9o?si=m3NgD0tlvOwwNy1l', '/images/recipes/09.jpg'
),
(
  'Sayur Bening Bayam Jagung Temu Kunci', 'berkuah', '4 Porsi', 'Manis', 'Temu Kunci (Boesenbergia rotunda)',
  'Sayur kuah bening ringan dan segar dengan aroma khas rimpang temu kunci yang menenangkan.',
  'Cuci bersih rimpang temu kunci, kerik kulit luarnya yang tipis, lalu memarkan (geprek) atau iris serong tipis sebelum direbus bersama bawang merah agar aroma segarnya keluar tanpa membuat kuah keruh.',
  '1 ikat besar (± 250 gr) bayam segar, 1 buah jagung manis (potong bulat), 3 ruas (4 cm) rimpang temu kunci (kupas kulit tipis, geprek), 4 siung bawang merah (iris tipis), 1 buah tomat merah (potong 6), 1.2 liter air bersih, 1.25 sdt garam, 1/2 sdt gula pasir.',
  '1. Didihkan 1.2 liter air bersama irisan bawang merah dan temu kunci geprek hingga harum. 2. Masukkan jagung manis, masak 6–7 menit hingga empuk. 3. Masukkan daun bayam, potongan tomat, garam, dan gula; masak sebentar 1.5–2 menit hingga bayam layu hijau cerah lalu angkat.',
  'https://youtu.be/pvwY28cOjrk?si=QfPvV8DgZbalSC4K', '/images/recipes/10.jpg'
),

-- KATEGORI II: MAKANAN TIDAK BERKUAH (11-20)
(
  'Sambal Andaliman Khas Batak', 'tidak_berkuah', '1 Mangkuk Kecil', 'Asam', 'Andaliman (Zanthoxylum acanthopodium)',
  'Sambal segar khas Tanah Batak dengan aroma sitrus tajam dan sensasi getir kelu di lidah dari buah andaliman.',
  'Gunakan buah andaliman segar berwarna hijau tua, buang tangkai kecilnya. Ulek mentah di tahap akhir tanpa dimasak lama agar minyak atsiri sitrus dan sensasi kelu (getir) di lidah tetap optimal.',
  '2 sdm penuh buah andaliman segar, 15 buah cabai rawit hijau, 6 siung bawang merah, 3 siung bawang putih, 3 butir kemiri, 1 batang serai (ambil bagian putih, iris tipis), 1 buah jeruk nipis, 3/4 sdt garam, 1/4 sdt gula pasir.',
  '1. Sangrai kemiri, bawang merah, bawang putih, dan cabai rawit di wajan kering selama 3–4 menit hingga sedikit layu. 2. Ulek bahan sangrai bersama irisan serai putih dan garam hingga setengah halus. 3. Masukkan buah andaliman segar, ulek kasar agar butirannya tetap terasa. 4. Beri gula pasir dan perasan air jeruk nipis, aduk rata.',
  'https://youtu.be/VAJhgBIjH8Y?si=yhpFmvxnDPknWCm3', '/images/recipes/11.jpg'
),
(
  'Sambal Matah Bawang Merah Khas Bali', 'tidak_berkuah', '1 Mangkuk Sedang', 'Manis', 'Bawang Merah (Allium cepa var. aggregatum)',
  'Sambal iris mentah khas Bali yang renyah segar dengan siraman minyak kelapa panas dan jeruk limau.',
  'Iris melintang bawang merah segar dengan ketebalan seragam (± 2 mm) lalu remas ringan bersama garam agar cairan pedasnya berkurang dan rasa manis alaminya keluar sebelum disiram minyak kelapa panas.',
  '12 siung bawang merah (iris tipis melintang), 8 cabai rawit merah (iris tipis), 3 batang serai bagian putih (iris sangat tipis), 5 lembar daun jeruk purut (buang tulang, iris sehalus rambut), 1 sdt terasi bakar, 1 jeruk limau, 4 sdm minyak kelapa panas, 1/2 sdt garam, 1/4 sdt gula pasir.',
  '1. Campurkan irisan bawang merah, cabai rawit, serai, daun jeruk, terasi bakar, garam, dan gula dalam mangkuk tahan panas. 2. Remas perlahan 30 detik hingga aroma menyatu. 3. Siram dengan 4 sdm minyak kelapa yang dipanaskan hingga hampir berasap. 4. Aduk cepat dan beri perasan air jeruk limau.',
  'https://youtu.be/2l43lXBBJo0?si=OH9o_-tche6ghplZ', '/images/recipes/12.jpg'
),
(
  'Ayam Goreng Bawang Putih Renyah', 'tidak_berkuah', '4–5 Porsi', 'Manis', 'Bawang Putih (Allium sativum)',
  'Ayam goreng garing berbumbu marinasi ketumbar yang digoreng bersama satu bonggol bawang putih geprek berkulit.',
  'Geprek 1 bonggol bawang putih utuh tanpa dikupas kulit arinya, diamkan 10 menit sebelum digoreng. Kulit ari melindungi daging bawang putih agar matang lembut seperti kacang panggang tanpa gosong pahit.',
  '600 gr sayap/paha bawah ayam, 1 bonggol (10–12 siung) bawang putih utuh (geprek berkulit), Bumbu Marinasi Halus: 6 bawang putih kupas, 1 sdm ketumbar sangrai, 1 cm kunyit, 1 sdt garam, 1/2 sdt kaldu ayam bubuk, 1/2 sdt lada putih, 2.5 sdm tepung tapioka, 2 sdm air matang, minyak goreng.',
  '1. Lumuri ayam dengan bumbu marinasi halus, tepung tapioka, dan 2 sdm air; diamkan di kulkas minimal 30 menit. 2. Goreng ayam dalam minyak panas api sedang selama 8–10 menit hingga setengah matang. 3. Masukkan bawang putih geprek berkulit, goreng bersama 4–5 menit hingga ayam keemasan renyah dan bawang putih harum.',
  'https://youtu.be/SaRB7P1pWmQ?si=K2tOUozdwvr0_cJb', '/images/recipes/13.jpg'
),
(
  'Telur Balado Khas Padang', 'tidak_berkuah', '6 Porsi', 'Pedas', 'Cabai Merah (Capsicum annuum)',
  'Telur rebus goreng berkulit keriput yang dibalut sambal lado merah tumbuk kasar khas Minang.',
  'Tumbuk kasar cabai merah keriting bersama bawang merah (jangan diblender terlalu halus berair) lalu tumis dengan minyak cukup menggunakan api sedang hingga keluar minyak merah yang mengilap.',
  '6 butir telur ayam rebus (kupas, goreng hingga berkulit keriput), Bumbu Tumbuk Kasar: 15 cabai merah keriting, 4 cabai merah besar, 8 bawang merah, 2 bawang putih, 1 tomat merah kecil, 2 lembar daun jeruk sobek, 1/2 sdt air jeruk nipis, 3/4 sdt garam, 1/2 sdt gula pasir, 5 sdm minyak goreng.',
  '1. Ulek kasar cabai merah keriting, cabai besar, bawang merah, bawang putih, dan tomat. 2. Tumis bumbu tumbuk dan daun jeruk dengan 5 sdm minyak api sedang selama 6–8 menit hingga matang tanak dan keluar minyak merah cerah. 3. Bumbui garam, gula, dan air jeruk nipis, masukkan telur goreng dan aduk rata.',
  'https://youtu.be/l4DJWeo-hXA?si=EXuEvRV3EW_FjNXZ', '/images/recipes/14.jpg'
),
(
  'Ayam Tangkap Daun Kari Khas Aceh', 'tidak_berkuah', '4–5 Porsi', 'Manis', 'Daun Kari / Temurui (Murraya koenigii)',
  'Potongan ayam kampung goreng garing yang tersembunyi di bawah remahan renyah daun kari, pandan, dan cabai hijau.',
  'Lepaskan helai daun kari dari tangkainya, lalu goreng langsung dalam minyak panas bersama ayam pada 3 menit terakhir agar daun kari berubah menjadi remah keripik hijau yang gurih renyah.',
  '1 ekor (± 800 gr) ayam kampung muda (potong kecil 16–20 bagian), 5 tangkai daun kari/temurui segar, 3 lembar daun pandan (potong kasar 3 cm), 8 cabai hijau keriting (belah dua), 6 bawang merah iris tipis, Bumbu Halus: 5 bawang putih, 3 cm kunyit, 2 cm jahe, 1 sdt ketumbar sangrai, 3 kemiri, 1.5 sdt garam, 1 sdm air jeruk nipis, minyak goreng.',
  '1. Lumuri potongan ayam dengan air jeruk nipis dan bumbu halus, diamkan 30 menit. 2. Goreng ayam dalam minyak panas api sedang 10–12 menit hingga hampir matang. 3. Masukkan daun kari, daun pandan, cabai hijau belah, dan bawang merah iris; goreng bersama 3–4 menit hingga dedaunan garing hijau tua dan ayam matang renyah.',
  'https://youtu.be/0er-IM7bPhk?si=IwLnWHRAULc_0veb', '/images/recipes/15.jpg'
),
(
  'Nasi Bakar Ayam Suwir Kemangi', 'tidak_berkuah', '4 Bungkus', 'Asam', 'Daun Kemangi (Ocimum basilicum)',
  'Nasi gurih santan berisi tumisan ayam suwir pedas dan daun kemangi segar yang dibungkus daun pisang lalu dibakar.',
  'Petik pucuk daun kemangi segar, cuci dan tiriskan. Campurkan daun kemangi ke tumisan ayam suwir sesaat setelah api dimatikan agar daun tetap segar dan harum saat nasi dibakar.',
  'Nasi Gurih: 400 gr beras, 400 ml santan encer, 2 serai, 3 daun salam, 1 sdt garam (masak matang). Isian: 300 gr dada ayam rebus suwir, 2 ikat daun kemangi segar, Bumbu Halus: 7 bawang merah, 4 bawang putih, 8 cabai merah keriting, 5 cabai rawit merah, 2 kemiri sangrai, 2 cm kunyit, 1 serai memar, 3 daun jeruk iris tipis, 100 ml kaldu ayam, 1 sdt garam, 1 sdt gula, 2 sdm minyak. Daun pisang & tusuk gigi.',
  '1. Tumis bumbu halus isian, serai, dan daun jeruk hingga harum. 2. Masukkan ayam suwir, kaldu, garam, dan gula; masak hingga kering meresap lalu matikan api dan aduk dengan daun kemangi segar. 3. Tata nasi gurih dan isian ayam di atas daun pisang, gulung padat, semat lidi, dan bakar di atas teflon panas 5–7 menit.',
  'https://youtu.be/fepp7pV-QfM?si=KvPfj8nMLzWbgPzN', '/images/recipes/16.jpg'
),
(
  'Sambal Kecombrang Teri Medan', 'tidak_berkuah', '1 Mangkuk Sedang', 'Asam', 'Kecombrang / Honje (Etlingera elatior)',
  'Sambal tumis aromatik perpaduan kuntum bunga kecombrang segar dengan gurih renyahnya teri medan goreng.',
  'Buang kelopak bagian luar bunga kecombrang yang keras dan berserat, ambil bagian kuntum dalam yang muda dan merah muda cerah. Iris tipis lalu remas sebentar dengan sedikit garam untuk mengurangi getah sebelum ditumis.',
  '2 kuntum bunga kecombrang muda (iris sangat tipis), 75 gr teri medan nasi (goreng garing), 12 cabai rawit merah iris, 5 cabai merah keriting iris, 8 bawang merah iris, 4 bawang putih iris, 3 daun jeruk iris halus, 1/2 sdt terasi bakar, 1/2 sdt garam, 1 sdt gula pasir, 4 sdm minyak goreng.',
  '1. Remas irisan bunga kecombrang dengan 1/4 sdt garam selama 30 detik, bilas cepat dan tiriskan. 2. Tumis bawang merah dan bawang putih hingga harum kekuningan, masukkan cabai, daun jeruk, dan terasi bakar. 3. Masukkan irisan kecombrang, sisa garam, dan gula; aduk cepat 2 menit. 4. Matikan api, tunggu uap berkurang lalu campurkan teri medan goreng.',
  'https://youtu.be/oUI_m5Zn2OA?si=JNIAwCCYw7MnSO3j', '/images/recipes/17.jpg'
),
(
  'Tempe & Tahu Bacem Ketumbar Khas Jogja', 'tidak_berkuah', '6 Porsi', 'Asam', 'Ketumbar (Coriandrum sativum)',
  'Lauk tradisional Yogyakarta berbahan tempe dan tahu yang diungkep perlahan dengan air kelapa, gula merah, dan ketumbar.',
  'Sangrai biji ketumbar utuh dengan api kecil selama 1–2 menit sebelum dihaluskan agar aroma hangat manis-sitrusnya keluar kuat dan meresap hingga ke bagian dalam tempe dan tahu.',
  '1 papan (± 350 gr) tempe padat (potong tebal 1.5 cm, kerat), 6 buah tahu putih padat, 1 sdm penuh biji ketumbar (sangrai, haluskan), 600 ml air kelapa tua, Bumbu Halus: 7 bawang merah, 4 bawang putih, ketumbar sangrai, 1.5 sdt garam. 80 gr gula merah sisir, 3 sdm kecap manis, 1.5 sdm air asam jawa pekat, 3 daun salam, 3 cm lengkuas memar, minyak goreng.',
  '1. Susun tempe dan tahu di panci bersama daun salam dan lengkuas. 2. Larutkan bumbu halus, gula merah, kecap manis, dan air asam jawa ke dalam air kelapa lalu tuang ke panci. 3. Ungkep api kecil tertutup 35–40 menit hingga air menyusut habis dan bumbu karamel meresap. 4. Goreng sebentar 30 detik tiap sisi sebelum disajikan.',
  'https://youtu.be/_ml-Zqmh6QA?si=8suY0Da1iWck5Buf', '/images/recipes/18.jpg'
),
(
  'Sapi Lada Hitam (Beef Blackpepper)', 'tidak_berkuah', '3–4 Porsi', 'Pedas', 'Lada Hitam (Piper nigrum)',
  'Irisan daging sapi has dalam empuk yang ditumis cepat dengan saus lada hitam tumbuk kasar dan paprika.',
  'Gunakan butiran lada hitam utuh dan tumbuk kasar (cracked black pepper) sesaat sebelum dimasak agar senyawa piperin dan minyak atsirinya tetap segar, pedas menggigit, dan tidak apek.',
  '350 gr daging sapi has dalam (iris tipis melintang serat), 1.5 sdm butiran lada hitam (sangrai 30 detik, tumbuk kasar), Marinasi: 1 sdm kecap asin, 1 sdt saus tiram, 1/2 sdt lada hitam, 1 sdt maizena, 1 sdt minyak wijen. 1/2 paprika merah & 1/2 paprika hijau, 1 bawang bombay, 3 bawang putih cincang, 2 cm jahe iris, Saus: 2 sdm saus tiram, 1.5 sdm kecap manis, 1 sdm saus tomat, 1/2 sdt gula, 150 ml air, larutan 1 sdt maizena, 2 sdm minyak.',
  '1. Marinasi daging sapi 15–20 menit. 2. Tumis bawang putih dan jahe dengan api besar hingga harum, masukkan daging sapi dan aduk cepat 2 menit hingga berubah warna. 3. Masukkan bawang bombay, paprika, bahan saus, dan sisa lada hitam tumbuk; masak 2 menit. 4. Kentalkan dengan larutan maizena dan sajikan panas.',
  'https://youtu.be/BZbvv8TbqgQ?si=9ieICZj9S1bNzeE-', '/images/recipes/19.jpg'
),
(
  'Ayam Goreng Lengkuas Renyah Gurih', 'tidak_berkuah', '4–5 Porsi', 'Asam', 'Lengkuas / Laos (Alpinia galanga)',
  'Ayam ungkep goreng keemasan dengan taburan serundeng parutan lengkuas muda yang renyah gurih.',
  'Pilih rimpang lengkuas muda yang kulitnya masih cerah kemerahan dan seratnya lunak, lalu parut memanjang searah serat sehingga saat digoreng menghasilkan serundeng lengkuas yang renyah tidak seperti ampas kayu.',
  '1 ekor (± 800 gr) ayam (potong 8 bagian), 150 gr lengkuas muda (parut memanjang), Bumbu Halus: 8 bawang merah, 5 bawang putih, 3 cm kunyit bakar, 2 cm jahe, 1 sdm ketumbar sangrai, 4 kemiri sangrai, 1.5 sdt garam, 1/2 sdt kaldu bubuk. Aromatik: 2 serai memar, 3 daun salam, 3 daun jeruk, 400 ml air kelapa/air matang, minyak goreng.',
  '1. Ungkep ayam bersama bumbu halus, lengkuas parut, serai, daun salam, daun jeruk, dan 400 ml air dengan api sedang selama 25–30 menit hingga air menyusut habis. 2. Pisahkan ayam dan tiriskan ampas lengkuas parut. 3. Goreng ayam hingga kuning keemasan lalu goreng parutan lengkuas berbumbu 3–4 menit hingga kering renyah; taburkan di atas ayam.',
  'https://youtu.be/QinXnt857XE?si=e40g3goZQ0mmGr9u', '/images/recipes/20.jpg'
),

-- KATEGORI III: CAMILAN KERING (21-30)
(
  'Rempeyek Kacang Tanah', 'camilan_kering', '1 Toples Besar', 'Asam', 'Daun Jeruk Purut (Citrus hystrix)',
  'Keripik tepung beras renyah gurih bertabur belahan kacang tanah dan irisan halus daun jeruk purut.',
  'Buang tulang tengah daun jeruk purut agar tidak pahit, lalu iris sangat tipis melintang (chiffonade) dan campurkan langsung ke adonan tepung encer agar aroma sitrusnya menyebar merata.',
  '200 gr tepung beras, 2 sdm tepung tapioka, 100 gr kacang tanah kupas (belah dua), 8 lembar daun jeruk purut segar (buang tulang, iris sehalus mungkin), 1 butir telur (kocok lepas), 250–275 ml santan encer, Bumbu Halus: 3 bawang putih, 3 kemiri sangrai, 1 sdt ketumbar sangrai, 1.5 cm kencur segar, 1 sdt garam, 1/2 sdt kaldu bubuk, minyak goreng.',
  '1. Campurkan tepung beras, tapioka, bumbu halus, telur, dan santan encer hingga adonan encer licin; masukkan irisan daun jeruk. 2. Panaskan minyak banyak dengan api sedang. 3. Ambil 1 sendok sayur adonan beri kacang tanah, tuang tipis di pinggir wajan, siram minyak panas hingga terlepas dan goreng sampai garing keemasan.',
  'https://youtu.be/xa8mDYfPnRo?si=f1euJKd8kWZxml_V', '/images/recipes/21.jpg'
),
(
  'Kue Kering Nastar Klasik Aroma Cengkeh', 'camilan_kering', '2 Toples (500 gr)', 'Manis', 'Cengkeh (Syzygium aromaticum)',
  'Kue kering klasik lembut lumer berisi selai nanas legit dengan aroma hangat dan hiasan kuncup cengkeh utuh.',
  'Rebus kuncup cengkeh utuh bersama parutan nanas untuk selai agar harum manis, serta tancapkan satu kuncup cengkeh utuh di bagian atas adonan kue sebagai hiasan dan aroma khas.',
  'Selai Nanas: 1 nanas parut, 120 gr gula pasir, 4 cengkeh utuh, 4 cm kayu manis (masak kering). Kulit: 150 gr butter, 100 gr margarin, 50 gr gula halus, 2 kuning telur, 325 gr terigu protein rendah, 25 gr maizena, 25 gr susu bubuk, 30–40 butir cengkeh utuh. Olesan: 2 kuning telur + 1 sdt minyak + 1/2 sdt SKM.',
  '1. Kocok butter, margarin, dan gula halus 1.5 menit; masukkan kuning telur kocok rata lalu aduk balik dengan tepung terigu, maizena, dan susu bubuk. 2. Ambil 8 gr adonan, isi selai nanas, bulatkan dan tancapkan 1 cengkeh di atasnya. 3. Panggang suhu 145–150°C selama 25 menit, oles kuning telur 2 kali, panggang lagi 10 menit.',
  'https://youtu.be/rQyroRNo8wI?si=xh_Pzn8EOYgjJQnC', '/images/recipes/22.jpg'
),
(
  'Kue Kering Kayu Manis (Cinnamon Cookies)', 'camilan_kering', '2 Toples (450 gr)', 'Manis', 'Kayu Manis (Cinnamomum burmannii)',
  'Kue kering renyah beraroma manis hangat kayu manis dan gula palem dengan taburan gula kayu manis di atasnya.',
  'Ayak bubuk kayu manis murni bersama tepung terigu agar aroma hangat manisnya tercampur merata tanpa gumpalan dan menghasilkan warna cokelat keemasan saat dipanggang.',
  '200 gr mentega tawar suhu ruang, 100 gr gula palem halus, 50 gr gula halus, 1 kuning telur, 275 gr terigu protein rendah, 1.5 sdm kayu manis bubuk, 1/2 sdt baking powder, 1/4 sdt garam. Taburan: 2 sdm gula pasir + 1/2 sdt kayu manis bubuk.',
  '1. Kocok mentega, gula palem, dan gula halus 2 menit hingga lembut, masukkan kuning telur. 2. Ayak terigu, kayu manis bubuk, baking powder, dan garam; aduk rata dengan spatula. 3. Gilas adonan tebal 4 mm, cetak, taburi gula kayu manis, dan panggang suhu 155–160°C selama 18–20 menit hingga renyah.',
  'https://youtu.be/kOWg8GlVc7g?si=REnHxvob2yf3_8x3', '/images/recipes/23.jpg'
),
(
  'Kue Semprit Pandan Suji Renyah', 'camilan_kering', '2 Toples (450 gr)', 'Manis', 'Daun Pandan & Daun Suji (Pandanus amaryllifolius)',
  'Kue semprit berbentuk bunga mawar berwarna hijau alami endapan daun suji dan daun pandan yang renyah.',
  'Blender 10 lembar daun suji dan 4 lembar daun pandan dengan sedikit air, peras dan saring, lalu endapkan semalaman di kulkas. Ambil endapan hijaunya yang pekat agar adonan kue kering tetap renyah dan tidak lembek.',
  '100 gr butter + 100 gr margarin, 110 gr gula halus, 2 kuning telur, 1.5 sdm endapan sari pandan suji pekat, 250 gr terigu protein rendah (sangrai ringan 5 menit, dinginkan, ayak), 50 gr maizena, 25 gr susu bubuk, chocochips/sukade untuk hiasan.',
  '1. Kocok butter, margarin, dan gula halus 2 menit hingga pucat; masukkan kuning telur dan endapan pandan suji. 2. Aduk balik dengan terigu, maizena, dan susu bubuk hingga kalis lembut. 3. Spuitkan bentuk mawar di loyang, beri chocochips di tengah, dan panggang suhu 150°C selama 25–30 menit.',
  'https://youtu.be/OF88eUNUxvM?si=0O52oyYB8CnlPgML', '/images/recipes/24.jpg'
),
(
  'Kue Bawang Gunting Renyah Gurih', 'camilan_kering', '1 Toples Besar (± 500 gr)', 'Manis', 'Bawang Merah & Bawang Putih',
  'Camilan tradisional renyah gurih berbentuk serong hasil guntingan adonan bawang merah, bawang putih, dan seledri.',
  'Haluskan bawang merah dan bawang putih hingga benar-benar lumat seperti pasta sebelum dicampurkan ke tepung agar tidak ada serpihan bawang kasar yang cepat gosong dan terasa pahit saat digoreng.',
  '300 gr terigu protein sedang, 60 gr tepung tapioka, 8 bawang merah (haluskan lembut), 4 bawang putih (haluskan lembut), 50 gr margarin leleh, 1 butir telur kocok lepas, 2 batang daun seledri (iris sangat halus), 65 ml santan kental instan, 1 sdt garam, 1/2 sdt kaldu bubuk, minyak goreng.',
  '1. Campur terigu, tapioka, bawang merah dan bawang putih halus, seledri, garam, dan kaldu bubuk. 2. Uleni bersama telur, margarin leleh, dan santan hingga kalis tidak lengket. 3. Pilin adonan memanjang lalu gunting serong tipis (± 2 mm) di atas nampan bertabur tapioka. 4. Goreng dalam minyak panas api sedang hingga kuning keemasan garing.',
  'https://youtu.be/KbhRiK2lN5I?si=n5uprushSUv5WWRc', '/images/recipes/25.jpg'
),
(
  'Kacang Telur Keriting Aroma Kencur', 'camilan_kering', '1 Toples Besar (± 650 gr)', 'Pedas', 'Kencur (Kaempferia galanga)',
  'Kacang tanah berlapis tepung keriting renyah manis-gurih dengan aroma segar khas kencur dan bawang putih.',
  'Kupas tipis kulit luar kencur segar lalu haluskan bersama bawang putih. Aroma segar kencur berpadu dengan manis-gurih adonan telur menciptakan cita rasa kacang keriting khas Nusantara yang wangi.',
  '500 gr kacang tanah kupas (sangrai 5 menit setengah matang, dinginkan), 250 gr terigu protein sedang, 3 sdm maizena, 1 butir telur besar, 80 gr gula pasir (blender halus), 3 cm kencur segar (haluskan), 4 bawang putih (haluskan), 1 sdm margarin leleh, 1/2 sdt garam, minyak goreng.',
  '1. Kocok telur dengan gula halus, kencur halus, bawang putih halus, garam, dan margarin leleh hingga larut. 2. Baluri kacang sangrai dengan kocokan telur lalu tiriskan. 3. Gulingkan kacang basah ke campuran terigu dan maizena sambil diayak memutar hingga keriting. 4. Goreng api kecil-sedang 8–10 menit hingga cokelat keemasan renyah.',
  'https://youtu.be/QBrrClnkz8M?si=A5IUNdAsMp2M9iPe', '/images/recipes/26.jpg'
),
(
  'Keripik Tempe Sagu Renyah', 'camilan_kering', '1 Toples Besar', 'Asam', 'Ketumbar & Kemiri',
  'Irisan tipis tempe kedelai yang dicelup adonan tepung beras-sagu berbumbu ketumbar sangrai dan daun jeruk.',
  'Sangrai biji ketumbar dan kemiri sebelum dihaluskan untuk bumbu adonan pelapis tepung beras-sagu agar keripik tempe beraroma wangi gurih dan tetap renyah berhari-hari.',
  '1 papan (± 400 gr) tempe kedelai padat (iris sangat tipis 1–1.5 mm), 150 gr tepung beras, 100 gr tepung tapioka/sagu, 250 ml air matang, Bumbu Halus: 1 sdm ketumbar sangrai, 3 kemiri sangrai, 4 bawang putih, 2 cm kencur, 1 sdt garam, 1/2 sdt kaldu bubuk. 4 daun jeruk iris halus, minyak goreng.',
  '1. Campur tepung beras, tapioka, bumbu halus, irisan daun jeruk, dan air hingga menjadi adonan encer licin. 2. Celupkan irisan tipis tempe satu per satu ke adonan pelapis. 3. Goreng dalam minyak panas api sedang hingga kering garing keemasan dan gelembung minyak menghilang.',
  'https://youtu.be/qYUseUrUqzM?si=Ycjemd9wA6oQ24gq', '/images/recipes/27.jpg'
),
(
  'Kue Spekulas (Spiku Kering) Rempah Pala & Fuli', 'camilan_kering', '2 Toples (450 gr)', 'Manis', 'Pala & Fuli (Myristica fragrans)',
  'Biskuit rempah klasik beraroma hangat racikan fuli, pala, kayu manis, cengkeh, dan kapulaga dengan taburan kenari.',
  'Parut biji pala utuh dan haluskan kepingan fuli kering bersama kayu manis dan cengkeh bubuk. Kombinasi fuli yang lembut dengan pala yang hangat menciptakan aroma kue spekulas klasik yang autentik.',
  '150 gr butter, 100 gr gula palem halus, 40 gr gula halus, 1 kuning telur, 225 gr terigu protein rendah, 25 gr susu bubuk, Racikan Rempah: 3/4 sdt pala bubuk segar, 1/2 sdt fuli bubuk, 1 sdt kayu manis bubuk, 1/4 sdt cengkeh bubuk, 1/4 sdt kapulaga bubuk, 1/4 sdt baking powder, 50 gr kenari/almond iris.',
  '1. Kocok butter, gula palem, dan gula halus 2 menit hingga lembut; masukkan kuning telur. 2. Ayak terigu, susu bubuk, baking powder, dan racikan rempah spekuk; aduk rata. 3. Gilas tebal 4 mm, cetak, tempelkan irisan kenari di atasnya, dan panggang suhu 150°C selama 22–25 menit.',
  'https://youtu.be/prlj0z0yyBg?si=gkBAa3Q-YkXf4eMz', '/images/recipes/28.jpg'
),
(
  'Stik Keju Lada Hitam (Blackpepper Cheese Stick)', 'camilan_kering', '1 Toples Besar (± 500 gr)', 'Pedas', 'Lada Hitam (Piper nigrum)',
  'Stik keju cheddar renyah dengan bintik dan sensasi pedas hangat butiran lada hitam tumbuk kasar.',
  'Tumbuk kasar butiran lada hitam (jangan terlalu halus) agar bintik hitamnya terlihat menarik di permukaan stik keju serta menghadirkan sensasi pedas hangat yang menyeimbangkan gurihnya keju cheddar.',
  '250 gr terigu protein sedang, 50 gr tepung tapioka, 100 gr keju cheddar parut halus, 1.5 sdt butiran lada hitam (sangrai sebentar, tumbuk kasar), 50 gr margarin suhu ruang, 1 butir telur kocok lepas, 50–60 ml air es, 1/2 sdt garam, 1/2 sdt kaldu bubuk, minyak goreng.',
  '1. Campur terigu, tapioka, keju parut, lada hitam tumbuk kasar, garam, dan kaldu bubuk. 2. Masukkan margarin, telur, dan air es sedikit demi sedikit; uleni hingga kalis. 3. Gilas tipis 2–3 mm, potong memanjang selebar 0.5 cm. 4. Goreng dalam minyak panas api sedang hingga kuning keemasan renyah.',
  'https://youtu.be/scbhIWpcQQA?si=Ls5wFTgBKd4sBsRY', '/images/recipes/29.jpg'
),
(
  'Kue Lidah Kucing Vanili Asli', 'camilan_kering', '2 Toples (400 gr)', 'Manis', 'Vanili (Vanilla planifolia)',
  'Kue kering tipis renyah lembut yang dikocok dengan biji hitam polong vanili asli (vanilla caviar).',
  'Belah memanjang polong vanili kering menggunakan ujung pisau, kerok biji hitam halusnya (vanilla caviar), dan kocok langsung bersama mentega agar aroma manis lembut vanili asli menempel sempurna di seluruh adonan.',
  '150 gr butter, 100 gr margarin, 160 gr gula halus, 1/2 batang polong vanili asli (kerok biji hitamnya), 100 ml putih telur (sekitar 3 butir suhu ruang), 225 gr terigu protein rendah, 25 gr maizena, 1 sdm susu bubuk.',
  '1. Kocok butter, margarin, gula halus, dan biji vanili asli kecepatan tinggi 5–7 menit hingga putih mengembang lembut. 2. Masukkan putih telur bertahap dengan kecepatan rendah, lalu aduk balik dengan campuran terigu, maizena, dan susu bubuk. 3. Spuitkan memanjang 5 cm di loyang lidah kucing, panggang suhu 150°C selama 15–20 menit.',
  'https://youtu.be/I8Vig59RQTA?si=QtrtcDnxqTDMUFa_', '/images/recipes/30.jpg'
),

-- KATEGORI IV: MINUMAN TRADISIONAL (31-40)
(
  'Wedang Jamu Bangle Jahe Madu', 'minuman', '2 Gelas', 'Pedas', 'Bangle (Zingiber montanum)',
  'Minuman rebusan rimpang bangle, jahe merah, kunyit, dan serai yang dipadukan madu murni hangat.',
  'Kupas kulit rimpang bangle segar lalu geprek atau iris tipis sebelum direbus dengan api kecil agar sari pahit-pedas hangatnya keluar seimbang tanpa membuat minuman terlalu getir.',
  '3 cm rimpang bangle segar (kupas, geprek memar), 3 cm jahe merah segar (geprek), 2 cm kunyit segar (kupas, iris tipis), 1 batang serai bagian putih (geprek), 500 ml air bersih, 2–3 sdm madu murni.',
  '1. Rebus 500 ml air bersama bangle geprek, jahe merah, irisan kunyit, dan serai dengan api kecil selama 15 menit hingga air menyusut menjadi 350 ml. 2. Saring ke dalam 2 gelas saji. 3. Diamkan 2 menit hingga hangat (tidak mendidih) lalu tambahkan madu murni dan aduk rata.',
  'https://youtu.be/3IiC8HD-ZDw?si=O3gLEDaLpGPkQvX-', '/images/recipes/31.jpg'
),
(
  'Jamu Cabe Puyang', 'minuman', '2–3 Gelas', 'Pedas', 'Cabai Jawa (Piper retrofractum) & Lempuyang',
  'Ramuan jamu tradisional berkhasiat penghangat tubuh dan pereda pegal linu dari cabai jawa dan lempuyang emprit.',
  'Tumbuk kasar buah cabai jawa kering dan kupas rimpang lempuyang emprit sebelum direbus bersama gula aren agar sensasi pedas hangat cabai jawa menyatu harmonis dengan rasa segar lempuyang.',
  '5 buah cabai jawa kering (tumbuk kasar), 50 gr rimpang lempuyang emprit segar (kupas, iris tipis), 20 gr kunyit segar iris, 20 gr jahe emprit geprek, 60 gr gula aren sisir, sejumput garam, 700 ml air bersih.',
  '1. Rebus cabai jawa tumbuk, irisan lempuyang, kunyit, jahe, dan 700 ml air api kecil 15–20 menit hingga menyusut menjadi 500 ml. 2. Masukkan gula aren sisir dan sejumput garam, didihkan 2 menit hingga larut. 3. Saring halus ke gelas saji dan minum selagi hangat.',
  'https://youtu.be/2XpmY1JhRvg?si=Sbbt7C2_XErMfNiq', '/images/recipes/32.jpg'
),
(
  'Bir Pletok Hangat Khas Betawi', 'minuman', '4–5 Gelas', 'Pedas', 'Jahe Merah, Cengkeh & Kayu Secang',
  'Minuman rempah tradisional non-alkohol khas Betawi berwarna merah ruby cerah dengan buih lembut saat dikocok.',
  'Bakar jahe merah di atas api kompor sebentar sebelum digeprek untuk memperkaya aromanya, dan masukkan serutan kayu secang pada tahap akhir perebusan agar menghasilkan warna merah ruby yang cerah alami.',
  '150 gr jahe merah segar (bakar sebentar, geprek), 5 cengkeh kering, 3 serai geprek, 4 cm kayu manis batang, 3 kapulaga memar, 1/4 biji pala memar, 1 genggam (± 15 gr) serutan kayu secang, 3 daun pandan simpul, 150 gr gula pasir/batu, sejumput garam, 1.2 liter air.',
  '1. Rebus 1.2 liter air bersama jahe merah, serai, cengkeh, kayu manis, kapulaga, pala, dan daun pandan selama 15 menit. 2. Masukkan serutan kayu secang, gula, dan garam; masak 5–7 menit hingga merah ruby cerah. 3. Saring ke teko lalu kocok dalam shaker/botol hingga berbuih.',
  'https://youtu.be/DhZGPBjVURc?si=0vlIY2zwjjgJoduV', '/images/recipes/33.jpg'
),
(
  'Wedang Uwuh Komplit Khas Yogyakarta', 'minuman', '2 Gelas', 'Pahit', 'Kayu Secang (Biancaea sappan)',
  'Minuman seduhan rempah khas Imogiri Yogyakarta yang menyajikan warna merah pekat kayu secang dan gula batu.',
  'Gunakan serutan teras kayu secang yang berwarna kemerahan dan rebus atau seduh bersama rempah daun kering (daun kayu manis, daun pala, daun cengkeh) selama 10 menit hingga warna merah pekat dan aroma hangatnya keluar.',
  '1 genggam (± 10 gr) serutan kayu secang kering, 1 ruas (4 cm) jahe emprit bakar geprek, 2 lembar daun kayu manis kering, 2 lembar daun pala kering, 3 cengkeh & 2 tangkai daun cengkeh kering, 1 serai geprek, 40 gr gula batu, 450 ml air bersih.',
  '1. Cuci bersih seluruh bahan rempah kering dan jahe. 2. Didihkan 450 ml air bersama jahe bakar, serai, daun kayu manis, daun pala, cengkeh, dan kayu secang dengan api kecil selama 10 menit hingga merah pekat. 3. Tuang panas ke gelas berisi gula batu.',
  'https://youtu.be/lmMSwIUvyNU?si=7os-FZYM4ZWDgFQT', '/images/recipes/34.jpg'
),
(
  'Jamu Beras Kencur Segar', 'minuman', '4 Gelas', 'Pedas', 'Kencur (Kaempferia galanga)',
  'Minuman jamu tradisional manis segar perpaduan sari rimpang kencur, jahe, beras sangrai, dan gula aren.',
  'Pilih kencur segar yang berisi, cukup kerik kulit tipis luarnya tanpa dikupas tebal karena minyak atsiri dan aroma segar kencur terkonsentrasi tepat di bawah lapisan kulit.',
  '100 gr kencur segar (kerik kulit luarnya), 50 gr beras putih (rendam 3 jam, tiriskan), 30 gr jahe segar kupas, 100 gr gula aren sisir, 2 sdm gula pasir, 1 daun pandan simpul, 1/4 sdt garam, 800 ml air matang.',
  '1. Sangrai beras rendam 5 menit hingga kering harum, dinginkan. 2. Rebus 400 ml air dengan gula aren, gula pasir, pandan, dan garam hingga larut. 3. Blender kencur, jahe, beras sangrai, dan 400 ml air matang hingga lembut; campur ke air gula aren lalu saring dengan kain bersih.',
  'https://youtu.be/dhduFR4RmbM?si=9EYy1_wibl98Ixod', '/images/recipes/35.jpg'
),
(
  'Jamu Kunyit Asam Segar', 'minuman', '4–5 Gelas', 'Asam', 'Kunyit (Curcuma longa) & Asam Jawa',
  'Minuman rempah penyegar tubuh perpaduan sari kunyit tua, asam jawa, dan gula aren yang nikmat disajikan dingin maupun hangat.',
  'Gunakan kunyit tua berwarna oranye pekat, blender bersama air matang lalu rebus bersama daging asam jawa dan gula aren. Asam jawa berfungsi menetralkan bau langu tanah pada kunyit sekaligus menyegarkan rasa.',
  '150 gr kunyit segar tua (kupas, iris tipis), 50 gr daging buah asam jawa tanpa biji, 120 gr gula aren sisir, 2 sdm gula pasir, 1 daun pandan simpul, 1/4 sdt garam, 1 liter air matang.',
  '1. Blender irisan kunyit dengan 300 ml air matang hingga lumat, saring ke panci. 2. Tambahkan 700 ml sisa air, daging asam jawa, gula aren, gula pasir, daun pandan, dan garam; rebus 10–12 menit hingga mendidih. 3. Diamkan hingga hangat lalu saring kembali.',
  'https://youtu.be/HypKbUc-GAg?si=gy7fiiyfeiTx34iu', '/images/recipes/36.jpg'
),
(
  'Minuman Herbal Lempuyang Gula Aren', 'minuman', '3 Gelas', 'Pahit', 'Lempuyang (Zingiber zerumbet)',
  'Minuman herbal tradisional perasan sari lempuyang emprit dan jahe yang dipadukan sirup gula aren pandan.',
  'Pilih rimpang lempuyang emprit yang berukuran kecil (bukan lempuyang gajah) karena rasanya lebih pedas hangat dan tidak terlalu pahit saat diperas sarinya.',
  '60 gr rimpang lempuyang emprit segar (kupas bersih), 20 gr jahe emprit segar kupas, 60 gr gula aren sisir, 1 daun pandan simpul, sejumput garam, 600 ml air matang.',
  '1. Parut halus lempuyang emprit dan jahe, peras dengan 200 ml air matang dan saring ampasnya. 2. Rebus 400 ml sisa air bersama gula aren sisir, daun pandan, dan garam hingga larut. 3. Tuang sari perasan lempuyang ke air gula, masak api kecil 3 menit, saring sekali lagi dan sajikan hangat.',
  'https://youtu.be/qWwAyAPovX0?si=XWg8XeCsvi4BTTfD', '/images/recipes/37.jpg'
),
(
  'Wedang Serai Jahe Jeruk Nipis', 'minuman', '2–3 Gelas', 'Asam', 'Serai / Sereh (Cymbopogon citratus)',
  'Wedang hangat aromatik berbahan batang serai memar dan jahe segar dengan sentuhan akhir perasan jeruk nipis.',
  'Buang lapisan daun luar serai yang keras, lalu memarkan (geprek) bagian pangkal batang putihnya hingga pecah berserat agar minyak atsiri beraroma sitrus segar larut optimal saat direbus.',
  '4 batang serai segar (ambil bagian putih, geprek memar), 4 cm jahe segar (kupas, geprek), 1 buah jeruk nipis segar, 3 sdm madu murni atau 40 gr gula batu, 650 ml air bersih.',
  '1. Didihkan 650 ml air bersama batang serai geprek dan jahe geprek dengan api kecil selama 12–15 menit hingga harum semerbak. 2. Saring ke gelas saji, masukkan gula batu atau madu hingga larut. 3. Tambahkan perasan air jeruk nipis tepat sebelum diminum.',
  'https://youtu.be/OTnE0UlxxiU?si=HLlj1SYE1nHLmTAa', '/images/recipes/38.jpg'
),
(
  'Jamu Temulawak', 'minuman', '3–4 Gelas', 'Pahit', 'Temulawak (Curcuma zanthorrhiza)',
  'Rebusan rimpang temulawak segar bersama kunyit, asam jawa, dan gula aren untuk menjaga kebugaran dan nafsu makan.',
  'Kupas kulit temulawak segar, iris tipis-tipis, lalu rebus bersama asam jawa dan kunyit untuk menyeimbangkan rasa pahit alaminya sekaligus mengekstrak kurkuminoid yang baik untuk kesehatan hati.',
  '100 gr rimpang temulawak segar (kupas, iris tipis), 30 gr kunyit segar iris tipis, 25 gr asam jawa tanpa biji, 90 gr gula aren sisir, 1 daun pandan simpul, 1/4 sdt garam, 850 ml air bersih.',
  '1. Rebus irisan temulawak, kunyit, asam jawa, daun pandan, garam, dan 850 ml air api kecil 20 menit hingga menyusut menjadi 600 ml. 2. Masukkan gula aren sisir, aduk hingga larut dan didihkan 2 menit. 3. Saring jamu temulawak ke gelas saji.',
  'https://youtu.be/8TtsSYs8uLA?si=Kkyzv-2CYUWP8bku', '/images/recipes/39.jpg'
),
(
  'Teh Rempah Adas Kapulaga Kayu Manis (Chai Nusantara)', 'minuman', '2 Cangkir', 'Manis', 'Adas, Kapulaga & Kayu Manis',
  'Seduhan teh hitam susu hangat dengan paduan rempah adas, kapulaga, kayu manis, cengkeh, dan jahe.',
  'Sangrai sebentar biji adas, polong kapulaga yang dimemarkan, dan batang kayu manis di dasar panci kering sebelum dituangi air agar aroma hangat manisnya lebih kaya dan menenangkan.',
  '1 sdt biji adas kering, 3 kapulaga (memarkan retak), 3 cm kayu manis batang, 2 cengkeh kering, 2 cm jahe segar geprek, 2 sdt teh hitam tubruk, 300 ml air bersih, 200 ml susu cair full cream, 2–3 sdm gula pasir/palem.',
  '1. Sangrai adas, kapulaga memar, kayu manis, dan cengkeh di panci kering selama 1 menit hingga harum. 2. Tuang 300 ml air dan jahe geprek, didihkan 7–8 menit. 3. Masukkan teh hitam dan gula, didihkan 2 menit lalu tuang 200 ml susu cair hingga mendidih berbuih; saring ke cangkir.',
  'https://youtu.be/JJ2j79nVv7M?si=M354SUIi0NLZlZ92', '/images/recipes/40.jpg'
),

-- KATEGORI V: CAMILAN BASAH (41-50)
(
  'Klepon Ketan Pandan Gula Merah', 'camilan_basah', '± 25 Butir', 'Manis', 'Daun Pandan (Pandanus amaryllifolius)',
  'Kue bola ketan hijau wangi daun pandan berisi gula merah aren cair dengan baluran kelapa parut kukus gurih.',
  'Blender 8 lembar daun pandan tua dengan air hangat lalu peras dan saring sarinya; gunakan air pandan hangat tersebut untuk menguleni tepung ketan agar kulit klepon lembut kenyal dan harum alami.',
  '250 gr tepung ketan putih, 50 gr tepung beras, 200–220 ml air perasan daun pandan & suji hangat, 1/2 sdt garam, 1/2 sdt air kapur sirih (opsional), Isian: 150 gr gula merah aren sisir halus. Baluran: 1/2 butir kelapa parut kukus 15 menit dengan 1 daun pandan & 1/4 sdt garam.',
  '1. Uleni tepung ketan, tepung beras, garam, dan air pandan hangat hingga kalis. 2. Pipihkan 12–15 gr adonan, isi 1 sdt gula merah sisir, bulatkan rapat. 3. Rebus dalam air mendidih berdaun pandan hingga mengapung (biarkan mengapung 1–2 menit agar gula lumer). 4. Angkat, tiriskan, dan gulingkan di kelapa parut kukus.',
  'https://youtu.be/IBmpksUOywg?si=-txU5wMU4KGwPiLI', '/images/recipes/41.jpg'
),
(
  'Dadar Gulung Hijau Suji Unti Kelapa', 'camilan_basah', '12–14 Buah', 'Manis', 'Daun Suji (Dracaena angustifolia)',
  'Dadar tipis berpori cantik hijau alami daun suji dengan isian unti kelapa parut gula merah pandan.',
  'Potong kecil 15 lembar daun suji hijau tua dan 4 lembar daun pandan, blender dengan sedikit air lalu saring dengan kain bersih untuk mendapatkan warna hijau zamrud alami yang cantik dan wangi.',
  'Unti Kelapa: 150 gr kelapa parut setengah tua, 100 gr gula merah sisir, 2 sdm gula pasir, 1 daun pandan, 1/4 sdt garam, 75 ml air (masak kesat, dinginkan). Kulit: 150 gr terigu protein sedang, 1.5 sdm tapioka, 1 telur kocok, 320 ml santan encer, 60 ml air perasan daun suji & pandan pekat, 1/2 sdt garam, 1 sdm minyak/margarin leleh.',
  '1. Aduk rata semua bahan kulit hingga licin, saring. 2. Dadar tipis di teflon anti lengket diameter 20 cm dengan api kecil 1.5 menit hingga kering berpori tanpa dibalik. 3. Beri 1.5 sdm unti kelapa di atas kulit, lipat sisi kiri-kanan, dan gulung rapi.',
  'https://youtu.be/DwlWPG3w7Ag?si=EWRgsM9oUkGf_yjV', '/images/recipes/42.jpg'
),
(
  'Setup Pisang Kepok Kayu Manis', 'camilan_basah', '4 Porsi', 'Manis', 'Kayu Manis (Cinnamomum burmannii)',
  'Hidangan penutup tradisional rebusan pisang kepok kuning dalam kuah sirup bening kayu manis, cengkeh, dan pandan.',
  'Gunakan 1 batang kayu manis utuh (panjang 5–6 cm) saat merebus sirup gula agar kuah setup tetap jernih keemasan dan harum lembut tanpa endapan bubuk.',
  '6 buah pisang kepok kuning matang (potong serong 1.5 cm), 1 batang (5–6 cm) kayu manis utuh, 3 cengkeh kering, 2 daun pandan simpul, 110 gr gula pasir/gula batu, sejumput garam, 750 ml air bersih.',
  '1. Didihkan 750 ml air bersama kayu manis, cengkeh, daun pandan, gula, dan garam selama 5 menit hingga harum. 2. Masukkan potongan pisang kepok kuning, masak api sedang 8–10 menit hingga pisang empuk namun tetap utuh. 3. Sajikan hangat atau dingin.',
  'https://youtu.be/AvCIumqCf2w?si=WO2d4nw9PbYO-b1C', '/images/recipes/43.jpg'
),
(
  'Kue Sus Isi Vla Vanili', 'camilan_basah', '15–18 Buah', 'Manis', 'Vanili (Vanilla planifolia)',
  'Kue sus panggang berongga lembut yang diisi krim vla susu kental beraroma biji polong vanili asli.',
  'Belah memanjang polong vanili kering, kerok biji hitamnya lalu rebus biji beserta kulit polongnya ke dalam susu cair vla untuk mengekstrak aroma vanili secara maksimal, baru angkat kulit polongnya.',
  'Kulit Sus: 125 ml air, 50 gr margarin/butter, 1/4 sdt garam, 1/2 sdt gula, 75 gr terigu protein sedang, 2 butir telur. Vla Vanili: 1/2 batang polong vanili asli (kerok bijinya), 250 ml susu cair full cream, 50 gr gula pasir, 20 gr maizena, 1 kuning telur, 1 sdm butter tawar, sejumput garam.',
  '1. Vla: masak susu cair, biji & polong vanili, gula, dan garam hingga mendidih; kentalkan dengan larutan maizena dan kuning telur, angkat polong, aduk butter lalu dinginkan tertutup plastik wrap. 2. Kulit: didihkan air, margarin, garam, dan gula; masukkan terigu aduk kalis, dinginkan hangat lalu kocok telur satu per satu. 3. Spuitkan di loyang, panggang suhu 200°C selama 25 menit; gunting dan isi vla.',
  'https://youtu.be/Ke_9YuGO-j4?si=ONdC30JJpbNaHQ9C', '/images/recipes/44.jpg'
),
(
  'Kolak Pisang Ubi Wangi Pandan & Cengkeh', 'camilan_basah', '5 Porsi', 'Manis', 'Daun Pandan & Cengkeh',
  'Kolak pisang dan ubi jalar dalam kuah santan gula merah aren yang diperkaya aroma daun pandan dan cengkeh.',
  'Ikat simpul daun pandan dan masukkan 2 butir cengkeh utuh saat merebus larutan gula merah untuk memberikan lapisan aroma hangat manis yang dalam pada kuah santan kolak.',
  '5 buah pisang raja/kepok kuning (potong serong 2 cm), 250 gr ubi jalar kuning/oranye (potong dadu 2.5 cm), 150 gr gula merah aren sisir, 2 sdm gula pasir, 2 daun pandan simpul, 2 cengkeh kering, 600 ml santan sedang, 250 ml air bersih, 1/2 sdt garam.',
  '1. Rebus 250 ml air, gula merah, gula pasir, daun pandan, cengkeh, dan garam hingga larut lalu saring. 2. Masukkan ubi jalar, masak 8 menit hingga setengah empuk. 3. Masukkan pisang dan 600 ml santan, masak api sedang sambil diaduk perlahan 7–8 menit hingga matang.',
  'https://youtu.be/qAbM3CLq8NU?si=HVHC4tsWJ-0TmH0c', '/images/recipes/45.jpg'
),
(
  'Kue Putu Ayu Hijau Suji Pandan', 'camilan_basah', '± 16 Buah', 'Manis', 'Daun Suji & Daun Pandan',
  'Bolu kukus lembut beraroma santan pandan suji dengan lapisan kelapa parut kukus gurih di bagian atasnya.',
  'Padukan sari endapan daun suji sebagai pewarna hijau zamrud alami dengan sari daun pandan sebagai pengharum ke dalam adonan bolu kukus agar kue lembut dan wangi.',
  'Kelapa Tabur: 100 gr kelapa parut muda, 1/4 sdt garam, 1 sdt maizena (kukus 10 menit). Adonan: 2 telur besar suhu ruang, 120 gr gula pasir, 1/2 sdt SP, 150 gr terigu protein sedang + 1/4 sdt baking powder, 100 ml santan kental + 30 ml air endapan sari daun suji & pandan.',
  '1. Padatkan 1 sdm kelapa parut kukus di dasar cetakan putu ayu beroles minyak. 2. Kocok telur, gula, dan SP kecepatan tinggi 6–7 menit hingga putih kental berjejak. 3. Masukkan terigu bergantian dengan santan pandan suji kecepatan rendah, aduk balik spatula. 4. Tuang ke cetakan dan kukus 15 menit hingga matang.',
  'https://youtu.be/8TPNBBnNd5g?si=JdqIBXmWEkAWfrHz', '/images/recipes/46.jpg'
),
(
  'Bubur Sumsum Kuah Kinca Gula Merah Pandan', 'camilan_basah', '4–5 Porsi', 'Manis', 'Daun Pandan (Pandanus amaryllifolius)',
  'Bubur tepung beras santan lembut gurih yang disajikan dengan siraman sirup kinca gula merah wangi pandan.',
  'Remas daun pandan segar dan ikat simpul di kedua tahap pemasakan (pada bubur santan maupun sirup gula merah) agar aroma wangi pandan menyatu lembut di setiap suapan.',
  'Kuah Kinca: 150 gr gula merah aren sisir, 200 ml air, 1 daun pandan simpul, sejumput garam (rebus mengental, saring). Bubur: 100 gr tepung beras, 750 ml santan sedang, 2 daun pandan segar (remas, simpulkan), 3/4 sdt garam halus.',
  '1. Larutkan 100 gr tepung beras dengan 250 ml santan dingin dan garam hingga licin. 2. Didihkan 500 ml sisa santan bersama daun pandan api kecil. 3. Tuang larutan tepung beras sambil terus diaduk cepat 10–12 menit hingga mengental licin meletup-letup. 4. Sajikan dengan siraman kuah kinca.',
  'https://youtu.be/ZNlF2B2_6zU?si=5Q3ymMsLEzncX2Zi', '/images/recipes/47.jpg'
),
(
  'Bakwan Sayur Renyah Gurih', 'camilan_basah', '12–15 Buah', 'Asam', 'Ketumbar & Bawang Putih',
  'Gorengan sayuran kol, wortel, dan tauge dengan balutan adonan tepung berbumbu ketumbar sangrai dan kunyit.',
  'Sangrai ketumbar utuh sebentar lalu haluskan bersama bawang putih dan sedikit kunyit untuk bumbu adonan tepung bakwan sehingga gorengan wangi sedap dan berwarna kuning keemasan.',
  '150 gr kol putih iris tipis, 1 wortel iris korek api, 75 gr tauge, 2 daun bawang & 1 seledri iris, 200 gr terigu protein sedang, 3 sdm tepung beras, 1 sdm margarin leleh, Bumbu Halus: 1 sdt ketumbar sangrai, 3 bawang putih, 1 cm kunyit, 1 sdt garam, 1/2 sdt kaldu bubuk, 1/4 sdt lada putih, 200–220 ml air matang, minyak goreng.',
  '1. Campur terigu, tepung beras, bumbu halus, dan air hingga adonan kental licin; masukkan margarin leleh dan seluruh sayuran iris. 2. Panaskan minyak goreng banyak api sedang. 3. Sendokkan adonan ke minyak panas, goreng hingga kuning keemasan renyah.',
  'https://youtu.be/A0oO39GwAwQ?si=J8xcFv6O8_UJRQOA', '/images/recipes/48.jpg'
),
(
  'Lapis Legit Kukus', 'camilan_basah', '1 Loyang (18x18 cm)', 'Manis', 'Kayu Manis, Pala, Kapulaga & Cengkeh',
  'Kue lapis legit kaya kuning telur dan mentega dengan keharuman racikan empat rempah spekuk Nusantara.',
  'Gunakan racikan bumbu spekuk murni (campuran bubuk kayu manis, pala, kapulaga, dan cengkeh) yang diayak halus bersama tepung terigu agar aromanya tersebar merata di setiap lapisan kue.',
  '15 butir kuning telur suhu ruang, 180 gr gula halus, 250 gr butter suhu ruang, 2 sdm susu kental manis putih, 50 gr terigu protein rendah, 15 gr susu bubuk, 1.5 sdt bumbu spekuk (kayu manis, pala, kapulaga, cengkeh bubuk), 1/4 sdt vanili bubuk.',
  '1. Kocok butter dan SKM 7–8 menit hingga putih lembut. 2. Di wadah lain kocok kuning telur, gula halus, dan vanili 8 menit hingga kental berjejak; aduk balik dengan kocokan butter. 3. Masukkan terigu, susu bubuk, dan bumbu spekuk. 4. Panggang berlapis-lapis (60 gr per lapis) dalam loyang 18x18 cm suhu 180°C selama 4–5 menit per lapis hingga habis.',
  'https://youtu.be/isZYKGxRz5g?si=vOF0Q2cym6GcF9EN', '/images/recipes/49.jpg'
),
(
  'Puding Susu Sutra Vanili Saus Karamel', 'camilan_basah', '6 Cup / 1 Loyang', 'Manis', 'Vanili (Vanilla planifolia)',
  'Puding susu lembut bertekstur sutra beraroma polong vanili asli dengan lapisan saus gula karamel di atasnya.',
  'Belah polong vanili dan rebus biji hitam beserta kulit polongnya ke dalam susu cair agar susu menyerap aroma vanili alami yang lembut manis tanpa bau amis susu.',
  'Saus Karamel: 100 gr gula pasir, 2 sdm air matang, 4 sdm air panas. Puding: 1/2 batang polong vanili asli (kerok bijinya), 750 ml susu cair full cream, 1 bungkus (7 gr) agar-agar bening, 85 gr gula pasir, 1 kuning telur (kocok lepas dengan 3 sdm susu), sejumput garam.',
  '1. Karamel: lelehkan gula pasir dan 2 sdm air hingga cokelat keemasan, tuang 4 sdm air panas lalu tuang ke dasar cetakan. 2. Rebus susu cair, biji & polong vanili, agar-agar, gula, dan garam hingga mendidih; pancing dengan kuning telur kocok dan didihkan sebentar. 3. Angkat polong vanili, saring ke atas karamel dan dinginkan 3 jam.',
  'https://youtu.be/yiQJEOQxwo0?si=wj7NL3lNRvsSO6sw', '/images/recipes/50.jpg'
);

UPDATE recipes SET image_url = '/images/recipes/' || title || CASE title
  -- Makanan Berkuah (1–10)
  WHEN 'Gulai Kambing Bumbu Adas' THEN '.png'
  WHEN 'Gulai Ikan Kakap Asam Gelugur' THEN '.png'
  WHEN 'Sayur Asem Segar Khas Nusantara' THEN '.jpg'
  WHEN 'Asam Padeh Ikan Tongkol Khas Minang' THEN '.png'
  WHEN 'Kuah Masam Keu-eung Ikan Khas Aceh' THEN '.png'
  WHEN 'Semur Daging Sapi Bunga Lawang' THEN '.jpg'
  WHEN 'Soto Ayam Kuah Kuning Segar' THEN '.jpg'
  WHEN 'Soto Betawi Kuah Santan Kapulaga' THEN '.png'
  WHEN 'Rawon Daging Sapi Khas Jawa Timur' THEN '.jpg'
  WHEN 'Sayur Bening Bayam Jagung Temu Kunci' THEN '.jpg'

  -- Makanan Tidak Berkuah (11–20)
  WHEN 'Sambal Andaliman Khas Batak' THEN '.png'
  WHEN 'Sambal Matah Bawang Merah Khas Bali' THEN '.png'
  WHEN 'Ayam Goreng Bawang Putih Renyah' THEN '.png'
  WHEN 'Telur Balado Khas Padang' THEN '.png'
  WHEN 'Ayam Tangkap Daun Kari Khas Aceh' THEN '.png'
  WHEN 'Nasi Bakar Ayam Suwir Kemangi' THEN '.jpg'
  WHEN 'Sambal Kecombrang Teri Medan' THEN '.jpg'
  WHEN 'Tempe & Tahu Bacem Ketumbar Khas Jogja' THEN '.jpg'
  WHEN 'Sapi Lada Hitam (Beef Blackpepper)' THEN '.jpg'
  WHEN 'Ayam Goreng Lengkuas Renyah Gurih' THEN '.png'

  -- Camilan Kering (21–30)
  WHEN 'Rempeyek Kacang Tanah' THEN '.jpg'
  WHEN 'Kue Kering Nastar Klasik Aroma Cengkeh' THEN '.jpg'
  WHEN 'Kue Kering Kayu Manis (Cinnamon Cookies)' THEN '.jpg'
  WHEN 'Kue Semprit Pandan Suji Renyah' THEN '.png'
  WHEN 'Kue Bawang Gunting Renyah Gurih' THEN '.jpg'
  WHEN 'Kacang Telur Keriting Aroma Kencur' THEN '.jpg'
  WHEN 'Keripik Tempe Sagu Renyah' THEN '.png'
  WHEN 'Kue Spekulas (Spiku Kering) Rempah Pala & Fuli' THEN '.jpg'
  WHEN 'Stik Keju Lada Hitam (Blackpepper Cheese Stick)' THEN '.png'
  WHEN 'Kue Lidah Kucing Vanili Asli' THEN '.jpg'

  -- Minuman Tradisional (31–40)
  WHEN 'Wedang Jamu Bangle Jahe Madu' THEN '.png'
  WHEN 'Jamu Cabe Puyang' THEN '.jpg'
  WHEN 'Bir Pletok Hangat Khas Betawi' THEN '.jpg'
  WHEN 'Wedang Uwuh Komplit Khas Yogyakarta' THEN '.jpg'
  WHEN 'Jamu Beras Kencur Segar' THEN '.png'
  WHEN 'Jamu Kunyit Asam Segar' THEN '.jpg'
  WHEN 'Minuman Herbal Lempuyang Gula Aren' THEN '.jpg'
  WHEN 'Wedang Serai Jahe Jeruk Nipis' THEN '.jpg'
  WHEN 'Jamu Temulawak' THEN '.jpg'
  WHEN 'Teh Rempah Adas Kapulaga Kayu Manis (Chai Nusantara)' THEN '.jpg'

  -- Camilan Basah (41–50)
  WHEN 'Klepon Ketan Pandan Gula Merah' THEN '.png'
  WHEN 'Dadar Gulung Hijau Suji Unti Kelapa' THEN '.png'
  WHEN 'Setup Pisang Kepok Kayu Manis' THEN '.jpg'
  WHEN 'Kue Sus Isi Vla Vanili' THEN '.jpg'
  WHEN 'Kolak Pisang Ubi Wangi Pandan & Cengkeh' THEN '.png'
  WHEN 'Kue Putu Ayu Hijau Suji Pandan' THEN '.png'
  WHEN 'Bubur Sumsum Kuah Kinca Gula Merah Pandan' THEN '.png'
  WHEN 'Bakwan Sayur Renyah Gurih' THEN '.jpg'
  WHEN 'Lapis Legit Kukus' THEN '.jpg'
  WHEN 'Puding Susu Sutra Vanili Saus Karamel' THEN '.png'

  ELSE '.jpg'
END;

UPDATE recipes
SET image_url = '/images/recipes/Nama Persis File.png'
WHERE title = 'Judul Resep';

UPDATE recipes
SET dish_type = 'camilan_kering',
    image_url = '/images/recipes/Bakwan Sayur Renyah Gurih.jpg'
WHERE title = 'Bakwan Sayur Renyah Gurih';