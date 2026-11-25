'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const STORAGE_CATEGORIES_KEY = 'niskala_admin_categories';
const STORAGE_TEACHERS_KEY = 'niskala_admin_teachers';
const STORAGE_STUDENTS_KEY = 'niskala_admin_students';
const STORAGE_VERIFICATIONS_KEY = 'niskala_admin_verifications';
const STORAGE_ADMIN_PROFILE_KEY = 'niskala_admin_profile';

const DEFAULT_FIVE_CATEGORIES = [
  'Makanan Berkuah',
  'Makanan Tidak Berkuah',
  'Camilan Kering',
  'Minuman',
  'Camilan Basah',
];

const DEFAULT_TEACHERS = [
  {
    id: 'teacher-1',
    name: 'Raka Pratama Wijaya Kusuma Putra',
    email: 'raka@gmail.com',
    password: '••••••••',
    specialty: 'Makanan Berkuah',
    role: 'teacher',
  },
  {
    id: 'teacher-2',
    name: 'Sari Dewi Lestari Putri Andini',
    email: 'sari@gmail.com',
    password: '••••••••',
    specialty: 'Makanan Tidak Berkuah',
    role: 'teacher',
  },
  {
    id: 'teacher-3',
    name: 'Dimas Aditya Nugraha Pratama Jaya',
    email: 'dimas@gmail.com',
    password: '••••••••',
    specialty: 'Camilan Kering',
    role: 'teacher',
  },
  {
    id: 'teacher-4',
    name: 'Tari Wulandari Kusuma Ningrum',
    email: 'tari@gmail.com',
    password: '••••••••',
    specialty: 'Camilan Basah',
    role: 'teacher',
  },
  {
    id: 'teacher-5',
    name: 'Bima Sakti Prakoso Santoso',
    email: 'bima@gmail.com',
    password: '••••••••',
    specialty: 'Minuman',
    role: 'teacher',
  },
];

const DEFAULT_STUDENTS = [
  {
    id: 'student-1',
    name: 'Putri Lestari Kusuma Wardani',
    email: 'putri@gmail.com',
    password: '••••••••',
    level: 'Murid Terdaftar',
    role: 'student',
  },
];

function readLocalArray(key) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeLocalJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Abaikan error storage
  }
}

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams?.get('tab') || 'categories';

  const [user, setUser] = useState(null);
  const [adminProfile, setAdminProfile] = useState({
    name: 'Admin Utama Niskala Rasa Indonesia',
    email: 'admin@gmail.com',
    password: '',
  });
  const [adminPasswordConfirm, setAdminPasswordConfirm] = useState('');

  const [categories, setCategories] = useState(DEFAULT_FIVE_CATEGORIES);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [teachers, setTeachers] = useState(DEFAULT_TEACHERS);
  const [editingTeacherId, setEditingTeacherId] = useState(null);
  const [teacherForm, setTeacherForm] = useState({
    name: '',
    email: '',
    password: '',
    specialty: 'Makanan Berkuah',
    specialties: ['Makanan Berkuah'],
  });

  const [students, setStudents] = useState(DEFAULT_STUDENTS);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [verifications, setVerifications] = useState([]);
  const [rejectingApplicant, setRejectingApplicant] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [confirmDeleteAdmin, setConfirmDeleteAdmin] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');

  // Muat sesi cookie + profil admin tersimpan saat refresh
  useEffect(() => {
    let cookieUser = null;
    try {
      const cookieStr = document.cookie || '';
      const found = cookieStr
        .split(';')
        .map((c) => c.trim())
        .find((c) => c.startsWith('niskala_user='));
      if (found) {
        const raw = decodeURIComponent(found.split('=').slice(1).join('='));
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.email || parsed.role)) {
          cookieUser = parsed;
          setUser(parsed);
        }
      }
    } catch {
      setUser(null);
    }

    try {
      const savedAdminRaw = window.localStorage.getItem(
        STORAGE_ADMIN_PROFILE_KEY
      );
      if (savedAdminRaw) {
        const savedAdmin = JSON.parse(savedAdminRaw);
        if (savedAdmin && (savedAdmin.name || savedAdmin.email)) {
          setAdminProfile((prev) => ({
            ...prev,
            name: savedAdmin.name || prev.name,
            email: savedAdmin.email || prev.email,
          }));
          return;
        }
      }
    } catch {
      // Abaikan error storage
    }

    if (cookieUser) {
      setAdminProfile((prev) => ({
        ...prev,
        name: cookieUser.name || cookieUser.full_name || prev.name,
        email: cookieUser.email || prev.email,
      }));
    }
  }, []);

  // Muat seluruh data & prioritaskan perubahan yang sudah disimpan agar tahan refresh
  useEffect(() => {
    let active = true;

    async function loadAdminData() {
      // 1. Kategori Kelas
      const savedCats = readLocalArray(STORAGE_CATEGORIES_KEY);
      if (savedCats && savedCats.length > 0) {
        if (active) setCategories(savedCats);
      } else {
        try {
          const resCls = await fetch('/api/classes', { cache: 'no-store' });
          if (resCls.ok) {
            const dataCls = await resCls.json();
            const list = Array.isArray(dataCls?.classes)
              ? dataCls.classes
              : Array.isArray(dataCls)
                ? dataCls
                : [];
            if (active && list.length > 0) {
              const cats = Array.from(
                new Set(
                  list
                    .map((c) => String(c?.category_name || '').trim())
                    .filter(Boolean)
                )
              );
              if (cats.length > 0) {
                setCategories(cats);
                writeLocalJson(STORAGE_CATEGORIES_KEY, cats);
              }
            }
          }
        } catch {
          // Pertahankan default 5 kategori
        }
      }

      // 2. Pengajar, Murid & Antrean Verifikasi dari /api/users + localStorage
      const savedTeachers = readLocalArray(STORAGE_TEACHERS_KEY);
      const savedStudents = readLocalArray(STORAGE_STUDENTS_KEY);
      const savedVerifications = readLocalArray(STORAGE_VERIFICATIONS_KEY);

      if (savedTeachers && savedTeachers.length > 0 && active) {
        setTeachers(savedTeachers);
      }
      if (savedStudents && savedStudents.length > 0 && active) {
        setStudents(savedStudents);
      }

      const combinedVerifications = savedVerifications
        ? [...savedVerifications]
        : [];

      try {
        const resUsers = await fetch('/api/users', { cache: 'no-store' });
        if (resUsers.ok) {
          const dataUsers = await resUsers.json();
          const list = Array.isArray(dataUsers?.users)
            ? dataUsers.users
            : Array.isArray(dataUsers)
              ? dataUsers
              : [];
          if (active && list.length > 0) {
            const apiTeachers = list
              .filter(
                (u) =>
                  String(u?.role || '').toLowerCase() === 'teacher' &&
                  String(u?.status || 'active').toLowerCase() !== 'pending'
              )
              .map((t, idx) => ({
                id: t.id ?? `teacher-api-${idx}`,
                name: t.name || t.full_name || t.email,
                email: t.email,
                password: '',
                specialty:
                  t.specialty ||
                  t.category_name ||
                  DEFAULT_FIVE_CATEGORIES[idx % DEFAULT_FIVE_CATEGORIES.length],
                role: 'teacher',
              }));

            const apiStudents = list
              .filter(
                (u) =>
                  String(u?.role || '').toLowerCase() === 'student' &&
                  String(u?.status || 'active').toLowerCase() !== 'pending'
              )
              .map((s, idx) => ({
                id: s.id ?? `student-api-${idx}`,
                name: s.name || s.full_name || s.email,
                email: s.email,
                password: '',
                level: s.skill_level || s.level || 'Murid Terdaftar',
                enrolled_classes_count: Number(s.enrolled_classes_count || 0),
                role: 'student',
              }));

            if (apiTeachers.length > 0) {
              setTeachers(apiTeachers);
              writeLocalJson(STORAGE_TEACHERS_KEY, apiTeachers);
            }
            if (apiStudents.length > 0) {
              setStudents(apiStudents);
              writeLocalJson(STORAGE_STUDENTS_KEY, apiStudents);
            }

            list
              .filter(
                (u) => String(u?.status || '').toLowerCase() === 'pending'
              )
              .forEach((item) => {
                const emailKey = String(item?.email || '').toLowerCase().trim();
                if (
                  emailKey &&
                  !combinedVerifications.some(
                    (v) =>
                      String(v?.email || '').toLowerCase().trim() === emailKey
                  )
                ) {
                  combinedVerifications.push(item);
                }
              });
          }
        }
      } catch {
        // Pertahankan data lokal/default bila endpoint tidak tersedia
      }

      // Cek antrean pendaftar baru yang tersimpan di localStorage
      try {
        const rawPendingReg = window.localStorage.getItem(
          'niskala_pending_registrations'
        );
        if (rawPendingReg) {
          const parsedReg = JSON.parse(rawPendingReg);
          if (Array.isArray(parsedReg)) {
            parsedReg.forEach((item) => {
              const emailKey = String(item?.email || '').toLowerCase().trim();
              if (
                emailKey &&
                !combinedVerifications.some(
                  (v) => String(v?.email || '').toLowerCase().trim() === emailKey
                )
              ) {
                combinedVerifications.push({
                  id: item.id || `reg-${emailKey}`,
                  name: item.name || item.full_name || emailKey,
                  email: item.email,
                  role: item.role || 'student',
                  specialty: item.specialty || 'Makanan Berkuah',
                  status: 'pending',
                });
              }
            });
          }
        }
      } catch {
        // Abaikan error storage
      }

      if (active) {
        setVerifications(combinedVerifications);
      }

      // 3. Materi Resep (Hanya baca daftar)
      try {
        const resRec = await fetch('/api/recipes', { cache: 'no-store' });
        if (resRec.ok) {
          const dataRec = await resRec.json();
          const list = Array.isArray(dataRec?.recipes)
            ? dataRec.recipes
            : Array.isArray(dataRec)
              ? dataRec
              : [];
          if (active) setRecipes(list);
        }
      } catch {
        // Abaikan bila API gagal
      }
    }

    loadAdminData();
    return () => {
      active = false;
    };
  }, []);

  const initialLetter =
    String(adminProfile.name || 'A').charAt(0).toUpperCase() || 'A';

  // --- Simpan Profil Admin ---
  async function handleSaveAdminProfile(e) {
    e.preventDefault();
    const trimmedName = adminProfile.name.trim();
    const trimmedEmail = adminProfile.email.trim();
    if (!trimmedName || !trimmedEmail) return;

    if (
      adminProfile.password &&
      adminPasswordConfirm &&
      adminProfile.password !== adminPasswordConfirm
    ) {
      setStatusMessage('Konfirmasi sandi baru tidak cocok.');
      return;
    }

    const updatedProfile = {
      name: trimmedName,
      email: trimmedEmail,
      role: 'admin',
    };

    writeLocalJson(STORAGE_ADMIN_PROFILE_KEY, updatedProfile);
    setAdminProfile((prev) => ({
      ...prev,
      name: trimmedName,
      email: trimmedEmail,
      password: '',
    }));
    setAdminPasswordConfirm('');

    try {
      const nextCookieUser = {
        ...(user || {}),
        name: trimmedName,
        full_name: trimmedName,
        email: trimmedEmail,
        role: 'admin',
      };
      document.cookie = `niskala_user=${encodeURIComponent(
        JSON.stringify(nextCookieUser)
      )}; Path=/; Max-Age=86400;`;
      setUser(nextCookieUser);
    } catch {
      // Abaikan error cookie
    }

    try {
      await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user?.id || 'admin',
          role: 'admin',
          name: trimmedName,
          email: trimmedEmail,
          ...(adminProfile.password ? { password: adminProfile.password } : {}),
        }),
      });
    } catch {
      // Abaikan bila API PUT belum tersedia
    }

    setStatusMessage('Profil Administrator berhasil diperbarui dan disimpan.');
  }

  // --- Kelola Kategori Kelas ---
  async function handleAddCategory(e) {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    if (!categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      const nextCategories = [...categories, trimmed];
      setCategories(nextCategories);
      writeLocalJson(STORAGE_CATEGORIES_KEY, nextCategories);

      try {
        await fetch('/api/classes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category_name: trimmed,
            title: `Kelas ${trimmed}`,
          }),
        });
      } catch {
        // Abaikan bila API POST belum tersedia
      }

      setStatusMessage(`Kategori "${trimmed}" berhasil ditambahkan.`);
    }
    setNewCategoryName('');
  }

  async function handleDeleteCategory(targetCat) {
    const nextCategories = categories.filter((cat) => cat !== targetCat);
    setCategories(nextCategories);
    writeLocalJson(STORAGE_CATEGORIES_KEY, nextCategories);

    try {
      await fetch('/api/classes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_name: targetCat }),
      });
    } catch {
      // Abaikan bila API DELETE belum tersedia
    }

    setStatusMessage(`Kategori "${targetCat}" berhasil dihapus.`);
  }

  // --- Edit Profil Guru (Pop-up Modal) ---
  function startEditTeacher(teacher) {
    const parsedSpecs = String(
      teacher.specialty || categories[0] || DEFAULT_FIVE_CATEGORIES[0]
    )
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    setEditingTeacherId(teacher.id);
    setTeacherForm({
      name: teacher.name || '',
      email: teacher.email || '',
      password: '',
      specialty: parsedSpecs.join(', '),
      specialties: parsedSpecs,
    });
  }

  async function handleSaveTeacher(e) {
    e.preventDefault();
    if (!editingTeacherId) return;

    const selectedSpecs =
      Array.isArray(teacherForm.specialties) && teacherForm.specialties.length > 0
        ? teacherForm.specialties
        : [teacherForm.specialty || categories[0] || DEFAULT_FIVE_CATEGORIES[0]];
    const joinedSpecialty = selectedSpecs.join(', ');

    const updatedList = teachers.map((t) => {
      if (t.id !== editingTeacherId) return t;
      return {
        ...t,
        name: teacherForm.name.trim() || t.name,
        email: teacherForm.email.trim() || t.email,
        specialty: joinedSpecialty,
        ...(teacherForm.password.trim()
          ? { password: teacherForm.password.trim() }
          : {}),
      };
    });

    setTeachers(updatedList);
    writeLocalJson(STORAGE_TEACHERS_KEY, updatedList);

    try {
      await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingTeacherId,
          role: 'teacher',
          name: teacherForm.name.trim(),
          email: teacherForm.email.trim(),
          specialty: joinedSpecialty,
          specialties: selectedSpecs,
          ...(teacherForm.password.trim()
            ? { password: teacherForm.password.trim() }
            : {}),
        }),
      });
    } catch {
      // Abaikan bila API PUT belum tersedia
    }

    setEditingTeacherId(null);
    setStatusMessage(
      `Data pengajar "${teacherForm.name.trim()}" berhasil diperbarui dan disimpan.`
    );
  }

  // --- Edit Profil Murid (Pop-up Modal) ---
  function startEditStudent(student) {
    setEditingStudentId(student.id);
    setStudentForm({
      name: student.name || '',
      email: student.email || '',
      password: '',
    });
  }

  async function handleSaveStudent(e) {
    e.preventDefault();
    if (!editingStudentId) return;

    const updatedList = students.map((s) => {
      if (s.id !== editingStudentId) return s;
      return {
        ...s,
        name: studentForm.name.trim() || s.name,
        email: studentForm.email.trim() || s.email,
        ...(studentForm.password.trim()
          ? { password: studentForm.password.trim() }
          : {}),
      };
    });

    setStudents(updatedList);
    writeLocalJson(STORAGE_STUDENTS_KEY, updatedList);

    try {
      await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingStudentId,
          role: 'student',
          name: studentForm.name.trim(),
          email: studentForm.email.trim(),
          ...(studentForm.password.trim()
            ? { password: studentForm.password.trim() }
            : {}),
        }),
      });
    } catch {
      // Abaikan bila API PUT belum tersedia
    }

    setEditingStudentId(null);
    setStatusMessage(
      `Data murid "${studentForm.name.trim()}" berhasil diperbarui dan disimpan.`
    );
  }

  // --- Verifikasi (ACC / Tolak) Pendaftar Baru ---
  async function handleVerificationDecision(
    applicant,
    decision,
    reasonText = ''
  ) {
    const appId = applicant.id ?? applicant.email;
    const remaining = verifications.filter(
      (v) => (v.id ?? v.email) !== appId
    );
    setVerifications(remaining);
    writeLocalJson(STORAGE_VERIFICATIONS_KEY, remaining);

    try {
      const rawPending = window.localStorage.getItem(
        'niskala_pending_registrations'
      );
      if (rawPending) {
        const parsed = JSON.parse(rawPending);
        if (Array.isArray(parsed)) {
          const filteredPending = parsed.filter(
            (p) =>
              String(p?.email || '').toLowerCase() !==
              String(applicant?.email || '').toLowerCase()
          );
          window.localStorage.setItem(
            'niskala_pending_registrations',
            JSON.stringify(filteredPending)
          );
        }
      }
    } catch {
      // Abaikan error storage
    }

    if (decision === 'approved') {
      const applicantRole = String(applicant.role || 'student').toLowerCase();
      if (applicantRole === 'teacher') {
        const nextTeachers = [
          ...teachers,
          {
            id: applicant.id || `teacher-${Date.now()}`,
            name: applicant.name || applicant.email,
            email: applicant.email,
            password: applicant.password || '',
            specialty:
              applicant.specialty ||
              categories[0] ||
              DEFAULT_FIVE_CATEGORIES[0],
            role: 'teacher',
          },
        ];
        setTeachers(nextTeachers);
        writeLocalJson(STORAGE_TEACHERS_KEY, nextTeachers);
      } else {
        const nextStudents = [
          ...students,
          {
            id: applicant.id || `student-${Date.now()}`,
            name: applicant.name || applicant.email,
            email: applicant.email,
            password: applicant.password || '',
            level: 'Murid Terdaftar',
            role: 'student',
          },
        ];
        setStudents(nextStudents);
        writeLocalJson(STORAGE_STUDENTS_KEY, nextStudents);
      }
    }

    try {
      if (decision === 'rejected') {
        await fetch('/api/users', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: applicant.id,
            email: applicant.email,
            is_rejection: true,
            rejection_reason: reasonText.trim(),
          }),
        });
      } else {
        await fetch('/api/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: applicant.id,
            email: applicant.email,
            role: applicant.role,
            status: 'approved',
          }),
        });
      }
    } catch {
      // Abaikan bila endpoint belum tersedia
    }

    setStatusMessage(
      decision === 'approved'
        ? `Pendaftar "${applicant.name || applicant.email}" berhasil di-ACC dan diaktifkan.`
        : `Pendaftar "${applicant.name || applicant.email}" telah ditolak dan data akunnya dihapus.`
    );
  }

  async function handleDeleteTeacher(teacher) {
    if (!teacher) return;
    const nextTeachers = teachers.filter((t) => t.id !== teacher.id);
    setTeachers(nextTeachers);
    writeLocalJson(STORAGE_TEACHERS_KEY, nextTeachers);

    try {
      await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: teacher.id, email: teacher.email }),
      });
    } catch {
      // Abaikan bila endpoint belum tersedia
    }

    setStatusMessage(
      `Pengajar "${teacher.name || teacher.email}" berhasil dihapus.`
    );
  }

  async function handleDeleteStudent(student) {
    if (!student) return;
    if (Number(student.enrolled_classes_count || 0) > 0) {
      setStatusMessage(
        `Murid "${student.name || student.email}" tidak dapat dihapus karena masih mengikuti ${student.enrolled_classes_count} kelas.`
      );
      return;
    }

    try {
      const res = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: student.id, email: student.email }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setStatusMessage(
          errData?.error ||
            `Murid "${student.name || student.email}" tidak dapat dihapus karena masih mengikuti kelas.`
        );
        return;
      }
    } catch {
      // Abaikan bila endpoint belum tersedia
    }

    const nextStudents = students.filter((s) => s.id !== student.id);
    setStudents(nextStudents);
    writeLocalJson(STORAGE_STUDENTS_KEY, nextStudents);

    setStatusMessage(
      `Murid "${student.name || student.email}" berhasil dihapus.`
    );
  }

  async function handleConfirmReject(e) {
    e.preventDefault();
    if (!rejectingApplicant) return;
    const reason = rejectionReason.trim();
    if (!reason) return;
    const target = rejectingApplicant;
    setRejectingApplicant(null);
    setRejectionReason('');
    await handleVerificationDecision(target, 'rejected', reason);
  }

  async function handleDeleteRecipe(recipeItem) {
    if (!recipeItem) return;
    const idStr = String(recipeItem.id);
    setRecipes((prev) => prev.filter((r) => String(r.id) !== idStr));

    try {
      const rawCustom = window.localStorage.getItem(
        'niskala_teacher_custom_recipes'
      );
      if (rawCustom) {
        const parsed = JSON.parse(rawCustom);
        if (Array.isArray(parsed)) {
          window.localStorage.setItem(
            'niskala_teacher_custom_recipes',
            JSON.stringify(parsed.filter((r) => String(r.id) !== idStr))
          );
        }
      }
      const rawDeleted = window.localStorage.getItem('niskala_deleted_recipes');
      const deletedList = rawDeleted ? JSON.parse(rawDeleted) : [];
      const nextDeleted = Array.isArray(deletedList)
        ? Array.from(new Set([...deletedList.map(String), idStr]))
        : [idStr];
      window.localStorage.setItem(
        'niskala_deleted_recipes',
        JSON.stringify(nextDeleted)
      );
    } catch {
      // Abaikan error storage
    }

    try {
      await fetch(`/api/recipes?id=${encodeURIComponent(idStr)}`, {
        method: 'DELETE',
      });
    } catch {
      // Abaikan error API
    }

    setStatusMessage(
      `Materi resep "${recipeItem.title || idStr}" berhasil dihapus.`
    );
  }

  async function handleLogout() {
    setUser(null);

    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Abaikan bila endpoint tidak tersedia
    }

    [
      'niskala_user',
      'niskala_token',
      'token',
      'session',
      'auth_token',
    ].forEach((name) => {
      document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
      document.cookie = `${name}=; Path=/; Max-Age=0;`;
    });

    try {
      window.localStorage.removeItem('niskala_user');
      window.localStorage.removeItem('user');
      window.localStorage.removeItem('currentUser');
      window.localStorage.removeItem('niskala_auth');
      window.sessionStorage.clear();
    } catch {
      // Abaikan error storage
    }

    window.location.href = '/login';
  }

  const navItems = [
    {
      key: 'profile',
      label: 'Profil Admin',
      badge: null,
    },
    {
      key: 'verifications',
      label: 'Verifikasi Pendaftaran',
      badge: verifications.length,
    },
    {
      key: 'categories',
      label: 'Kategori Kelas Kursus',
      badge: categories.length,
    },
    {
      key: 'teachers',
      label: 'Daftar Pengajar',
      badge: teachers.length,
    },
    {
      key: 'students',
      label: 'Daftar Murid',
      badge: students.length,
    },
    {
      key: 'recipes',
      label: 'Semua Materi Resep',
      badge: recipes.length || 50,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f4f6f3] text-[#1e2923]">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row lg:px-10 lg:py-10">
        {/* Sidebar Portal Admin (Sticky) */}
        <aside className="w-full shrink-0 lg:sticky lg:top-24 lg:w-68 lg:self-start">
          <div className="rounded-3xl border border-[#e3eae1] bg-white p-6 shadow-2xs">
            <div className="rounded-2xl border border-[#e3eae1] bg-[#f8faf7] p-4 text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#4e674c] text-sm font-bold text-white">
                {initialLetter}
              </div>
              <p className="mt-2.5 truncate text-xs font-bold text-[#1a2820]">
                {adminProfile.name}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-[#5d6f63]">
                {adminProfile.email}
              </p>
              <p className="mt-2.5 inline-block rounded-full bg-[#eef3ec] px-3 py-1 text-[11px] font-semibold text-[#3f553d]">
                Halo, {String(adminProfile.name || 'Admin').trim().split(/\s+/)[0]}!
              </p>
            </div>

            <nav className="mt-5 space-y-1.5">
              {navItems.map((item) => {
                const isActive = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() =>
                      router.push(`/dashboard/admin?tab=${item.key}`)
                    }
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-left text-xs font-semibold transition-colors ${
                      isActive
                        ? 'border border-[#dce5d9] bg-[#f4f7f3] text-[#1a2820] shadow-2xs'
                        : 'text-[#3b4f42] hover:bg-[#f8faf7]'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.badge !== null && (
                      <span className="text-[11px] text-[#5d6f63]">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="mt-6 border-t border-[#edf2ec] pt-4">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#2d4034] transition-colors hover:bg-[#f4f7f3]"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1f2922] text-[10px] font-bold text-white">
                  N
                </span>
                Keluar Akun
              </button>
            </div>
          </div>
        </aside>

        {/* Konten Utama */}
        <main className="flex-1 space-y-7">
          <section className="rounded-3xl border border-[#e3eae1] bg-white p-6 shadow-2xs sm:p-8">
            <h1 className="text-2xl font-bold text-[#1a2820]">
              Dashboard Administrator
            </h1>
            <p className="mt-1.5 text-xs text-[#5d6f63]">
              Selamat datang, {adminProfile.name}.
            </p>
          </section>

          {statusMessage && (
            <div className="rounded-2xl border border-[#cfe0cc] bg-[#eef5ed] px-5 py-3.5 text-xs font-medium text-[#2e4933]">
              {statusMessage}
            </div>
          )}

          {/* TAB 1: PROFIL ADMIN */}
          {activeTab === 'profile' && (
            <section className="rounded-3xl border border-[#e3eae1] bg-white p-6 shadow-2xs sm:p-8">
              <h2 className="text-lg font-bold text-[#1a2820]">
                Ubah Profil Administrator
              </h2>
              <p className="mt-1 text-xs text-[#5d6f63]">
                Perbarui nama tampilan, email, atau kata sandi akun admin Anda.
              </p>

              <form
                onSubmit={handleSaveAdminProfile}
                className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2"
              >
                <div>
                  <label className="block text-[11px] font-bold text-[#557153] uppercase">
                    Nama Lengkap Admin
                  </label>
                  <input
                    type="text"
                    required
                    value={adminProfile.name}
                    onChange={(e) =>
                      setAdminProfile((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="mt-1.5 w-full rounded-xl border border-[#d6dfd3] bg-[#fafbfa] px-4 py-2.5 text-xs text-[#1e2923] outline-none focus:border-[#557153]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#557153] uppercase">
                    Email Admin
                  </label>
                  <input
                    type="email"
                    required
                    value={adminProfile.email}
                    onChange={(e) =>
                      setAdminProfile((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="mt-1.5 w-full rounded-xl border border-[#d6dfd3] bg-[#fafbfa] px-4 py-2.5 text-xs text-[#1e2923] outline-none focus:border-[#557153]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#557153] uppercase">
                    Kata Sandi Baru (Opsional)
                  </label>
                  <input
                    type="password"
                    value={adminProfile.password}
                    onChange={(e) =>
                      setAdminProfile((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    placeholder="Kosongkan jika tidak diubah"
                    className="mt-1.5 w-full rounded-xl border border-[#d6dfd3] bg-[#fafbfa] px-4 py-2.5 text-xs text-[#1e2923] outline-none focus:border-[#557153]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#557153] uppercase">
                    Konfirmasi Sandi Baru
                  </label>
                  <input
                    type="password"
                    value={adminPasswordConfirm}
                    onChange={(e) => setAdminPasswordConfirm(e.target.value)}
                    placeholder="Ulangi kata sandi baru"
                    className="mt-1.5 w-full rounded-xl border border-[#d6dfd3] bg-[#fafbfa] px-4 py-2.5 text-xs text-[#1e2923] outline-none focus:border-[#557153]"
                  />
                </div>

                <div className="pt-2 sm:col-span-2">
                  <button
                    type="submit"
                    className="rounded-xl bg-[#4e674c] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#3f553d]"
                  >
                    Simpan Perubahan Profil
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* TAB 2: VERIFIKASI PENDAFTAR BARU (ACC / TOLAK) */}
          {activeTab === 'verifications' && (
            <section className="rounded-3xl border border-[#e3eae1] bg-white p-6 shadow-2xs sm:p-8">
              <h2 className="text-lg font-bold text-[#1a2820]">
                Verifikasi Pendaftaran ({verifications.length})
              </h2>
              <p className="mt-1 text-xs text-[#5d6f63]">
                Setujui (ACC) atau tolak pendaftaran akun pengajar maupun murid
                baru.
              </p>

              {verifications.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-[#e3eae1] bg-[#f9fbf8] p-6 text-xs text-[#5d6f63]">
                  Tidak ada pendaftar baru yang menunggu verifikasi saat ini.
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {verifications.map((app, idx) => (
                    <div
                      key={app.id ?? app.email ?? idx}
                      className="flex flex-col justify-between rounded-2xl border border-[#e3eae1] bg-[#fafbf9] p-5"
                    >
                      <div>
                        <p className="text-[10px] font-bold tracking-wider text-[#557153] uppercase">
                          Calon{' '}
                          {String(app.role || 'student').toLowerCase() ===
                          'teacher'
                            ? 'Pengajar'
                            : 'Murid'}
                        </p>
                        <h3 className="mt-1 text-sm font-bold text-[#1a2820]">
                          {app.name || app.full_name || app.email}
                        </h3>
                        <p className="mt-0.5 text-xs text-[#5d6f63]">
                          {app.email}
                        </p>
                        {String(app.role || '').toLowerCase() === 'teacher' &&
                          app.specialty && (
                            <p className="mt-1 text-xs font-medium text-[#4e674c]">
                              Spesialisasi: {app.specialty}
                            </p>
                          )}
                      </div>

                      <div className="mt-4 flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() =>
                            handleVerificationDecision(app, 'approved')
                          }
                          className="rounded-lg bg-[#4e674c] px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#3f553d]"
                        >
                          ACC / Terima
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRejectingApplicant(app);
                            setRejectionReason('');
                          }}
                          className="rounded-lg border border-[#f0d2d2] bg-[#fdf4f4] px-4 py-1.5 text-xs font-semibold text-[#a43b3b] transition-colors hover:bg-[#fae5e5]"
                        >
                          Tolak
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* TAB 3: KATEGORI KELAS KURSUS */}
          {activeTab === 'categories' && (
            <section className="rounded-3xl border border-[#e3eae1] bg-white p-6 shadow-2xs sm:p-8">
              <h2 className="text-lg font-bold text-[#1a2820]">
                Kategori Kelas Kursus ({categories.length})
              </h2>
              <p className="mt-1 text-xs text-[#5d6f63]">
                Kelola daftar kategori kelas kursus yang tersedia.
              </p>

              <form
                onSubmit={handleAddCategory}
                className="mt-5 flex flex-wrap items-center gap-3"
              >
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Nama kategori baru..."
                  className="w-full max-w-xs rounded-xl border border-[#d6dfd3] bg-[#fafbfa] px-4 py-2.5 text-xs text-[#1e2923] outline-none focus:border-[#557153]"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-[#4e674c] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#3f553d]"
                >
                  Tambah Kategori
                </button>
              </form>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((cat) => (
                  <div
                    key={cat}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-[#e3eae1] bg-[#fafbf9] px-5 py-4"
                  >
                    <span className="truncate text-xs font-bold text-[#1a2820]">
                      {cat}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setConfirmDeleteAdmin({
                          type: 'category',
                          item: cat,
                          label: `kategori "${cat}"`,
                        })
                      }
                      className="rounded-lg border border-[#f0d2d2] bg-[#fdf4f4] px-3 py-1 text-[11px] font-semibold text-[#a43b3b] transition-colors hover:bg-[#fae5e5]"
                    >
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* TAB 4: DAFTAR PENGAJAR (BENTUK DAFTAR) */}
          {activeTab === 'teachers' && (
            <section className="rounded-3xl border border-[#e3eae1] bg-white p-6 shadow-2xs sm:p-8">
              <h2 className="text-lg font-bold text-[#1a2820]">
                Daftar Pengajar ({teachers.length})
              </h2>
              <p className="mt-1 text-xs text-[#5d6f63]">
                Ubah profil, email, sandi, dan kategori kelas yang diampu oleh
                pengajar.
              </p>

              <div className="mt-6 overflow-x-auto rounded-2xl border border-[#e3eae1]">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#e3eae1] bg-[#f8faf7] text-[11px] font-bold tracking-wider text-[#557153] uppercase">
                      <th className="px-4 py-3">No</th>
                      <th className="px-4 py-3">Nama Pengajar</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Kategori Ampu</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#edf2ec]">
                    {teachers.map((t, idx) => (
                      <tr key={t.id} className="hover:bg-[#fafbf9]">
                        <td className="px-4 py-3 text-[#5d6f63]">{idx + 1}</td>
                        <td className="px-4 py-3 font-bold text-[#1a2820]">
                          {t.name}
                        </td>
                        <td className="px-4 py-3 text-[#5d6f63]">{t.email}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            {String(t.specialty || 'Pengajar Kuliner')
                              .split(',')
                              .map((s) => s.trim())
                              .filter(Boolean)
                              .map((spec) => (
                                <span
                                  key={spec}
                                  className="inline-block rounded-full bg-[#eef3ec] px-2.5 py-0.5 text-[11px] font-semibold text-[#3f553d]"
                                >
                                  {spec}
                                </span>
                              ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => startEditTeacher(t)}
                              className="rounded-lg border border-[#d6dfd3] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#2d4034] transition-colors hover:bg-[#eef3ec]"
                            >
                              Edit Profil
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setConfirmDeleteAdmin({
                                  type: 'teacher',
                                  item: t,
                                  label: `pengajar "${t.name || t.email}"`,
                                })
                              }
                              className="rounded-lg border border-[#f0d2d2] bg-[#fdf4f4] px-3 py-1.5 text-[11px] font-semibold text-[#a43b3b] transition-colors hover:bg-[#fae5e5]"
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* TAB 5: DAFTAR MURID (BENTUK DAFTAR) */}
          {activeTab === 'students' && (
            <section className="rounded-3xl border border-[#e3eae1] bg-white p-6 shadow-2xs sm:p-8">
              <h2 className="text-lg font-bold text-[#1a2820]">
                Daftar Murid ({students.length})
              </h2>
              <p className="mt-1 text-xs text-[#5d6f63]">
                Ubah nama, email, dan kata sandi akun murid terdaftar.
              </p>

              <div className="mt-6 overflow-x-auto rounded-2xl border border-[#e3eae1]">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#e3eae1] bg-[#f8faf7] text-[11px] font-bold tracking-wider text-[#557153] uppercase">
                      <th className="px-4 py-3">No</th>
                      <th className="px-4 py-3">Nama Murid</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#edf2ec]">
                    {students.map((s, idx) => (
                      <tr key={s.id} className="hover:bg-[#fafbf9]">
                        <td className="px-4 py-3 text-[#5d6f63]">{idx + 1}</td>
                        <td className="px-4 py-3 font-bold text-[#1a2820]">
                          {s.name}
                        </td>
                        <td className="px-4 py-3 text-[#5d6f63]">{s.email}</td>
                        <td className="px-4 py-3">
                          <span className="inline-block rounded-full bg-[#eef3ec] px-2.5 py-0.5 text-[11px] font-semibold text-[#3f553d]">
                            {s.level || 'Murid Terdaftar'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => startEditStudent(s)}
                              className="rounded-lg border border-[#d6dfd3] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#2d4034] transition-colors hover:bg-[#eef3ec]"
                            >
                              Edit Profil
                            </button>
                            <button
                              type="button"
                              disabled={Number(s.enrolled_classes_count || 0) > 0}
                              title={
                                Number(s.enrolled_classes_count || 0) > 0
                                  ? `Murid masih mengikuti ${s.enrolled_classes_count} kelas`
                                  : 'Hapus murid'
                              }
                              onClick={() =>
                                setConfirmDeleteAdmin({
                                  type: 'student',
                                  item: s,
                                  label: `murid "${s.name || s.email}"`,
                                })
                              }
                              className="rounded-lg border border-[#f0d2d2] bg-[#fdf4f4] px-3 py-1.5 text-[11px] font-semibold text-[#a43b3b] transition-colors hover:bg-[#fae5e5] disabled:cursor-not-allowed disabled:opacity-45"
                            >
                              {Number(s.enrolled_classes_count || 0) > 0
                                ? `Ikut ${s.enrolled_classes_count} Kelas`
                                : 'Hapus'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* TAB 6: SEMUA MATERI RESEP (ADMIN HANYA LIHAT & HAPUS, TIDAK BISA TAMBAH) */}
          {activeTab === 'recipes' && (
            <section className="rounded-3xl border border-[#e3eae1] bg-white p-6 shadow-2xs sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-[#1a2820]">
                    Semua Materi Resep ({recipes.length})
                  </h2>
                  <p className="mt-1 text-xs text-[#5d6f63]">
                    Admin dapat meninjau dan menghapus materi resep yang ada.
                    Penambahan atau pengeditan materi dilakukan oleh Pengajar.
                  </p>
                </div>
                <Link
                  href="/recipes"
                  className="rounded-full bg-[#4e674c] px-5 py-2 text-xs font-semibold text-white hover:bg-[#3f553d]"
                >
                  Buka Katalog Resep
                </Link>
              </div>

              {recipes.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-[#e3eae1] bg-[#f9fbf8] p-6 text-xs text-[#5d6f63]">
                  Belum ada materi resep yang tersedia.
                </div>
              ) : (
                <div className="mt-6 overflow-x-auto rounded-2xl border border-[#e3eae1]">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#e3eae1] bg-[#f8faf7] text-[11px] font-bold tracking-wider text-[#557153] uppercase">
                        <th className="px-4 py-3">No</th>
                        <th className="px-4 py-3">Judul Materi</th>
                        <th className="px-4 py-3">Kategori</th>
                        <th className="px-4 py-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#edf2ec]">
                      {recipes.map((r, idx) => (
                        <tr key={r.id} className="hover:bg-[#fafbf9]">
                          <td className="px-4 py-3 text-[#5d6f63]">{idx + 1}</td>
                          <td className="px-4 py-3 font-bold text-[#1a2820]">
                            {r.title}
                          </td>
                          <td className="px-4 py-3 text-[#5d6f63]">
                            {r.category_name || r.dish_type || '-'}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                setConfirmDeleteAdmin({
                                  type: 'recipe',
                                  item: r,
                                  label: `materi "${r.title}"`,
                                })
                              }
                              className="rounded-lg border border-[#f0d2d2] bg-[#fdf4f4] px-3 py-1 text-[11px] font-semibold text-[#a43b3b] transition-colors hover:bg-[#fae5e5]"
                            >
                              Hapus Materi
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
        </main>
      </div>

      {/* POP-UP MODAL EDIT PROFIL PENGAJAR */}
      {editingTeacherId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a2820]/45 p-4 backdrop-blur-[1px]"
          onClick={() => setEditingTeacherId(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-[#e3eae1] bg-white p-6 shadow-xl sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#edf2ec] pb-3.5">
              <div>
                <p className="text-[10px] font-bold tracking-wider text-[#557153] uppercase">
                  PORTAL ADMINISTRATOR
                </p>
                <h3 className="mt-0.5 text-base font-bold text-[#1a2820]">
                  Edit Profil & Sandi Pengajar
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingTeacherId(null)}
                className="rounded-lg px-2.5 py-1 text-xs font-semibold text-[#5d6f63] hover:bg-[#f4f7f3]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTeacher} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-[#3b4f42]">
                  Nama Pengajar
                </label>
                <input
                  type="text"
                  required
                  value={teacherForm.name}
                  onChange={(e) =>
                    setTeacherForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-[#d6dfd3] bg-[#fafbfa] px-3.5 py-2.5 text-xs outline-none focus:border-[#557153]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#3b4f42]">
                  Email Pengajar
                </label>
                <input
                  type="email"
                  required
                  value={teacherForm.email}
                  onChange={(e) =>
                    setTeacherForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-[#d6dfd3] bg-[#fafbfa] px-3.5 py-2.5 text-xs outline-none focus:border-[#557153]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#3b4f42]">
                  Sandi Baru Pengajar (Opsional)
                </label>
                <input
                  type="password"
                  value={teacherForm.password}
                  onChange={(e) =>
                    setTeacherForm((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  placeholder="Isi untuk mengubah sandi pengajar"
                  className="mt-1 w-full rounded-xl border border-[#d6dfd3] bg-[#fafbfa] px-3.5 py-2.5 text-xs outline-none focus:border-[#557153]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#3b4f42]">
                  Kategori Kelas yang Diampu (Bisa Lebih dari 1)
                </label>
                <div className="mt-1.5 max-h-40 space-y-1.5 overflow-y-auto rounded-xl border border-[#d6dfd3] bg-[#fafbfa] p-3">
                  {categories.map((cat) => {
                    const checked = (teacherForm.specialties || []).includes(cat);
                    return (
                      <label
                        key={cat}
                        className="flex cursor-pointer items-center gap-2 text-xs text-[#1a2820]"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? Array.from(
                                  new Set([
                                    ...(teacherForm.specialties || []),
                                    cat,
                                  ])
                                )
                              : (teacherForm.specialties || []).filter(
                                  (c) => c !== cat
                                );
                            setTeacherForm((prev) => ({
                              ...prev,
                              specialties: next,
                              specialty: next.join(', '),
                            }));
                          }}
                          className="accent-[#4e674c]"
                        />
                        <span>{cat}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 border-t border-[#edf2ec] pt-4">
                <button
                  type="button"
                  onClick={() => setEditingTeacherId(null)}
                  className="rounded-xl border border-[#d6dfd3] bg-white px-4 py-2 text-xs font-semibold text-[#3b4f42] hover:bg-[#eef3ec]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#4e674c] px-5 py-2 text-xs font-semibold text-white hover:bg-[#3f553d]"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POP-UP KONFIRMASI HAPUS ADMIN */}
      {confirmDeleteAdmin && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a2820]/45 p-4 backdrop-blur-[1px]"
          onClick={() => setConfirmDeleteAdmin(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-[#e3eae1] bg-white p-6 text-center shadow-xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-[#1a2820]">
              Konfirmasi Hapus
            </h3>
            <p className="text-xs leading-relaxed text-[#5d6f63]">
              Apakah Anda yakin ingin menghapus{' '}
              <strong className="text-[#1a2820]">
                {confirmDeleteAdmin.label}
              </strong>
              ? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setConfirmDeleteAdmin(null)}
                className="rounded-xl border border-[#d6dfd3] bg-white px-4 py-2 text-xs font-semibold text-[#3b4f42] hover:bg-[#eef3ec]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={async () => {
                  const target = confirmDeleteAdmin;
                  setConfirmDeleteAdmin(null);
                  if (target.type === 'category') {
                    await handleDeleteCategory(target.item);
                  } else if (target.type === 'teacher') {
                    await handleDeleteTeacher(target.item);
                  } else if (target.type === 'student') {
                    await handleDeleteStudent(target.item);
                  } else if (target.type === 'recipe') {
                    await handleDeleteRecipe(target.item);
                  }
                }}
                className="rounded-xl bg-[#a43b3b] px-5 py-2 text-xs font-semibold text-white hover:bg-[#8a2f2f]"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POP-UP MODAL ALASAN PENOLAKAN PENDAFTARAN */}
      {rejectingApplicant && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a2820]/45 p-4 backdrop-blur-[1px]"
          onClick={() => setRejectingApplicant(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-[#e3eae1] bg-white p-6 shadow-xl sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#edf2ec] pb-3.5">
              <div>
                <p className="text-[10px] font-bold tracking-wider text-[#a43b3b] uppercase">
                  PENOLAKAN PENDAFTARAN
                </p>
                <h3 className="mt-0.5 text-base font-bold text-[#1a2820]">
                  Alasan Penolakan Akun
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRejectingApplicant(null)}
                className="rounded-lg px-2.5 py-1 text-xs font-semibold text-[#5d6f63] hover:bg-[#f4f7f3]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="mt-4 space-y-3.5">
              <p className="text-xs text-[#5d6f63]">
                Berikan alasan penolakan untuk{' '}
                <strong className="text-[#1a2820]">
                  {rejectingApplicant.name ||
                    rejectingApplicant.full_name ||
                    rejectingApplicant.email}
                </strong>
                . Alasan ini akan ditampilkan sebagai notifikasi saat pengguna
                mencoba masuk.
              </p>
              <div>
                <label className="block text-[11px] font-semibold text-[#3b4f42]">
                  Alasan Penolakan
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Contoh: Berkas sertifikat kuliner belum valid atau data profil belum lengkap."
                  className="mt-1 w-full rounded-xl border border-[#d6dfd3] bg-[#fafbfa] px-3.5 py-2.5 text-xs outline-none focus:border-[#a43b3b]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 border-t border-[#edf2ec] pt-4">
                <button
                  type="button"
                  onClick={() => setRejectingApplicant(null)}
                  className="rounded-xl border border-[#d6dfd3] bg-white px-4 py-2 text-xs font-semibold text-[#3b4f42] hover:bg-[#eef3ec]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#a43b3b] px-5 py-2 text-xs font-semibold text-white hover:bg-[#8a2f2f]"
                >
                  Tolak Pendaftaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POP-UP MODAL EDIT PROFIL MURID */}
      {editingStudentId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a2820]/45 p-4 backdrop-blur-[1px]"
          onClick={() => setEditingStudentId(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-[#e3eae1] bg-white p-6 shadow-xl sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#edf2ec] pb-3.5">
              <div>
                <p className="text-[10px] font-bold tracking-wider text-[#557153] uppercase">
                  PORTAL ADMINISTRATOR
                </p>
                <h3 className="mt-0.5 text-base font-bold text-[#1a2820]">
                  Edit Profil & Sandi Murid
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingStudentId(null)}
                className="rounded-lg px-2.5 py-1 text-xs font-semibold text-[#5d6f63] hover:bg-[#f4f7f3]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-[#3b4f42]">
                  Nama Murid
                </label>
                <input
                  type="text"
                  required
                  value={studentForm.name}
                  onChange={(e) =>
                    setStudentForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-[#d6dfd3] bg-[#fafbfa] px-3.5 py-2.5 text-xs outline-none focus:border-[#557153]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#3b4f42]">
                  Email Murid
                </label>
                <input
                  type="email"
                  required
                  value={studentForm.email}
                  onChange={(e) =>
                    setStudentForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-[#d6dfd3] bg-[#fafbfa] px-3.5 py-2.5 text-xs outline-none focus:border-[#557153]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#3b4f42]">
                  Sandi Baru Murid (Opsional)
                </label>
                <input
                  type="password"
                  value={studentForm.password}
                  onChange={(e) =>
                    setStudentForm((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  placeholder="Isi untuk mengubah sandi murid"
                  className="mt-1 w-full rounded-xl border border-[#d6dfd3] bg-[#fafbfa] px-3.5 py-2.5 text-xs outline-none focus:border-[#557153]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 border-t border-[#edf2ec] pt-4">
                <button
                  type="button"
                  onClick={() => setEditingStudentId(null)}
                  className="rounded-xl border border-[#d6dfd3] bg-white px-4 py-2 text-xs font-semibold text-[#3b4f42] hover:bg-[#eef3ec]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#4e674c] px-5 py-2 text-xs font-semibold text-white hover:bg-[#3f553d]"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f4f6f3] p-8 text-xs text-[#5d6f63]">
          Memuat Dashboard Administrator...
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}