import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Student, StudentReportData, KenaikanStatus, isSemesterGenap } from '../../types';
import {
  X,
  Award,
  GraduationCap,
  Sparkles,
  Save,
  RotateCcw,
  CheckCircle2,
  Calendar,
  FileText,
  AlertCircle,
  TrendingUp,
  Info,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  MessageSquare,
  UserCheck
} from 'lucide-react';

interface ModalEditRaporSiswaProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
}

export const ModalEditRaporSiswa: React.FC<ModalEditRaporSiswaProps> = ({
  isOpen,
  onClose,
  student
}) => {
  const {
    schoolInfo,
    updateSchoolInfo,
    getStudentReport,
    updateStudentReport,
    getAllGradesForStudent,
    getAllMidSemesterGradesForStudent,
    calculateStudentRankings,
    calculateMidSemesterRankings,
    getStudentKokurikulerInfo,
    students
  } = useApp();

  const reportData = getStudentReport(student.id);
  const kokurInfo = getStudentKokurikulerInfo(student.id);

  const [activeTab, setActiveTab] = useState<'semester' | 'mid_semester'>('semester');

  // Semester fields
  const [ranking, setRanking] = useState<string | number>(reportData.ranking ?? 1);
  const [statusKenaikan, setStatusKenaikan] = useState<KenaikanStatus>(reportData.statusKenaikan || 'Naik Kelas');
  const [targetKelas, setTargetKelas] = useState<string>(reportData.targetKelas || 'V (Lima)');
  const [keteranganKenaikan, setKeteranganKenaikan] = useState<string>(reportData.keteranganKenaikan || '');
  const [catatanWaliKelas, setCatatanWaliKelas] = useState<string>(reportData.catatanWaliKelas || '');
  const [deskripsiKokurikuler, setDeskripsiKokurikuler] = useState<string>(
    reportData.deskripsiKokurikuler || kokurInfo.deskripsi
  );
  const [tanggapanOrangTua, setTanggapanOrangTua] = useState<string>(
    reportData.tanggapanOrangTua || ''
  );
  const [tempatTanggalRapor, setTempatTanggalRapor] = useState<string>(reportData.tempatTanggalRapor || `${schoolInfo.city}, 20 Juni 2027`);
  const [showRanking, setShowRanking] = useState<boolean>(reportData.showRanking !== false);
  const [showKenaikan, setShowKenaikan] = useState<boolean>(reportData.showKenaikan !== false);
  const [parentSignatureChoice, setParentSignatureChoice] = useState<'auto' | 'ayah' | 'ibu' | 'custom' | 'dots'>(
    reportData.parentSignatureChoice || 'auto'
  );
  const [parentCustomName, setParentCustomName] = useState<string>(reportData.parentCustomName || '');

  // Mid semester fields
  const [rankingMid, setRankingMid] = useState<string | number>(reportData.rankingMid ?? reportData.ranking ?? 1);
  const [catatanWaliKelasMid, setCatatanWaliKelasMid] = useState<string>(
    reportData.catatanWaliKelasMid ||
    `"Ananda ${student.nama} menunjukkan kesungguhan dan keaktifan belajar yang sangat baik hingga tengah semester ini. Pertahankan ketekunan belajarmu dan terus kembangkan potensimu pada paruh semester kedua."`
  );
  const defaultMidTanggal = schoolInfo.semester?.includes('2')
    ? `${schoolInfo.city}, 28 Maret 2027`
    : `${schoolInfo.city}, 10 Oktober 2026`;
  const [tempatTanggalRaporMid, setTempatTanggalRaporMid] = useState<string>(
    reportData.tempatTanggalRaporMid || defaultMidTanggal
  );

  // Synchronize with student change
  useEffect(() => {
    if (student) {
      const current = getStudentReport(student.id);
      setRanking(current.ranking ?? 1);
      setRankingMid(current.rankingMid ?? current.ranking ?? 1);
      setStatusKenaikan(current.statusKenaikan || 'Naik Kelas');
      setTargetKelas(current.targetKelas || 'V (Lima)');
      setKeteranganKenaikan(current.keteranganKenaikan || '');
      setCatatanWaliKelas(current.catatanWaliKelas || '');
      const kInfo = getStudentKokurikulerInfo(student.id);
      setDeskripsiKokurikuler(current.deskripsiKokurikuler || kInfo.deskripsi);
      setTanggapanOrangTua(current.tanggapanOrangTua || '');
      setCatatanWaliKelasMid(
        current.catatanWaliKelasMid ||
        `"Ananda ${student.nama} menunjukkan kesungguhan dan keaktifan belajar yang sangat baik hingga tengah semester ini. Pertahankan ketekunan belajarmu dan terus kembangkan potensimu pada paruh semester kedua."`
      );
      setTempatTanggalRapor(current.tempatTanggalRapor || `${schoolInfo.city}, 20 Juni 2027`);
      setTempatTanggalRaporMid(current.tempatTanggalRaporMid || defaultMidTanggal);
      setShowRanking(current.showRanking !== false);
      setShowKenaikan(current.showKenaikan !== false);
      setParentSignatureChoice(current.parentSignatureChoice || 'auto');
      setParentCustomName(current.parentCustomName || '');
    }
  }, [student, isOpen]);

  if (!isOpen || !student) return null;

  const sGrades = getAllGradesForStudent(student.id);
  const totalScore = sGrades.reduce((sum, g) => sum + g.nilaiAkhir, 0);
  const avgScore = sGrades.length > 0 ? +(totalScore / sGrades.length).toFixed(1) : 0;

  const sMidGrades = getAllMidSemesterGradesForStudent(student.id);
  const totalScoreMid = sMidGrades.reduce((sum, g) => sum + g.nilaiAkhirMid, 0);
  const avgScoreMid = sMidGrades.length > 0 ? +(totalScoreMid / sMidGrades.length).toFixed(1) : 0;

  // Auto calculate ranking for this specific student
  const handleAutoCalculateRanking = () => {
    if (activeTab === 'mid_semester') {
      const midRankings = calculateMidSemesterRankings();
      const myRank = midRankings.find(r => r.siswaId === student.id);
      if (myRank) setRankingMid(myRank.rank);
    } else {
      const rankings = calculateStudentRankings();
      const myRank = rankings.find(r => r.siswaId === student.id);
      if (myRank) setRanking(myRank.rank);
    }
  };

  // Generate decision text when status or target class changes
  const handleStatusChange = (newStatus: KenaikanStatus) => {
    setStatusKenaikan(newStatus);
    const academicYear = schoolInfo.academicYear || '2026/2027';
    if (newStatus === 'Naik Kelas') {
      setKeteranganKenaikan(
        `Berdasarkan pencapaian seluruh tujuan pembelajaran pada Tahun Pelajaran ${academicYear}, peserta didik dinyatakan: NAIK KE KELAS ${targetKelas.toUpperCase()}`
      );
    } else if (newStatus === 'Tinggal Kelas') {
      setKeteranganKenaikan(
        `Berdasarkan evaluasi ketercapaian kompetensi dan ketidakhadiran pada Tahun Pelajaran ${academicYear}, peserta didik dinyatakan: TINGGAL DI KELAS ${schoolInfo.className.toUpperCase()}`
      );
    } else if (newStatus === 'Lulus') {
      setKeteranganKenaikan(
        `Berdasarkan kriteria kelulusan dan hasil asesmen sumatif akhir jenjang, peserta didik dinyatakan: LULUS DARI SATUAN PENDIDIKAN DASAR`
      );
    } else if (newStatus === 'Tidak Lulus') {
      setKeteranganKenaikan(
        `Berdasarkan kriteria kelulusan, peserta didik dinyatakan: TIDAK LULUS`
      );
    } else {
      setKeteranganKenaikan('');
    }
  };

  const handleTargetKelasChange = (newTarget: string) => {
    setTargetKelas(newTarget);
    if (statusKenaikan === 'Naik Kelas') {
      const academicYear = schoolInfo.academicYear || '2026/2027';
      setKeteranganKenaikan(
        `Berdasarkan pencapaian seluruh tujuan pembelajaran pada Tahun Pelajaran ${academicYear}, peserta didik dinyatakan: NAIK KE KELAS ${newTarget.toUpperCase()}`
      );
    }
  };

  // Catatan presets for Akhir Semester
  const catatanPresets = [
    {
      label: 'Sangat Baik & Mandiri',
      text: `"Ananda ${student.nama} menunjukkan kemandirian, nalar kritis, dan budi pekerti yang sangat membanggakan di semester ini. Pertahankan prestasi dan terus kembangkan bakat kepemimpinanmu."`
    },
    {
      label: 'Aktif & Konsisten',
      text: `"Ananda ${student.nama} sangat aktif dalam diskusi kelas dan konsisten mencapai ketuntasan tujuan pembelajaran. Sikap disiplin dan kerja samanya patut menjadi teladan bagi rekan-rekannya."`
    },
    {
      label: 'Peningkatan Literasi',
      text: `"Ananda ${student.nama} mengalami perkembangan yang sangat baik dalam literasi dan kemampuan berpikir analitis. Terus rajin membaca dan eksplorasi hal-hal baru."`
    },
    {
      label: 'Perlu Motivasi & Bimbingan',
      text: `"Ananda ${student.nama} memiliki potensi besar, namun perlu lebih fokus dalam menyimak instruksi pembelajaran dan meningkatkan ketelitian saat pengerjaan tugas."`
    },
    {
      label: 'Bakat Seni & Olahraga',
      text: `"Ananda ${student.nama} menunjukkan bakat istimewa dalam bidang seni dan olahraga serta berakhlak mulia. Diharapkan tetap menyeimbangkan ketekunan dalam bidang akademik."`
    }
  ];

  // Catatan presets for Mid Semester (STS)
  const catatanPresetsMid = [
    {
      label: 'Progres Tengah Semester Baik',
      text: `"Ananda ${student.nama} menunjukkan semangat belajar yang sangat baik hingga pertengahan semester ini. Hasil asesmen sumatif tengah semester menunjukkan capaian yang memuaskan."`
    },
    {
      label: 'Aktif dan Bertanggung Jawab',
      text: `"Ananda ${student.nama} selalu antusias menyelesaikan tugas-tugas awal semester tepat waktu. Pertahankan ketekunan dan kerja kerasmu menjelang akhir semester nanti."`
    },
    {
      label: 'Perlu Penguatan Materi Dasar',
      text: `"Ananda ${student.nama} perlu meningkatkan ketelitian dan mengulang materi dasar di rumah agar hasil pada paruh kedua semester semakin optimal."`
    },
    {
      label: 'Disiplin dan Santun',
      text: `"Ananda ${student.nama} menunjukkan sikap sopan santun dan kedisiplinan yang tinggi dalam kegiatan pembelajaran harian tengah semester."`
    }
  ];

  const handleSave = () => {
    updateStudentReport(student.id, {
      siswaId: student.id,
      ranking,
      rankingMid,
      totalNilai: totalScore,
      rataRataNilai: avgScore,
      totalNilaiMid: totalScoreMid,
      rataRataNilaiMid: avgScoreMid,
      statusKenaikan,
      targetKelas,
      keteranganKenaikan,
      catatanWaliKelas,
      catatanWaliKelasMid,
      deskripsiKokurikuler,
      tanggapanOrangTua,
      tempatTanggalRapor,
      tempatTanggalRaporMid,
      showRanking,
      showKenaikan,
      parentSignatureChoice,
      parentCustomName
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 shadow-md">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-200 bg-blue-800/60 px-2 py-0.5 rounded border border-blue-600/40">
                Pengaturan Rapor Siswa
              </span>
              <h3 className="text-base font-bold text-white mt-0.5 flex items-center gap-2">
                Edit Data Rapor: {student.nama}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selection: Akhir Semester vs Mid Semester */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 px-6 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('semester')}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-xl text-xs font-bold transition-colors ${
              activeTab === 'semester'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-t-2 border-blue-600 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Rapor Akhir Semester (SAS)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('mid_semester')}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-xl text-xs font-bold transition-colors ${
              activeTab === 'mid_semester'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 border-t-2 border-amber-600 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Rapor Mid Semester (STS)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar text-xs">
          {/* Student Quick Stat Info */}
          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3.5 dark:border-blue-900/40 dark:bg-blue-950/30 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">
                {student.nomorAbsen}. {student.nama}
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                NISN: <span className="font-mono text-slate-700 dark:text-slate-300">{student.nisn}</span> • Kelas: {schoolInfo.className} ({schoolInfo.phase})
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="text-center">
                <p className="text-[10px] text-slate-400 font-medium">
                  {activeTab === 'mid_semester' ? 'Total Nilai Mid' : 'Total Nilai Akhir'}
                </p>
                <p className="font-extrabold text-blue-600 dark:text-blue-400 text-xs">
                  {activeTab === 'mid_semester' ? totalScoreMid : totalScore}
                </p>
              </div>
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
              <div className="text-center">
                <p className="text-[10px] text-slate-400 font-medium">
                  {activeTab === 'mid_semester' ? 'Rata Mid' : 'Rata Akhir'}
                </p>
                <p className="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs">
                  {activeTab === 'mid_semester' ? avgScoreMid : avgScore}
                </p>
              </div>
            </div>
          </div>

          {activeTab === 'semester' ? (
            <>
              {/* SECTION 1: RANKING KELAS AKHIR SEMESTER */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-amber-500" />
                    <label className="font-bold text-slate-900 dark:text-white text-xs">
                      1. Ranking / Peringkat Kelas Akhir Semester
                    </label>
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showRanking}
                      onChange={e => setShowRanking(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      Tampilkan Ranking di Lembar Rapor
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Isian Ranking Siswa:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={ranking}
                        onChange={e => setRanking(e.target.value)}
                        placeholder="Contoh: 1, 2, atau Juara 1"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAutoCalculateRanking}
                        className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] shrink-0 active:scale-95 transition-all shadow-xs flex items-center gap-1"
                        title="Hitung ranking otomatis dari total nilai seluruh siswa"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Otomatis</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Total {students.length} siswa di kelas {schoolInfo.className}.
                    </p>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/50 rounded-xl p-2.5 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
                    <Sparkles className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                    <p className="leading-relaxed">
                      Ranking dapat diinput manual sesuai kebijakan sekolah atau dihitung otomatis berdasarkan akumulasi nilai rapor semester.
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION 2: KENAIKAN KELAS / STATUS AKHIR */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-emerald-600" />
                    <label className="font-bold text-slate-900 dark:text-white text-xs">
                      2. Keputusan Kenaikan Kelas / Status Akhir Semester
                    </label>
                  </div>

                  {isSemesterGenap(schoolInfo.semester) ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateSchoolInfo({ semester: '1 (Ganjil)' })}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-[10px] font-bold transition-all shadow-xs cursor-pointer"
                        title="Beralih kembali ke Semester 1 (Ganjil)"
                      >
                        <ArrowLeft className="h-3 w-3" />
                        <span>Ke Smt 1</span>
                      </button>
                      <label className="flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={showKenaikan}
                          onChange={e => setShowKenaikan(e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                          Tampilkan Kotak Keputusan di Rapor (Semester 2)
                        </span>
                      </label>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateSchoolInfo({ semester: '2 (Genap)' })}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-[10px] font-bold transition-all shadow-xs cursor-pointer"
                        title="Beralih ke format Rapor Semester 2 (Genap)"
                      >
                        <span>Ke Smt 2</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                        <Info className="h-3 w-3" />
                        Otomatis Nonaktif di Semester 1
                      </span>
                    </div>
                  )}
                </div>

                {!isSemesterGenap(schoolInfo.semester) && (
                  <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/50 rounded-xl p-2.5 text-[11px] text-blue-900 dark:text-blue-200 flex items-start gap-2">
                    <Info className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
                    <p className="leading-relaxed">
                      <strong>Mode Semester 1 (Ganjil):</strong> Keputusan kenaikan kelas hanya diputuskan dan dicetak pada <strong>Semester 2 (Genap)</strong>.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Status Kenaikan / Kelulusan:
                    </label>
                    <select
                      value={statusKenaikan}
                      onChange={e => handleStatusChange(e.target.value as KenaikanStatus)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none"
                    >
                      <option value="Naik Kelas">Naik Kelas</option>
                      <option value="Tinggal Kelas">Tinggal Kelas</option>
                      <option value="Lulus">Lulus (Tamat Satuan Pendidikan)</option>
                      <option value="Tidak Lulus">Tidak Lulus</option>
                      <option value="Belum Ditentukan">Belum Ditentukan (Semester Ganjil)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Target Kelas Selanjutnya (Bila Naik):
                    </label>
                    <input
                      type="text"
                      value={targetKelas}
                      disabled={statusKenaikan !== 'Naik Kelas'}
                      onChange={e => handleTargetKelasChange(e.target.value)}
                      placeholder="Contoh: V (Lima), VI (Enam), Kelas 5"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Kalimat Resmi Keputusan:
                  </label>
                  <textarea
                    value={keteranganKenaikan}
                    onChange={e => setKeteranganKenaikan(e.target.value)}
                    rows={2}
                    placeholder="Kalimat ketetapan resmi kenaikan kelas..."
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none"
                  />
                </div>
              </div>

              {/* SECTION 3: CATATAN WALI KELAS AKHIR SEMESTER */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <label className="font-bold text-slate-900 dark:text-white text-xs">
                      3. Catatan Wali Kelas & Karakter Pelajar Pancasila (Akhir Semester)
                    </label>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">Kolom D Rapor</span>
                </div>

                <div>
                  <p className="text-[10.5px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                    Gunakan Rekomendasi Template Catatan Cepat:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {catatanPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCatatanWaliKelas(preset.text)}
                        className="rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 px-2.5 py-1 text-[10px] font-medium text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        + {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  value={catatanWaliKelas}
                  onChange={e => setCatatanWaliKelas(e.target.value)}
                  rows={3}
                  placeholder="Tuliskan catatan kemajuan belajar, kedisiplinan, dan motivasi peserta didik..."
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none italic leading-relaxed"
                />
              </div>

              {/* SECTION 4: DESKRIPSI KOKURIKULER (KOLOM D RAPOR SEMESTER 1 & 2) */}
              <div className="rounded-xl border border-purple-200 dark:border-purple-800/60 p-4 bg-purple-50/40 dark:bg-purple-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    <label className="font-bold text-slate-900 dark:text-white text-xs">
                      4. Deskripsi Kokurikuler (Kolom D Rapor Semester)
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-purple-700 dark:text-purple-300 font-bold bg-purple-100 dark:bg-purple-900/60 px-2 py-0.5 rounded">
                      {kokurInfo.projekJudul}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const fresh = getStudentKokurikulerInfo(student.id);
                        setDeskripsiKokurikuler(fresh.deskripsi);
                      }}
                      className="flex items-center gap-1 text-[10.5px] font-bold text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-purple-200 bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-700 px-2 py-0.5 rounded-lg transition-colors shadow-2xs cursor-pointer"
                      title="Sinkronkan dengan deskripsi dari menu penilaian kokurikuler"
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>Sinkronkan Penilaian</span>
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Secara default, kolom ini otomatis mengambil narasi capaian dari menu <strong>Penilaian Kokurikuler & DPL</strong> (E-Rapor Kemendikdasmen). Anda dapat menyesuaikan redaksinya di sini.
                </p>

                <textarea
                  value={deskripsiKokurikuler}
                  onChange={e => setDeskripsiKokurikuler(e.target.value)}
                  rows={3}
                  placeholder="Deskripsi capaian kokurikuler siswa..."
                  className="w-full rounded-xl border border-purple-300 bg-white p-2.5 text-xs text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none italic leading-relaxed"
                />
              </div>

              {/* SECTION 5: TANGGAPAN ORANG TUA / WALI MURID (KOLOM F RAPOR SEMESTER 1 & 2) */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-emerald-600" />
                    <label className="font-bold text-slate-900 dark:text-white text-xs">
                      5. Tanggapan Orang Tua / Wali Murid (Kolom F Rapor Semester)
                    </label>
                  </div>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded">
                    Format Kosong di Lembar Rapor
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Pada lembar cetak rapor, kolom ini tampil sebagai <strong>format kosong bergaris</strong> untuk ditulis tangan secara langsung oleh Orang Tua / Wali Murid saat pembagian rapor. Jika ada tanggapan digital yang ingin disimpan, Anda dapat mengetiknya di bawah ini.
                </p>

                <textarea
                  value={tanggapanOrangTua}
                  onChange={e => setTanggapanOrangTua(e.target.value)}
                  rows={2}
                  placeholder="Kosongkan jika ingin dibiarkan bergaris kosong untuk ditulis tangan..."
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none italic leading-relaxed"
                />
              </div>

              {/* SECTION: TANDA TANGAN ORANG TUA / WALI PADA RAPOR */}
              <div className="rounded-xl border border-blue-200 dark:border-blue-800/70 p-4 bg-blue-50/40 dark:bg-blue-950/20 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-blue-600" />
                    <label className="font-bold text-slate-900 dark:text-white text-xs">
                      Nama Orang Tua / Wali pada Tanda Tangan Rapor
                    </label>
                  </div>
                  <span className="text-[10px] text-blue-700 dark:text-blue-300 font-bold bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded">
                    Pengesahan Rapor
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Tentukan nama yang tercetak pada kolom tanda tangan Orang Tua / Wali untuk peserta didik <strong>{student.nama}</strong>:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setParentSignatureChoice('auto')}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center text-center ${
                      parentSignatureChoice === 'auto'
                        ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span>Otomatis</span>
                    <span className="text-[10px] font-normal opacity-85 mt-0.5">Ikuti Toolbar Cetak</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setParentSignatureChoice('ayah')}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center text-center ${
                      parentSignatureChoice === 'ayah'
                        ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span>Nama Ayah</span>
                    <span className="text-[10px] font-normal opacity-85 mt-0.5 truncate max-w-full">
                      {student.namaAyah || '(Belum Ada)'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setParentSignatureChoice('ibu')}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center text-center ${
                      parentSignatureChoice === 'ibu'
                        ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span>Nama Ibu</span>
                    <span className="text-[10px] font-normal opacity-85 mt-0.5 truncate max-w-full">
                      {student.namaIbu || '(Belum Ada)'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setParentSignatureChoice('custom')}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center text-center ${
                      parentSignatureChoice === 'custom'
                        ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span>Wali / Kustom</span>
                    <span className="text-[10px] font-normal opacity-85 mt-0.5">Ketik Sendiri</span>
                  </button>
                </div>

                {parentSignatureChoice === 'custom' && (
                  <div className="pt-1">
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Nama Lengkap Wali / Pengganti Orang Tua:
                    </label>
                    <input
                      type="text"
                      value={parentCustomName}
                      onChange={e => setParentCustomName(e.target.value)}
                      placeholder="Masukkan nama lengkap wali peserta didik..."
                      className="w-full rounded-xl border border-blue-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none font-bold"
                    />
                  </div>
                )}
              </div>

              {/* SECTION 6: TANGGAL PENGESAHAN AKHIR SEMESTER */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>6. Tempat & Tanggal Pengesahan Rapor Akhir Semester:</span>
                  </label>
                  <input
                    type="text"
                    value={tempatTanggalRapor}
                    onChange={e => setTempatTanggalRapor(e.target.value)}
                    placeholder="Contoh: Jakarta, 20 Juni 2027"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none"
                  />
                </div>
                <div className="flex items-center text-[11px] text-slate-500 dark:text-slate-400 pt-5">
                  <span>Wali Kelas: <strong>{schoolInfo.homeroomTeacherName}</strong></span>
                </div>
              </div>
            </>
          ) : (
            /* MID SEMESTER TAB EDITING */
            <>
              {/* SECTION 1: RANKING MID SEMESTER */}
              <div className="rounded-xl border border-amber-200 dark:border-amber-800 p-4 bg-amber-50/40 dark:bg-amber-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-amber-600" />
                    <label className="font-bold text-slate-900 dark:text-white text-xs">
                      1. Ranking / Peringkat Tengah Semester (STS)
                    </label>
                  </div>
                  <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded">
                    Rapor Mid Semester
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Peringkat Tengah Semester:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={rankingMid}
                        onChange={e => setRankingMid(e.target.value)}
                        placeholder="Contoh: 1, 2, atau Juara 1"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAutoCalculateRanking}
                        className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shrink-0 active:scale-95 transition-all shadow-xs flex items-center gap-1"
                        title="Hitung ranking otomatis dari nilai STS + Formatif siswa"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Otomatis Mid</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-[11px] text-slate-700 dark:text-slate-300 flex items-start gap-2">
                    <Info className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                    <p className="leading-relaxed">
                      Nilai Rapor Tengah Semester menampilkan capaian Asesmen Sumatif Tengah Semester (STS) pada tahun pelajaran yang sedang berjalan.
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION 2: CATATAN WALI KELAS MID SEMESTER */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-amber-600" />
                    <label className="font-bold text-slate-900 dark:text-white text-xs">
                      2. Catatan Perkembangan Belajar Tengah Semester (Wali Kelas)
                    </label>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">Kolom D Rapor Mid</span>
                </div>

                <div>
                  <p className="text-[10.5px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                    Template Catatan Tengah Semester:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {catatanPresetsMid.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCatatanWaliKelasMid(preset.text)}
                        className="rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 px-2.5 py-1 text-[10px] font-medium text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        + {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  value={catatanWaliKelasMid}
                  onChange={e => setCatatanWaliKelasMid(e.target.value)}
                  rows={3}
                  placeholder="Tuliskan catatan evaluasi belajar tengah semester peserta didik..."
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none italic leading-relaxed"
                />
              </div>

              {/* SECTION: TANDA TANGAN ORANG TUA / WALI PADA RAPOR MID */}
              <div className="rounded-xl border border-amber-200 dark:border-amber-800/70 p-4 bg-amber-50/40 dark:bg-amber-950/20 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-amber-600" />
                    <label className="font-bold text-slate-900 dark:text-white text-xs">
                      Nama Orang Tua / Wali pada Tanda Tangan Rapor
                    </label>
                  </div>
                  <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded">
                    Pengesahan Rapor Mid
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Tentukan nama yang tercetak pada kolom tanda tangan Orang Tua / Wali untuk peserta didik <strong>{student.nama}</strong>:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setParentSignatureChoice('auto')}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center text-center ${
                      parentSignatureChoice === 'auto'
                        ? 'border-amber-600 bg-amber-600 text-white shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span>Otomatis</span>
                    <span className="text-[10px] font-normal opacity-85 mt-0.5">Ikuti Toolbar Cetak</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setParentSignatureChoice('ayah')}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center text-center ${
                      parentSignatureChoice === 'ayah'
                        ? 'border-amber-600 bg-amber-600 text-white shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span>Nama Ayah</span>
                    <span className="text-[10px] font-normal opacity-85 mt-0.5 truncate max-w-full">
                      {student.namaAyah || '(Belum Ada)'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setParentSignatureChoice('ibu')}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center text-center ${
                      parentSignatureChoice === 'ibu'
                        ? 'border-amber-600 bg-amber-600 text-white shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span>Nama Ibu</span>
                    <span className="text-[10px] font-normal opacity-85 mt-0.5 truncate max-w-full">
                      {student.namaIbu || '(Belum Ada)'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setParentSignatureChoice('custom')}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center text-center ${
                      parentSignatureChoice === 'custom'
                        ? 'border-amber-600 bg-amber-600 text-white shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span>Wali / Kustom</span>
                    <span className="text-[10px] font-normal opacity-85 mt-0.5">Ketik Sendiri</span>
                  </button>
                </div>

                {parentSignatureChoice === 'custom' && (
                  <div className="pt-1">
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Nama Lengkap Wali / Pengganti Orang Tua:
                    </label>
                    <input
                      type="text"
                      value={parentCustomName}
                      onChange={e => setParentCustomName(e.target.value)}
                      placeholder="Masukkan nama lengkap wali peserta didik..."
                      className="w-full rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none font-bold"
                    />
                  </div>
                )}
              </div>

              {/* SECTION 3: TANGGAL PENGESAHAN MID SEMESTER */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-amber-500" />
                    <span>Tempat & Tanggal Pengesahan Rapor Mid Semester:</span>
                  </label>
                  <input
                    type="text"
                    value={tempatTanggalRaporMid}
                    onChange={e => setTempatTanggalRaporMid(e.target.value)}
                    placeholder="Contoh: Jakarta, 10 Oktober 2026"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none"
                  />
                </div>
                <div className="flex items-center text-[11px] text-slate-500 dark:text-slate-400 pt-5">
                  <span>Wali Kelas: <strong>{schoolInfo.homeroomTeacherName}</strong></span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 px-6 py-3.5 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-95 transition-all"
          >
            <Save className="h-4 w-4" />
            <span>Simpan Perubahan Rapor</span>
          </button>
        </div>
      </div>
    </div>
  );
};
