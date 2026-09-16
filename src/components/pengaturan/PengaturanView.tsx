import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SchoolInfo } from '../../types';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { UserManagementSection } from './UserManagementSection';
import { RolePermissionsMatrixSection } from './RolePermissionsMatrixSection';
import { LogoKopSection } from './LogoKopSection';
import { TemaDanTampilanSection } from './TemaDanTampilanSection';
import { KurikulumFaseSelectorModal } from '../common/KurikulumFaseSelectorModal';
import {
  CURRICULUM_PHASE_PRESETS,
  CurriculumPhaseKey,
  detectPhaseKey
} from '../../data/kurikulumMerdekaPresets';
import {
  Settings,
  Building2,
  GraduationCap,
  Save,
  RotateCcw,
  Download,
  Upload,
  Check,
  ShieldCheck,
  Sparkles,
  UserCheck,
  ArrowRight,
  Users,
  SlidersHorizontal,
  Database,
  FileJson,
  BookOpen,
  Image as ImageIcon,
  Sun,
  Moon,
  Palette
} from 'lucide-react';

export const PengaturanView: React.FC = () => {
  const {
    schoolInfo,
    updateSchoolInfo,
    resetAllDataToDefault,
    exportDatabaseToJson,
    importDatabaseFromJson,
    teachers,
    availableUsers,
    setCurrentTab,
    currentUser,
    addToast
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'profil' | 'logo_kop' | 'tema' | 'pengguna' | 'hak_akses' | 'database'>('profil');
  const [formData, setFormData] = useState<SchoolInfo>({ ...schoolInfo });
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);
  const [selectedPhaseForModal, setSelectedPhaseForModal] = useState<CurriculumPhaseKey>('fase_b');

  useEffect(() => {
    setFormData({ ...schoolInfo });
  }, [schoolInfo]);

  const activeDetectedPhaseKey = detectPhaseKey(formData.phase);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolInfo(formData);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDatabaseFromJson(content);
        if (success) {
          setFormData({ ...schoolInfo });
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <Settings className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Pengaturan Sistem & Hak Akses
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Konfigurasi identitas sekolah, logo kop dokumen, akun login pengguna, hak akses menu, dan database
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentTab('nilai')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              <span>Mata Pelajaran & TP</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentTab('guru')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 transition-colors"
            >
              <UserCheck className="h-4 w-4" />
              <span>Data Guru & Tendik ({teachers.length})</span>
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('profil')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'profil'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>Profil Sekolah & Kelas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('logo_kop')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'logo_kop'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ImageIcon className="h-4 w-4" />
            <span>Logo & Kop Sekolah (Kiri-Kanan)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('tema')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'tema'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Palette className="h-4 w-4" />
            <span>Tema & Tampilan (Mode Malam/Terang)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('pengguna')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'pengguna'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Manajemen Pengguna</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              activeSubTab === 'pengguna' ? 'bg-blue-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}>
              {availableUsers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('hak_akses')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'hak_akses'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Hak Akses Menu Login</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('database')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'database'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Database className="h-4 w-4" />
            <span>Cadangan & Database</span>
          </button>
        </div>
      </div>

      {/* Subtab 1: Logo & Kop Surat Section */}
      {activeSubTab === 'logo_kop' && <LogoKopSection />}

      {/* Subtab: Tema & Tampilan Layar (Mode Malam & Terang) */}
      {activeSubTab === 'tema' && <TemaDanTampilanSection />}

      {/* Subtab 2: User Management */}
      {activeSubTab === 'pengguna' && <UserManagementSection />}

      {/* Subtab 3: Role Permissions Matrix */}
      {activeSubTab === 'hak_akses' && <RolePermissionsMatrixSection />}

      {/* Subtab 4: School Profile & Curriculum */}
      {activeSubTab === 'profil' && (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Quick banner to Logo Kop */}
          <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:border-blue-900/50 dark:from-blue-950/40 dark:to-slate-900 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-600/20">
                <ImageIcon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  Kustomisasi Logo Kop Surat (Kiri & Kanan)
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Ganti logo resmi Tut Wuri Handayani, Kemenag, Pemda, atau unggah logo khas sekolah sendiri.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveSubTab('logo_kop')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all whitespace-nowrap active:scale-95"
            >
              <span>Atur Logo Kop</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Card 1: Identitas Resmi Sekolah & Kop Dokumen */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Identitas Resmi Sekolah & Header Kop Dokumen
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Sekolah Dasar *
                </label>
                <input
                  type="text"
                  required
                  value={formData.schoolName}
                  onChange={e => setFormData({ ...formData, schoolName: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  NPSN Sekolah
                </label>
                <input
                  type="text"
                  value={formData.npsn}
                  onChange={e => setFormData({ ...formData, npsn: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Desa / Kelurahan
                </label>
                <input
                  type="text"
                  value={formData.village || ''}
                  onChange={e => setFormData({ ...formData, village: e.target.value })}
                  placeholder="Contoh: Kebayoran Baru / Selong"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Kecamatan
                </label>
                <input
                  type="text"
                  value={formData.subdistrict}
                  onChange={e => setFormData({ ...formData, subdistrict: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Kabupaten / Kota *
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Provinsi *
                </label>
                <input
                  type="text"
                  required
                  value={formData.province}
                  onChange={e => setFormData({ ...formData, province: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Alamat Lengkap Sekolah *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Kode Pos
                </label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={e => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nomor Telepon Sekolah
                </label>
                <input
                  type="text"
                  value={formData.phoneNumber}
                  onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Sekolah
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Situs Web
                </label>
                <input
                  type="text"
                  value={formData.website}
                  onChange={e => setFormData({ ...formData, website: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Periode Akademik & Penandatangan Rapor */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-5">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3 flex-wrap">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Struktur Kelas, Semester, & Pejabat Penandatangan
                </h3>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedPhaseForModal(activeDetectedPhaseKey || 'fase_b');
                  setIsPhaseModalOpen(true);
                }}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-xs font-bold transition-all active:scale-95 shadow-xs"
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                <span>Otomatis Sesuaikan Fase Kurikulum</span>
              </button>
            </div>

            {/* Banner Quick Phase Switcher */}
            <div className="rounded-2xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/40 dark:bg-indigo-950/30 p-4">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-900 dark:text-indigo-200">
                    Pilihan Cepat Fase Kurikulum Merdeka (KMPM):
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                    Aktif: {formData.phase || 'Fase B'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Klik kartu untuk sinkronkan otomatis
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(Object.keys(CURRICULUM_PHASE_PRESETS) as CurriculumPhaseKey[]).map(key => {
                  const preset = CURRICULUM_PHASE_PRESETS[key];
                  const isActive = activeDetectedPhaseKey === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setSelectedPhaseForModal(key);
                        setIsPhaseModalOpen(true);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all relative ${
                        isActive
                          ? 'border-indigo-600 bg-white dark:bg-slate-800 shadow-sm ring-1 ring-indigo-500'
                          : 'border-indigo-100 dark:border-slate-800 bg-white/70 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-indigo-300'
                      }`}
                    >
                      {isActive && (
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-800" />
                      )}
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-base">{preset.icon}</span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {preset.shortLabel}
                        </span>
                      </div>
                      <p className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 truncate">
                        {preset.gradeLevels}
                      </p>
                      <p className="text-[9px] text-slate-500 mt-1">
                        {preset.subjects.length} Mapel &bull; {preset.tujuanPembelajaran.length} TP
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Kolom Rombel Kelas */}
              <div className="lg:col-span-8">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Nama Rombongan Belajar (Kelas) *
                  </label>
                  <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                    Aktif: Kelas <span className="font-bold underline">{formData.className}</span>
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                  <input
                    type="text"
                    required
                    placeholder="Cth: 4A"
                    value={formData.className}
                    onChange={e => setFormData({ ...formData, className: e.target.value })}
                    className="w-full sm:w-28 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-white font-bold text-center focus:outline-none focus:border-blue-500 shrink-0"
                  />
                  <div className="flex-1 flex flex-wrap items-center gap-1">
                    {['1A', '2A', '3A', '4A', '5A', '6A', '1B', '2B', '3B', '4B', '5B', '6B'].map(cls => (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => setFormData({ ...formData, className: cls })}
                        className={`px-2 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                          formData.className === cls
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-blue-50 hover:text-blue-600'
                        }`}
                      >
                        {cls}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Kolom Tahun Ajaran (Ukuran Disesuaikan Rapi & Lebih Kecil) */}
              <div className="lg:col-span-4">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tahun Ajaran *
                </label>
                <input
                  type="text"
                  required
                  placeholder="2026/2027"
                  value={formData.academicYear}
                  onChange={e => setFormData({ ...formData, academicYear: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-white font-mono font-bold text-center tracking-wide focus:outline-none focus:border-blue-500"
                />
                <div className="flex items-center gap-1 mt-1">
                  {['2025/2026', '2026/2027', '2027/2028'].map(yr => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => setFormData({ ...formData, academicYear: yr })}
                      className={`flex-1 py-0.5 text-[10px] font-mono rounded border text-center transition-all cursor-pointer ${
                        formData.academicYear === yr
                          ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {yr.split('/')[0].slice(2)}/{yr.split('/')[1].slice(2)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-4">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Semester Aktif *
                </label>
                <select
                  value={formData.semester}
                  onChange={e => setFormData({ ...formData, semester: e.target.value as '1 (Ganjil)' | '2 (Genap)' })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="1 (Ganjil)">Semester 1 (Ganjil)</option>
                  <option value="2 (Genap)">Semester 2 (Genap)</option>
                </select>
              </div>

              <div className="lg:col-span-4">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Fase Kurikulum Merdeka (KMPM) *
                </label>
                <input
                  type="text"
                  value={formData.phase}
                  onChange={e => setFormData({ ...formData, phase: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="lg:col-span-4">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Kurikulum Digunakan *
                </label>
                <select
                  value={formData.kurikulum}
                  onChange={e => setFormData({ ...formData, kurikulum: e.target.value as any })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Kurikulum Merdeka Pembelajaran Mendalam (KMPM)">
                    Kurikulum Merdeka Pembelajaran Mendalam (KMPM)
                  </option>
                  <option value="Kurikulum Merdeka">Kurikulum Merdeka (KUMER Standar)</option>
                  <option value="Kurikulum 2013">Kurikulum 2013 (K13)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Hari Efektif Sekolah per Minggu
                </label>
                <select
                  value={formData.effectiveDaysPerWeek || 5}
                  onChange={e => {
                    const daysCount = parseInt(e.target.value, 10);
                    const activeDays = daysCount === 6 
                      ? ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
                      : ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
                    setFormData({
                      ...formData,
                      effectiveDaysPerWeek: daysCount,
                      activeSchoolDays: activeDays
                    });
                  }}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 font-semibold"
                >
                  <option value={5}>5 Hari Sekolah (Senin - Jumat)</option>
                  <option value={6}>6 Hari Sekolah (Senin - Sabtu)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Kepala Sekolah *
                </label>
                <input
                  type="text"
                  required
                  value={formData.headmasterName}
                  onChange={e => setFormData({ ...formData, headmasterName: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  NIP Kepala Sekolah
                </label>
                <input
                  type="text"
                  value={formData.headmasterNip}
                  onChange={e => setFormData({ ...formData, headmasterNip: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Wali Kelas *
                </label>
                <input
                  type="text"
                  required
                  value={formData.homeroomTeacherName}
                  onChange={e => setFormData({ ...formData, homeroomTeacherName: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  NIP Wali Kelas
                </label>
                <input
                  type="text"
                  value={formData.homeroomTeacherNip}
                  onChange={e => setFormData({ ...formData, homeroomTeacherNip: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 active:scale-95 transition-all"
              >
                <Save className="h-4 w-4" />
                <span>Simpan Pengaturan Profil</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Subtab 5: Database & Backup */}
      {activeSubTab === 'database' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Pusat Cadangan & Pemulihan Data (Backup & Restore)
              </h3>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Semua data buku administrasi kelas, data guru, logo kop surat, akun pengguna, nilai, absensi, jurnal, dan matriks hak akses tersimpan secara offline & aman di penyimpanan peramban (Local Storage).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {/* Export JSON */}
              <div className="p-4 rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 flex flex-col justify-between">
                <div>
                  <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-3 shadow-md shadow-blue-600/20">
                    <Download className="h-5 w-5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Unduh Backup JSON</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Simpan salinan seluruh database dan konfigurasi logo ke berkas JSON di komputer Anda.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={exportDatabaseToJson}
                  className="mt-4 w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Backup</span>
                </button>
              </div>

              {/* Import JSON */}
              <div className="p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 flex flex-col justify-between">
                <div>
                  <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-3 shadow-md shadow-emerald-600/20">
                    <Upload className="h-5 w-5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Restore Data JSON</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Pulihkan seluruh basis data dan konfigurasi kop surat dari berkas JSON yang pernah diunduh.
                  </p>
                </div>
                <label className="mt-4 w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all cursor-pointer">
                  <Upload className="h-3.5 w-3.5" />
                  <span>Pilih File Backup</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Reset to Default */}
              <div className="p-4 rounded-2xl border border-rose-100 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 flex flex-col justify-between">
                <div>
                  <div className="h-10 w-10 rounded-xl bg-rose-600 text-white flex items-center justify-center mb-3 shadow-md shadow-rose-600/20">
                    <RotateCcw className="h-5 w-5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Reset ke Data Awal</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Kembalikan seluruh data siswa, nilai, logo kop, guru, dan akun ke simulasi standar.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsResetConfirmOpen(true)}
                  className="mt-4 w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-all"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Simulasi</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Reset Dialog */}
      {isResetConfirmOpen && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setIsResetConfirmOpen(false)}
          onConfirm={() => {
            resetAllDataToDefault();
            setIsResetConfirmOpen(false);
            setFormData({ ...schoolInfo });
          }}
          title="Reset Semua Data ke Pengaturan Awal?"
          message="Tindakan ini akan mengembalikan data seluruh pendidik/guru, siswa, absensi, nilai, kas, akun login, logo kop surat, dan jadwal ke data awal."
          confirmText="Ya, Reset Sekarang"
          type="danger"
        />
      )}

      {/* Modal Sinkronisasi Fase Kurikulum Merdeka */}
      <KurikulumFaseSelectorModal
        isOpen={isPhaseModalOpen}
        onClose={() => setIsPhaseModalOpen(false)}
        initialPhaseKey={selectedPhaseForModal}
      />
    </div>
  );
};


