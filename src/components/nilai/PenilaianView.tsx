import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AssessmentType, Subject, TujuanPembelajaran } from '../../types';
import { Modal } from '../common/Modal';
import { HeaderKopSekolah } from '../common/HeaderKopSekolah';
import { BadgeStatus } from '../common/BadgeStatus';
import { MataPelajaranDanTPSection } from './MataPelajaranDanTPSection';
import { EkstrakurikulerSection } from './EkstrakurikulerSection';
import { ModalCetakLeger } from '../raport/ModalCetakLeger';
import {
  GraduationCap,
  BookOpen,
  Calculator,
  Save,
  Printer,
  Sparkles,
  Search,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Award,
  Layers,
  SlidersHorizontal,
  Plus,
  Edit2,
  Info,
  ChevronDown,
  ChevronUp,
  Trophy,
  Filter,
  Trash2,
  HelpCircle,
  Zap,
  Check,
  Target
} from 'lucide-react';

export const PenilaianView: React.FC = () => {
  const {
    students,
    subjects,
    grades,
    saveGrade,
    getStudentGradeSummary,
    getAllGradesForStudent,
    tujuanPembelajaranList,
    addTP,
    updateTP,
    deleteTP,
    extracurriculars,
    schoolInfo,
    currentUser,
    setCurrentTab,
    addToast
  } = useApp();

  const safeSubjects = subjects || [];
  const safeStudents = students || [];
  const safeGrades = grades || [];
  const safeTPs = tujuanPembelajaranList || [];
  const safeExtracurriculars = extracurriculars || [];

  const [activeSubTab, setActiveSubTab] = useState<'input_nilai' | 'ekstrakurikuler' | 'kelola_mapel_tp'>('input_nilai');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(safeSubjects[0]?.id || 'mapel-05');
  const [searchQuery, setSearchQuery] = useState('');
  const [semesterFilter, setSemesterFilter] = useState<'Semua' | '1 (Ganjil)' | '2 (Genap)'>('Semua');
  const [isPrintLegerOpen, setIsPrintLegerOpen] = useState(false);
  const [isTPInfoExpanded, setIsTPInfoExpanded] = useState(true);

  // Quick TP Modal States
  const [isQuickAddTPModalOpen, setIsQuickAddTPModalOpen] = useState(false);
  const [isTPDetailModalOpen, setIsTPDetailModalOpen] = useState(false);
  const [selectedDetailTP, setSelectedDetailTP] = useState<TujuanPembelajaran | null>(null);

  // Form State for Quick TP Creation / Editing
  const [tpModalMode, setTpModalMode] = useState<'add' | 'edit'>('add');
  const [editingTPId, setEditingTPId] = useState<string | null>(null);
  const [quickTpForm, setQuickTpForm] = useState<{
    kode: string;
    lingkupMateri: string;
    deskripsi: string;
    semester: '1 (Ganjil)' | '2 (Genap)' | 'Semua';
    kktp: number;
    ringkasanRaporTuntas: string;
    ringkasanRaporPerluBimbingan: string;
  }>({
    kode: 'TP 1',
    lingkupMateri: '',
    deskripsi: '',
    semester: '1 (Ganjil)',
    kktp: 75,
    ringkasanRaporTuntas: '',
    ringkasanRaporPerluBimbingan: ''
  });

  const currentSubject = safeSubjects.find(s => s.id === selectedSubjectId) || safeSubjects[0];

  // Dynamically filtered active TPs for current subject according to semester filter
  const currentSubjectTPs = useMemo(() => {
    return safeTPs.filter(tp => {
      if (tp.mapelId !== currentSubject?.id) return false;
      if (semesterFilter !== 'Semua') {
        const isSemGanjil = semesterFilter.includes('1') || semesterFilter.toLowerCase().includes('ganjil');
        const tpGanjil = tp.semester.includes('1') || tp.semester.toLowerCase().includes('ganjil');
        if (tp.semester !== 'Semua' && isSemGanjil !== tpGanjil) return false;
      }
      return true;
    });
  }, [safeTPs, currentSubject?.id, semesterFilter]);

  // Helper to get grade record for specific student, mapel, and assessment/TP index
  const getGradeValue = (siswaId: string, mapelId: string, assessmentKey: string, defaultVal = 80): number => {
    const rec = safeGrades.find(g => 
      g.siswaId === siswaId && 
      g.mapelId === mapelId && 
      g.jenis === assessmentKey
    );
    return rec ? rec.nilai : defaultVal;
  };

  const handleScoreChange = (siswaId: string, type: AssessmentType, valueStr: string) => {
    let score = parseInt(valueStr, 10);
    if (isNaN(score)) score = 0;
    if (score > 100) score = 100;
    if (score < 0) score = 0;

    saveGrade(siswaId, selectedSubjectId, type, score);
  };

  // Quick Open Modal for Add TP
  const openAddTPModal = () => {
    const nextIdx = currentSubjectTPs.length + 1;
    setTpModalMode('add');
    setEditingTPId(null);
    setQuickTpForm({
      kode: `TP ${nextIdx}`,
      lingkupMateri: `Bab ${nextIdx}: Lingkup Materi Baru`,
      deskripsi: '',
      semester: (schoolInfo?.semester as any) || '1 (Ganjil)',
      kktp: currentSubject?.kktp || 75,
      ringkasanRaporTuntas: '',
      ringkasanRaporPerluBimbingan: ''
    });
    setIsQuickAddTPModalOpen(true);
  };

  // Quick Open Modal for Edit TP
  const openEditTPModal = (tp: TujuanPembelajaran) => {
    setTpModalMode('edit');
    setEditingTPId(tp.id);
    setQuickTpForm({
      kode: tp.kode,
      lingkupMateri: tp.lingkupMateri,
      deskripsi: tp.deskripsi,
      semester: tp.semester,
      kktp: tp.kktp || currentSubject?.kktp || 75,
      ringkasanRaporTuntas: tp.ringkasanRaporTuntas || '',
      ringkasanRaporPerluBimbingan: tp.ringkasanRaporPerluBimbingan || ''
    });
    setIsQuickAddTPModalOpen(true);
  };

  // Quick Save TP
  const handleSaveQuickTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTpForm.lingkupMateri.trim() || !quickTpForm.deskripsi.trim()) {
      addToast('error', 'Validasi Gagal', 'Lingkup Materi/Bab dan Rumusan Kalimat TP wajib diisi.');
      return;
    }

    if (tpModalMode === 'add') {
      addTP({
        mapelId: currentSubject.id,
        kode: quickTpForm.kode.trim(),
        lingkupMateri: quickTpForm.lingkupMateri.trim(),
        deskripsi: quickTpForm.deskripsi.trim(),
        semester: quickTpForm.semester,
        fase: `Fase ${schoolInfo.className.includes('1') || schoolInfo.className.includes('2') ? 'A' : schoolInfo.className.includes('3') || schoolInfo.className.includes('4') ? 'B' : 'C'}`,
        kktp: quickTpForm.kktp,
        ringkasanRaporTuntas: quickTpForm.ringkasanRaporTuntas.trim() || `memahami materi ${quickTpForm.lingkupMateri}`,
        ringkasanRaporPerluBimbingan: quickTpForm.ringkasanRaporPerluBimbingan.trim() || `penguasaan materi ${quickTpForm.lingkupMateri}`
      });
      addToast('success', 'TP Berhasil Ditambahkan', `${quickTpForm.kode} aktif otomatis pada tabel input nilai mapel ${currentSubject.nama}.`);
    } else if (editingTPId) {
      updateTP(editingTPId, {
        kode: quickTpForm.kode.trim(),
        lingkupMateri: quickTpForm.lingkupMateri.trim(),
        deskripsi: quickTpForm.deskripsi.trim(),
        semester: quickTpForm.semester,
        kktp: quickTpForm.kktp,
        ringkasanRaporTuntas: quickTpForm.ringkasanRaporTuntas.trim(),
        ringkasanRaporPerluBimbingan: quickTpForm.ringkasanRaporPerluBimbingan.trim()
      });
      addToast('success', 'TP Diperbarui', `Perubahan ${quickTpForm.kode} langsung diterapkan ke penilaian dan deskripsi rapor.`);
    }

    setIsQuickAddTPModalOpen(false);
  };

  // Auto Generate Standard Kurikulum Merdeka TPs for Subject with 0 TPs
  const handleAutoGenerateStandardTPs = () => {
    const templates = [
      {
        kode: 'TP 1',
        materi: 'Bab 1: Konsep Dasar & Pemahaman Awal',
        desc: `Memahami konsep esensial dan prinsip dasar dalam pembelajaran ${currentSubject.nama} secara kritis dan mandiri.`
      },
      {
        kode: 'TP 2',
        materi: 'Bab 2: Analisis & Penerapan Konsep',
        desc: `Menganalisis dan mempraktikkan keterampilan berpikir terstruktur sesuai materi ${currentSubject.nama} dalam kehidupan sehari-hari.`
      },
      {
        kode: 'TP 3',
        materi: 'Bab 3: Eksplorasi & Pemecahan Masalah',
        desc: `Mengeksplorasi solusi kreatif dan memecahkan permasalahan kontekstual pada lingkup ${currentSubject.nama}.`
      },
      {
        kode: 'TP 4',
        materi: 'Bab 4: Evaluasi & Refleksi Akhir',
        desc: `Menyajikan hasil karya, mengevaluasi capaian belajar, serta merefleksikan nilai-nilai Profil Pelajar Pancasila pada ${currentSubject.nama}.`
      }
    ];

    templates.forEach(t => {
      addTP({
        mapelId: currentSubject.id,
        kode: t.kode,
        lingkupMateri: t.materi,
        deskripsi: t.desc,
        semester: 'Semua',
        fase: 'Fase B (Kelas 4)',
        kktp: currentSubject.kktp || 75,
        ringkasanRaporTuntas: `menguasai ${t.materi.toLowerCase()}`,
        ringkasanRaporPerluBimbingan: `pemahaman ${t.materi.toLowerCase()}`
      });
    });

    addToast('success', '4 TP Kurikulum Merdeka Terbentuk', `Tujuan Pembelajaran otomatis aktif pada mata pelajaran ${currentSubject.nama}.`);
  };

  // Quick Batch Fill Formatif Nilai
  const handleBatchFillScores = (scoreValue: number) => {
    safeStudents.forEach(student => {
      currentSubjectTPs.forEach((_, idx) => {
        saveGrade(student.id, selectedSubjectId, `Formatif_TP${idx + 1}` as AssessmentType, scoreValue);
      });
      saveGrade(student.id, selectedSubjectId, 'Sumatif_STS', scoreValue);
      saveGrade(student.id, selectedSubjectId, 'Sumatif_SAS', scoreValue);
    });
    addToast('success', 'Pengisian Massal Berhasil', `Nilai seluruh asesmen (${currentSubjectTPs.length} TP, STS, SAS) diatur ke ${scoreValue}.`);
  };

  const filteredStudents = safeStudents.filter(s =>
    s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.nisn.includes(searchQuery)
  );

  // Class analytics for current subject
  const currentSubjectGrades = safeStudents.map(s => getStudentGradeSummary(s.id, selectedSubjectId));
  const finalScores = currentSubjectGrades.map(g => g.nilaiAkhir);
  const avgClassScore = finalScores.length > 0 ? (finalScores.reduce((a, b) => a + b, 0) / finalScores.length).toFixed(1) : '85.0';
  const highestScore = finalScores.length > 0 ? Math.max(...finalScores) : 95;
  const lowestScore = finalScores.length > 0 ? Math.min(...finalScores) : 75;
  const passingCount = currentSubjectGrades.filter(g => g.ketercapaian === 'Tuntas').length;
  const passingRate = safeStudents.length > 0 ? Math.round((passingCount / safeStudents.length) * 100) : 100;

  const isTeacherOrAdmin = currentUser.role !== 'siswa';

  return (
    <div className="space-y-6">
      {/* Sub-Tab Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar w-full sm:w-auto">
          <button
            onClick={() => setActiveSubTab('input_nilai')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeSubTab === 'input_nilai'
                ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            <span>Input Nilai Asesmen & Leger Kelas</span>
          </button>

          <button
            onClick={() => setActiveSubTab('ekstrakurikuler')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeSubTab === 'ekstrakurikuler'
                ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Trophy className="h-4 w-4 text-amber-500" />
            <span>Isian Kegiatan Ekstrakurikuler</span>
            <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-1.5 py-0.2 rounded-full">
              {safeExtracurriculars.length} Ekskul
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('kelola_mapel_tp')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeSubTab === 'kelola_mapel_tp'
                ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Kelola Mata Pelajaran & Tujuan Pembelajaran (TP)</span>
            <span className="text-[10px] font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-1.5 py-0.2 rounded-full">
              {tujuanPembelajaranList.length} TP
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('kokurikuler_dpl')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60"
            title="Buka penilaian kokurikuler berformat E-Rapor Kemendikdasmen"
          >
            <Target className="h-4 w-4 text-purple-600" />
            <span>Penilaian Kokurikuler (E-Rapor)</span>
            <span className="text-[10px] font-extrabold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-1.5 py-0.2 rounded-full">
              Kemendikdasmen
            </span>
          </button>
        </div>

        {activeSubTab === 'input_nilai' && (
          <div className="flex items-center gap-2 px-2 self-end sm:self-auto">
            <button
              onClick={() => setIsPrintLegerOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5 text-slate-500" />
              <span>Cetak Leger Nilai</span>
            </button>
          </div>
        )}
      </div>

      {/* RENDER VIEW ACCORDING TO SUB-TAB */}
      {activeSubTab === 'kelola_mapel_tp' ? (
        <MataPelajaranDanTPSection />
      ) : activeSubTab === 'ekstrakurikuler' ? (
        <EkstrakurikulerSection />
      ) : (
        <div className="space-y-6">
          {/* Top Header & Subject Selector */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Daftar Nilai & Asesmen Kurikulum Merdeka
                    </h2>
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      TP Dinamis Otomatis
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Setiap penambahan atau perubahan TP pada mapel akan <strong>langsung muncul otomatis</strong> di kolom asesmen formatif & deskripsi rapor.
                  </p>
                </div>
              </div>

              {isTeacherOrAdmin && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={openAddTPModal}
                    className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-3.5 py-1.5 text-xs font-bold shadow-sm shadow-blue-600/25 transition-all cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>+ Tambah TP ({currentSubject?.nama})</span>
                  </button>

                  <button
                    onClick={() => setActiveSubTab('kelola_mapel_tp')}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500" />
                    <span>Kelola Semua Mapel & TP</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mata Pelajaran Tabs Selector */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pilih Mata Pelajaran:</span>
                
                {/* Semester Filter Toggle */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
                  <Filter className="h-3 w-3 text-slate-400 ml-1" />
                  <span className="text-[10px] text-slate-500 font-medium mr-1">Semester:</span>
                  {(['Semua', '1 (Ganjil)', '2 (Genap)'] as const).map(sem => (
                    <button
                      key={sem}
                      onClick={() => setSemesterFilter(sem)}
                      className={`px-2 py-0.5 rounded-lg text-[10.5px] font-bold transition-all ${
                        semesterFilter === sem
                          ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-900 dark:text-blue-400'
                          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {sem}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {subjects.map(subject => {
                  const isSelected = selectedSubjectId === subject.id;
                  const subjectActiveTPCount = safeTPs.filter(t => {
                    if (t.mapelId !== subject.id) return false;
                    if (semesterFilter !== 'Semua') {
                      const isSemGanjil = semesterFilter.includes('1') || semesterFilter.toLowerCase().includes('ganjil');
                      const tpGanjil = t.semester.includes('1') || t.semester.toLowerCase().includes('ganjil');
                      if (t.semester !== 'Semua' && isSemGanjil !== tpGanjil) return false;
                    }
                    return true;
                  }).length;

                  return (
                    <button
                      key={subject.id}
                      onClick={() => setSelectedSubjectId(subject.id)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                      }`}
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>{subject.nama} ({subject.kode})</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected ? 'bg-blue-700 text-blue-100' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                        {subjectActiveTPCount} TP Aktif
                      </span>
                    </button>
                  );
                })}

                {isTeacherOrAdmin && (
                  <button
                    onClick={() => setActiveSubTab('kelola_mapel_tp')}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap border border-dashed border-slate-300 hover:border-blue-500 hover:text-blue-600 text-slate-500 transition-colors cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Tambah Mapel Baru</span>
                  </button>
                )}
              </div>
            </div>

            {/* Expandable TP Overview Banner for Current Subject */}
            <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="flex items-center justify-between gap-2">
                <div
                  onClick={() => setIsTPInfoExpanded(!isTPInfoExpanded)}
                  className="flex items-center gap-2 cursor-pointer select-none"
                >
                  <Layers className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                    Tujuan Pembelajaran Aktif ({currentSubject?.nama}):
                  </span>
                  <span className="text-[10.5px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full shadow-xs">
                    {currentSubjectTPs.length} TP Tersedia di Kolom Input
                  </span>
                  {isTPInfoExpanded ? (
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  )}
                </div>

                {isTeacherOrAdmin && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={openAddTPModal}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Tambah TP Mapel Ini</span>
                    </button>
                  </div>
                )}
              </div>

              {isTPInfoExpanded && (
                <div className="mt-3 pt-3 border-t border-blue-200/60 dark:border-slate-700/80">
                  {currentSubjectTPs.length === 0 ? (
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        Belum ada Tujuan Pembelajaran yang dikonfigurasi untuk mata pelajaran <strong>{currentSubject?.nama}</strong>.
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={handleAutoGenerateStandardTPs}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Buat Otomatis 4 TP Standar Kurikulum Merdeka</span>
                        </button>
                        <button
                          type="button"
                          onClick={openAddTPModal}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Tambah TP Manual</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                      {currentSubjectTPs.map((tp, idx) => (
                        <div
                          key={tp.id}
                          className="group relative p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left space-y-1 shadow-xs hover:border-blue-300 dark:hover:border-blue-800 transition-all"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                              {tp.kode || `TP ${idx + 1}`}
                            </span>
                            <div className="flex items-center gap-1">
                              <span className="text-[9px] font-medium text-slate-400">
                                {tp.semester}
                              </span>
                              {isTeacherOrAdmin && (
                                <button
                                  type="button"
                                  onClick={() => openEditTPModal(tp)}
                                  className="opacity-60 hover:opacity-100 text-blue-600 p-0.5 rounded hover:bg-blue-50"
                                  title="Edit Rumusan TP"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate" title={tp.lingkupMateri}>
                            {tp.lingkupMateri}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-tight" title={tp.deskripsi}>
                            {tp.deskripsi}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Analytics Mini Banner for Selected Subject */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50">
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">Rata-rata Kelas</p>
                <p className="text-xl font-extrabold text-blue-950 dark:text-white mt-0.5">{avgClassScore}</p>
                <p className="text-[10px] text-blue-600 dark:text-blue-400">KKTP Minimal {currentSubject?.kktp}</p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Ketuntasan KKTP</p>
                <p className="text-xl font-extrabold text-emerald-950 dark:text-white mt-0.5">{passingRate}%</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400">{passingCount} dari {students.length} Siswa</p>
              </div>

              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50">
                <p className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">Nilai Tertinggi</p>
                <p className="text-xl font-extrabold text-purple-950 dark:text-white mt-0.5">{highestScore}</p>
                <p className="text-[10px] text-purple-600 dark:text-purple-400">Predikat A</p>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">Nilai Terendah</p>
                <p className="text-xl font-extrabold text-amber-950 dark:text-white mt-0.5">{lowestScore}</p>
                <p className="text-[10px] text-amber-600 dark:text-amber-400">Ambang Batas Nilai</p>
              </div>
            </div>
          </div>

          {/* Spreadsheet Input Table for Selected Subject */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative max-w-sm w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama siswa atau NISN..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 shadow-xs"
                />
              </div>

              {/* Action tools */}
              <div className="flex flex-wrap items-center gap-2">
                {isTeacherOrAdmin && (
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <span className="text-[10.5px] font-bold text-slate-500 px-2">Isi Massal:</span>
                    <button
                      type="button"
                      onClick={() => handleBatchFillScores(currentSubject.kktp || 75)}
                      className="px-2 py-1 rounded-lg text-[10px] font-bold bg-white dark:bg-slate-900 hover:text-blue-600 text-slate-700 dark:text-slate-200 shadow-2xs cursor-pointer"
                      title="Isi seluruh nilai dengan ambang KKTP"
                    >
                      KKTP ({currentSubject.kktp || 75})
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBatchFillScores(85)}
                      className="px-2 py-1 rounded-lg text-[10px] font-bold bg-white dark:bg-slate-900 hover:text-blue-600 text-slate-700 dark:text-slate-200 shadow-2xs cursor-pointer"
                      title="Isi seluruh nilai dengan 85 (Baik)"
                    >
                      Nilai 85
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
                  <span className="text-[11px]">Rumus NA: (Formatif 40%) + (STS 30%) + (SAS 30%)</span>
                </div>
              </div>
            </div>

            {/* Main Table with Dynamic Active TP Columns */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                  <thead className="border-b border-slate-200 bg-slate-50/90 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-800/90 dark:text-slate-300">
                    <tr>
                      <th className="px-3 py-3 text-center w-10">No</th>
                      <th className="px-3 py-3 min-w-[160px]">Nama Siswa</th>

                      {/* DYNAMIC ACTIVE TP COLUMNS */}
                      {currentSubjectTPs.length > 0 ? (
                        currentSubjectTPs.map((tp, idx) => (
                          <th
                            key={tp.id}
                            className="px-2 py-2.5 text-center bg-blue-50/80 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300 border-l border-blue-100 dark:border-blue-900/50 min-w-[70px]"
                          >
                            <div
                              onClick={() => {
                                setSelectedDetailTP(tp);
                                setIsTPDetailModalOpen(true);
                              }}
                              className="cursor-pointer group flex flex-col items-center justify-center select-none"
                              title={`${tp.kode}: ${tp.lingkupMateri}\n${tp.deskripsi}\n(Klik untuk lihat rincian TP)`}
                            >
                              <div className="flex items-center gap-1 font-extrabold text-blue-700 dark:text-blue-300 group-hover:underline">
                                <span>{tp.kode || `TP ${idx + 1}`}</span>
                                <Info className="h-3 w-3 text-blue-400 opacity-60 group-hover:opacity-100" />
                              </div>
                              <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-[65px] block">
                                {tp.lingkupMateri.replace(/^Bab\s*\d*:\s*/i, '')}
                              </span>
                            </div>
                          </th>
                        ))
                      ) : (
                        <th className="px-3 py-3 text-center bg-blue-50/40 text-blue-600 dark:text-blue-400 italic">
                          (Belum Ada TP - Silakan Tambah TP)
                        </th>
                      )}

                      {/* Quick Add TP Header Action */}
                      {isTeacherOrAdmin && (
                        <th className="px-1.5 py-2 text-center bg-blue-50/40 dark:bg-blue-950/20 w-8">
                          <button
                            type="button"
                            onClick={openAddTPModal}
                            title="Tambah Tujuan Pembelajaran (TP) Baru untuk Mapel Ini"
                            className="p-1 rounded-md text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </th>
                      )}

                      <th className="px-2 py-3 text-center bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 border-l border-slate-200 dark:border-slate-800 w-14">
                        STS
                      </th>
                      <th className="px-2 py-3 text-center bg-purple-50/70 dark:bg-purple-950/30 text-purple-900 dark:text-purple-300 w-14">
                        SAS
                      </th>
                      <th className="px-3 py-3 text-center bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-300 font-extrabold w-14">
                        NA
                      </th>
                      <th className="px-2 py-3 text-center w-12">Predikat</th>
                      <th className="px-3 py-3 min-w-[260px]">
                        Deskripsi Rapor Kurmer (Otomatis: TP Tertinggi & Terendah)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {filteredStudents.map(student => {
                      const sts = getGradeValue(student.id, selectedSubjectId, 'Sumatif_STS', 80);
                      const sas = getGradeValue(student.id, selectedSubjectId, 'Sumatif_SAS', 80);
                      const summary = getStudentGradeSummary(student.id, selectedSubjectId);

                      return (
                        <tr
                          key={student.id}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          {/* No */}
                          <td className="px-3 py-2.5 text-center font-bold text-slate-900 dark:text-white">
                            {student.nomorAbsen}
                          </td>

                          {/* Name */}
                          <td className="px-3 py-2.5 font-semibold text-slate-900 dark:text-white truncate">
                            {student.nama}
                          </td>

                          {/* DYNAMIC TP CELL INPUTS */}
                          {currentSubjectTPs.length > 0 ? (
                            currentSubjectTPs.map((tp, idx) => {
                              const assessmentKey: AssessmentType = `Formatif_TP${idx + 1}` as AssessmentType;
                              const scoreVal = getGradeValue(student.id, selectedSubjectId, assessmentKey, 80);

                              return (
                                <td
                                  key={tp.id}
                                  className="px-1.5 py-2 text-center bg-blue-50/20 dark:bg-blue-950/10 border-l border-blue-50 dark:border-blue-950/30"
                                >
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    disabled={!isTeacherOrAdmin}
                                    value={scoreVal}
                                    onChange={e => handleScoreChange(student.id, assessmentKey, e.target.value)}
                                    title={`${student.nama} • ${tp.kode}: ${tp.lingkupMateri}`}
                                    className="w-12 text-center rounded-lg border border-slate-200 bg-white p-1 font-bold text-xs text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                  />
                                </td>
                              );
                            })
                          ) : (
                            <td className="px-3 py-2 text-center bg-slate-50/50 text-slate-400 text-[11px]">
                              -
                            </td>
                          )}

                          {/* Empty spacer if teacher button exists in header */}
                          {isTeacherOrAdmin && <td className="px-1 py-2 text-center bg-blue-50/10"></td>}

                          {/* Sumatif STS */}
                          <td className="px-1.5 py-2 text-center bg-amber-50/20 dark:bg-amber-950/10 border-l border-slate-200 dark:border-slate-800">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              disabled={!isTeacherOrAdmin}
                              value={sts}
                              onChange={e => handleScoreChange(student.id, 'Sumatif_STS', e.target.value)}
                              className="w-12 text-center rounded-lg border border-amber-200 bg-white p-1 font-bold text-xs text-amber-900 focus:border-amber-500 focus:outline-none dark:border-amber-800 dark:bg-slate-800 dark:text-amber-200"
                            />
                          </td>

                          {/* Sumatif SAS */}
                          <td className="px-1.5 py-2 text-center bg-purple-50/20 dark:bg-purple-950/10">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              disabled={!isTeacherOrAdmin}
                              value={sas}
                              onChange={e => handleScoreChange(student.id, 'Sumatif_SAS', e.target.value)}
                              className="w-12 text-center rounded-lg border border-purple-200 bg-white p-1 font-bold text-xs text-purple-900 focus:border-purple-500 focus:outline-none dark:border-purple-800 dark:bg-slate-800 dark:text-purple-200"
                            />
                          </td>

                          {/* Nilai Akhir (NA) */}
                          <td className="px-3 py-2.5 text-center bg-emerald-50/60 dark:bg-emerald-950/30">
                            <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300">
                              {summary.nilaiAkhir}
                            </span>
                          </td>

                          {/* Predikat */}
                          <td className="px-2 py-2.5 text-center">
                            <span className={`inline-block font-extrabold px-2 py-0.5 rounded text-xs ${
                              summary.predikat === 'A'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                : summary.predikat === 'B'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}>
                              {summary.predikat}
                            </span>
                          </td>

                          {/* Auto Deskripsi Capaian */}
                          <td className="px-3 py-2.5 text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                            {summary.deskripsiCapaian}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL QUICK TAMBAH / EDIT TUJUAN PEMBELAJARAN (TP) */}
      {isQuickAddTPModalOpen && (
        <Modal
          isOpen={isQuickAddTPModalOpen}
          onClose={() => setIsQuickAddTPModalOpen(false)}
          title={tpModalMode === 'add' ? `Tambah TP Baru (${currentSubject?.nama})` : `Edit TP (${currentSubject?.nama})`}
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleSaveQuickTP} className="space-y-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900 text-xs text-blue-800 dark:text-blue-200">
              <p className="font-bold">Informasi Penilaian Kurikulum Merdeka:</p>
              <p className="mt-0.5">
                TP yang Anda simpan akan <strong>otomatis langsung muncul sebagai kolom penilaian formatif</strong> pada mata pelajaran {currentSubject?.nama} dan menyusun deskripsi rapor secara cerdas.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Kode TP <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: TP 1, TP 2, 4.1"
                  value={quickTpForm.kode}
                  onChange={e => setQuickTpForm({ ...quickTpForm, kode: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-800 dark:text-slate-100 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Semester Aktif
                </label>
                <select
                  value={quickTpForm.semester}
                  onChange={e => setQuickTpForm({ ...quickTpForm, semester: e.target.value as any })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-800 dark:text-slate-100"
                >
                  <option value="1 (Ganjil)">Semester 1 (Ganjil)</option>
                  <option value="2 (Genap)">Semester 2 (Genap)</option>
                  <option value="Semua">Semua Semester</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Lingkup Materi / Bab <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Bab 1: Pancasila Sebagai Nilai Kehidupan"
                value={quickTpForm.lingkupMateri}
                onChange={e => setQuickTpForm({ ...quickTpForm, lingkupMateri: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-800 dark:text-slate-100 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Rumusan Kalimat Tujuan Pembelajaran (TP) <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="Contoh: Menjelaskan makna sila-sila Pancasila dan mengidentifikasi penerapannya dalam kehidupan sehari-hari."
                value={quickTpForm.deskripsi}
                onChange={e => {
                  const val = e.target.value;
                  setQuickTpForm({
                    ...quickTpForm,
                    deskripsi: val,
                    ringkasanRaporTuntas: quickTpForm.ringkasanRaporTuntas || val.slice(0, 50),
                    ringkasanRaporPerluBimbingan: quickTpForm.ringkasanRaporPerluBimbingan || val.slice(0, 50)
                  });
                }}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                  Ringkasan Rapor (Saat Tuntas/Tinggi)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: memahami makna sila Pancasila"
                  value={quickTpForm.ringkasanRaporTuntas}
                  onChange={e => setQuickTpForm({ ...quickTpForm, ringkasanRaporTuntas: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-amber-700 dark:text-amber-400 mb-1">
                  Ringkasan Rapor (Saat Perlu Bimbingan)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: penerapan sila Pancasila di rumah"
                  value={quickTpForm.ringkasanRaporPerluBimbingan}
                  onChange={e => setQuickTpForm({ ...quickTpForm, ringkasanRaporPerluBimbingan: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsQuickAddTPModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md cursor-pointer"
              >
                <Save className="h-4 w-4" />
                <span>{tpModalMode === 'add' ? 'Simpan & Aktifkan TP' : 'Simpan Perubahan'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL LIHAT DETAIL TP KETIKA HEADER DIKLIK */}
      {isTPDetailModalOpen && selectedDetailTP && (
        <Modal
          isOpen={isTPDetailModalOpen}
          onClose={() => setIsTPDetailModalOpen(false)}
          title={`Rincian ${selectedDetailTP.kode}: ${selectedDetailTP.lingkupMateri}`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">Mata Pelajaran</span>
                <p className="text-sm font-extrabold text-blue-950 dark:text-white">{currentSubject?.nama}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-blue-600 text-white font-extrabold text-xs">
                {selectedDetailTP.kode}
              </span>
            </div>

            <div>
              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Rumusan Kalimat Tujuan Pembelajaran:</span>
              <p className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 leading-relaxed">
                {selectedDetailTP.deskripsi}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900">
                <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-300 block">Narasi Rapor (Tuntas)</span>
                <p className="text-[11px] text-emerald-950 dark:text-emerald-100 font-medium mt-1">
                  "...{selectedDetailTP.ringkasanRaporTuntas || selectedDetailTP.deskripsi}"
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900">
                <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-300 block">Narasi Rapor (Bimbingan)</span>
                <p className="text-[11px] text-amber-950 dark:text-amber-100 font-medium mt-1">
                  "...{selectedDetailTP.ringkasanRaporPerluBimbingan || selectedDetailTP.deskripsi}"
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
              {isTeacherOrAdmin ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsTPDetailModalOpen(false);
                      openEditTPModal(selectedDetailTP);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Edit Rumusan TP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      deleteTP(selectedDetailTP.id);
                      setIsTPDetailModalOpen(false);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Hapus TP</span>
                  </button>
                </div>
              ) : <div />}

              <button
                type="button"
                onClick={() => setIsTPDetailModalOpen(false)}
                className="px-4 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Cetak Leger Nilai Lengkap Resmi */}
      {isPrintLegerOpen && (
        <ModalCetakLeger
          isOpen={isPrintLegerOpen}
          onClose={() => setIsPrintLegerOpen(false)}
          defaultMode="matrix"
        />
      )}
    </div>
  );
};
