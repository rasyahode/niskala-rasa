'use client';

import { useEffect, useState } from 'react';
import ClassFormCard from '@/components/admin/ClassFormCard';
import ClassCatalogTable from '@/components/admin/ClassCatalogTable';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';

const EMPTY_FORM = {
  title: '',
  category_name: '',
  description: '',
  teacher_id: '',
  total_lessons: 10,
};

export default function NewAdminClassPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function loadData() {
    const [uRes, cRes] = await Promise.all([
      fetch('/api/admin/users', { cache: 'no-store' }),
      fetch('/api/classes', { cache: 'no-store' }),
    ]);
    if (uRes.ok) {
      const u = await uRes.json();
      const list = Array.isArray(u?.teachers) ? u.teachers : [];
      setTeachers(list);
      if (list[0]) setForm((prev) => ({ ...prev, teacher_id: prev.teacher_id || String(list[0].id) }));
    }
    if (cRes.ok) {
      const c = await cRes.json();
      setClasses(Array.isArray(c) ? c : c?.classes || []);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          teacher_id: form.teacher_id ? Number(form.teacher_id) : null,
          total_lessons: Number(form.total_lessons) || 10,
        }),
      });
      if (res.ok) {
        setForm((prev) => ({ ...EMPTY_FORM, teacher_id: prev.teacher_id }));
        await loadData();
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/classes?id=${deleteTarget.id}`, { method: 'DELETE' });
      if (res.ok) await loadData();
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F7F3] p-5 sm:p-8 max-w-5xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-[#DCE4D7] p-6 shadow-2xs">
        <h1 className="text-2xl font-extrabold text-[#2B3E29]">Kelola Kelas Kursus</h1>
      </div>

      <ClassFormCard
        form={form}
        setForm={setForm}
        teachers={teachers}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      <ClassCatalogTable
        classes={classes}
        onAskDelete={(item) =>
          setDeleteTarget({
            type: 'class',
            id: item.id,
            title: item.title,
            subtitle: item.category_name,
          })
        }
      />

      <ConfirmDeleteModal
        target={deleteTarget}
        isDeleting={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
