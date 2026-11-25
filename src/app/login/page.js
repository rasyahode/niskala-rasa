'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const MIN_USERNAME_LENGTH = 3;
const MIN_PASSWORD_LENGTH = 6;

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState('login');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [specialization, setSpecialization] = useState('Makanan Berkuah');
  const [cvLink, setCvLink] = useState('');
  const [certificationLink, setCertificationLink] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [rejectedNotice, setRejectedNotice] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  function redirectByRole(user) {
    if (user.role === 'admin') {
      router.replace('/dashboard/admin');
    } else if (user.role === 'teacher') {
      router.replace('/dashboard/teacher');
    } else {
      router.replace('/dashboard/student');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');
    setRejectedNotice(null);
    setSuccessMsg('');

    // Validasi panjang minimal input
    if (mode === 'register' && fullName.trim().length < MIN_USERNAME_LENGTH) {
      setErrorMsg(`Nama lengkap minimal ${MIN_USERNAME_LENGTH} karakter.`);
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setErrorMsg(`Kata sandi minimal ${MIN_PASSWORD_LENGTH} karakter.`);
      return;
    }

    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload =
        mode === 'login'
          ? { email, password }
          : {
              full_name: fullName.trim(),
              email,
              password,
              role,
              specialization: role === 'teacher' ? specialization : null,
              cv_url: role === 'teacher' ? cvLink.trim() : null,
              certificate_url: role === 'teacher' ? certificationLink.trim() : null,
            };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.status === 'rejected') {
          setRejectedNotice({
            title: 'Akun Anda Ditolak oleh Administrator',
            reason:
              data.rejection_reason ||
              'Pendaftaran akun Anda tidak disetujui oleh Administrator.',
          });
        } else {
          setErrorMsg(data.error || 'Email atau kata sandi salah.');
        }
        setLoading(false);
        return;
      }

      localStorage.setItem('niskala_user', JSON.stringify(data.user));
      redirectByRole(data.user);
    } catch (err) {
      setErrorMsg('Gagal terhubung ke server. Pastikan server Next.js dan PostgreSQL aktif.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F5F7F3] flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#D4E0CD] p-7 sm:p-8 shadow-sm space-y-6">
        {/* Toggle Masuk / Daftar */}
        <div className="grid grid-cols-2 p-1 rounded-full bg-[#EEF3EB] border border-[#DCE5D5]">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={
              mode === 'login'
                ? 'py-2 rounded-full bg-white text-[#2B3E29] text-xs font-bold shadow-xs transition'
                : 'py-2 rounded-full text-stone-600 text-xs font-semibold hover:text-[#2B3E29] transition'
            }
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={
              mode === 'register'
                ? 'py-2 rounded-full bg-white text-[#2B3E29] text-xs font-bold shadow-xs transition'
                : 'py-2 rounded-full text-stone-600 text-xs font-semibold hover:text-[#2B3E29] transition'
            }
          >
            Daftar Baru
          </button>
        </div>

        {rejectedNotice && (
          <div
            role="alert"
            className="px-4 py-3.5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 space-y-1 shadow-xs"
          >
            <p className="text-xs font-bold text-rose-800">
              {rejectedNotice.title}
            </p>
            <p className="text-xs leading-relaxed text-rose-700">
              <strong>Alasan penolakan:</strong> {rejectedNotice.reason}
            </p>
          </div>
        )}

        {errorMsg && (
          <div className="px-4 py-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium leading-relaxed">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="px-4 py-3 rounded-2xl bg-[#EEF3EB] border border-[#B8CCA9] text-[#2B3E29] text-xs font-semibold leading-relaxed">
            {successMsg}
          </div>
        )}

        <div>
          <h1 className="text-2xl font-bold text-stone-900">
            {mode === 'login' ? 'Masuk ke Niskala Rasa' : 'Pendaftaran Anggota Kursus'}
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            {mode === 'login'
              ? 'Gunakan akun Murid, Pengajar, atau Administrator Anda.'
              : 'Lengkapi data di bawah ini untuk ditinjau dan disetujui oleh Administrator.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Nama Lengkap / Username
              </label>
              <input
                type="text"
                required
                minLength={MIN_USERNAME_LENGTH}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Minimal 3 karakter"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-[#4D6B4A]"
              />
              <p className="text-[11px] text-stone-500 mt-1">
                Minimal {MIN_USERNAME_LENGTH} karakter ({fullName.trim().length}/{MIN_USERNAME_LENGTH}).
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@gmail.com"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-[#4D6B4A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Kata Sandi
            </label>
            <input
              type="password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-[#4D6B4A]"
            />
            <p className="text-[11px] text-stone-500 mt-1">
              Minimal {MIN_PASSWORD_LENGTH} karakter ({password.length}/{MIN_PASSWORD_LENGTH}).
            </p>
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Daftar Sebagai
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm bg-white focus:outline-none focus:border-[#4D6B4A]"
                >
                  <option value="student">Murid (Student)</option>
                  <option value="teacher">Pengajar (Teacher · Professional)</option>
                </select>
              </div>

              {role === 'teacher' && (
                <div className="p-4 rounded-2xl bg-[#F5F7F3] border border-[#D4E0CD] space-y-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#3C553A]">
                    Berkas Verifikasi Pengajar Professional
                  </p>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Spesialisasi Kategori Kelas
                    </label>
                    <select
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm bg-white focus:outline-none focus:border-[#4D6B4A]"
                    >
                      <option value="Makanan Berkuah">Makanan Berkuah</option>
                      <option value="Makanan Tidak Berkuah">Makanan Tidak Berkuah</option>
                      <option value="Camilan Kering">Camilan Kering</option>
                      <option value="Minuman">Minuman</option>
                      <option value="Camilan Basah">Camilan Basah</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Tautan Curriculum Vitae (CV)
                    </label>
                    <input
                      type="text"
                      required
                      value={cvLink}
                      onChange={(e) => setCvLink(e.target.value)}
                      placeholder="https://drive.google.com/file/d/cv-anda..."
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs bg-white focus:outline-none focus:border-[#4D6B4A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Tautan Sertifikasi Memasak / Kuliner
                    </label>
                    <input
                      type="text"
                      required
                      value={certificationLink}
                      onChange={(e) => setCertificationLink(e.target.value)}
                      placeholder="https://drive.google.com/file/d/sertifikat-anda..."
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs bg-white focus:outline-none focus:border-[#4D6B4A]"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-[#4D6B4A] text-white text-sm font-bold hover:bg-[#3C553A] disabled:opacity-60 transition shadow-xs"
          >
            {loading ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Kirim Pendaftaran'}
          </button>
        </form>

        <div className="text-center pt-2">
          <Link
            href="/"
            className="text-xs font-semibold text-stone-500 hover:text-[#4D6B4A] transition"
          >
            Kembali ke Beranda (Guest)
          </Link>
        </div>
      </div>
    </div>
  );
}
