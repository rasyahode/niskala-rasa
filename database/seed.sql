-- =========================================================
-- 2. SEED DATA AWAL POSTGRESQL - NISKALA RASA
-- =========================================================

BEGIN;

-- Kategori Kelas
INSERT INTO categories (name)
VALUES
  ('Rempah Nusantara'),
  ('Resep Luar Negeri Berempah'),
  ('Teknik Sangrai & Infusi'),
  ('Praktik Studio Makassar')
ON CONFLICT (name) DO NOTHING;

-- Akun Uji Coba 4 Peran (Password semua akun: admin123 / teacher123 / student123 / pending123)
-- Hash di bawah adalah hash bcrypt valid untuk masing-masing password
INSERT INTO users (
  username, email, password_hash, role, teacher_status,
  teacher_level, cv_info, professional_license, approved_at
)
VALUES
  ('Admin Niskala', 'admin@niskalarasa.id', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'admin', 'none', NULL, NULL, NULL, NULL),
  ('Chef Basic', 'teacher@niskalarasa.id', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'teacher', 'approved', 'basic', 'CV Pengajar Dasar Rempah Nusantara (3 tahun)', 'LIS-REMPAH-BASIC-01', NOW()),
  ('Siswa Rempah', 'student@niskalarasa.id', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'student', 'none', NULL, NULL, NULL, NULL),
  ('Calon Guru Adv', 'pending@niskalarasa.id', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'student', 'pending', 'advanced', 'CV Spesialis Ekstraksi & Sangrai Rempah (6 tahun)', 'LIS-KULINER-ADV-09', NULL)
ON CONFLICT (email) DO NOTHING;

-- 50 Rempah Khas Indonesia
INSERT INTO spices (
  name, latin_name, plant_part, origin_region,
  dominant_taste, characteristics, processing_method
)
VALUES
  ('Adas', 'Foeniculum vulgare', 'Biji', 'Indonesia', 'manis', 'Aroma manis mirip licorice; bumbu kari, gulai, dan jamu', 'Sangrai kering Adas dengan api kecil hingga harum, lalu memarkan atau haluskan sesuai kebutuhan racikan.'),
  ('Andaliman', 'Zanthoxylum acanthopodium', 'Buah', 'Indonesia', 'asam', 'Aroma jeruk segar, getir, dan sensasi kelu di lidah; khas Batak', 'Olahan buah Andaliman: masukkan pada tahap yang sesuai (segar di akhir atau diseduh terukur) agar kesegarannya terjaga.'),
  ('Asam Gelugur', 'Garcinia atroviridis', 'Buah', 'Indonesia', 'asam', 'Rasa asam segar; bumbu gulai, kari, dan masakan Sumatra', 'Olahan buah Asam Gelugur: masukkan pada tahap yang sesuai (segar di akhir atau diseduh terukur) agar kesegarannya terjaga.'),
  ('Asam Jawa', 'Tamarindus indica', 'Buah', 'Indonesia', 'asam', 'Rasa asam manis; penyegar kuah sayur asem, sambal, dan jamu', 'Olahan buah Asam Jawa: masukkan pada tahap yang sesuai (segar di akhir atau diseduh terukur) agar kesegarannya terjaga.'),
  ('Asam Kandis', 'Garcinia xanthochymus', 'Buah', 'Indonesia', 'asam', 'Rasa asam pekat tanpa membuat kuah keruh; khas rendang dan gulai', 'Olahan buah Asam Kandis: masukkan pada tahap yang sesuai (segar di akhir atau diseduh terukur) agar kesegarannya terjaga.'),
  ('Asam Sunti', 'Averrhoa bilimbi', 'Buah olahan', 'Indonesia', 'asam', 'Belimbing wuluh fermentasi kering; rasa asam gurih khas Aceh', 'Seduh atau rebus singkat Asam Sunti dengan air hangat agar rasa asam-gurihnya larut merata ke kuah.'),
  ('Bangle', 'Zingiber montanum', 'Rimpang', 'Indonesia', 'pedas', 'Aroma menyengat dan rasa pahit pedas; bahan jamu dan obat tradisional', 'Kupas dan memarkan atau iris tipis Bangle, lalu tumis bersama bumbu dasar dengan api sedang.'),
  ('Bawang Batak (Lokio)', 'Allium chinense', 'Umbi & daun', 'Indonesia', 'asam', 'Aroma lembut perpaduan bawang merah dan kucai; khas Sumatra Utara', 'Kupas dan memarkan atau iris tipis Bawang Batak (Lokio), lalu tumis bersama bumbu dasar dengan api sedang.'),
  ('Bawang Merah', 'Allium cepa var. aggregatum', 'Umbi', 'Indonesia', 'manis', 'Rasa gurih manis; bumbu dasar hampir seluruh masakan Nusantara', 'Kupas dan memarkan atau iris tipis Bawang Merah, lalu tumis bersama bumbu dasar dengan api sedang.'),
  ('Bawang Putih', 'Allium sativum', 'Umbi', 'Indonesia', 'manis', 'Aroma tajam dan gurih; bumbu dasar tumisan, sup, dan marinasi', 'Kupas dan memarkan atau iris tipis Bawang Putih, lalu tumis bersama bumbu dasar dengan api sedang.'),
  ('Bunga Lawang (Pekak)', 'Illicium verum', 'Buah/Bunga', 'Indonesia', 'manis', 'Aroma manis kuat seperti adas; bumbu semur, gulai, dan sup', 'Tambahkan Bunga Lawang (Pekak) pada waktu yang tepat agar aroma dan tekstur halusnya tidak rusak oleh panas berlebih.'),
  ('Cabai Jawa', 'Piper retrofractum', 'Buah', 'Indonesia', 'pedas', 'Rasa pedas hangat menyengat; bahan jamu tradisional dan gulai', 'Sangrai tipis atau giling Cabai Jawa sesuai tingkat kepedasan yang diinginkan lalu tumis bersama bumbu.'),
  ('Cabai Merah', 'Capsicum annuum', 'Buah', 'Indonesia', 'pedas', 'Rasa pedas sedang dan memberi warna merah pada sambal/bumbu', 'Sangrai tipis atau giling Cabai Merah sesuai tingkat kepedasan yang diinginkan lalu tumis bersama bumbu.'),
  ('Cabai Rawit', 'Capsicum frutescens', 'Buah', 'Indonesia', 'pedas', 'Rasa pedas tajam; pelengkap lalapan, tumisan, dan sambal', 'Sangrai tipis atau giling Cabai Rawit sesuai tingkat kepedasan yang diinginkan lalu tumis bersama bumbu.'),
  ('Cengkeh', 'Syzygium aromaticum', 'Kuncup bunga', 'Indonesia', 'pedas', 'Aroma hangat, pedas, dan manis; bumbu semur, rendang, dan kretek', 'Tambahkan Cengkeh pada waktu yang tepat agar aroma dan tekstur halusnya tidak rusak oleh panas berlebih.'),
  ('Daun Jambu Biji', 'Psidium guajava', 'Daun', 'Indonesia', 'pahit', 'Memberi warna cokelat pekat dan rasa sepat pada olahan telur/gudeg', 'Cuci bersih Daun Jambu Biji dan sobek atau gulung sebelum dimasukkan di tahap akhir memasak agar aroma segar tetap terjaga.'),
  ('Daun Jeruk Purut', 'Citrus hystrix', 'Daun', 'Indonesia', 'asam', 'Aroma jeruk segar yang kuat; penghilang amis dan penyedap soto/rendang', 'Cuci bersih Daun Jeruk Purut dan sobek atau gulung sebelum dimasukkan di tahap akhir memasak agar aroma segar tetap terjaga.'),
  ('Daun Kari (Temurui)', 'Murraya koenigii', 'Daun', 'Indonesia', 'manis', 'Aroma gurih khas; bumbu utama kari dan masakan khas Aceh', 'Cuci bersih Daun Kari (Temurui) dan sobek atau gulung sebelum dimasukkan di tahap akhir memasak agar aroma segar tetap terjaga.'),
  ('Daun Kemangi', 'Ocimum basilicum', 'Daun', 'Indonesia', 'asam', 'Aroma segar mirip sitrus dan mint; lalapan, pepes, dan woku', 'Cuci bersih Daun Kemangi dan sobek atau gulung sebelum dimasukkan di tahap akhir memasak agar aroma segar tetap terjaga.'),
  ('Daun Ketumbar', 'Coriandrum sativum', 'Daun', 'Indonesia', 'manis', 'Aroma segar khas; taburan sup, soto, dan masakan peranakan', 'Cuci bersih Daun Ketumbar dan sobek atau gulung sebelum dimasukkan di tahap akhir memasak agar aroma segar tetap terjaga.'),
  ('Daun Kunyit', 'Curcuma longa', 'Daun', 'Indonesia', 'manis', 'Aroma harum lembut; pembungkus pepes serta bumbu rendang dan gulai', 'Cuci bersih Daun Kunyit dan sobek atau gulung sebelum dimasukkan di tahap akhir memasak agar aroma segar tetap terjaga.'),
  ('Daun Mangkokan', 'Polyscias scutellaria', 'Daun', 'Indonesia', 'manis', 'Aroma khas; campuran gulai ikan dan masakan Padang', 'Cuci bersih Daun Mangkokan dan sobek atau gulung sebelum dimasukkan di tahap akhir memasak agar aroma segar tetap terjaga.'),
  ('Daun Pandan', 'Pandanus amaryllifolius', 'Daun', 'Indonesia', 'manis', 'Aroma wangi manis; pewarna hijau alami kue dan pengharum nasi', 'Cuci bersih Daun Pandan dan sobek atau gulung sebelum dimasukkan di tahap akhir memasak agar aroma segar tetap terjaga.'),
  ('Daun Salam', 'Syzygium polyanthum', 'Daun', 'Indonesia', 'manis', 'Aroma sedap ringan; bumbu dasar masakan berkuah, tumis, dan nasi uduk', 'Cuci bersih Daun Salam dan sobek atau gulung sebelum dimasukkan di tahap akhir memasak agar aroma segar tetap terjaga.'),
  ('Daun Suji', 'Dracaena angustifolia', 'Daun', 'Indonesia', 'manis', 'Pewarna hijau pekat alami pada kue tradisional tanpa aroma kuat', 'Cuci bersih Daun Suji dan sobek atau gulung sebelum dimasukkan di tahap akhir memasak agar aroma segar tetap terjaga.'),
  ('Fuli (Bunga Pala)', 'Myristica fragrans', 'Selaput biji', 'Indonesia', 'manis', 'Aroma lebih lembut dan hangat dibanding biji pala; bumbu semur dan sup', 'Sangrai kering Fuli (Bunga Pala) dengan api kecil hingga harum, lalu memarkan atau haluskan sesuai kebutuhan racikan.'),
  ('Jahe', 'Zingiber officinale', 'Rimpang', 'Indonesia', 'pedas', 'Rasa pedas hangat; penghilang amis, bumbu tumis, dan minuman hangat', 'Kupas dan memarkan atau iris tipis Jahe, lalu tumis bersama bumbu dasar dengan api sedang.'),
  ('Jeruk Limau', 'Citrus amblycarpa', 'Buah', 'Indonesia', 'asam', 'Aroma sangat wangi dan asam segar; pelengkap sambal, soto, dan siomay', 'Olahan buah Jeruk Limau: masukkan pada tahap yang sesuai (segar di akhir atau diseduh terukur) agar kesegarannya terjaga.'),
  ('Jeruk Nipis', 'Citrus aurantiifolia', 'Buah', 'Indonesia', 'asam', 'Rasa asam tajam; penghilang bau amis ikan/daging dan penyegar kuah', 'Olahan buah Jeruk Nipis: masukkan pada tahap yang sesuai (segar di akhir atau diseduh terukur) agar kesegarannya terjaga.'),
  ('Jintan', 'Cuminum cyminum', 'Biji', 'Indonesia', 'pahit', 'Aroma hangat sedikit pahit; bumbu opor, gulai, kari, dan sate', 'Sangrai kering Jintan dengan api kecil hingga harum, lalu memarkan atau haluskan sesuai kebutuhan racikan.'),
  ('Kapulaga', 'Amomum compactum', 'Biji/Buah', 'Indonesia', 'manis', 'Aroma hangat manis beraroma kamper; bumbu gulai, soto, dan wedang', 'Sangrai kering Kapulaga dengan api kecil hingga harum, lalu memarkan atau haluskan sesuai kebutuhan racikan.'),
  ('Kayu Manis', 'Cinnamomum burmannii', 'Kulit kayu', 'Indonesia', 'manis', 'Aroma manis dan hangat; bumbu semur, gulai, kue, dan minuman', 'Sangrai singkat atau rebus Kayu Manis perlahan untuk mengekstrak warna serta aroma khasnya.'),
  ('Kayu Secang', 'Biancaea sappan', 'Kulit/Serutan kayu', 'Indonesia', 'pahit', 'Memberi warna merah alami dan rasa sepat ringan; bahan wedang uwuh', 'Sangrai singkat atau rebus Kayu Secang perlahan untuk mengekstrak warna serta aroma khasnya.'),
  ('Kecombrang (Honje)', 'Etlingera elatior', 'Kuntum bunga', 'Indonesia', 'asam', 'Rasa asam segar dan aroma wangi khas; bahan sambal, arsik, dan urap', 'Tambahkan Kecombrang (Honje) pada waktu yang tepat agar aroma dan tekstur halusnya tidak rusak oleh panas berlebih.'),
  ('Kemiri', 'Aleurites moluccanus', 'Biji', 'Indonesia', 'manis', 'Rasa gurih dan mengentalkan kuah; bumbu dasar putih, opor, dan soto', 'Sangrai kering Kemiri dengan api kecil hingga harum, lalu memarkan atau haluskan sesuai kebutuhan racikan.'),
  ('Kemukus', 'Piper cubeba', 'Buah', 'Indonesia', 'pedas', 'Aroma pedas mirip lada bercampur kayu putih; bahan jamu dan bumbu lawas', 'Sangrai tipis atau giling Kemukus sesuai tingkat kepedasan yang diinginkan lalu tumis bersama bumbu.'),
  ('Kencur', 'Kaempferia galanga', 'Rimpang', 'Indonesia', 'pedas', 'Aroma segar menyengat; bumbu seblak, pecel, urap, dan beras kencur', 'Kupas dan memarkan atau iris tipis Kencur, lalu tumis bersama bumbu dasar dengan api sedang.'),
  ('Ketumbar', 'Coriandrum sativum', 'Biji', 'Indonesia', 'asam', 'Aroma harum hangat dengan sentuhan jeruk; bumbu bacem, gorengan, dan opor', 'Sangrai kering Ketumbar dengan api kecil hingga harum, lalu memarkan atau haluskan sesuai kebutuhan racikan.'),
  ('Klabet (Fenugreek)', 'Trigonella foenum-graecum', 'Biji', 'Indonesia', 'pahit', 'Aroma mirip sirup maple dan sedikit pahit; bumbu kari dan gulai', 'Sangrai kering Klabet (Fenugreek) dengan api kecil hingga harum, lalu memarkan atau haluskan sesuai kebutuhan racikan.'),
  ('Kluwek (Kepayang)', 'Pangium edule', 'Biji', 'Indonesia', 'pahit', 'Memberi warna hitam pekat dan rasa gurih earthy; khas rawon dan brongkos', 'Sangrai kering Kluwek (Kepayang) dengan api kecil hingga harum, lalu memarkan atau haluskan sesuai kebutuhan racikan.'),
  ('Kunyit', 'Curcuma longa', 'Rimpang', 'Indonesia', 'manis', 'Memberi warna kuning cerah dan aroma earthy; bumbu kuning, kari, dan jamu', 'Kupas dan memarkan atau iris tipis Kunyit, lalu tumis bersama bumbu dasar dengan api sedang.'),
  ('Lada Hitam', 'Piper nigrum', 'Buah', 'Indonesia', 'pedas', 'Rasa pedas tajam dan aroma kuat; bumbu marinasi, sup, dan tumisan', 'Sangrai tipis atau giling Lada Hitam sesuai tingkat kepedasan yang diinginkan lalu tumis bersama bumbu.'),
  ('Lada Putih', 'Piper nigrum', 'Biji', 'Indonesia', 'pedas', 'Rasa pedas lebih bersih tanpa mengubah warna kuah; khas soto dan sup', 'Sangrai kering Lada Putih dengan api kecil hingga harum, lalu memarkan atau haluskan sesuai kebutuhan racikan.'),
  ('Lengkuas (Laos)', 'Alpinia galanga', 'Rimpang', 'Indonesia', 'asam', 'Aroma segar sedikit pedas; bumbu rendang, sayur asem, dan ayam goreng', 'Kupas dan memarkan atau iris tipis Lengkuas (Laos), lalu tumis bersama bumbu dasar dengan api sedang.'),
  ('Lempuyang', 'Zingiber zerumbet', 'Rimpang', 'Indonesia', 'pahit', 'Rasa pahit pedas dan aroma khas; bahan utama jamu cabe puyang', 'Kupas dan memarkan atau iris tipis Lempuyang, lalu tumis bersama bumbu dasar dengan api sedang.'),
  ('Pala', 'Myristica fragrans', 'Biji', 'Indonesia', 'manis', 'Aroma hangat manis dan sedikit pedas; bumbu sup, semur, dan kue', 'Sangrai kering Pala dengan api kecil hingga harum, lalu memarkan atau haluskan sesuai kebutuhan racikan.'),
  ('Serai (Sereh)', 'Cymbopogon citratus', 'Batang', 'Indonesia', 'asam', 'Aroma sitrus segar; pengharum kuah soto, gulai, pepes, dan sambal', 'Memarkan bagian pangkal Serai (Sereh) lalu masukkan ke dalam kuah atau tumisan agar aroma segarnya keluar.'),
  ('Temu Kunci', 'Boesenbergia rotunda', 'Rimpang', 'Indonesia', 'manis', 'Aroma segar ringan; bumbu wajib sayur bening bayam dan urap', 'Kupas dan memarkan atau iris tipis Temu Kunci, lalu tumis bersama bumbu dasar dengan api sedang.'),
  ('Temulawak', 'Curcuma zanthorrhiza', 'Rimpang', 'Indonesia', 'pahit', 'Rasa pahit dan aroma tajam; bahan utama jamu penambah nafsu makan', 'Kupas dan memarkan atau iris tipis Temulawak, lalu tumis bersama bumbu dasar dengan api sedang.'),
  ('Vanili', 'Vanilla planifolia', 'Polong buah', 'Indonesia', 'manis', 'Aroma manis lembut; pengharum kue, roti, es krim, dan minuman', 'Belah atau memarkan Vanili lalu infusikan pada suhu hangat terkontrol agar aroma lembutnya keluar.')
ON CONFLICT (name) DO UPDATE SET
  latin_name = EXCLUDED.latin_name,
  plant_part = EXCLUDED.plant_part,
  origin_region = EXCLUDED.origin_region,
  dominant_taste = EXCLUDED.dominant_taste,
  characteristics = EXCLUDED.characteristics,
  processing_method = EXCLUDED.processing_method;

-- Resep Khas Indonesia & Rekomendasi Luar Negeri Berempah Indonesia
INSERT INTO recipes (title, origin_country, indonesian_spices, dominant_taste, summary)
VALUES
  ('Kolak Pisang Kayu Manis Kerinci', 'Indonesia', 'Kayu Manis, Kapulaga', 'manis', 'Hidangan penutup khas Indonesia berkuah santan hangat dengan aroma manis kayu manis dan kapulaga.'),
  ('Arsik Ikan Mas Andaliman', 'Indonesia', 'Andaliman, Asam Gelugur, Kecombrang (Honje)', 'asam', 'Masakan khas Batak, Indonesia dengan keasaman asam gelugur dan kesegaran pedas-kebas andaliman.'),
  ('Coto Makassar Rempah Pilihan', 'Indonesia', 'Cengkeh, Pala, Kapulaga, Jintan, Serai (Sereh)', 'pedas', 'Sup daging khas Makassar dengan racikan rempah Nusantara yang gurih hangat dan beraroma kuat.'),
  ('Rawon Hitam Keluwak', 'Indonesia', 'Kluwek (Kepayang), Kemukus, Cengkeh', 'pahit', 'Sup daging berkuah gelap khas Jawa Timur dengan karakter pahit-gurih keluwak dan kehangatan kemukus.'),
  ('Spiced Lamb Tagine', 'Maroko', 'Kayu Manis, Cengkeh, Kapulaga', 'manis', 'Rebusan daging domba khas Maroko dengan sentuhan manis hangat kayu manis dan cengkeh asal Indonesia.'),
  ('Spiced Chai Infusion', 'India', 'Kayu Manis, Kapulaga, Cengkeh, Jahe', 'manis', 'Seduhan teh rempah ala India yang diperkaya kayu manis, kapulaga, dan jahe.'),
  ('Citrus Herb Poached Fish', 'Yunani', 'Andaliman, Asam Gelugur', 'asam', 'Olahan ikan kuah segar gaya Mediterania dengan sentuhan asam dan aroma khas andaliman Indonesia.'),
  ('Smoked Pepper & Clove Roast Beef', 'Amerika Serikat', 'Cengkeh, Kemukus, Lada Hitam', 'pedas', 'Daging panggang dengan lapisan bumbu rempah pedas-hangat berbahan cengkeh, kemukus, dan lada hitam.'),
  ('Warm Nutmeg Cream Sauce', 'Prancis', 'Pala, Fuli (Bunga Pala)', 'pahit', 'Saus krim klasik Prancis dengan sentuhan aroma khas pala dan fuli yang diparut segar.')
ON CONFLICT (title) DO NOTHING;

-- Kelas Studio & Rekaman Pembelajaran
INSERT INTO classes (
  title, category_name, start_date, end_date, teacher_name, teacher_level,
  indonesian_spice, schedule_label, recording_status, recording_url, status
)
VALUES
  (
    'Sangrai & Infusi Kayu Manis Kerinci untuk Hidangan Manis',
    'Teknik Sangrai & Infusi',
    NULL,
    NULL,
    'Chef Basic',
    'basic',
    'Kayu Manis',
    'Studio & Rekaman · Sabtu 09:00 WITA',
    'Video Pembelajaran Diunggah oleh Admin',
    '/videos/kayu-manis-kerinci.mp4',
    'active'
  ),
  (
    'Penerapan Andaliman & Asam Gelugur pada Resep Pilihan',
    'Resep Luar Negeri Berempah',
    '2026-11-24',
    '2026-12-24',
    'Chef Basic',
    'intermediate',
    'Andaliman',
    'Studio & Rekaman · Minggu 13:00 WITA',
    'Video Pembelajaran Diunggah oleh Admin',
    '/videos/andaliman-asam-gelugur.mp4',
    'active'
  )
ON CONFLICT (title) DO NOTHING;

-- Materi Awal Setiap Kelas
INSERT INTO class_materials (class_id, order_index, title, content_body)
SELECT c.id, 1, 'Pengenalan Karakter & Seleksi Rempah', 'Pelajari aroma, bagian tanaman, serta cara memilih rempah khas Indonesia sebelum diolah.'
FROM classes c
WHERE NOT EXISTS (SELECT 1 FROM class_materials cm WHERE cm.class_id = c.id);

INSERT INTO class_materials (class_id, order_index, title, content_body)
SELECT c.id, 2, 'Teknik Pengolahan & Rekaman Studio', 'Ikuti panduan pengolahan rempah serta saksikan rekaman penuh kelas studio yang diunggah Admin.'
FROM classes c
WHERE (SELECT COUNT(*) FROM class_materials cm WHERE cm.class_id = c.id) = 1;

COMMIT;