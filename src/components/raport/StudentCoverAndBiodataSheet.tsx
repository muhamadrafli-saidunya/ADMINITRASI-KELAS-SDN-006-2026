import React from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { SchoolLogoRenderer } from '../common/SchoolLogoRenderer';
import {
  CoverBorderStyle,
  CoverBorderColor,
  CoverFrameDecorator,
  getBorderColorClasses
} from './CoverDecorations';

export type CoverPageSection = 'all' | 'cover' | 'school_identity' | 'biodata';
export type { CoverBorderStyle, CoverBorderColor };

export interface CoverPrintSettings {
  section: CoverPageSection;
  coverStyle: CoverBorderStyle;
  coverBorderColor?: CoverBorderColor;
  showPhoto: boolean;
  showSignature: boolean;
  paperSize: 'A4' | 'F4';
  admissionDate?: string;
}

interface StudentCoverAndBiodataSheetProps {
  student: Student;
  settings?: Partial<CoverPrintSettings>;
  className?: string;
  isPageBreakAfter?: boolean;
}

/**
 * Format date to standard Indonesian long format e.g. "14 Mei 2014"
 */
function formatIndonesianDate(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (monthIdx >= 0 && monthIdx < 12 && !isNaN(day)) {
        return `${day} ${months[monthIdx]} ${year}`;
      }
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export const StudentCoverAndBiodataSheet: React.FC<StudentCoverAndBiodataSheetProps> = ({
  student,
  settings,
  className = '',
  isPageBreakAfter = false
}) => {
  const { schoolInfo } = useApp();

  const section: CoverPageSection = settings?.section || 'all';
  const coverStyle: CoverBorderStyle = settings?.coverStyle || 'batik_nusantara';
  const coverBorderColor: CoverBorderColor = settings?.coverBorderColor || 'monochrome';
  const showPhoto = settings?.showPhoto !== false;
  const showSignature = settings?.showSignature !== false;
  const admissionDate = settings?.admissionDate || `15 Juli ${parseInt(schoolInfo.academicYear.split('/')[0] || '2024', 10)}`;

  const shouldRenderCover = section === 'all' || section === 'cover';
  const shouldRenderSchool = section === 'all' || section === 'school_identity';
  const shouldRenderBiodata = section === 'all' || section === 'biodata';

  const defaultCityDate = `${schoolInfo.city}, ${admissionDate}`;
  const colorTheme = getBorderColorClasses(coverBorderColor);

  // Frame styling classes for Cover Depan
  const getCoverFrameClass = () => {
    switch (coverStyle) {
      case 'batik_nusantara':
        return `border-[5px] ${colorTheme.border} p-8 sm:p-12 relative shadow-xs`;
      case 'certificate_royal':
        return `border-[6px] border-double ${colorTheme.border} p-8 sm:p-12 relative shadow-xs`;
      case 'geometric_art':
        return `border-4 ${colorTheme.border} outline outline-2 outline-offset-2 ${colorTheme.border} p-8 sm:p-12 relative shadow-xs`;
      case 'vintage_ornate':
        return `border-[5px] ${colorTheme.border} p-8 sm:p-12 relative shadow-xs`;
      case 'minimal_clean':
        return `border-2 ${colorTheme.border} p-8 sm:p-12 relative shadow-xs`;
      case 'classic':
      default:
        return `border-4 ${colorTheme.border} outline outline-2 outline-offset-4 ${colorTheme.border} p-8 sm:p-12 relative shadow-xs`;
    }
  };

  return (
    <div className={`student-cover-biodata-container text-black print:text-black w-full ${className}`}>
      
      {/* ========================================================================= */}
      {/* HALAMAN 1: COVER DEPAN RAPOR (SAMPUL LUAR)                                */}
      {/* ========================================================================= */}
      {shouldRenderCover && (
        <div
          className={`cover-page bg-white min-h-[960px] flex flex-col justify-between items-center text-center ${getCoverFrameClass()} ${
            (shouldRenderSchool || shouldRenderBiodata || isPageBreakAfter) ? 'print-page-break mb-12 print:mb-0' : ''
          }`}
        >
          {/* Ornamen Bingkai Vektor Eksklusif */}
          <CoverFrameDecorator style={coverStyle} colorTheme={coverBorderColor} />

          {/* Bagian Atas: Lambang & Judul */}
          <div className="w-full flex flex-col items-center pt-4 z-10">
            <div className="mb-4">
              <SchoolLogoRenderer
                preset={schoolInfo.logoLeftPreset || 'tutwuri'}
                customUrl={schoolInfo.logoLeft}
                width={90}
                alt="Logo Tut Wuri Handayani"
              />
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-widest uppercase" style={{ color: colorTheme.stroke }}>
              LAPORAN HASIL BELAJAR
            </h1>
            <h2 className="text-lg sm:text-xl font-bold tracking-wider uppercase mt-1" style={{ color: colorTheme.stroke }}>
              SEKOLAH DASAR (SD)
            </h2>
            <div
              className="mt-3 inline-block px-4 py-1 border rounded-full text-xs font-bold tracking-wider uppercase"
              style={{ borderColor: colorTheme.stroke, color: colorTheme.stroke }}
            >
              {schoolInfo.kurikulum || 'Kurikulum Merdeka Pembelajaran Mendalam (KMPM)'}
            </div>
          </div>

          {/* Bagian Tengah: Box Nama Siswa & Identitas */}
          <div className="w-full max-w-lg my-10 z-10">
            <div className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-slate-600 mb-2">
              Nama Peserta Didik:
            </div>
            <div
              className={`border-2 p-5 rounded-xl shadow-xs transition-all ${colorTheme.accentBg}`}
              style={{ borderColor: colorTheme.stroke }}
            >
              <p
                className="text-lg sm:text-2xl font-black tracking-wide uppercase"
                style={{ color: colorTheme.stroke }}
              >
                {student.nama}
              </p>
              <div
                className="mt-3 flex items-center justify-center gap-6 text-xs sm:text-sm font-bold border-t pt-2.5"
                style={{ borderColor: `${colorTheme.stroke}40`, color: colorTheme.stroke }}
              >
                <span>NIS: <strong className="font-mono">{student.nis || '-'}</strong></span>
                <span>•</span>
                <span>NISN: <strong className="font-mono">{student.nisn || '-'}</strong></span>
              </div>
            </div>

            <div className="mt-6 text-xs font-semibold uppercase tracking-wider text-slate-700">
              Kelas: <strong className="font-bold text-sm" style={{ color: colorTheme.stroke }}>{student.kelas || schoolInfo.className}</strong>
              {schoolInfo.phase ? ` (${schoolInfo.phase})` : ' (Fase B)'}
            </div>
          </div>

          {/* Bagian Bawah: Data Satuan Pendidikan & Kementerian */}
          <div
            className="w-full flex flex-col items-center pb-4 border-t pt-6 z-10"
            style={{ borderColor: `${colorTheme.stroke}30` }}
          >
            <h3
              className="text-base sm:text-lg font-black tracking-wider uppercase"
              style={{ color: colorTheme.stroke }}
            >
              {schoolInfo.schoolName}
            </h3>
            <p className="text-xs sm:text-sm font-bold text-slate-700 mt-1">
              NPSN: <span className="font-mono font-bold">{schoolInfo.npsn || '20100000'}</span>
            </p>
            <p className="text-[11px] sm:text-xs text-slate-600 max-w-md mt-1">
              {schoolInfo.address}{schoolInfo.village ? `, ${schoolInfo.village}` : ''}, {schoolInfo.subdistrict}, {schoolInfo.city}, {schoolInfo.province} {schoolInfo.postalCode ? `Kode Pos ${schoolInfo.postalCode}` : ''}
            </p>

            <div
              className="mt-6 pt-4 border-t w-3/4"
              style={{ borderColor: `${colorTheme.stroke}40` }}
            >
              <p
                className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest"
                style={{ color: colorTheme.stroke }}
              >
                KEMENTERIAN PENDIDIKAN DASAR DAN MENENGAH (KEMENDIKDASMEN)
              </p>
              <p
                className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest mt-0.5 opacity-90"
                style={{ color: colorTheme.stroke }}
              >
                REPUBLIK INDONESIA
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HALAMAN 2: IDENTITAS SATUAN PENDIDIKAN (PROFIL SEKOLAH)                   */}
      {/* ========================================================================= */}
      {shouldRenderSchool && (
        <div
          className={`school-identity-page bg-white min-h-[960px] p-6 sm:p-10 border border-slate-300 rounded-lg ${
            (shouldRenderBiodata || isPageBreakAfter) ? 'print-page-break mb-12 print:mb-0' : ''
          }`}
        >
          {/* Header Identitas Sekolah */}
          <div className="text-center pb-4 border-b-2 border-slate-900 mb-8">
            <h2 className="text-base sm:text-lg font-black tracking-wider text-slate-900 uppercase">
              RAPOR PESERTA DIDIK (KMPM)
            </h2>
            <h3 className="text-sm sm:text-base font-bold tracking-wide text-slate-800 uppercase mt-0.5">
              SEKOLAH DASAR (SD) • KURIKULUM MERDEKA PEMBELAJARAN MENDALAM
            </h3>
            <div className="mt-2 inline-block px-3 py-0.5 bg-slate-100 border border-slate-800 rounded text-xs font-bold uppercase text-slate-900">
              IDENTITAS SATUAN PENDIDIKAN
            </div>
          </div>

          {/* Tabel Detail Profil Sekolah */}
          <div className="max-w-2xl mx-auto space-y-4 my-8">
            <table className="w-full text-xs sm:text-sm border-collapse">
              <tbody className="divide-y divide-slate-200">
                <tr className="py-2">
                  <td className="py-2.5 w-8 font-bold text-slate-800 align-top">1.</td>
                  <td className="py-2.5 w-48 sm:w-56 font-bold text-slate-800 align-top">Nama Sekolah</td>
                  <td className="py-2.5 w-4 text-center font-bold text-slate-800 align-top">:</td>
                  <td className="py-2.5 font-black text-slate-900 uppercase align-top">{schoolInfo.schoolName}</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-slate-800 align-top">2.</td>
                  <td className="py-2.5 font-bold text-slate-800 align-top">NPSN</td>
                  <td className="py-2.5 text-center font-bold text-slate-800 align-top">:</td>
                  <td className="py-2.5 font-mono font-bold text-slate-900 align-top">{schoolInfo.npsn || '-'}</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-slate-800 align-top">3.</td>
                  <td className="py-2.5 font-bold text-slate-800 align-top">Nomor Statistik Sekolah (NSS)</td>
                  <td className="py-2.5 text-center font-bold text-slate-800 align-top">:</td>
                  <td className="py-2.5 font-mono text-slate-900 align-top">101016001001</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-slate-800 align-top">4.</td>
                  <td className="py-2.5 font-bold text-slate-800 align-top">Alamat Sekolah</td>
                  <td className="py-2.5 text-center font-bold text-slate-800 align-top">:</td>
                  <td className="py-2.5 text-slate-900 align-top">{schoolInfo.address}</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-slate-800 align-top">5.</td>
                  <td className="py-2.5 font-bold text-slate-800 align-top">Kelurahan / Desa</td>
                  <td className="py-2.5 text-center font-bold text-slate-800 align-top">:</td>
                  <td className="py-2.5 text-slate-900 align-top">{schoolInfo.village || schoolInfo.subdistrict || '-'}</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-slate-800 align-top">6.</td>
                  <td className="py-2.5 font-bold text-slate-800 align-top">Kecamatan</td>
                  <td className="py-2.5 text-center font-bold text-slate-800 align-top">:</td>
                  <td className="py-2.5 text-slate-900 align-top">{schoolInfo.subdistrict}</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-slate-800 align-top">7.</td>
                  <td className="py-2.5 font-bold text-slate-800 align-top">Kabupaten / Kota</td>
                  <td className="py-2.5 text-center font-bold text-slate-800 align-top">:</td>
                  <td className="py-2.5 text-slate-900 align-top">{schoolInfo.city}</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-slate-800 align-top">8.</td>
                  <td className="py-2.5 font-bold text-slate-800 align-top">Provinsi</td>
                  <td className="py-2.5 text-center font-bold text-slate-800 align-top">:</td>
                  <td className="py-2.5 text-slate-900 align-top">{schoolInfo.province}</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-slate-800 align-top">9.</td>
                  <td className="py-2.5 font-bold text-slate-800 align-top">Kode Pos</td>
                  <td className="py-2.5 text-center font-bold text-slate-800 align-top">:</td>
                  <td className="py-2.5 font-mono text-slate-900 align-top">{schoolInfo.postalCode || '-'}</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-slate-800 align-top">10.</td>
                  <td className="py-2.5 font-bold text-slate-800 align-top">Nomor Telepon / Fax</td>
                  <td className="py-2.5 text-center font-bold text-slate-800 align-top">:</td>
                  <td className="py-2.5 font-mono text-slate-900 align-top">{schoolInfo.phoneNumber || '-'}</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-slate-800 align-top">11.</td>
                  <td className="py-2.5 font-bold text-slate-800 align-top">Pos-el (E-mail)</td>
                  <td className="py-2.5 text-center font-bold text-slate-800 align-top">:</td>
                  <td className="py-2.5 text-slate-900 align-top">{schoolInfo.email || '-'}</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-slate-800 align-top">12.</td>
                  <td className="py-2.5 font-bold text-slate-800 align-top">Laman (Website)</td>
                  <td className="py-2.5 text-center font-bold text-slate-800 align-top">:</td>
                  <td className="py-2.5 text-blue-700 underline align-top">{schoolInfo.website || '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-12 text-center text-xs text-slate-500">
            Dokumen resmi identitas satuan pendidikan Kurikulum Merdeka Pembelajaran Mendalam (KMPM)
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HALAMAN 3: IDENTITAS PESERTA DIDIK (BIODATA SISWA LENGKAP)                */}
      {/* ========================================================================= */}
      {shouldRenderBiodata && (
        <div
          className={`student-biodata-page bg-white min-h-[960px] p-6 sm:p-10 border border-slate-300 rounded-lg ${
            isPageBreakAfter ? 'print-page-break' : ''
          }`}
        >
          {/* Header Lembar Biodata Siswa */}
          <div className="text-center pb-3 border-b-2 border-slate-900 mb-6">
            <h2 className="text-base sm:text-lg font-black tracking-wider text-slate-900 uppercase">
              KETERANGAN TENTANG DIRI PESERTA DIDIK
            </h2>
            <h3 className="text-xs sm:text-sm font-bold tracking-wide text-slate-700 uppercase mt-0.5">
              (BIODATA LENGKAP PESERTA DIDIK)
            </h3>
          </div>

          {/* Tabel Isi Biodata Siswa */}
          <div className="text-xs sm:text-[13px] leading-relaxed space-y-1 my-4">
            <table className="w-full border-collapse">
              <tbody>
                {/* 1. Nama Siswa */}
                <tr>
                  <td className="py-1 w-6 font-bold text-slate-900 align-top">1.</td>
                  <td className="py-1 w-48 sm:w-56 font-bold text-slate-900 align-top">Nama Peserta Didik (Lengkap)</td>
                  <td className="py-1 w-3 text-center font-bold text-slate-900 align-top">:</td>
                  <td className="py-1 font-black text-slate-900 uppercase align-top">{student.nama}</td>
                </tr>

                {/* 2. Nomor Induk Siswa */}
                <tr>
                  <td className="py-1 font-bold text-slate-900 align-top">2.</td>
                  <td className="py-1 font-bold text-slate-900 align-top">Nomor Induk Siswa (NIS)</td>
                  <td className="py-1 text-center font-bold text-slate-900 align-top">:</td>
                  <td className="py-1 font-mono font-bold text-slate-900 align-top">{student.nis || '-'}</td>
                </tr>

                {/* 3. NISN */}
                <tr>
                  <td className="py-1 font-bold text-slate-900 align-top">3.</td>
                  <td className="py-1 font-bold text-slate-900 align-top">Nomor Induk Siswa Nasional (NISN)</td>
                  <td className="py-1 text-center font-bold text-slate-900 align-top">:</td>
                  <td className="py-1 font-mono font-bold text-slate-900 align-top">{student.nisn || '-'}</td>
                </tr>

                {/* 4. TTL */}
                <tr>
                  <td className="py-1 font-bold text-slate-900 align-top">4.</td>
                  <td className="py-1 font-bold text-slate-900 align-top">Tempat, Tanggal Lahir</td>
                  <td className="py-1 text-center font-bold text-slate-900 align-top">:</td>
                  <td className="py-1 text-slate-900 align-top">
                    {student.tempatLahir ? `${student.tempatLahir}, ` : ''}{formatIndonesianDate(student.tanggalLahir)}
                  </td>
                </tr>

                {/* 5. Jenis Kelamin */}
                <tr>
                  <td className="py-1 font-bold text-slate-900 align-top">5.</td>
                  <td className="py-1 font-bold text-slate-900 align-top">Jenis Kelamin</td>
                  <td className="py-1 text-center font-bold text-slate-900 align-top">:</td>
                  <td className="py-1 text-slate-900 align-top">
                    {student.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                  </td>
                </tr>

                {/* 6. Agama */}
                <tr>
                  <td className="py-1 font-bold text-slate-900 align-top">6.</td>
                  <td className="py-1 font-bold text-slate-900 align-top">Agama dan Kepercayaan</td>
                  <td className="py-1 text-center font-bold text-slate-900 align-top">:</td>
                  <td className="py-1 text-slate-900 align-top">{student.agama || 'Islam'}</td>
                </tr>

                {/* 7. Status dalam Keluarga */}
                <tr>
                  <td className="py-1 font-bold text-slate-900 align-top">7.</td>
                  <td className="py-1 font-bold text-slate-900 align-top">Status dalam Keluarga</td>
                  <td className="py-1 text-center font-bold text-slate-900 align-top">:</td>
                  <td className="py-1 text-slate-900 align-top">Anak Kandung</td>
                </tr>

                {/* 8. Anak Ke- */}
                <tr>
                  <td className="py-1 font-bold text-slate-900 align-top">8.</td>
                  <td className="py-1 font-bold text-slate-900 align-top">Anak Ke-</td>
                  <td className="py-1 text-center font-bold text-slate-900 align-top">:</td>
                  <td className="py-1 text-slate-900 align-top">1 (Satu)</td>
                </tr>

                {/* 9. Alamat Siswa */}
                <tr>
                  <td className="py-1 font-bold text-slate-900 align-top">9.</td>
                  <td className="py-1 font-bold text-slate-900 align-top">Alamat Peserta Didik</td>
                  <td className="py-1 text-center font-bold text-slate-900 align-top">:</td>
                  <td className="py-1 text-slate-900 align-top">{student.alamat || '-'}</td>
                </tr>

                {/* 10. Nomor Telepon */}
                <tr>
                  <td className="py-1 font-bold text-slate-900 align-top">10.</td>
                  <td className="py-1 font-bold text-slate-900 align-top">Nomor Telepon Rumah / HP</td>
                  <td className="py-1 text-center font-bold text-slate-900 align-top">:</td>
                  <td className="py-1 font-mono text-slate-900 align-top">{student.noHpOrtu || '-'}</td>
                </tr>

                {/* 11. Sekolah Asal */}
                <tr>
                  <td className="py-1 font-bold text-slate-900 align-top">11.</td>
                  <td className="py-1 font-bold text-slate-900 align-top">Sekolah Asal (TK / PAUD)</td>
                  <td className="py-1 text-center font-bold text-slate-900 align-top">:</td>
                  <td className="py-1 text-slate-900 align-top">TK Pertiwi / PAUD Bintang</td>
                </tr>

                {/* 12. Diterima di Sekolah ini */}
                <tr>
                  <td className="py-1 font-bold text-slate-900 align-top">12.</td>
                  <td className="py-1 font-bold text-slate-900 align-top" colSpan={3}>
                    Diterima di sekolah ini:
                  </td>
                </tr>
                <tr>
                  <td className="py-0.5"></td>
                  <td className="py-0.5 pl-4 text-slate-800">a. Di kelas</td>
                  <td className="py-0.5 text-center font-bold text-slate-800">:</td>
                  <td className="py-0.5 text-slate-900 font-semibold">{student.kelas || schoolInfo.className}</td>
                </tr>
                <tr>
                  <td className="py-0.5"></td>
                  <td className="py-0.5 pl-4 text-slate-800">b. Pada tanggal</td>
                  <td className="py-0.5 text-center font-bold text-slate-800">:</td>
                  <td className="py-0.5 text-slate-900 font-semibold">{admissionDate}</td>
                </tr>

                {/* 13. Data Orang Tua */}
                <tr>
                  <td className="py-1 font-bold text-slate-900 align-top">13.</td>
                  <td className="py-1 font-bold text-slate-900 align-top" colSpan={3}>
                    Data Orang Tua:
                  </td>
                </tr>
                <tr>
                  <td className="py-0.5"></td>
                  <td className="py-0.5 pl-4 text-slate-800">a. Nama Ayah Kandung</td>
                  <td className="py-0.5 text-center font-bold text-slate-800">:</td>
                  <td className="py-0.5 font-bold text-slate-900 uppercase">{student.namaAyah || '-'}</td>
                </tr>
                <tr>
                  <td className="py-0.5"></td>
                  <td className="py-0.5 pl-4 text-slate-800">b. Nama Ibu Kandung</td>
                  <td className="py-0.5 text-center font-bold text-slate-800">:</td>
                  <td className="py-0.5 font-bold text-slate-900 uppercase">{student.namaIbu || '-'}</td>
                </tr>
                <tr>
                  <td className="py-0.5"></td>
                  <td className="py-0.5 pl-4 text-slate-800">c. Pekerjaan Orang Tua</td>
                  <td className="py-0.5 text-center font-bold text-slate-800">:</td>
                  <td className="py-0.5 text-slate-900">{student.pekerjaanOrtu || 'Karyawan Swasta / Wiraswasta'}</td>
                </tr>
                <tr>
                  <td className="py-0.5"></td>
                  <td className="py-0.5 pl-4 text-slate-800">d. Alamat Orang Tua</td>
                  <td className="py-0.5 text-center font-bold text-slate-800">:</td>
                  <td className="py-0.5 text-slate-900">{student.alamat || '-'}</td>
                </tr>
                <tr>
                  <td className="py-0.5"></td>
                  <td className="py-0.5 pl-4 text-slate-800">e. No. HP / WhatsApp Orang Tua</td>
                  <td className="py-0.5 text-center font-bold text-slate-800">:</td>
                  <td className="py-0.5 font-mono text-slate-900">{student.noHpOrtu || '-'}</td>
                </tr>

                {/* 14. Data Wali */}
                <tr>
                  <td className="py-1 font-bold text-slate-900 align-top">14.</td>
                  <td className="py-1 font-bold text-slate-900 align-top" colSpan={3}>
                    Data Wali Peserta Didik (Bila Ada):
                  </td>
                </tr>
                <tr>
                  <td className="py-0.5"></td>
                  <td className="py-0.5 pl-4 text-slate-800">a. Nama Wali</td>
                  <td className="py-0.5 text-center font-bold text-slate-800">:</td>
                  <td className="py-0.5 text-slate-900">-</td>
                </tr>
                <tr>
                  <td className="py-0.5"></td>
                  <td className="py-0.5 pl-4 text-slate-800">b. Pekerjaan Wali</td>
                  <td className="py-0.5 text-center font-bold text-slate-800">:</td>
                  <td className="py-0.5 text-slate-900">-</td>
                </tr>
                <tr>
                  <td className="py-0.5"></td>
                  <td className="py-0.5 pl-4 text-slate-800">c. Alamat Wali</td>
                  <td className="py-0.5 text-center font-bold text-slate-800">:</td>
                  <td className="py-0.5 text-slate-900">-</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bagian Bawah: Pas Foto 3x4 & Tanda Tangan Kepala Sekolah */}
          {showSignature && (
            <div className="mt-8 pt-4 flex items-end justify-between border-t border-slate-200">
              {/* Kotak Pas Foto 3 x 4 cm */}
              <div className="flex flex-col items-center">
                {showPhoto ? (
                  <div className="w-[110px] h-[145px] border-2 border-dashed border-slate-700 flex flex-col items-center justify-center p-1 bg-slate-50 relative overflow-hidden rounded">
                    {student.fotoUrl && !student.fotoUrl.includes('placeholder') ? (
                      <img
                        src={student.fotoUrl}
                        alt={student.nama}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="text-center p-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">PAS FOTO</span>
                        <span className="text-xs font-black text-slate-700 block">3 x 4 cm</span>
                        <span className="text-[9px] text-slate-400 mt-1 block">Cap Tindih</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-[110px] h-[145px] border-2 border-dashed border-slate-400 flex items-center justify-center text-center p-2 text-slate-400 text-[10px] font-bold">
                    PAS FOTO<br/>3 x 4 cm
                  </div>
                )}
              </div>

              {/* Titimangsa & Tanda Tangan Kepala Sekolah */}
              <div className="text-center text-xs sm:text-sm min-w-[240px]">
                <p className="text-slate-800">{defaultCityDate}</p>
                <p className="font-bold text-slate-900 mt-1">Kepala Sekolah,</p>
                
                {/* Ruang Tanda Tangan & Stempel */}
                <div className="h-20" />

                <p className="font-black text-slate-900 uppercase underline tracking-wide">
                  {schoolInfo.headmasterName}
                </p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">
                  NIP. <span className="font-mono">{schoolInfo.headmasterNip || '-'}</span>
                </p>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
