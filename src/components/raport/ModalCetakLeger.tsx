import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { isSemesterGenap } from '../../types';
import { HeaderKopSekolah } from '../common/HeaderKopSekolah';
import {
  Printer,
  X,
  FileSpreadsheet,
  Trophy,
  GraduationCap,
  Calendar,
  CheckSquare,
  Square,
  SlidersHorizontal,
  Download,
  Info
} from 'lucide-react';

interface ModalCetakLegerProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'matrix' | 'leaderboard' | 'kenaikan';
}

export const ModalCetakLeger: React.FC<ModalCetakLegerProps> = ({
  isOpen,
  onClose,
  defaultMode = 'matrix'
}) => {
  const {
    schoolInfo,
    students,
    subjects,
    getStudentReport,
    getAllGradesForStudent,
    getStudentAttendanceStats
  } = useApp();

  const isGenap = isSemesterGenap(schoolInfo.semester);

  // Tab mode
  const [printMode, setPrintMode] = useState<'matrix' | 'leaderboard' | 'kenaikan'>(defaultMode);

  // Orientation & paper options
  const [pageOrientation, setPageOrientation] = useState<'landscape' | 'portrait'>(
    defaultMode === 'matrix' ? 'landscape' : 'portrait'
  );

  // Print customization options
  const [showSignature, setShowSignature] = useState(true);
  const [showAttendance, setShowAttendance] = useState(true);
  const [showStatsFooter, setShowStatsFooter] = useState(true);
  const [sortBy, setSortBy] = useState<'absen' | 'rank' | 'nama' | 'total'>('absen');
  const [customReportDate, setCustomReportDate] = useState(
    schoolInfo.reportDate ||
      new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
  );

  // Computed per-student dataset
  const computedList = useMemo(() => {
    return students.map(student => {
      const report = getStudentReport(student.id);
      const studentGrades = getAllGradesForStudent(student.id);
      const attStats = getStudentAttendanceStats(student.id);

      const totalScore = studentGrades.reduce((sum, g) => sum + g.nilaiAkhir, 0);
      const avgScore =
        studentGrades.length > 0 ? +(totalScore / studentGrades.length).toFixed(1) : 0;
      const completedCount = studentGrades.filter(
        g => g.nilaiAkhir >= (g.subject.kktp || 75)
      ).length;

      const subjectScores: Record<string, number> = {};
      studentGrades.forEach(g => {
        subjectScores[g.subject.id] = g.nilaiAkhir;
      });

      // Best subject
      let bestSubject = '-';
      let maxScore = -1;
      studentGrades.forEach(g => {
        if (g.nilaiAkhir > maxScore) {
          maxScore = g.nilaiAkhir;
          bestSubject = g.subject.nama;
        }
      });

      // Predicate based on average
      let predicate = 'C';
      if (avgScore >= 90) predicate = 'A';
      else if (avgScore >= 80) predicate = 'B';
      else if (avgScore >= 70) predicate = 'C';
      else predicate = 'D';

      const numericRank =
        report.ranking && !isNaN(Number(report.ranking)) ? Number(report.ranking) : 999;

      return {
        student,
        report,
        studentGrades,
        subjectScores,
        totalScore,
        avgScore,
        predicate,
        completedCount,
        attStats,
        bestSubject,
        maxScore,
        numericRank
      };
    });
  }, [students, subjects, getStudentReport, getAllGradesForStudent, getStudentAttendanceStats]);

  // Sorted list for printout
  const sortedStudents = useMemo(() => {
    const list = [...computedList];
    list.sort((a, b) => {
      if (sortBy === 'rank') {
        return a.numericRank - b.numericRank || b.totalScore - a.totalScore;
      }
      if (sortBy === 'total') {
        return b.totalScore - a.totalScore;
      }
      if (sortBy === 'nama') {
        return a.student.nama.localeCompare(b.student.nama);
      }
      // default: absen
      return (a.student.nomorAbsen || 0) - (b.student.nomorAbsen || 0);
    });
    return list;
  }, [computedList, sortBy]);

  // Class statistics
  const classStats = useMemo(() => {
    const totalStudents = students.length;
    if (totalStudents === 0) {
      return {
        overallAvg: 0,
        highestTotal: 0,
        lowestTotal: 0,
        subjectAverages: {},
        subjectMax: {},
        subjectMin: {},
        subjectPassPercent: {},
        countNaik: 0,
        countTinggal: 0,
        countLulus: 0
      };
    }

    let sumTotalScores = 0;
    let highestTotal = -1;
    let lowestTotal = 999999;
    let countNaik = 0;
    let countTinggal = 0;
    let countLulus = 0;

    const subSums: Record<string, number> = {};
    const subMax: Record<string, number> = {};
    const subMin: Record<string, number> = {};
    const subPassCount: Record<string, number> = {};

    subjects.forEach(sub => {
      subSums[sub.id] = 0;
      subMax[sub.id] = -1;
      subMin[sub.id] = 999;
      subPassCount[sub.id] = 0;
    });

    computedList.forEach(item => {
      if (item.report.statusKenaikan === 'Naik Kelas') countNaik++;
      else if (item.report.statusKenaikan === 'Tinggal Kelas') countTinggal++;
      else if (item.report.statusKenaikan === 'Lulus') countLulus++;

      sumTotalScores += item.totalScore;
      if (item.totalScore > highestTotal) highestTotal = item.totalScore;
      if (item.totalScore < lowestTotal) lowestTotal = item.totalScore;

      subjects.forEach(sub => {
        const score = item.subjectScores[sub.id] || 0;
        subSums[sub.id] += score;
        if (score > subMax[sub.id]) subMax[sub.id] = score;
        if (score < subMin[sub.id]) subMin[sub.id] = score;
        if (score >= (sub.kktp || 75)) subPassCount[sub.id]++;
      });
    });

    const subjectAverages: Record<string, number> = {};
    const subjectPassPercent: Record<string, number> = {};

    subjects.forEach(sub => {
      subjectAverages[sub.id] = +(subSums[sub.id] / totalStudents).toFixed(1);
      subjectPassPercent[sub.id] = Math.round((subPassCount[sub.id] / totalStudents) * 100);
      if (subMin[sub.id] === 999) subMin[sub.id] = 0;
      if (subMax[sub.id] === -1) subMax[sub.id] = 0;
    });

    const overallAvg =
      subjects.length > 0 ? +(sumTotalScores / (totalStudents * subjects.length)).toFixed(1) : 0;

    return {
      overallAvg,
      highestTotal: highestTotal === -1 ? 0 : highestTotal,
      lowestTotal: lowestTotal === 999999 ? 0 : lowestTotal,
      subjectAverages,
      subjectMax: subMax,
      subjectMin: subMin,
      subjectPassPercent,
      countNaik,
      countTinggal,
      countLulus
    };
  }, [students, subjects, computedList]);

  if (!isOpen) return null;

  const handlePrintDocument = () => {
    window.print();
  };

  const getDocTitle = () => {
    if (printMode === 'matrix') return 'LEGER NILAI & REKAPITULASI HASIL BELAJAR PESERTA DIDIK (KMPM)';
    if (printMode === 'leaderboard') return 'DAFTAR PERINGKAT & PRESTASI HASIL BELAJAR SE-KELAS (KMPM)';
    return 'REKAPITULASI KEPUTUSAN KENAIKAN KELAS & KELULUSAN (KMPM)';
  };

  const getDocSubtitle = () => {
    return `KURIKULUM MERDEKA PEMBELAJARAN MENDALAM (KMPM) • Kelas: ${schoolInfo.className} • Fase: ${schoolInfo.phase || 'B'} • Semester: ${schoolInfo.semester} • Tahun Ajaran: ${schoolInfo.academicYear}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-xs print:p-0 print:m-0 print:static print:block print:overflow-visible print:bg-transparent print:z-auto">
      {/* Injected Print Page Rule for Orientation */}
      <style>{`
        @media print {
          @page {
            size: ${pageOrientation} !important;
            margin: 8mm 8mm 8mm 8mm !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-6xl max-h-[96vh] flex flex-col rounded-2xl bg-slate-100 dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150 print:max-h-none print:w-full print:max-w-none print:border-none print:shadow-none print:rounded-none print:m-0 print:p-0 print:static print:bg-transparent print:overflow-visible print:animate-none">
        {/* Top Header Toolbar */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-3.5 no-print print:hidden shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <Printer className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Pratinjau & Cetak Leger Rapor Kelas
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Format resmi Kurikulum Merdeka Pembelajaran Mendalam (KMPM) • Kelas {schoolInfo.className} • {schoolInfo.academicYear}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrintDocument}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Cetak Sekarang (Print / PDF)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Options & Tab Bar */}
        <div className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 p-3 sm:px-5 no-print print:hidden space-y-3 shrink-0 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Format Selection Tabs */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setPrintMode('matrix');
                  setSortBy('absen');
                  setPageOrientation('landscape');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  printMode === 'matrix'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>Leger Nilai Lengkap</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPrintMode('leaderboard');
                  setSortBy('rank');
                  setPageOrientation('portrait');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  printMode === 'leaderboard'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Trophy className="h-3.5 w-3.5" />
                <span>Daftar Peringkat & Prestasi</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPrintMode('kenaikan');
                  setSortBy('absen');
                  setPageOrientation('portrait');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  printMode === 'kenaikan'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <GraduationCap className="h-3.5 w-3.5" />
                <span>Rekap Kenaikan / Kelulusan</span>
              </button>
            </div>

            {/* Print Customization Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Orientasi Kertas */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Orientasi:</span>
                <select
                  value={pageOrientation}
                  onChange={e => setPageOrientation(e.target.value as any)}
                  className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
                >
                  <option value="landscape">Lanskap (Landscape - Disarankan)</option>
                  <option value="portrait">Tegak (Portrait)</option>
                </select>
              </div>

              {/* Urutan */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Urutan:</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
                >
                  <option value="absen">No. Absen</option>
                  <option value="rank">Peringkat / Rank</option>
                  <option value="total">Total Nilai</option>
                  <option value="nama">Nama Siswa</option>
                </select>
              </div>

              {/* Tanggal Titimangsa */}
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-slate-500 font-medium">Titimangsa:</span>
                <input
                  type="text"
                  value={customReportDate}
                  onChange={e => setCustomReportDate(e.target.value)}
                  placeholder="Contoh: 15 Juli 2025"
                  className="w-36 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1 text-xs font-medium text-slate-800 dark:text-slate-200 outline-none"
                />
              </div>

              {/* Toggle Tanda Tangan */}
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 font-medium select-none">
                <input
                  type="checkbox"
                  checked={showSignature}
                  onChange={e => setShowSignature(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>Tanda Tangan</span>
              </label>

              {printMode === 'matrix' && (
                <>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 font-medium select-none">
                    <input
                      type="checkbox"
                      checked={showAttendance}
                      onChange={e => setShowAttendance(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>Presensi (S/I/A)</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 font-medium select-none">
                    <input
                      type="checkbox"
                      checked={showStatsFooter}
                      onChange={e => setShowStatsFooter(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>Ringkasan Statistik</span>
                  </label>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Printable Document View */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 custom-scrollbar bg-slate-200/60 dark:bg-slate-950 print:p-0 print:m-0 print:overflow-visible print:bg-transparent print:block">
          <div
            id="printable-official-document"
            className="printable-document-sheet max-w-[1100px] mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-md border border-slate-300 text-black print:border-none print:shadow-none print:p-0 print:m-0 print:w-full print:max-w-none font-sans print:text-black print:bg-white"
          >
            {/* 1. Header Kop Surat Resmi */}
            <HeaderKopSekolah
              documentTitle={getDocTitle()}
              subTitle={getDocSubtitle()}
            />

            {/* 2. Metadata Information Block */}
            <div className="grid grid-cols-2 text-[10.5px] leading-tight mb-3 text-black">
              <div className="space-y-0.5">
                <p>
                  <strong>Satuan Pendidikan:</strong> {schoolInfo.schoolName}
                </p>
                <p>
                  <strong>Kelas / Fase:</strong> {schoolInfo.className} / {schoolInfo.phase || 'Fase B'}
                </p>
                <p>
                  <strong>Semester:</strong> {schoolInfo.semester} (
                  {isGenap ? 'Semester Genap' : 'Semester Ganjil'})
                </p>
              </div>
              <div className="space-y-0.5 text-right">
                <p>
                  <strong>Tahun Ajaran:</strong> {schoolInfo.academicYear}
                </p>
                <p>
                  <strong>Guru / Wali Kelas:</strong> {schoolInfo.homeroomTeacherName}
                </p>
                <p>
                  <strong>NIP:</strong> {schoolInfo.homeroomTeacherNip || '-'}
                </p>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* FORMAT 1: LEGER NILAI & PRESENSI LENGKAP */}
            {/* ========================================================================= */}
            {printMode === 'matrix' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[9.5px] border-collapse border border-black text-black">
                  <thead>
                    <tr className="bg-slate-100 border border-black text-center font-bold">
                      <th rowSpan={2} className="border border-black p-1 w-6">
                        No
                      </th>
                      <th rowSpan={2} className="border border-black p-1 text-left min-w-[140px]">
                        Nama Peserta Didik
                      </th>
                      <th rowSpan={2} className="border border-black p-1 w-7">
                        L/P
                      </th>

                      {/* Mapel Columns */}
                      <th colSpan={subjects.length} className="border border-black p-1 bg-slate-200">
                        Mata Pelajaran (Nilai Akhir Rapor)
                      </th>

                      <th rowSpan={2} className="border border-black p-1 w-11 font-extrabold bg-slate-200">
                        Total
                      </th>
                      <th rowSpan={2} className="border border-black p-1 w-11 font-extrabold bg-slate-200">
                        Rata²
                      </th>
                      <th rowSpan={2} className="border border-black p-1 w-9 font-extrabold bg-amber-100">
                        Rank
                      </th>

                      {showAttendance && (
                        <th colSpan={3} className="border border-black p-1">
                          Ketidakhadiran
                        </th>
                      )}

                      <th rowSpan={2} className="border border-black p-1 min-w-[85px]">
                        Status {isGenap ? 'Kenaikan' : 'Capaian'}
                      </th>
                    </tr>

                    <tr className="bg-slate-50 border border-black text-center font-bold text-[8.5px]">
                      {subjects.map(sub => (
                        <th
                          key={sub.id}
                          className="border border-black p-1 min-w-[34px]"
                          title={`${sub.nama} (KKTP: ${sub.kktp})`}
                        >
                          <div>{sub.kode}</div>
                          <div className="text-[7.5px] font-normal text-slate-600">≥{sub.kktp}</div>
                        </th>
                      ))}

                      {showAttendance && (
                        <>
                          <th className="border border-black p-0.5 w-6">S</th>
                          <th className="border border-black p-0.5 w-6">I</th>
                          <th className="border border-black p-0.5 w-6">A</th>
                        </>
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {sortedStudents.map((item, idx) => {
                      const s = item.student;
                      const r = item.report;
                      const isTop3 = item.numericRank <= 3;

                      return (
                        <tr
                          key={s.id}
                          className={`border border-black text-center ${
                            isTop3 ? 'bg-amber-50/40' : ''
                          }`}
                        >
                          <td className="border border-black p-1 font-bold">
                            {s.nomorAbsen || idx + 1}
                          </td>
                          <td className="border border-black p-1 text-left">
                            <div className="font-bold text-[10px] leading-tight">{s.nama}</div>
                            <div className="text-[8px] text-slate-500 font-mono">
                              NISN: {s.nisn}
                            </div>
                          </td>
                          <td className="border border-black p-1">{s.jenisKelamin}</td>

                          {/* Scores */}
                          {subjects.map(sub => {
                            const score = item.subjectScores[sub.id] ?? 0;
                            const isTuntas = score >= (sub.kktp || 75);

                            return (
                              <td
                                key={sub.id}
                                className={`border border-black p-1 font-semibold ${
                                  !isTuntas ? 'text-rose-700 font-bold bg-rose-50' : ''
                                }`}
                              >
                                {score}
                              </td>
                            );
                          })}

                          {/* Total & Average */}
                          <td className="border border-black p-1 font-black bg-slate-50">
                            {item.totalScore}
                          </td>
                          <td className="border border-black p-1 font-black bg-slate-50">
                            {item.avgScore}
                          </td>
                          <td className="border border-black p-1 font-black bg-amber-50">
                            {r.ranking || item.numericRank}
                          </td>

                          {/* Attendance */}
                          {showAttendance && (
                            <>
                              <td className="border border-black p-1 font-mono">
                                {item.attStats.sakit}
                              </td>
                              <td className="border border-black p-1 font-mono">
                                {item.attStats.izin}
                              </td>
                              <td className="border border-black p-1 font-mono font-bold text-rose-700">
                                {item.attStats.alpa}
                              </td>
                            </>
                          )}

                          {/* Status */}
                          <td className="border border-black p-1 font-semibold text-[9px]">
                            {r.statusKenaikan || 'Naik Kelas'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>

                  {/* Summary Footer */}
                  {showStatsFooter && (
                    <tfoot>
                      {/* Rata-Rata */}
                      <tr className="bg-slate-100 font-bold border-t-2 border-black">
                        <td colSpan={3} className="border border-black p-1 text-right font-black">
                          RATA-RATA KELAS:
                        </td>
                        {subjects.map(sub => (
                          <td key={sub.id} className="border border-black p-1 text-center font-mono">
                            {classStats.subjectAverages[sub.id] ?? '-'}
                          </td>
                        ))}
                        <td className="border border-black p-1 text-center font-black">
                          {(classStats.overallAvg * subjects.length).toFixed(0)}
                        </td>
                        <td className="border border-black p-1 text-center font-black">
                          {classStats.overallAvg}
                        </td>
                        <td colSpan={showAttendance ? 5 : 2} className="border border-black p-1 text-[8.5px] text-left">
                          Rerata dari {students.length} Peserta Didik
                        </td>
                      </tr>

                      {/* Tertinggi */}
                      <tr className="bg-slate-50 text-[8.5px]">
                        <td colSpan={3} className="border border-black p-1 text-right font-bold text-emerald-800">
                          NILAI TERTINGGI:
                        </td>
                        {subjects.map(sub => (
                          <td key={sub.id} className="border border-black p-1 text-center font-mono font-bold text-emerald-800">
                            {classStats.subjectMax[sub.id] ?? '-'}
                          </td>
                        ))}
                        <td className="border border-black p-1 text-center font-bold text-emerald-800">
                          {classStats.highestTotal}
                        </td>
                        <td colSpan={showAttendance ? 6 : 3} className="border border-black p-1 text-[8.5px] text-left">
                          Nilai Terendah: Total {classStats.lowestTotal}
                        </td>
                      </tr>

                      {/* % Tuntas */}
                      <tr className="bg-slate-50 text-[8.5px]">
                        <td colSpan={3} className="border border-black p-1 text-right font-bold text-blue-800">
                          KETUNTASAN KKTP (%):
                        </td>
                        {subjects.map(sub => (
                          <td key={sub.id} className="border border-black p-1 text-center font-mono font-bold text-blue-800">
                            {classStats.subjectPassPercent[sub.id]}%
                          </td>
                        ))}
                        <td colSpan={showAttendance ? 8 : 5} className="border border-black p-1 text-[8.5px] text-left">
                          Target Ketercapaian Tujuan Pembelajaran 100%
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            )}

            {/* ========================================================================= */}
            {/* FORMAT 2: DAFTAR PERINGKAT & PRESTASI SE-KELAS */}
            {/* ========================================================================= */}
            {printMode === 'leaderboard' && (
              <div className="overflow-x-auto space-y-4">
                <table className="w-full text-left text-[10px] border-collapse border border-black text-black">
                  <thead>
                    <tr className="bg-slate-100 border border-black text-center font-bold">
                      <th className="border border-black p-1.5 w-12 bg-amber-100 font-black">
                        Peringkat
                      </th>
                      <th className="border border-black p-1.5 w-10">Absen</th>
                      <th className="border border-black p-1.5 w-24">NISN</th>
                      <th className="border border-black p-1.5 text-left min-w-[160px]">
                        Nama Peserta Didik
                      </th>
                      <th className="border border-black p-1.5 w-8">L/P</th>
                      <th className="border border-black p-1.5 w-16 font-extrabold bg-slate-200">
                        Total Nilai
                      </th>
                      <th className="border border-black p-1.5 w-16 font-extrabold bg-slate-200">
                        Rata-Rata
                      </th>
                      <th className="border border-black p-1.5 w-14">Predikat</th>
                      <th className="border border-black p-1.5 text-left min-w-[120px]">
                        Mapel Tertinggi
                      </th>
                      <th className="border border-black p-1.5 w-20">Ketuntasan</th>
                      <th className="border border-black p-1.5 text-left min-w-[140px]">
                        Catatan Prestasi & Rekomendasi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedStudents.map((item, idx) => {
                      const s = item.student;
                      const r = item.report;
                      const rankDisplay = r.ranking || item.numericRank;
                      const isTop1 = item.numericRank === 1;
                      const isTop2 = item.numericRank === 2;
                      const isTop3 = item.numericRank === 3;

                      return (
                        <tr
                          key={s.id}
                          className={`border border-black text-center ${
                            isTop1
                              ? 'bg-amber-100/60 font-medium'
                              : isTop2 || isTop3
                              ? 'bg-amber-50/50'
                              : ''
                          }`}
                        >
                          <td className="border border-black p-1.5 font-black text-center text-xs">
                            {isTop1 ? '🥇 1' : isTop2 ? '🥈 2' : isTop3 ? '🥉 3' : rankDisplay}
                          </td>
                          <td className="border border-black p-1.5 font-bold">
                            {s.nomorAbsen || idx + 1}
                          </td>
                          <td className="border border-black p-1.5 font-mono">{s.nisn}</td>
                          <td className="border border-black p-1.5 text-left font-bold">{s.nama}</td>
                          <td className="border border-black p-1.5">{s.jenisKelamin}</td>
                          <td className="border border-black p-1.5 font-black bg-slate-50">
                            {item.totalScore}
                          </td>
                          <td className="border border-black p-1.5 font-black bg-slate-50">
                            {item.avgScore}
                          </td>
                          <td className="border border-black p-1.5 font-bold">
                            {item.predicate}
                          </td>
                          <td className="border border-black p-1.5 text-left text-[9px]">
                            {item.bestSubject} ({item.maxScore})
                          </td>
                          <td className="border border-black p-1.5 text-[9px] font-semibold">
                            {item.completedCount}/{subjects.length} Tuntas
                          </td>
                          <td className="border border-black p-1.5 text-left text-[9px] leading-tight">
                            {r.catatanWaliKelas
                              ? r.catatanWaliKelas.slice(0, 80) + '...'
                              : item.numericRank <= 3
                              ? 'Prestasi istimewa, pertahankan capaian belajar.'
                              : 'Tingkatkan keaktifan dan ketuntasan belajar.'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* ========================================================================= */}
            {/* FORMAT 3: REKAP KEPUTUSAN KENAIKAN KELAS & KELULUSAN */}
            {/* ========================================================================= */}
            {printMode === 'kenaikan' && (
              <div className="overflow-x-auto space-y-4">
                <table className="w-full text-left text-[10px] border-collapse border border-black text-black">
                  <thead>
                    <tr className="bg-slate-100 border border-black text-center font-bold">
                      <th className="border border-black p-1.5 w-10">No</th>
                      <th className="border border-black p-1.5 w-24">NISN</th>
                      <th className="border border-black p-1.5 text-left min-w-[160px]">
                        Nama Peserta Didik
                      </th>
                      <th className="border border-black p-1.5 w-8">L/P</th>
                      <th className="border border-black p-1.5 w-16">Rata² Nilai</th>
                      <th className="border border-black p-1.5 min-w-[110px] font-extrabold bg-slate-200">
                        Keputusan Status
                      </th>
                      <th className="border border-black p-1.5 min-w-[100px]">Target Kelas</th>
                      <th className="border border-black p-1.5 text-left min-w-[240px]">
                        Narasi Keputusan Resmi Rapor
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedStudents.map((item, idx) => {
                      const s = item.student;
                      const r = item.report;
                      const status = r.statusKenaikan || 'Naik Kelas';

                      return (
                        <tr key={s.id} className="border border-black text-center">
                          <td className="border border-black p-1.5 font-bold">
                            {s.nomorAbsen || idx + 1}
                          </td>
                          <td className="border border-black p-1.5 font-mono">{s.nisn}</td>
                          <td className="border border-black p-1.5 text-left font-bold">{s.nama}</td>
                          <td className="border border-black p-1.5">{s.jenisKelamin}</td>
                          <td className="border border-black p-1.5 font-bold">{item.avgScore}</td>
                          <td className="border border-black p-1.5 font-black uppercase text-[10px]">
                            {status}
                          </td>
                          <td className="border border-black p-1.5 font-semibold text-[9.5px]">
                            {r.targetKelas || '-'}
                          </td>
                          <td className="border border-black p-1.5 text-left text-[9px] leading-tight">
                            {r.keteranganKenaikan ||
                              `Berdasarkan pencapaian seluruh tujuan pembelajaran pada Tahun Ajaran ${schoolInfo.academicYear}, ananda dinyatakan: NAIK KELAS.`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Ringkasan Jumlah */}
                <div className="border border-black p-3 bg-slate-50 text-[10px] grid grid-cols-3 text-center font-bold">
                  <div>Naik Kelas: {classStats.countNaik} Siswa</div>
                  <div>Tinggal Kelas: {classStats.countTinggal} Siswa</div>
                  <div>Lulus: {classStats.countLulus} Siswa</div>
                </div>
              </div>
            )}

            {/* 3. Tanda Tangan Resmi 2 Pihak */}
            {showSignature && (
              <div className="mt-8 grid grid-cols-2 text-[11px] text-center text-black page-break-inside-avoid">
                <div>
                  <p>Mengetahui,</p>
                  <p className="font-bold">Kepala Sekolah {schoolInfo.schoolName}</p>
                  <div className="h-16" />
                  <p className="font-bold uppercase underline">
                    {schoolInfo.headmasterName || 'NAMA KEPALA SEKOLAH'}
                  </p>
                  <p className="font-mono text-[10px]">
                    NIP. {schoolInfo.headmasterNip || '----------------------'}
                  </p>
                </div>

                <div>
                  <p>
                    {schoolInfo.city || 'Kuantan Singingi'}, {customReportDate}
                  </p>
                  <p className="font-bold">Guru Kelas / Wali Kelas {schoolInfo.className}</p>
                  <div className="h-16" />
                  <p className="font-bold uppercase underline">
                    {schoolInfo.homeroomTeacherName || 'NAMA GURU WALI KELAS'}
                  </p>
                  <p className="font-mono text-[10px]">
                    NIP. {schoolInfo.homeroomTeacherNip || '----------------------'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-3 no-print print:hidden shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Info className="h-4 w-4 text-blue-500" />
            <span>Format cetak dioptimalkan untuk kertas A4 / F4 (Folio) Landscape atau Portrait.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handlePrintDocument}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all"
            >
              <Printer className="h-4 w-4" />
              <span>Cetak Leger Resmi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
