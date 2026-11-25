'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const COURSE_TERMS = {
  berkuah: {
    label: '1. Makanan Berkuah (Gulai, Soto, Rawon, Sayur Kuah)',
    rules: [
      'Menguasai teknik kaldu jernih, santan agar tidak pecah, serta penakaran rempah kuah.',
      'Menyertakan teknik pengolahan rempah kunci (sangrai/bakar/memarkan) pada setiap resep.',
      'Mengunggah video pembelajaran berdurasi jelas dengan takaran bahan akurat per porsi.',
      'Menuliskan langkah memasak bertahap dan estimasi waktu masak secara realistis.',
      'Bertanggung jawab memperbarui materi video jika terdapat koreksi takaran bumbu.',
    ],
  },
  tidak_berkuah: {
    label: '2. Makanan Tidak Berkuah (Tumis, Goreng Rempah, Bakar, Sambal)',
    rules: [
      'Menguasai teknik marinasi bumbu meresap, penggorengan renyah, dan pengolahan sambal Nusantara.',
      'Menjelaskan teknik menjaga aroma minyak atsiri rempah segar (seperti andaliman/kecombrang).',
      'Menyajikan video praktik dapur dengan tahapan persiapan bahan dan tingkat kematangan jelas.',
      'Melampirkan takaran bumbu halus, bumbu aromatik, dan perkiraan porsi hidangan.',
      'Menjaga keaslian teknik olah rempah tanpa menghilangkan ciri khas daerah resep.',
    ],
  },
  camilan_kering: {
    label: '3. Camilan Kering (Kue Kering Rempah, Keripik, Stik Renyah)',
    rules: [
      'Menguasai takaran gramasi adonan, suhu pemanggangan oven, dan teknik penggorengan garing.',
      'Menjelaskan metode pengayakan/penyangraian rempah bubuk atau rempah halus agar tidak pahit.',
      'Menyertakan panduan penyimpanan kedap udara agar kerenyahan produk tahan lama.',
      'Mengunggah video pembelajaran yang memperlihatkan tekstur adonan sebelum dan sesudah matang.',
      'Mencantumkan estimasi hasil jadi (jumlah toples atau berat bersih gram) secara akurat.',
    ],
  },
  minuman: {
    label: '4. Minuman (Jamu Tradisional, Wedang Rempah, Teh Rempah)',
    rules: [
      'Menguasai pemilihan rimpang segar (emprit/tua) dan takaran perebusan ekstrak rempah.',
      'Menjelaskan cara menyeimbangkan rasa pahit-pedas rimpang dengan asam alami atau gula aren.',
      'Mencantumkan aturan suhu penyajian (misalnya penambahan madu saat suhu hangat).',
      'Menyajikan video tutorial higienis mulai dari pencucian, penyaringan, hingga penyajian.',
      'Menyertakan takaran volume air bersih dan estimasi jumlah gelas/cangkir sajian.',
    ],
  },
  camilan_basah: {
    label: '5. Camilan Basah (Kue Kukus, Jajanan Pasar, Puding & Kolak)',
    rules: [
      'Menguasai ekstraksi pewarna dan pengharum alami (endapan daun suji, daun pandan, polong vanili).',
      'Menjelaskan teknik pengukusan, perebusan santan, atau pemanggangan berlapis secara presisi.',
      'Menyertakan takaran isian (unti kelapa, vla vanili, kinca) dan kulit kue secara terpisah.',
      'Mengunggah video tutorial yang menampilkan konsistensi adonan yang tepat anti gagal.',
      'Mencantumkan jumlah porsi/potongan kue dan saran penyajian terbaik.',
    ],
  },
};

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState('student');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [specialty, setSpecialty] = useState('berkuah');
  const [cvInfo, setCvInfo] = useState('');
  const [license, setLicense] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: username,
        username,
        email,
        password,
        role,
        teacher_specialty: role === 'teacher' ? specialty : null,
        cv_info: role === 'teacher' ? cvInfo : null,
        professional_license: role === 'teacher' ? license : null,
        agreed_terms: role === 'teacher' ? agreedTerms : true,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setErrorMsg(data.error || 'Pendaftaran gagal.');
      return;
    }

    localStorage.setItem('niskala_user', JSON.stringify(data.user));
    if (role === 'teacher') {
      router.push('/dashboard/teacher');
    } else {
      router.push('/dashboard/student');
    }
  }

  const activeTerms = COURSE_TERMS[specialty];

  return (
    <div className="min-h-screen bg-[#F6F8F5] text-stone-800 px-6 py-10">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl border border-stone-200 shadow-sm">
        <h1 className="text-2xl font-bold text-stone-900 mb-1">Daftar Akun Niskala Rasa</h1>
        <p className="text-sm text-stone-500 mb-6">
          Pilih peran sebagai Murid untuk belajar resep, atau daftar sebagai Pengajar spesialis
          kategori kuliner.
        </p>

        {/* Pilih Peran */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setRole('student')}
            className={`py-2.5 px-4 rounded-xl text-sm font-semibold border transition ${
              role === 'student'
                ? 'bg-[#556B56] text-white border-[#556B56]'
                : 'bg-stone-50 text-stone-700 border-stone-200'
            }`}
          >
            Daftar Sebagai Murid
          </button>
          <button
            type="button"
            onClick={() => setRole('teacher')}
            className={`py-2.5 px-4 rounded-xl text-sm font-semibold border transition ${
              role === 'teacher'
                ? 'bg-[#556B56] text-white border-[#556B56]'
                : 'bg-stone-50 text-stone-700 border-stone-200'
            }`}
          >
            Daftar Sebagai Pengajar
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-900">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Nama Lengkap</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Kata Sandi</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm"
              />
            </div>
          </div>

          {role === 'teacher' && (
            <div className="space-y-4 pt-3 border-t border-stone-200">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Pilih Kategori Course yang Akan Diajar (5 Kategori)
                </label>
                <select
                  value={specialty}
                  onChange={(e) => {
                    setSpecialty(e.target.value);
                    setAgreedTerms(false);
                  }}
                  className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm bg-white"
                >
                  <option value="berkuah">1. Makanan Berkuah</option>
                  <option value="tidak_berkuah">2. Makanan Tidak Berkuah</option>
                  <option value="camilan_kering">3. Camilan Kering</option>
                  <option value="minuman">4. Minuman</option>
                  <option value="camilan_basah">5. Camilan Basah</option>
                </select>
              </div>

              {/* 5 Ketentuan Khusus Sesuai Course yang Dipilih */}
              <div className="p-4 rounded-xl bg-[#F2F6F2] border border-[#C8D6C8]">
                <p className="text-xs font-bold uppercase tracking-wider text-[#3F5240] mb-2">
                  5 Ketentuan Pengajar — {activeTerms.label}
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-stone-700">
                  {activeTerms.rules.map((rule, idx) => (
                    <li key={idx}>{rule}</li>
                  ))}
                </ol>

                <label className="mt-3 flex items-start gap-2 text-xs font-semibold text-stone-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span>
                    Saya telah membaca dan menyetujui seluruh 5 ketentuan pengajar untuk kategori
                    course yang saya pilih.
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Ringkasan CV & Pengalaman Kuliner
                </label>
                <textarea
                  rows={2}
                  required
                  value={cvInfo}
                  onChange={(e) => setCvInfo(e.target.value)}
                  placeholder="Tuliskan pengalaman memasak/mengajar sesuai kategori pilihan..."
                  className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nomor Sertifikat / Lisensi Keahlian
                </label>
                <input
                  type="text"
                  required
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                  placeholder="Contoh: CERT-KULINER-2026-09"
                  className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-lg bg-[#556B56] text-white text-sm font-semibold hover:bg-[#435644]"
          >
            {role === 'teacher' ? 'Ajukan Pendaftaran Pengajar' : 'Daftar Sekarang'}
          </button>
        </form>

        <p className="text-xs text-stone-500 mt-5 text-center">
          Sudah punya akun?{' '}
          <Link href="/login" className="font-semibold text-[#556B56] underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
