'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const CATEGORY_KEY_MAP = {
  'makanan berkuah': 'berkuah',
  berkuah: 'berkuah',
  'makanan tidak berkuah': 'tidak_berkuah',
  'tidak berkuah': 'tidak_berkuah',
  tidak_berkuah: 'tidak_berkuah',
  'camilan kering': 'camilan_kering',
  camilan_kering: 'camilan_kering',
  'camilan basah': 'camilan_basah',
  camilan_basah: 'camilan_basah',
  minuman: 'minuman',
};

function toCategoryKey(raw) {
  const norm = String(raw || '')
    .toLowerCase()
    .replace(/_/g, ' ')
    .trim();
  return (
    CATEGORY_KEY_MAP[norm] ||
    norm.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
  );
}

const LOCAL_CLASSES_STORAGE_KEY = 'niskala_teacher_custom_classes';
const LOCAL_RECIPES_STORAGE_KEY = 'niskala_teacher_custom_recipes';
const CHAT_STORAGE_KEY = 'niskala_feedback_messages';

function TeacherDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams?.get('tab') || 'classes';

  const [user, setUser] = useState(null);
  const [teacherSpecialties, setTeacherSpecialties] = useState([
    'Makanan Berkuah',
  ]);
  // Form tambah kategori baru
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryAddedModal, setCategoryAddedModal] = useState(null);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
  const [classes, setClasses] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // Form tambah resep
  const [recipeTitle, setRecipeTitle] = useState('');
  const [recipeCategory, setRecipeCategory] = useState('Makanan Berkuah');
  const [recipeSpice, setRecipeSpice] = useState('');
  const [recipePortion, setRecipePortion] = useState('');
  const [recipeTaste, setRecipeTaste] = useState('');
  const [recipeImageUrl, setRecipeImageUrl] = useState('');
  const [recipeVideoUrl, setRecipeVideoUrl] = useState('');
  const [recipeSummary, setRecipeSummary] = useState('');
  const [recipeTechnique, setRecipeTechnique] = useState('');
  const [recipeIngredients, setRecipeIngredients] = useState('');
  const [recipeInstructions, setRecipeInstructions] = useState('');

  // Form edit kelas
  const [editingClassId, setEditingClassId] = useState(null);
  const [editClassForm, setEditClassForm] = useState({
    title: '',
    category_name: '',
    description: '',
  });

  // Form edit resep
  const [editingRecipeId, setEditingRecipeId] = useState(null);
  const [editRecipeForm, setEditRecipeForm] = useState({
    title: '',
    category_name: 'Makanan Berkuah',
    key_spice: '',
    portion_estimate: '',
    dominant_taste: '',
    image_url: '',
    video_url: '',
    summary: '',
    spice_technique: '',
    ingredients: '',
    instructions: '',
  });

  useEffect(() => {
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
          setUser(parsed);
        }
      }
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function syncTeacherSpecialty() {
      const fallbackSpec =
        user?.specialty || user?.specialization || 'Makanan Berkuah';
      let resolvedSpec = fallbackSpec;

      try {
        const resUsers = await fetch('/api/users', { cache: 'no-store' });
        if (resUsers.ok) {
          const dataUsers = await resUsers.json();
          const list = Array.isArray(dataUsers?.users) ? dataUsers.users : [];
          const me = list.find(
            (u) =>
              (user?.id && String(u.id) === String(user.id)) ||
              (user?.email &&
                String(u.email || '').toLowerCase().trim() ===
                  String(user.email || '').toLowerCase().trim())
          );
          if (me?.specialty) {
            resolvedSpec = me.specialty;
          }
        }
      } catch {
        // Fallback ke localStorage
      }

      if (resolvedSpec === fallbackSpec) {
        try {
          const rawAdminTeachers = window.localStorage.getItem(
            'niskala_admin_teachers'
          );
          if (rawAdminTeachers) {
            const parsedTeachers = JSON.parse(rawAdminTeachers);
            if (Array.isArray(parsedTeachers)) {
              const meLocal = parsedTeachers.find(
                (t) =>
                  (user?.id && String(t.id) === String(user.id)) ||
                  (user?.email &&
                    String(t.email || '').toLowerCase().trim() ===
                      String(user.email || '').toLowerCase().trim())
              );
              if (meLocal?.specialty) {
                resolvedSpec = meLocal.specialty;
              }
            }
          }
        } catch {
          // Abaikan error storage
        }
      }

      const resolvedList = String(resolvedSpec || 'Makanan Berkuah')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const finalList =
        resolvedList.length > 0 ? resolvedList : ['Makanan Berkuah'];

      if (active) {
        setTeacherSpecialties(finalList);
        setRecipeCategory(finalList[0]);
      }
    }

    if (user) {
      syncTeacherSpecialty();
    }
    return () => {
      active = false;
    };
  }, [user]);

  const teacherName =
    user?.name || user?.full_name || 'Raka Pratama Wijaya Kusuma Putra';
  const teacherEmail = user?.email || 'raka@niskalarasa.id';
  const initialLetter = String(teacherName).charAt(0).toUpperCase() || 'R';

  useEffect(() => {
    let active = true;

    async function loadTeacherData() {
      let apiClasses = [];
      try {
        const resCls = await fetch('/api/classes', { cache: 'no-store' });
        if (resCls.ok) {
          const dataCls = await resCls.json();
          apiClasses = Array.isArray(dataCls?.classes)
            ? dataCls.classes
            : Array.isArray(dataCls)
              ? dataCls
              : [];
        }
      } catch {
        // Abaikan bila API gagal
      }

      let customClasses = [];
      try {
        const rawCls = window.localStorage.getItem(LOCAL_CLASSES_STORAGE_KEY);
        if (rawCls) {
          const parsed = JSON.parse(rawCls);
          if (Array.isArray(parsed)) customClasses = parsed;
        }
      } catch {
        // Abaikan error storage
      }

      let deletedClassIds = new Set();
      try {
        const rawDelCls = window.localStorage.getItem('niskala_deleted_classes');
        if (rawDelCls) {
          const parsedDel = JSON.parse(rawDelCls);
          if (Array.isArray(parsedDel)) {
            deletedClassIds = new Set(parsedDel.map(String));
          }
        }
      } catch {
        // Abaikan error storage
      }

      const combinedClasses = [...apiClasses];
      customClasses.forEach((cc) => {
        if (!combinedClasses.some((c) => String(c.id) === String(cc.id))) {
          combinedClasses.push(cc);
        }
      });
      if (active) {
        setClasses(
          combinedClasses.filter((c) => !deletedClassIds.has(String(c.id)))
        );
      }

      let apiRecipes = [];
      try {
        const resRec = await fetch('/api/recipes', { cache: 'no-store' });
        if (resRec.ok) {
          const dataRec = await resRec.json();
          apiRecipes = Array.isArray(dataRec?.recipes)
            ? dataRec.recipes
            : Array.isArray(dataRec)
              ? dataRec
              : [];
        }
      } catch {
        // Abaikan bila API gagal
      }

      let customRecipes = [];
      try {
        const rawRec = window.localStorage.getItem(LOCAL_RECIPES_STORAGE_KEY);
        if (rawRec) {
          const parsed = JSON.parse(rawRec);
          if (Array.isArray(parsed)) customRecipes = parsed;
        }
      } catch {
        // Abaikan error storage
      }

      const combinedRecipes = [...apiRecipes];
      customRecipes.forEach((cr) => {
        if (!combinedRecipes.some((r) => String(r.id) === String(cr.id))) {
          combinedRecipes.push(cr);
        }
      });
      if (active) setRecipes(combinedRecipes);

      try {
        const rawChat = window.localStorage.getItem(CHAT_STORAGE_KEY);
        if (rawChat) {
          const parsedChat = JSON.parse(rawChat);
          if (Array.isArray(parsedChat) && active) {
            setChatMessages(parsedChat);
          }
        }
      } catch {
        // Abaikan error storage
      }
    }

    loadTeacherData();
    return () => {
      active = false;
    };
  }, []);

  async function handleAddTeacherCategory(e) {
    e.preventDefault();
    if (isPendingApproval) return;
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    const alreadyExists = teacherSpecialties.some(
      (s) => s.toLowerCase() === trimmed.toLowerCase()
    );
    const nextSpecialties = alreadyExists
      ? teacherSpecialties
      : [...teacherSpecialties, trimmed];

    setTeacherSpecialties(nextSpecialties);
    setRecipeCategory(trimmed);
    setNewCategoryName('');

    const newClassEntry = {
      id: `class-${Date.now()}`,
      title: `Kelas ${trimmed}`,
      category_name: trimmed,
      description: 'Kelas praktik kuliner Nusantara bersama pengajar Niskala Rasa.',
      teacher_name: teacherName,
    };
    setClasses((prev) =>
      prev.some(
        (c) =>
          String(c.category_name || '').toLowerCase() === trimmed.toLowerCase()
      )
        ? prev
        : [...prev, newClassEntry]
    );

    try {
      const rawCats = window.localStorage.getItem('niskala_admin_categories');
      const parsedCats = rawCats ? JSON.parse(rawCats) : [];
      const catList = Array.isArray(parsedCats) ? parsedCats : [];
      if (!catList.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
        window.localStorage.setItem(
          'niskala_admin_categories',
          JSON.stringify([...catList, trimmed])
        );
      }
    } catch {
      // Abaikan error storage
    }

    try {
      await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user?.id,
          email: user?.email,
          role: 'teacher',
          specialty: nextSpecialties.join(', '),
          specialties: nextSpecialties,
        }),
      });
    } catch {
      // Abaikan bila API gagal
    }

    try {
      await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_name: trimmed,
          title: `Kelas ${trimmed}`,
          teacher_id: user?.id || null,
        }),
      });
    } catch {
      // Abaikan bila API gagal
    }

    setStatusMessage(
      `Kategori baru "${trimmed}" berhasil ditambahkan. Anda kini dapat menambahkan resep pada kategori ini.`
    );
    setCategoryAddedModal({ name: trimmed });
  }

  function handleStartEditClass(cls) {
    setEditingClassId(cls.id);
    setEditClassForm({
      title: cls.title || '',
      category_name: cls.category_name || cls.dish_type || '',
      description: cls.recipe_description || cls.description || '',
    });
  }

  async function handleSaveEditClass(e) {
    e.preventDefault();
    if (!editingClassId || !editClassForm.title.trim()) return;

    const updatedTitle = editClassForm.title.trim();
    const updatedDesc = editClassForm.description.trim();

    setClasses((prev) =>
      prev.map((c) =>
        String(c.id) === String(editingClassId)
          ? {
              ...c,
              title: updatedTitle,
              description: updatedDesc,
              recipe_description: updatedDesc,
            }
          : c
      )
    );

    try {
      const rawCustom = window.localStorage.getItem(LOCAL_CLASSES_STORAGE_KEY);
      if (rawCustom) {
        const parsed = JSON.parse(rawCustom);
        if (Array.isArray(parsed)) {
          window.localStorage.setItem(
            LOCAL_CLASSES_STORAGE_KEY,
            JSON.stringify(
              parsed.map((c) =>
                String(c.id) === String(editingClassId)
                  ? {
                      ...c,
                      title: updatedTitle,
                      description: updatedDesc,
                      recipe_description: updatedDesc,
                    }
                  : c
              )
            )
          );
        }
      }
    } catch {
      // Abaikan error storage
    }

    try {
      await fetch('/api/classes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingClassId,
          title: updatedTitle,
          category_name: editClassForm.category_name,
          description: updatedDesc,
          teacher_id: user?.id || null,
        }),
      });
    } catch {
      // Abaikan bila API PUT tidak tersedia
    }

    setEditingClassId(null);
    setStatusMessage(`Kelas "${updatedTitle}" berhasil diperbarui.`);
  }

  async function handleDeleteClass(cls) {
    if (isPendingApproval || !cls) return;
    const idStr = String(cls.id);
    setClasses((prev) => prev.filter((c) => String(c.id) !== idStr));

    try {
      const rawCustom = window.localStorage.getItem(LOCAL_CLASSES_STORAGE_KEY);
      if (rawCustom) {
        const parsed = JSON.parse(rawCustom);
        if (Array.isArray(parsed)) {
          window.localStorage.setItem(
            LOCAL_CLASSES_STORAGE_KEY,
            JSON.stringify(parsed.filter((c) => String(c.id) !== idStr))
          );
        }
      }
      const rawDeleted = window.localStorage.getItem('niskala_deleted_classes');
      const deletedList = rawDeleted ? JSON.parse(rawDeleted) : [];
      const nextDeleted = Array.isArray(deletedList)
        ? Array.from(new Set([...deletedList.map(String), idStr]))
        : [idStr];
      window.localStorage.setItem(
        'niskala_deleted_classes',
        JSON.stringify(nextDeleted)
      );
    } catch {
      // Abaikan error storage
    }

    try {
      await fetch(`/api/classes?id=${encodeURIComponent(idStr)}`, {
        method: 'DELETE',
      });
    } catch {
      // Abaikan bila API DELETE tidak tersedia
    }

    setStatusMessage(`Kelas "${cls.title || idStr}" berhasil dihapus.`);
  }

  async function handleCreateRecipe(e) {
    e.preventDefault();
    if (isPendingApproval) return;
    if (!recipeTitle.trim()) return;

    const lockedCategory = teacherSpecialties.includes(recipeCategory)
      ? recipeCategory
      : teacherSpecialties[0];
    const draftRecipe = {
      id: `recipe-${Date.now()}`,
      title: recipeTitle.trim(),
      category_name: lockedCategory,
      dish_type: lockedCategory,
      key_spice: recipeSpice.trim() || 'Rempah Nusantara',
      portion_estimate: recipePortion.trim() || '4 Porsi',
      dominant_taste: recipeTaste.trim() || 'Gurih & Rempah',
      image_url: recipeImageUrl.trim(),
      video_url: recipeVideoUrl.trim(),
      summary:
        recipeSummary.trim() ||
        'Resep kurasi pengajar Niskala Rasa untuk materi praktik kelas.',
      spice_technique: recipeTechnique.trim(),
      ingredients: recipeIngredients.trim(),
      instructions: recipeInstructions.trim(),
    };

    let savedRecipe = draftRecipe;
    try {
      const resPost = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draftRecipe),
      });
      if (resPost.ok) {
        const dataPost = await resPost.json();
        if (dataPost?.recipe?.id) {
          savedRecipe = { ...draftRecipe, ...dataPost.recipe };
        }
      }
    } catch {
      // Abaikan bila API POST tidak tersedia
    }

    setRecipes((prev) => [savedRecipe, ...prev]);
    try {
      const raw = window.localStorage.getItem(LOCAL_RECIPES_STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      const next = Array.isArray(list) ? [savedRecipe, ...list] : [savedRecipe];
      window.localStorage.setItem(
        LOCAL_RECIPES_STORAGE_KEY,
        JSON.stringify(next)
      );
    } catch {
      // Abaikan error storage
    }

    setRecipeTitle('');
    setRecipeSpice('');
    setRecipePortion('');
    setRecipeTaste('');
    setRecipeImageUrl('');
    setRecipeVideoUrl('');
    setRecipeSummary('');
    setRecipeTechnique('');
    setRecipeIngredients('');
    setRecipeInstructions('');
    setStatusMessage(`Resep "${savedRecipe.title}" berhasil ditambahkan ke katalog & database.`);
  }

  function handleStartEditRecipe(recipe) {
    setEditingRecipeId(recipe.id);
    setEditRecipeForm({
      title: recipe.title || '',
      category_name:
        recipe.category_name || recipe.dish_type || 'Makanan Berkuah',
      key_spice: recipe.key_spice || '',
      portion_estimate: recipe.portion_estimate || '',
      dominant_taste: recipe.dominant_taste || '',
      image_url: recipe.image_url || '',
      video_url: recipe.video_url || '',
      summary: recipe.summary || '',
      spice_technique: recipe.spice_technique || '',
      ingredients: recipe.ingredients || '',
      instructions: recipe.instructions || '',
    });
  }

  async function handleSaveEditRecipe(e) {
    e.preventDefault();
    if (!editingRecipeId || !editRecipeForm.title.trim()) return;

    const updatedPayload = {
      id: editingRecipeId,
      title: editRecipeForm.title.trim(),
      category_name: editRecipeForm.category_name,
      dish_type: editRecipeForm.category_name,
      key_spice: editRecipeForm.key_spice.trim() || 'Rempah Nusantara',
      portion_estimate: editRecipeForm.portion_estimate.trim(),
      dominant_taste: editRecipeForm.dominant_taste.trim(),
      image_url: editRecipeForm.image_url.trim(),
      video_url: editRecipeForm.video_url.trim(),
      summary:
        editRecipeForm.summary.trim() ||
        'Resep kurasi pengajar Niskala Rasa untuk materi praktik kelas.',
      spice_technique: editRecipeForm.spice_technique.trim(),
      ingredients: editRecipeForm.ingredients.trim(),
      instructions: editRecipeForm.instructions.trim(),
    };

    setRecipes((prev) =>
      prev.map((r) =>
        String(r.id) === String(editingRecipeId)
          ? { ...r, ...updatedPayload }
          : r
      )
    );

    try {
      const rawEdited = window.localStorage.getItem('niskala_edited_recipes');
      const editedMap = rawEdited ? JSON.parse(rawEdited) : {};
      editedMap[String(editingRecipeId)] = updatedPayload;
      window.localStorage.setItem(
        'niskala_edited_recipes',
        JSON.stringify(editedMap)
      );
    } catch {
      // Abaikan error storage
    }

    try {
      await fetch('/api/recipes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPayload),
      });
    } catch {
      // Abaikan bila API PUT tidak tersedia
    }

    setEditingRecipeId(null);
    setStatusMessage(`Materi resep "${updatedPayload.title}" berhasil diperbarui.`);
  }

  async function handleDeleteRecipe(recipe) {
    if (isPendingApproval || !recipe) return;
    const idStr = String(recipe.id);
    setRecipes((prev) => prev.filter((r) => String(r.id) !== idStr));

    try {
      const rawCustom = window.localStorage.getItem(LOCAL_RECIPES_STORAGE_KEY);
      if (rawCustom) {
        const parsed = JSON.parse(rawCustom);
        if (Array.isArray(parsed)) {
          window.localStorage.setItem(
            LOCAL_RECIPES_STORAGE_KEY,
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
      // Abaikan bila API DELETE tidak tersedia
    }

    setStatusMessage(`Materi resep "${recipe.title}" berhasil dihapus.`);
  }

  function handleSendChat(e) {
    e.preventDefault();
    if (isPendingApproval) return;
    const text = chatInput.trim();
    if (!text) return;

    const next = [
      ...chatMessages,
      {
        id: Date.now(),
        sender: `${teacherName} (Guru)`,
        role: 'teacher',
        text,
        created_at: new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ];
    setChatMessages(next);
    setChatInput('');
    try {
      window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Abaikan error storage
    }
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
    { key: 'profile', label: 'Profil Pengajar' },
    { key: 'classes', label: 'Kelola Kelas' },
    { key: 'recipes', label: 'Kelola Materi Resep' },
    { key: 'chat', label: 'Feedback Murid' },
  ];

  const isRejected =
    user &&
    String(user.role || '').toLowerCase() !== 'admin' &&
    String(user.status || '').toLowerCase() === 'rejected';

  const isPendingApproval =
    user &&
    String(user.role || '').toLowerCase() !== 'admin' &&
    !isRejected &&
    (String(user.status || '').toLowerCase() === 'pending' ||
      user.is_approved === false);

  if (isRejected) {
    return (
      <div className="min-h-screen bg-[#f4f6f3] flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-3xl border border-[#e3eae1] bg-white p-8 text-center shadow-2xs space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-700 font-bold text-lg border border-rose-200">
            !
          </div>
          <h1 className="text-xl font-bold text-[#1a2820]">
            Pendaftaran Pengajar Ditolak
          </h1>
          <p className="text-xs leading-relaxed text-[#5d6f63]">
            Maaf, pengajuan akun pengajar Anda tidak disetujui oleh Administrator.
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-xl bg-[#4e674c] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#3f553d]"
          >
            Keluar & Kembali ke Halaman Masuk
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6f3] text-[#1e2923]">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row lg:px-10 lg:py-10">
        {/* Sidebar Portal Pengajar (Sticky) */}
        <aside className="w-full shrink-0 lg:sticky lg:top-24 lg:w-68 lg:self-start">
          <div className="rounded-3xl border border-[#e3eae1] bg-white p-6 shadow-2xs">
            <div className="flex items-center gap-3 pb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eef3ec] text-xs font-bold text-[#465e44]">
                NR
              </div>
              <div>
                <p className="text-sm font-bold text-[#1a2820]">Niskala Rasa</p>
                <p className="text-[10px] font-bold tracking-wider text-[#557153] uppercase">
                  PORTAL PENGAJAR
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#e3eae1] bg-[#f8faf7] p-4 text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#4e674c] text-sm font-bold text-white">
                {initialLetter}
              </div>
              <p className="mt-2.5 truncate text-xs font-bold text-[#1a2820]">
                {teacherName}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-[#5d6f63]">
                {teacherEmail}
              </p>
              <p className="mt-2.5 inline-block rounded-full bg-[#eef3ec] px-3 py-1 text-[11px] font-semibold text-[#3f553d]">
                Halo, {String(teacherName).trim().split(/\s+/)[0]}!
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
                      router.push(`/dashboard/teacher?tab=${item.key}`)
                    }
                    className={`w-full rounded-xl px-4 py-2.5 text-left text-xs font-semibold transition-colors ${
                      isActive
                        ? 'border border-[#dce5d9] bg-[#f4f7f3] text-[#1a2820] shadow-2xs'
                        : 'text-[#3b4f42] hover:bg-[#f8faf7]'
                    }`}
                  >
                    {item.label}
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
              Dashboard Pengajar
            </h1>
            <p className="mt-1.5 text-xs text-[#5d6f63]">
              Selamat datang, {teacherName}. Kelola kelas, materi resep, dan
              bimbingan murid.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[#2d4034]">
                Kategori Ampu Anda:
              </span>
              {teacherSpecialties.map((spec) => (
                <span
                  key={spec}
                  className="rounded-full border border-[#d6dfd3] bg-[#f8faf7] px-3 py-1 text-xs font-bold text-[#4e674c]"
                >
                  {spec}
                </span>
              ))}
            </div>
          </section>

          {isPendingApproval && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-xs font-medium text-amber-900">
              <strong>Menunggu Persetujuan Admin:</strong> Akun pengajar Anda
              sedang ditinjau. Anda hanya dapat melihat halaman ini dan belum
              dapat menambah, mengedit, menghapus, atau mengirim pesan sampai
              akun disetujui.
            </div>
          )}

          {statusMessage && (
            <div className="rounded-2xl border border-[#cfe0cc] bg-[#eef5ed] px-5 py-3.5 text-xs font-medium text-[#2e4933]">
              {statusMessage}
            </div>
          )}

          {activeTab === 'profile' && (
            <section className="rounded-3xl border border-[#e3eae1] bg-white p-6 shadow-2xs sm:p-8">
              <h2 className="text-lg font-bold text-[#1a2820]">
                Profil Pengajar
              </h2>
              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#e3eae1] bg-[#f9fbf8] p-5">
                  <p className="text-[11px] font-bold text-[#557153] uppercase">
                    Nama Pengajar
                  </p>
                  <p className="mt-1.5 text-sm font-semibold text-[#1a2820]">
                    {teacherName}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#e3eae1] bg-[#f9fbf8] p-5">
                  <p className="text-[11px] font-bold text-[#557153] uppercase">
                    Email
                  </p>
                  <p className="mt-1.5 text-sm font-semibold text-[#1a2820]">
                    {teacherEmail}
                  </p>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'classes' && (
            <>
              <section className="rounded-3xl border border-[#e3eae1] bg-white p-6 shadow-2xs sm:p-8">
                <h2 className="text-lg font-bold text-[#1a2820]">
                  Tambah Kategori
                </h2>
                <p className="mt-1 text-xs text-[#5d6f63]">
                  Buat kategori kuliner baru untuk langsung menambahkan resep di
                  dalamnya.
                </p>
                <form
                  onSubmit={handleAddTeacherCategory}
                  className={`mt-4 flex flex-wrap items-center gap-3 ${
                    isPendingApproval ? 'pointer-events-none opacity-55' : ''
                  }`}
                >
                  <input
                    type="text"
                    required
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nama kategori baru (misal: Hidangan Panggang)..."
                    className="w-full max-w-xs rounded-xl border border-[#d6dfd3] bg-[#fafbfa] px-4 py-2.5 text-xs outline-none focus:border-[#557153]"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-[#4e674c] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#3f553d]"
                  >
                    Tambah Kategori
                  </button>
                </form>
              </section>

              <section
                id="daftar-kelas-aktif"
                className="rounded-3xl border border-[#e3eae1] bg-white p-6 shadow-2xs sm:p-8"
              >
                <h2 className="text-lg font-bold text-[#1a2820]">
                  Daftar Kelas Aktif ({classes.length})
                </h2>
                <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                  {classes.map((cls) => {
                    const clsKey = toCategoryKey(
                      cls.dish_type || cls.category_name
                    );
                    const canManageClass = teacherSpecialties.some(
                      (s) => toCategoryKey(s) === clsKey
                    );
                    return (
                      <div
                        key={cls.id}
                        className="flex flex-col justify-between rounded-2xl border border-[#e3eae1] bg-[#fafbf9] p-6"
                      >
                        <div>
                          <p className="text-[11px] font-bold text-[#557153] uppercase">
                            {cls.category_name ||
                              cls.dish_type ||
                              'Kelas Kuliner'}
                          </p>
                          <h3 className="mt-1.5 text-base font-bold text-[#1a2820]">
                            {cls.title}
                          </h3>
                          <p className="mt-1.5 text-xs text-[#5d6f63]">
                            {cls.recipe_description || cls.description}
                          </p>
                        </div>
                        {canManageClass && !isPendingApproval && (
                          <div className="mt-4 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleStartEditClass(cls)}
                              className="rounded-lg border border-[#d6dfd3] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#2d4034] transition-colors hover:bg-[#eef3ec]"
                            >
                              Edit Kelas
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setConfirmDeleteItem({
                                  type: 'class',
                                  item: cls,
                                  label: cls.title || cls.category_name,
                                })
                              }
                              className="rounded-lg border border-[#f0d2d2] bg-[#fdf4f4] px-3 py-1.5 text-[11px] font-semibold text-[#a43b3b] transition-colors hover:bg-[#fae5e5]"
                            >
                              Hapus
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            </>
          )}

          {activeTab === 'recipes' && (
            <>
              <section className="rounded-3xl border border-[#e3eae1] bg-white p-6 shadow-2xs sm:p-8">
                <h2 className="text-lg font-bold text-[#1a2820]">
                  Tambah Materi Resep
                </h2>
                <form
                  onSubmit={handleCreateRecipe}
                  className={`mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 ${
                    isPendingApproval ? 'pointer-events-none opacity-55' : ''
                  }`}
                >
                  <input
                    type="text"
                    required
                    value={recipeTitle}
                    onChange={(e) => setRecipeTitle(e.target.value)}
                    placeholder="Nama hidangan / resep..."
                    className="rounded-xl border border-[#d6dfd3] bg-[#fafbfa] px-4 py-2.5 text-xs outline-none focus:border-[#557153]"
                  />
                  {teacherSpecialties.length > 1 ? (
                    <select
                      value={recipeCategory}
                      onChange={(e) => setRecipeCategory(e.target.value)}
                      className="rounded-xl border border-[#d6dfd3] bg-[#fafbfa] px-4 py-2.5 text-xs outline-none focus:border-[#557153]"
                    >
                      {teacherSpecialties.map((spec) => (
                        <option key={spec} value={spec}>
                          {spec}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex items-center rounded-xl border border-[#d6dfd3] bg-[#f4f7f3] px-4 py-2.5 text-xs font-semibold text-[#2d4034]">
                      Kategori: {teacherSpecialties[0]}
                    </div>
                  )}
                  <input
                    type="text"
                    value={recipeSpice}
                    onChange={(e) => setRecipeSpice(e.target.value)}
                    placeholder="Bumbu / bahan kunci..."
                    className="rounded-xl border border-[#d6dfd3] bg-[#fafbfa] px-4 py-2.5 text-xs outline-none focus:border-[#557153]"
                  />
                  <input
                    type="text"
                    value={recipePortion}
                    onChange={(e) => setRecipePortion(e.target.value)}
                    placeholder="Estimasi porsi (misal: 4 Porsi)..."
                    className="rounded-xl border border-[#d6dfd3] bg-[#fafbfa] px-4 py-2.5 text-xs outline-none focus:border-[#557153]"
                  />
                  <input
                    type="text"
                    value={recipeTaste}
                    onChange={(e) => setRecipeTaste(e.target.value)}
                    placeholder="Rasa dominan (misal: Gurih & Rempah)..."
                    className="rounded-xl border border-[#d6dfd3] bg-[#fafbfa] px-4 py-2.5 text-xs outline-none focus:border-[#557153]"
                  />
                  <input
                    type="url"
                    value={recipeImageUrl}
                    onChange={(e) => setRecipeImageUrl(e.target.value)}
                    placeholder="Link Gambar Hidangan (https://...)..."
                    className="rounded-xl border border-[#d6dfd3] bg-[#fafbfa] px-4 py-2.5 text-xs outline-none focus:border-[#557153]"
                  />
                  <input
                    type="url"
                    value={recipeVideoUrl}
                    onChange={(e) => setRecipeVideoUrl(e.target.value)}
                    placeholder="Link Video Pembelajaran (YouTube / MP4)..."
                    className="rounded-xl border border-[#d6dfd3] bg-[#fafbfa] px-4 py-2.5 text-xs outline-none focus:border-[#557153]"
                  />
                  <input
                    type="text"
                    value={recipeSummary}
                    onChange={(e) => setRecipeSummary(e.target.value)}
                    placeholder="Ringkasan singkat resep..."
                    className="rounded-xl border border-[#d6dfd3] bg-[#fafbfa] px-4 py-2.5 text-xs outline-none focus:border-[#557153]"
                  />
                  <input
                    type="text"
                    value={recipeTechnique}
                    onChange={(e) => setRecipeTechnique(e.target.value)}
                    placeholder="Teknik pengolahan rempah (sangrai/ulek/bakar)..."
                    className="rounded-xl border border-[#d6dfd3] bg-[#fafbfa] px-4 py-2.5 text-xs outline-none focus:border-[#557153] sm:col-span-2"
                  />
                  <textarea
                    rows={2}
                    value={recipeIngredients}
                    onChange={(e) => setRecipeIngredients(e.target.value)}
                    placeholder="Daftar bahan-bahan (pisahkan dengan koma atau baris baru)..."
                    className="rounded-xl border border-[#d6dfd3] bg-[#fafbfa] px-4 py-2.5 text-xs outline-none focus:border-[#557153] sm:col-span-2"
                  />
                  <textarea
                    rows={2}
                    value={recipeInstructions}
                    onChange={(e) => setRecipeInstructions(e.target.value)}
                    placeholder="Langkah-langkah memasak..."
                    className="rounded-xl border border-[#d6dfd3] bg-[#fafbfa] px-4 py-2.5 text-xs outline-none focus:border-[#557153] sm:col-span-2"
                  />
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      className="rounded-full bg-[#4e674c] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#3f553d]"
                    >
                      Tambahkan ke Katalog
                    </button>
                  </div>
                </form>
              </section>

              <section className="rounded-3xl border border-[#e3eae1] bg-white p-6 shadow-2xs sm:p-8">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-lg font-bold text-[#1a2820]">
                    Katalog Materi Resep (
                    {
                      recipes.filter((r) => {
                        const rKey = toCategoryKey(
                          r.dish_type || r.category_name
                        );
                        return (
                          teacherSpecialties.length === 0 ||
                          teacherSpecialties.some(
                            (s) => toCategoryKey(s) === rKey
                          )
                        );
                      }).length
                    }
                    )
                  </h2>
                  <Link
                    href="/recipes?scope=teacher"
                    className="rounded-full border border-[#d6dfd3] bg-[#f8faf7] px-4 py-2 text-xs font-semibold text-[#2d4034] hover:bg-[#eef3ec]"
                  >
                    Lihat Katalog Kategori Saya
                  </Link>
                </div>
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {recipes
                    .filter((r) => {
                      const rKey = toCategoryKey(
                        r.dish_type || r.category_name
                      );
                      return (
                        teacherSpecialties.length === 0 ||
                        teacherSpecialties.some(
                          (s) => toCategoryKey(s) === rKey
                        )
                      );
                    })
                    .map((r) => (
                    <div
                      key={r.id}
                      className="flex flex-col justify-between rounded-2xl border border-[#e3eae1] bg-[#fafbf9] p-5"
                    >
                      <div>
                        <p className="text-[10px] font-bold text-[#557153] uppercase">
                          {r.category_name || r.dish_type}
                        </p>
                        <h3 className="mt-1 text-sm font-bold text-[#1a2820]">
                          {r.title}
                        </h3>
                      </div>
                      {!isPendingApproval && (
                        <div className="mt-4 flex items-center gap-2">
                          <Link
                            href={`/dashboard/teacher/recipes/${r.id}/edit`}
                            className="rounded-lg border border-[#d6dfd3] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#2d4034] transition-colors hover:bg-[#eef3ec]"
                          >
                            Edit Materi
                          </Link>
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmDeleteItem({
                                type: 'recipe',
                                item: r,
                                label: r.title,
                              })
                            }
                            className="rounded-lg border border-[#f0d2d2] bg-[#fdf4f4] px-3 py-1.5 text-[11px] font-semibold text-[#a43b3b] transition-colors hover:bg-[#fae5e5]"
                          >
                            Hapus
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {activeTab === 'chat' && (
            <section className="rounded-3xl border border-[#e3eae1] bg-white p-6 shadow-2xs sm:p-8">
              <h2 className="text-lg font-bold text-[#1a2820]">
                Feedback & Diskusi Murid
              </h2>
              <div className="mt-5 max-h-72 space-y-3 overflow-y-auto rounded-2xl border border-[#e3eae1] bg-[#f9fbf8] p-5">
                {chatMessages.length === 0 ? (
                  <p className="text-xs text-[#5d6f63]">
                    Belum ada pesan masuk dari murid.
                  </p>
                ) : (
                  chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className="rounded-xl border border-[#e3eae1] bg-white p-3.5 text-xs"
                    >
                      <div className="flex items-center justify-between font-semibold text-[#2d4034]">
                        <span>{msg.sender}</span>
                        <span className="text-[10px] text-[#7a8a7f]">
                          {msg.created_at}
                        </span>
                      </div>
                      <p className="mt-1 text-[#1e2923]">{msg.text}</p>
                    </div>
                  ))
                )}
              </div>

              <form
                onSubmit={handleSendChat}
                className={`mt-5 flex gap-3 ${
                  isPendingApproval ? 'pointer-events-none opacity-55' : ''
                }`}
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Tulis balasan atau evaluasi untuk murid..."
                  className="flex-1 rounded-full border border-[#d6dfd3] bg-[#fafbfa] px-4 py-2.5 text-xs outline-none focus:border-[#557153]"
                />
                <button
                  type="submit"
                  className="rounded-full bg-[#4e674c] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#3f553d]"
                >
                  Kirim Balasan
                </button>
              </form>
            </section>
          )}
        </main>
      </div>

      {/* POP-UP KONFIRMASI HAPUS */}
      {confirmDeleteItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a2820]/45 p-4 backdrop-blur-[1px]"
          onClick={() => setConfirmDeleteItem(null)}
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
                {confirmDeleteItem.label}
              </strong>
              ? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setConfirmDeleteItem(null)}
                className="rounded-xl border border-[#d6dfd3] bg-white px-4 py-2 text-xs font-semibold text-[#3b4f42] hover:bg-[#eef3ec]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={async () => {
                  const target = confirmDeleteItem;
                  setConfirmDeleteItem(null);
                  if (target.type === 'class') {
                    await handleDeleteClass(target.item);
                  } else {
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

      {/* POP-UP NOTIFIKASI TAMBAH KATEGORI BERHASIL */}
      {categoryAddedModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a2820]/45 p-4 backdrop-blur-[1px]"
          onClick={() => {
            setCategoryAddedModal(null);
            document
              .getElementById('daftar-kelas-aktif')
              ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-[#e3eae1] bg-white p-6 text-center shadow-xl sm:p-7 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 font-bold text-lg border border-emerald-200">
              ✓
            </div>
            <h3 className="text-base font-bold text-[#1a2820]">
              Kategori Berhasil Ditambahkan
            </h3>
            <p className="text-xs leading-relaxed text-[#5d6f63]">
              Kategori{' '}
              <strong className="text-[#1a2820]">
                {categoryAddedModal.name}
              </strong>{' '}
              telah berhasil ditambahkan. Anda akan diarahkan ke bagian Daftar
              Kelas Aktif.
            </p>
            <button
              type="button"
              onClick={() => {
                setCategoryAddedModal(null);
                document
                  .getElementById('daftar-kelas-aktif')
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="w-full rounded-xl bg-[#4e674c] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#3f553d]"
            >
              Lihat Perubahan
            </button>
          </div>
        </div>
      )}

      {/* POP-UP MODAL EDIT KELAS */}
      {editingClassId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a2820]/45 p-4 backdrop-blur-[1px]"
          onClick={() => setEditingClassId(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-[#e3eae1] bg-white p-6 shadow-xl sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#edf2ec] pb-3.5">
              <div>
                <p className="text-[10px] font-bold tracking-wider text-[#557153] uppercase">
                  PORTAL PENGAJAR
                </p>
                <h3 className="mt-0.5 text-base font-bold text-[#1a2820]">
                  Edit Kelas
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingClassId(null)}
                className="rounded-lg px-2.5 py-1 text-xs font-semibold text-[#5d6f63] hover:bg-[#f4f7f3]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditClass} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-[#3b4f42]">
                  Kategori Kelas
                </label>
                <div className="mt-1 w-full rounded-xl border border-[#d6dfd3] bg-[#f4f7f3] px-3.5 py-2.5 text-xs font-semibold text-[#2d4034]">
                  {editClassForm.category_name}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#3b4f42]">
                  Judul Kelas
                </label>
                <input
                  type="text"
                  required
                  value={editClassForm.title}
                  onChange={(e) =>
                    setEditClassForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-[#d6dfd3] bg-[#fafbfa] px-3.5 py-2.5 text-xs outline-none focus:border-[#557153]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#3b4f42]">
                  Deskripsi Kelas
                </label>
                <textarea
                  rows={3}
                  value={editClassForm.description}
                  onChange={(e) =>
                    setEditClassForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-[#d6dfd3] bg-[#fafbfa] px-3.5 py-2.5 text-xs outline-none focus:border-[#557153]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 border-t border-[#edf2ec] pt-4">
                <button
                  type="button"
                  onClick={() => setEditingClassId(null)}
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

export default function TeacherDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f4f6f3] p-8 text-xs text-[#5d6f63]">
          Memuat Dashboard Pengajar...
        </div>
      }
    >
      <TeacherDashboardContent />
    </Suspense>
  );
}