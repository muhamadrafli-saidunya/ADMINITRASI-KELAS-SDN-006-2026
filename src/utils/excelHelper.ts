import * as XLSX from 'xlsx';
import {
  Student,
  Teacher,
  Subject,
  TujuanPembelajaran,
  GradeRecord,
  AttendanceRecord,
  ScheduleItem,
  CashTransaction,
  InventoryItem,
  CounselingRecord
} from '../types';

// Helper to save workbook to user browser as .xlsx file
export function downloadWorkbook(workbook: XLSX.WorkBook, filename: string) {
  XLSX.writeFile(workbook, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
}

// 1. TEMPLATE DATA SISWA
export function generateStudentTemplate(existingSubjects: Subject[] = []): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  const headers = [
    'No Absen',
    'NISN',
    'NIS',
    'Nama Lengkap Siswa',
    'Jenis Kelamin (L/P)',
    'Tempat Lahir',
    'Tanggal Lahir (YYYY-MM-DD)',
    'Agama',
    'Alamat Lengkap',
    'Nama Ayah',
    'Nama Ibu',
    'Pekerjaan Orang Tua',
    'No HP / WhatsApp Orang Tua',
    'Status (Aktif/Mutasi/Lulus)',
    'Kelas',
    'Catatan Khusus'
  ];

  const sampleData = [
    [
      1,
      '0123456789',
      '202401',
      'Ahmad Fadilah',
      'L',
      'Jakarta',
      '2015-05-12',
      'Islam',
      'Jl. Merdeka No. 10 RT 02/05',
      'Bambang Sutrisno',
      'Siti Aminah',
      'Karyawan Swasta',
      '081234567890',
      'Aktif',
      'Kelas 4A',
      'Tertarik di bidang sains'
    ],
    [
      2,
      '0123456790',
      '202402',
      'Aisyah Putri Azzahra',
      'P',
      'Bandung',
      '2015-08-20',
      'Islam',
      'Jl. Mawar Indah Blok B3',
      'Rahmat Hidayat',
      'Nurul Fatimah',
      'Wiraswasta',
      '081398765432',
      'Aktif',
      'Kelas 4A',
      'Aktif dalam kegiatan pramuka'
    ],
    [
      3,
      '0123456791',
      '202403',
      'Budi Santoso',
      'L',
      'Surabaya',
      '2015-02-14',
      'Islam',
      'Jl. Kenanga No. 45',
      'Supriyadi',
      'Endang Lestari',
      'PNS / Guru',
      '081223344556',
      'Aktif',
      'Kelas 4A',
      'Memerlukan pendampingan membaca'
    ]
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);

  // Set column widths
  ws['!cols'] = [
    { wch: 10 }, // No Absen
    { wch: 15 }, // NISN
    { wch: 12 }, // NIS
    { wch: 28 }, // Nama
    { wch: 18 }, // JK
    { wch: 15 }, // Tempat Lahir
    { wch: 22 }, // Tgl Lahir
    { wch: 12 }, // Agama
    { wch: 35 }, // Alamat
    { wch: 22 }, // Nama Ayah
    { wch: 22 }, // Nama Ibu
    { wch: 20 }, // Pekerjaan
    { wch: 22 }, // No HP
    { wch: 16 }, // Status
    { wch: 12 }, // Kelas
    { wch: 30 }  // Catatan
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Data_Siswa');

  // Sheet Petunjuk
  const petunjukHeaders = ['Kolom', 'Keterangan', 'Contoh Pengisian / Aturan'];
  const petunjukData = [
    ['No Absen', 'Nomor urut absen siswa (angka)', '1, 2, 3, dst.'],
    ['NISN', 'Nomor Induk Siswa Nasional (10 digit angka, Wajib)', '0123456789'],
    ['NIS', 'Nomor Induk Sekolah', '202401'],
    ['Nama Lengkap Siswa', 'Nama lengkap siswa sesuai akta (Wajib)', 'Ahmad Fadilah'],
    ['Jenis Kelamin (L/P)', 'L = Laki-laki, P = Perempuan (Wajib)', 'L atau P'],
    ['Tanggal Lahir', 'Format tahun-bulan-tanggal', '2015-05-12'],
    ['Agama', 'Pilihan: Islam, Kristen, Katolik, Hindu, Buddha, Konghucu', 'Islam'],
    ['Status', 'Pilihan: Aktif, Mutasi, Lulus, Non-aktif', 'Aktif']
  ];
  const wsPetunjuk = XLSX.utils.aoa_to_sheet([petunjukHeaders, ...petunjukData]);
  wsPetunjuk['!cols'] = [{ wch: 25 }, { wch: 45 }, { wch: 35 }];
  XLSX.utils.book_append_sheet(wb, wsPetunjuk, 'Panduan_Pengisian');

  return wb;
}

// 2. TEMPLATE DATA GURU & TENDIK
export function generateTeacherTemplate(): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  const headers = [
    'Nama Lengkap & Gelar',
    'NIP',
    'NUPTK',
    'Jenis Kelamin (L/P)',
    'Jabatan',
    'Jenis Pendidik',
    'Status Kepegawaian',
    'Golongan / Pangkat',
    'Pendidikan Terakhir',
    'Jurusan / Prodi',
    'No HP / WhatsApp',
    'Email',
    'Alamat Lengkap',
    'Status (Aktif/Cuti/Pensiun)',
    'Mata Pelajaran Diampu'
  ];

  const sampleData = [
    [
      'Drs. H. Mulyono, M.Pd.',
      '196805121992031005',
      '8452746648200032',
      'L',
      'Kepala Sekolah',
      'Kepala Sekolah',
      'PNS',
      'IV/b - Pembina Tk. I',
      'S2 Manajemen Pendidikan',
      'Administrasi Pendidikan',
      '081234567801',
      'mulyono.kepsek@sekolah.sch.id',
      'Jl. Melati No. 12, Sleman',
      'Aktif',
      'Manajerial Sekolah'
    ],
    [
      'Nur Hidayati, S.Pd.SD.',
      '198503142010012028',
      '3456789012345678',
      'P',
      'Wali Kelas 4A',
      'Guru Kelas',
      'PNS',
      'III/c - Penata',
      'S1 PGSD',
      'Pendidikan Guru Sekolah Dasar',
      '081398765402',
      'nur.hidayati@sekolah.sch.id',
      'Jl. Mawar No. 4, Yogyakarta',
      'Aktif',
      'Tematik, Matematika, IPAS, Bahasa Indonesia'
    ],
    [
      'Ustadz Rahmat Fauzi, S.Pd.I.',
      '199008202022211003',
      '1234567890123456',
      'L',
      'Guru PAI & BP',
      'Guru Mapel',
      'PPPK',
      'IX (PPPK)',
      'S1 PAI',
      'Pendidikan Agama Islam',
      '081223344503',
      'rahmat.fauzi@sekolah.sch.id',
      'Jl. Kenanga No. 8, Bantul',
      'Aktif',
      'Pendidikan Agama & Budi Pekerti'
    ]
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
  ws['!cols'] = [
    { wch: 30 }, // Nama
    { wch: 22 }, // NIP
    { wch: 20 }, // NUPTK
    { wch: 18 }, // JK
    { wch: 22 }, // Jabatan
    { wch: 20 }, // Jenis Pendidik
    { wch: 20 }, // Status Kepegawaian
    { wch: 22 }, // Golongan
    { wch: 25 }, // Pendidikan
    { wch: 30 }, // Jurusan
    { wch: 20 }, // No HP
    { wch: 30 }, // Email
    { wch: 35 }, // Alamat
    { wch: 16 }, // Status
    { wch: 40 }  // Mapel
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Data_Guru');
  return wb;
}

// 3. TEMPLATE DAFTAR NILAI SISWA
export function generateGradeTemplate(students: Student[], subjects: Subject[]): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  // We can create a sheet per subject or a combined master sheet
  const headers = [
    'No Absen',
    'NISN',
    'Nama Siswa',
    'Kode Mapel',
    'Nama Mata Pelajaran',
    'Formatif TP 1',
    'Formatif TP 2',
    'Formatif TP 3',
    'Formatif TP 4',
    'Sumatif Tengah Sem (STS)',
    'Sumatif Akhir Sem (SAS)'
  ];

  const sampleRows: any[] = [];
  
  const targetStudents = students.length > 0 ? students : [
    { id: '1', nomorAbsen: 1, nisn: '0123456789', nama: 'Ahmad Fadilah' } as Student,
    { id: '2', nomorAbsen: 2, nisn: '0123456790', nama: 'Aisyah Putri Azzahra' } as Student,
    { id: '3', nomorAbsen: 3, nisn: '0123456791', nama: 'Budi Santoso' } as Student
  ];

  const primarySubject = subjects.find(s => s.kode === 'PAI') || subjects[0] || {
    id: 's1',
    kode: 'PAI',
    nama: 'Pendidikan Agama & Budi Pekerti'
  };

  targetStudents.forEach((s) => {
    sampleRows.push([
      s.nomorAbsen || 1,
      s.nisn,
      s.nama,
      primarySubject.kode,
      primarySubject.nama,
      85,
      88,
      82,
      90,
      86,
      88
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
  ws['!cols'] = [
    { wch: 10 }, // No Absen
    { wch: 15 }, // NISN
    { wch: 28 }, // Nama
    { wch: 14 }, // Kode Mapel
    { wch: 32 }, // Nama Mapel
    { wch: 15 }, // TP 1
    { wch: 15 }, // TP 2
    { wch: 15 }, // TP 3
    { wch: 15 }, // TP 4
    { wch: 24 }, // STS
    { wch: 24 }  // SAS
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Nilai_Siswa');

  // Sheet Daftar Kode Mapel
  const mapelHeaders = ['Kode Mapel', 'Nama Mata Pelajaran', 'KKTP (Target Minimal)', 'Guru Pengampu'];
  const mapelRows = subjects.map(s => [s.kode, s.nama, s.kktp, s.guruPengampu]);
  const wsMapel = XLSX.utils.aoa_to_sheet([mapelHeaders, ...mapelRows]);
  wsMapel['!cols'] = [{ wch: 15 }, { wch: 35 }, { wch: 22 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(wb, wsMapel, 'Daftar_Mata_Pelajaran');

  return wb;
}

// 4. TEMPLATE PRESENSI HARIAN
export function generateAttendanceTemplate(students: Student[], dateString: string): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  const headers = [
    'No Absen',
    'NISN',
    'Nama Siswa',
    'Tanggal (YYYY-MM-DD)',
    'Status Kehadiran (Hadir/Sakit/Izin/Alpa)',
    'Keterangan / Alasan'
  ];

  const targetStudents = students.length > 0 ? students : [
    { id: '1', nomorAbsen: 1, nisn: '0123456789', nama: 'Ahmad Fadilah' } as Student,
    { id: '2', nomorAbsen: 2, nisn: '0123456790', nama: 'Aisyah Putri Azzahra' } as Student,
    { id: '3', nomorAbsen: 3, nisn: '0123456791', nama: 'Budi Santoso' } as Student
  ];

  const sampleRows = targetStudents.map(s => [
    s.nomorAbsen || 1,
    s.nisn,
    s.nama,
    dateString || new Date().toISOString().split('T')[0],
    'Hadir',
    '-'
  ]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
  ws['!cols'] = [
    { wch: 10 },
    { wch: 15 },
    { wch: 28 },
    { wch: 22 },
    { wch: 35 },
    { wch: 30 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Presensi_Harian');
  return wb;
}

// 5. TEMPLATE BUKU KAS KELAS
export function generateCashTemplate(): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  const headers = [
    'Tanggal (YYYY-MM-DD)',
    'Jenis (Pemasukan/Pengeluaran)',
    'Kategori Transaksi',
    'Keterangan Rinci',
    'Nominal / Jumlah (Rp)',
    'Penanggung Jawab / Bendahara',
    'Nama Siswa (Jika Iuran Kas)'
  ];

  const sampleRows = [
    ['2026-08-01', 'Pemasukan', 'Iuran Kas Mingguan', 'Iuran Kas Kelas Minggu ke-1 (30 Siswa)', 150000, 'Bendahara Kelas', 'Semua Siswa'],
    ['2026-08-03', 'Pengeluaran', 'ATK / Spidol', 'Pembelian 3 Pcs Spidol Whiteboard & Penghapus', 35000, 'Wali Kelas / Seksi Peralatan', ''],
    ['2026-08-08', 'Pemasukan', 'Iuran Kas Mingguan', 'Iuran Kas Kelas Minggu ke-2', 150000, 'Bendahara Kelas', 'Semua Siswa'],
    ['2026-08-10', 'Pengeluaran', 'Fotocopy Tugas', 'Penggandaan Lembar Kerja Siswa (LKPD) IPAS', 45000, 'Wali Kelas', '']
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
  ws['!cols'] = [
    { wch: 20 },
    { wch: 26 },
    { wch: 25 },
    { wch: 45 },
    { wch: 22 },
    { wch: 30 },
    { wch: 25 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Buku_Kas_Kelas');
  return wb;
}

// 6. TEMPLATE INVENTARIS KELAS (KIR)
export function generateInventoryTemplate(): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  const headers = [
    'Kode Barang',
    'Nama Barang / Aset',
    'Spesifikasi / Merk / Bahan',
    'Kategori',
    'Jumlah',
    'Satuan (Unit/Pcs/Set)',
    'Kondisi (Baik/Rusak Ringan/Rusak Berat)',
    'Tahun Pengadaan',
    'Sumber Dana (BOS/Paguyuban/Bantuan)',
    'Keterangan Lokasi'
  ];

  const sampleRows = [
    ['MEJ-01', 'Meja Siswa Kayu Jati', 'Kayu Jati Kombinasi Besi Kokoh', 'Perabot', 15, 'Unit', 'Baik', 2024, 'BOS Reguler', 'Ruang Kelas 4A'],
    ['KUR-01', 'Kursi Siswa', 'Besi + Dudukan Kayu Ergonomis', 'Perabot', 30, 'Unit', 'Baik', 2024, 'BOS Reguler', 'Ruang Kelas 4A'],
    ['WBD-01', 'Papan Tulis Whiteboard', 'Ukuran 120 x 240 cm Magnetik', 'Perabot', 1, 'Unit', 'Baik', 2023, 'BOS Reguler', 'Dinding Depan Kelas'],
    ['KPS-01', 'Kipas Angin Dinding', 'Maspion 16 Inch Putar 3 Speed', 'Elektronik', 2, 'Unit', 'Baik', 2023, 'Kas Paguyuban', 'Dinding Kiri & Kanan'],
    ['RAK-01', 'Rak Pojok Baca', 'Bahan Particle Board 3 Tingkat', 'Pojok Baca', 1, 'Unit', 'Baik', 2024, 'Donasi Paguyuban', 'Sudut Belakang Kanan']
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
  ws['!cols'] = [
    { wch: 14 },
    { wch: 28 },
    { wch: 32 },
    { wch: 18 },
    { wch: 10 },
    { wch: 18 },
    { wch: 32 },
    { wch: 16 },
    { wch: 25 },
    { wch: 25 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Inventaris_Kelas');
  return wb;
}

// 7. TEMPLATE JADWAL PELAJARAN
export function generateScheduleTemplate(subjects: Subject[]): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  const headers = [
    'Hari (Senin/Selasa/Rabu/Kamis/Jumat/Sabtu)',
    'Jam Ke (1-8)',
    'Waktu Mulai - Selesai (Contoh: 07.00 - 07.35)',
    'Kode Mapel',
    'Nama Mata Pelajaran',
    'Guru Pengampu',
    'Ruang',
    'Topik / Catatan Materi'
  ];

  const sampleRows = [
    ['Senin', 1, '07.00 - 07.40', 'UPC', 'Upacara Bendera', 'Wali Kelas 4A', 'Lapangan Utama', 'Upacara Rutin'],
    ['Senin', 2, '07.40 - 08.15', 'PAI', 'Pendidikan Agama & Budi Pekerti', 'Ustadz Rahmat Fauzi, S.Pd.I.', 'Ruang Kelas 4A', 'Kisah Nabi Muhammad SAW'],
    ['Senin', 3, '08.15 - 08.50', 'PAI', 'Pendidikan Agama & Budi Pekerti', 'Ustadz Rahmat Fauzi, S.Pd.I.', 'Ruang Kelas 4A', 'Kisah Nabi Muhammad SAW'],
    ['Senin', 4, '09.05 - 09.40', 'MTK', 'Matematika', 'Nur Hidayati, S.Pd.SD.', 'Ruang Kelas 4A', 'Pecahan Senilai'],
    ['Selasa', 1, '07.00 - 07.35', 'BIN', 'Bahasa Indonesia', 'Nur Hidayati, S.Pd.SD.', 'Ruang Kelas 4A', 'Membaca Teks Cerita']
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
  ws['!cols'] = [
    { wch: 20 },
    { wch: 14 },
    { wch: 30 },
    { wch: 14 },
    { wch: 32 },
    { wch: 28 },
    { wch: 18 },
    { wch: 30 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Jadwal_Pelajaran');
  return wb;
}

// 8. TEMPLATE TUJUAN PEMBELAJARAN (TP)
export function generateTPTemplate(subjects: Subject[]): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  const headers = [
    'Kode Mapel',
    'Nama Mata Pelajaran',
    'Kode TP (Contoh: TP 1, TP 2)',
    'Lingkup Materi / Bab',
    'Deskripsi Rumusan Tujuan Pembelajaran',
    'Semester (1 (Ganjil) / 2 (Genap) / Semua)',
    'KKTP Khusus',
    'Ringkasan Rapor Saat Tercapai (Tuntas)',
    'Ringkasan Rapor Saat Perlu Bimbingan'
  ];

  const sampleRows = [
    [
      'PAI',
      'Pendidikan Agama & Budi Pekerti',
      'TP 1',
      'Bab 1: Meneladani Asmaulhusna',
      'Peserta didik dapat memahami dan meneladani makna Asmaulhusna Al-Malik, Al-Aziz, Al-Quddus dalam kehidupan sehari-hari.',
      '1 (Ganjil)',
      75,
      'Menunjukkan penguasaan sangat baik dalam memahami makna Asmaulhusna.',
      'Perlu bimbingan dalam menghafal dan menerapkan perilaku Asmaulhusna.'
    ],
    [
      'BIN',
      'Bahasa Indonesia',
      'TP 1',
      'Bab 1: Sudah Besar',
      'Peserta didik mampu mengidentifikasi ide pokok dan ide pendukung pada teks narasi yang dibaca.',
      '1 (Ganjil)',
      75,
      'Sangat terampil dalam menemukan ide pokok teks narasi secara mandiri.',
      'Perlu bimbingan dalam membedakan ide pokok dan ide pendukung.'
    ]
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
  ws['!cols'] = [
    { wch: 14 },
    { wch: 32 },
    { wch: 15 },
    { wch: 28 },
    { wch: 45 },
    { wch: 22 },
    { wch: 14 },
    { wch: 40 },
    { wch: 40 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Tujuan_Pembelajaran');
  return wb;
}

// ==========================================
// EXPORT CURRENT DATA TO REAL EXCEL WORKBOOK
// ==========================================

export function exportAllDataToExcel(
  students: Student[],
  teachers: Teacher[],
  subjects: Subject[],
  grades: GradeRecord[],
  cashTransactions: CashTransaction[],
  inventory: InventoryItem[],
  schedules: ScheduleItem[],
  tps: TujuanPembelajaran[]
): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  // 1. Students Sheet
  const studentRows = students.map((s, idx) => ({
    'No': idx + 1,
    'No Absen': s.nomorAbsen,
    'NISN': s.nisn,
    'NIS': s.nis,
    'Nama Lengkap': s.nama,
    'L/P': s.jenisKelamin,
    'Tempat Lahir': s.tempatLahir,
    'Tanggal Lahir': s.tanggalLahir,
    'Agama': s.agama,
    'Alamat': s.alamat,
    'Nama Ayah': s.namaAyah,
    'Nama Ibu': s.namaIbu,
    'No HP Ortu': s.noHpOrtu,
    'Status': s.status,
    'Kelas': s.kelas
  }));
  const wsStudents = XLSX.utils.json_to_sheet(studentRows);
  XLSX.utils.book_append_sheet(wb, wsStudents, 'Data_Siswa');

  // 2. Teachers Sheet
  const teacherRows = teachers.map((t, idx) => ({
    'No': idx + 1,
    'Nama Lengkap': t.nama,
    'NIP': t.nip,
    'NUPTK': t.nuptk || '-',
    'L/P': t.jenisKelamin,
    'Jabatan': t.jabatan,
    'Jenis Guru': t.jenisGuru,
    'Status Kepegawaian': t.statusKepegawaian,
    'Golongan': t.golonganPangkat || '-',
    'Pendidikan': t.pendidikanTerakhir,
    'No HP': t.noHp,
    'Email': t.email,
    'Status': t.statusAktif
  }));
  const wsTeachers = XLSX.utils.json_to_sheet(teacherRows);
  XLSX.utils.book_append_sheet(wb, wsTeachers, 'Data_Guru');

  // 3. Subjects Sheet
  const subjectRows = subjects.map((sub, idx) => ({
    'No': idx + 1,
    'Kode': sub.kode,
    'Nama Mapel': sub.nama,
    'Kelompok': sub.kelompok,
    'KKTP': sub.kktp,
    'Guru Pengampu': sub.guruPengampu,
    'Jam/Minggu': sub.jumlahJamPerMinggu || 4
  }));
  const wsSubjects = XLSX.utils.json_to_sheet(subjectRows);
  XLSX.utils.book_append_sheet(wb, wsSubjects, 'Mata_Pelajaran');

  // 4. Grades Sheet
  const gradeRows = grades.map((g, idx) => {
    const student = students.find(s => s.id === g.siswaId);
    const subject = subjects.find(sub => sub.id === g.mapelId);
    return {
      'No': idx + 1,
      'Nama Siswa': student?.nama || g.siswaId,
      'NISN': student?.nisn || '',
      'Mata Pelajaran': subject?.nama || g.mapelId,
      'Jenis Penilaian': g.jenis,
      'Nilai': g.nilai,
      'Capaian Kompetensi': g.capaianKompetensi || ''
    };
  });
  const wsGrades = XLSX.utils.json_to_sheet(gradeRows);
  XLSX.utils.book_append_sheet(wb, wsGrades, 'Rekap_Nilai');

  // 5. Cash Sheet
  const cashRows = cashTransactions.map((c, idx) => ({
    'No': idx + 1,
    'Tanggal': c.tanggal,
    'Jenis': c.jenis,
    'Kategori': c.kategori,
    'Keterangan': c.keterangan,
    'Jumlah (Rp)': c.jumlah,
    'Penanggung Jawab': c.penanggungJawab,
    'Nama Siswa': c.namaSiswa || '-'
  }));
  const wsCash = XLSX.utils.json_to_sheet(cashRows);
  XLSX.utils.book_append_sheet(wb, wsCash, 'Buku_Kas');

  // 6. Inventory Sheet
  const invRows = inventory.map((item, idx) => ({
    'No': idx + 1,
    'Kode': item.kodeBarang,
    'Nama Barang': item.namaBarang,
    'Spesifikasi': item.spesifikasi || '-',
    'Jumlah': item.jumlah,
    'Satuan': item.satuan || 'Unit',
    'Kondisi': item.kondisi,
    'Sumber Dana': item.sumberDana || '-',
    'Tahun': item.tahunPengadaan || '-'
  }));
  const wsInv = XLSX.utils.json_to_sheet(invRows);
  XLSX.utils.book_append_sheet(wb, wsInv, 'Inventaris_KIR');

  return wb;
}

// ==========================================
// PARSING UPLOADED EXCEL FILE
// ==========================================

export interface ParsedExcelResult<T> {
  data: T[];
  errors: string[];
  totalRows: number;
  validRows: number;
}

export async function parseExcelFile(file: File): Promise<XLSX.WorkBook> {
  const arrayBuffer = await file.arrayBuffer();
  return XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
}

// Format Excel Date to clean YYYY-MM-DD
export function formatExcelDate(val: any): string {
  if (val === undefined || val === null || val === '') return '2015-01-01';

  // 1. If JavaScript Date object
  if (val instanceof Date && !isNaN(val.getTime())) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const d = String(val.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // 2. If Excel serial number (e.g. 42136 = 12/05/2015)
  if (typeof val === 'number' && val > 1000) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const date = new Date(excelEpoch.getTime() + val * 86400000);
    if (!isNaN(date.getTime())) {
      const y = date.getUTCFullYear();
      const m = String(date.getUTCMonth() + 1).padStart(2, '0');
      const d = String(date.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }

  const str = String(val).trim();
  if (!str) return '2015-01-01';

  // 3. YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  // 4. DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const dmyMatch = str.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
  if (dmyMatch) {
    const d = String(dmyMatch[1]).padStart(2, '0');
    const m = String(dmyMatch[2]).padStart(2, '0');
    const y = dmyMatch[3];
    return `${y}-${m}-${d}`;
  }

  // 5. YYYY/MM/DD
  const ymdMatch = str.match(/^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})$/);
  if (ymdMatch) {
    const y = ymdMatch[1];
    const m = String(ymdMatch[2]).padStart(2, '0');
    const d = String(ymdMatch[3]).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // 6. Indonesian text format: "12 Mei 2015", "5 Agustus 2014"
  const indoMonths: Record<string, string> = {
    januari: '01', jan: '01',
    februari: '02', feb: '02', pebruari: '02',
    maret: '03', mar: '03',
    april: '04', apr: '04',
    mei: '05', may: '05',
    juni: '06', jun: '06',
    juli: '07', jul: '07',
    agustus: '08', ags: '08', agu: '08', agt: '08',
    september: '09', sep: '09',
    oktober: '10', okt: '10',
    november: '11', nov: '11', nopember: '11',
    desember: '12', des: '12'
  };

  const textMatch = str.match(/(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})/);
  if (textMatch) {
    const d = String(textMatch[1]).padStart(2, '0');
    const monthName = textMatch[2].toLowerCase();
    const m = indoMonths[monthName] || '01';
    const y = textMatch[3];
    return `${y}-${m}-${d}`;
  }

  return str;
}

// Find appropriate worksheet for student data
export function findStudentWorksheet(wb: XLSX.WorkBook): { sheetName: string; ws: XLSX.WorkSheet } | null {
  if (!wb.SheetNames || wb.SheetNames.length === 0) return null;

  // 1. By sheet name priority
  const priorityKeywords = ['data_siswa', 'datasiswa', 'siswa', 'induk', 'buku_induk', 'bukuinduk', 'peserta', 'murid', 'student'];
  for (const name of wb.SheetNames) {
    const clean = name.toLowerCase().replace(/[\s_-]/g, '');
    if (priorityKeywords.some(kw => clean.includes(kw.replace(/[\s_-]/g, '')))) {
      const ws = wb.Sheets[name];
      if (ws && ws['!ref']) return { sheetName: name, ws };
    }
  }

  // 2. By content scan (find sheet with student column keywords)
  for (const name of wb.SheetNames) {
    if (name.toLowerCase().includes('panduan') || name.toLowerCase().includes('petunjuk')) continue;
    const ws = wb.Sheets[name];
    if (!ws || !ws['!ref']) continue;
    const aoa: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    for (let r = 0; r < Math.min(8, aoa.length); r++) {
      const row = aoa[r];
      if (!Array.isArray(row)) continue;
      const rowStr = row.map(c => String(c).toLowerCase()).join(' ');
      if (
        (rowStr.includes('nama') || rowStr.includes('peserta')) &&
        (rowStr.includes('nisn') || rowStr.includes('nis') || rowStr.includes('absen') || rowStr.includes('kelamin'))
      ) {
        return { sheetName: name, ws };
      }
    }
  }

  // 3. Fallback to first non-empty sheet
  for (const name of wb.SheetNames) {
    const ws = wb.Sheets[name];
    if (ws && ws['!ref']) return { sheetName: name, ws };
  }

  return { sheetName: wb.SheetNames[0], ws: wb.Sheets[wb.SheetNames[0]] };
}

// Parse Students from Sheet with high fault-tolerance & header auto-detection
export function parseStudentsFromSheet(ws: XLSX.WorkSheet, defaultClass: string = 'Kelas 4A'): ParsedExcelResult<Partial<Student>> {
  const aoa: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  const data: Partial<Student>[] = [];
  const errors: string[] = [];

  if (!aoa || aoa.length === 0) {
    return { data, errors: ['Lembar Excel kosong atau tidak memiliki baris data.'], totalRows: 0, validRows: 0 };
  }

  // Find header row (scan first 10 rows for keywords like 'nama', 'nisn', 'nis', 'peserta didik')
  let headerRowIndex = -1;
  for (let r = 0; r < Math.min(10, aoa.length); r++) {
    const row = aoa[r];
    if (!Array.isArray(row)) continue;
    const cells = row.map(c => String(c || '').toLowerCase().trim());
    const hasNama = cells.some(c => c.includes('nama') || c.includes('peserta') || c.includes('murid') || c.includes('student'));
    const hasIdOrAbsen = cells.some(c => c.includes('nisn') || c.includes('nis') || c.includes('absen') || c.includes('urut') || c.includes('jk') || c.includes('kelamin'));
    if (hasNama && hasIdOrAbsen) {
      headerRowIndex = r;
      break;
    }
    // Secondary check: just having both 'nama' and other common headers
    if (hasNama) {
      headerRowIndex = r;
      break;
    }
  }

  // Fallback to row 0 if no clear header was detected
  if (headerRowIndex === -1) {
    headerRowIndex = 0;
  }

  const rawHeaders: string[] = (aoa[headerRowIndex] || []).map(h => String(h || '').trim());
  const headerMap = new Map<string, number>();

  rawHeaders.forEach((h, colIdx) => {
    if (h) {
      headerMap.set(h.toLowerCase(), colIdx);
    }
  });

  // Helper to find column index matching a regex or list of terms
  const findCol = (pattern: RegExp, excludePattern?: RegExp): number => {
    for (const [key, colIdx] of headerMap.entries()) {
      if (excludePattern && excludePattern.test(key)) continue;
      if (pattern.test(key)) return colIdx;
    }
    return -1;
  };

  const colNama = findCol(/(nama.*(siswa|peserta|murid|lengkap)|^(nama|name|student))$/i, /(ayah|ibu|ortu|wali|sekolah)/i);
  const colNisn = findCol(/nisn/i);
  const colNis = findCol(/^(nis|nipd|no\.?\s*induk(\s*siswa)?|nomor\s*induk(\s*siswa)?)$/i) !== -1
    ? findCol(/^(nis|nipd|no\.?\s*induk(\s*siswa)?|nomor\s*induk(\s*siswa)?)$/i)
    : findCol(/(nis|nomor induk)$/i, /nisn/i);
  const colAbsen = findCol(/^(no\.?\s*absen|nomor\s*absen|no\.?\s*urut|nomor\s*urut|absen|no|no\.)$/i);
  const colJk = findCol(/jenis\s*kelamin|jk|l\/p|gender|sex/i);
  const colTempatLahir = findCol(/tempat\s*lahir|kota\s*lahir/i, /tanggal|tgl/i);
  const colTanggalLahir = findCol(/tanggal\s*lahir|tgl\s*lahir|tgl\.?\s*lahir|birth/i, /tempat/i);
  const colTtl = findCol(/tempat.*t(an)?g(ga)?l.*lahir|ttl/i);
  const colAgama = findCol(/agama/i);
  const colAlamat = findCol(/alamat/i, /ortu|wali/i);
  const colAyah = findCol(/ayah|bapak/i);
  const colIbu = findCol(/ibu/i);
  const colPekerjaan = findCol(/pekerjaan/i);
  const colHp = findCol(/hp|wa|whatsapp|telepon|ponsel|kontak/i);
  const colStatus = findCol(/status/i);
  const colKelas = findCol(/kelas|rombel/i);
  const colCatatan = findCol(/catatan|keterangan/i);

  const dataRows = aoa.slice(headerRowIndex + 1);

  dataRows.forEach((row, rowOffset) => {
    const actualRowNum = headerRowIndex + rowOffset + 2;
    if (!Array.isArray(row) || row.length === 0) return;

    // Check if entire row is empty
    const hasAnyValue = row.some(cell => String(cell || '').trim() !== '');
    if (!hasAnyValue) return;

    // Retrieve fields
    const getVal = (colIdx: number): any => (colIdx >= 0 && colIdx < row.length ? row[colIdx] : '');

    let rawNama = colNama >= 0 ? getVal(colNama) : '';
    // If colNama not found or blank, try column 1, 2, or 3 if they have names
    if (!rawNama && row.length > 3) {
      // heuristic: first non-numeric string with length > 2
      const candidate = row.find((c, i) => i > 0 && typeof c === 'string' && c.trim().length > 2 && isNaN(Number(c)));
      if (candidate) rawNama = candidate;
    }

    const nama = String(rawNama || '').trim();
    if (!nama || nama.length < 2) {
      errors.push(`Baris ${actualRowNum}: Nama siswa kosong atau tidak valid, baris dilewati.`);
      return;
    }

    // NISN & NIS
    let nisn = String(colNisn >= 0 ? getVal(colNisn) : '').replace(/[^0-9]/g, '').trim();
    let nis = String(colNis >= 0 ? getVal(colNis) : '').replace(/[^0-9a-zA-Z]/g, '').trim();

    // Gender
    const rawJk = String(colJk >= 0 ? getVal(colJk) : 'L').toUpperCase().trim();
    let jenisKelamin: 'L' | 'P' = 'L';
    if (rawJk.startsWith('P') && !rawJk.startsWith('PRIA')) {
      jenisKelamin = 'P';
    } else if (rawJk.startsWith('W') || rawJk.startsWith('F')) {
      jenisKelamin = 'P';
    } else {
      jenisKelamin = 'L';
    }

    // Nomor Absen
    const rawAbsen = colAbsen >= 0 ? getVal(colAbsen) : '';
    const parsedAbsen = Number(rawAbsen);
    const nomorAbsen = !isNaN(parsedAbsen) && parsedAbsen > 0 ? parsedAbsen : data.length + 1;

    // TTL handling
    let tempatLahir = String(colTempatLahir >= 0 ? getVal(colTempatLahir) : '').trim();
    let rawTglLahir = colTanggalLahir >= 0 ? getVal(colTanggalLahir) : '';

    if (colTtl >= 0 && (!tempatLahir || !rawTglLahir)) {
      const ttlVal = String(getVal(colTtl) || '').trim();
      if (ttlVal) {
        const parts = ttlVal.split(/[,/]/);
        if (parts.length >= 2) {
          if (!tempatLahir) tempatLahir = parts[0].trim();
          if (!rawTglLahir) rawTglLahir = parts.slice(1).join('-').trim();
        } else if (!tempatLahir) {
          tempatLahir = ttlVal;
        }
      }
    }

    const tanggalLahir = formatExcelDate(rawTglLahir);
    if (!tempatLahir) tempatLahir = 'Jakarta';

    // Agama
    const rawAgama = String(colAgama >= 0 ? getVal(colAgama) : 'Islam').trim().toLowerCase();
    let agama: 'Islam' | 'Kristen' | 'Katolik' | 'Hindu' | 'Buddha' | 'Konghucu' = 'Islam';
    if (rawAgama.includes('kristen') || rawAgama.includes('protestan')) {
      agama = 'Kristen';
    } else if (rawAgama.includes('katolik') || rawAgama.includes('catholic')) {
      agama = 'Katolik';
    } else if (rawAgama.includes('hindu')) {
      agama = 'Hindu';
    } else if (rawAgama.includes('buddha') || rawAgama.includes('budha')) {
      agama = 'Buddha';
    } else if (rawAgama.includes('konghucu') || rawAgama.includes('khonghucu')) {
      agama = 'Konghucu';
    } else {
      agama = 'Islam';
    }

    // Other fields
    const alamat = String(colAlamat >= 0 ? getVal(colAlamat) : '').trim();
    const namaAyah = String(colAyah >= 0 ? getVal(colAyah) : '').trim();
    const namaIbu = String(colIbu >= 0 ? getVal(colIbu) : '').trim();
    const pekerjaanOrtu = String(colPekerjaan >= 0 ? getVal(colPekerjaan) : '').trim();
    const noHpOrtu = String(colHp >= 0 ? getVal(colHp) : '').trim();
    
    // Status
    const rawStatus = String(colStatus >= 0 ? getVal(colStatus) : 'Aktif').trim().toLowerCase();
    let status: 'Aktif' | 'Mutasi' | 'Lulus' | 'Non-aktif' = 'Aktif';
    if (rawStatus.includes('mutasi')) status = 'Mutasi';
    else if (rawStatus.includes('lulus')) status = 'Lulus';
    else if (rawStatus.includes('non') || rawStatus.includes('keluar')) status = 'Non-aktif';

    const kelas = String(colKelas >= 0 ? getVal(colKelas) : defaultClass).trim() || defaultClass;
    const catatanKhusus = String(colCatatan >= 0 ? getVal(colCatatan) : '').trim();

    // Generate safe Firestore-compliant student ID
    const baseId = nisn ? `sis_${nisn}` : `sis_${Date.now().toString().slice(-6)}_${data.length + 1}`;
    const safeId = baseId.replace(/[^a-zA-Z0-9_-]/g, '_');

    // Default fallback foto
    const fotoUrl = jenisKelamin === 'P'
      ? `https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80`
      : `https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80`;

    data.push({
      id: safeId,
      nomorAbsen,
      nisn: nisn || `00${Date.now().toString().slice(-8)}`,
      nis: nis || `${202400 + data.length + 1}`,
      nama,
      jenisKelamin,
      tempatLahir,
      tanggalLahir,
      agama,
      alamat: alamat || 'Jl. Pendidikan No. 1',
      namaAyah: namaAyah || '-',
      namaIbu: namaIbu || '-',
      pekerjaanOrtu: pekerjaanOrtu || 'Wiraswasta',
      noHpOrtu: noHpOrtu || '081234567890',
      fotoUrl,
      status,
      kelas,
      catatanKhusus
    });
  });

  return {
    data,
    errors,
    totalRows: dataRows.length,
    validRows: data.length
  };
}

// Parse Teachers from Sheet
export function parseTeachersFromSheet(ws: XLSX.WorkSheet): ParsedExcelResult<Partial<Teacher>> {
  const rawRows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
  const data: Partial<Teacher>[] = [];
  const errors: string[] = [];

  rawRows.forEach((row, idx) => {
    const rowNum = idx + 2;
    const nama = row['Nama Lengkap & Gelar'] || row['Nama Lengkap'] || row['Nama'] || '';
    const nip = String(row['NIP'] || '-').trim();
    const nuptk = String(row['NUPTK'] || '').trim();
    const jkRaw = String(row['Jenis Kelamin (L/P)'] || row['JK'] || 'L').toUpperCase().trim();
    const jenisKelamin: 'L' | 'P' = jkRaw.startsWith('P') ? 'P' : 'L';
    const jabatan = row['Jabatan'] || 'Guru Mapel';
    const jenisGuru = row['Jenis Pendidik'] || row['Jenis Guru'] || 'Guru Mapel';
    const statusKepegawaian = row['Status Kepegawaian'] || 'PNS';
    const golonganPangkat = row['Golongan / Pangkat'] || row['Golongan'] || '-';
    const pendidikanTerakhir = row['Pendidikan Terakhir'] || 'S1 PGSD';
    const jurusan = row['Jurusan / Prodi'] || row['Jurusan'] || '';
    const noHp = String(row['No HP / WhatsApp'] || row['No HP'] || '');
    const email = row['Email'] || '';
    const alamat = row['Alamat Lengkap'] || row['Alamat'] || '';
    const statusAktif = row['Status (Aktif/Cuti/Pensiun)'] || row['Status'] || 'Aktif';
    const mapelString = row['Mata Pelajaran Diampu'] || row['Mata Pelajaran'] || '';

    if (!nama || String(nama).trim().length === 0) {
      errors.push(`Baris ${rowNum}: Nama guru kosong, dilewati.`);
      return;
    }

    const mapelList = mapelString
      ? String(mapelString).split(/[,;]/).map((m: string) => m.trim()).filter(Boolean)
      : [];

    data.push({
      id: nip && nip !== '-' ? `t_${nip}` : `t_${Date.now()}_${idx}`,
      nip: nip || '-',
      nuptk: nuptk || undefined,
      nama: String(nama).trim(),
      jenisKelamin,
      jabatan: String(jabatan).trim(),
      jenisGuru: (['Kepala Sekolah', 'Guru Kelas', 'Guru Mapel', 'Guru BK', 'Tenaga Kependidikan'].includes(jenisGuru) ? jenisGuru : 'Guru Mapel') as any,
      statusKepegawaian: (['PNS', 'PPPK', 'GTT / Honorer', 'Guru Tetap Yayasan'].includes(statusKepegawaian) ? statusKepegawaian : 'PNS') as any,
      golonganPangkat: String(golonganPangkat).trim(),
      pendidikanTerakhir: String(pendidikanTerakhir).trim(),
      jurusan: String(jurusan).trim(),
      noHp: String(noHp).trim(),
      email: String(email).trim(),
      alamat: String(alamat).trim(),
      statusAktif: (['Aktif', 'Cuti', 'Pensiun', 'Mutasi'].includes(statusAktif) ? statusAktif : 'Aktif') as any,
      mataPelajaranUtama: mapelList,
      fotoUrl: `https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80`
    });
  });

  return {
    data,
    errors,
    totalRows: rawRows.length,
    validRows: data.length
  };
}

// Parse Grades from Sheet
export function parseGradesFromSheet(
  ws: XLSX.WorkSheet,
  students: Student[],
  subjects: Subject[]
): ParsedExcelResult<GradeRecord> {
  const rawRows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
  const data: GradeRecord[] = [];
  const errors: string[] = [];

  rawRows.forEach((row, idx) => {
    const rowNum = idx + 2;
    const nisn = String(row['NISN'] || '').trim();
    const nama = String(row['Nama Siswa'] || row['Nama'] || '').trim();
    const kodeMapel = String(row['Kode Mapel'] || row['Kode'] || '').trim().toUpperCase();

    // Match student
    let student = students.find(s => s.nisn === nisn);
    if (!student && nama) {
      student = students.find(s => s.nama.toLowerCase().includes(nama.toLowerCase()));
    }

    if (!student) {
      errors.push(`Baris ${rowNum}: Siswa dengan NISN "${nisn}" / Nama "${nama}" tidak ditemukan di database.`);
      return;
    }

    // Match subject
    let subject = subjects.find(sub => sub.kode.toUpperCase() === kodeMapel);
    if (!subject && row['Nama Mata Pelajaran']) {
      const subjectName = String(row['Nama Mata Pelajaran']).toLowerCase();
      subject = subjects.find(sub => sub.nama.toLowerCase().includes(subjectName));
    }

    if (!subject) {
      errors.push(`Baris ${rowNum}: Mata pelajaran "${kodeMapel || row['Nama Mata Pelajaran']}" tidak dikenali.`);
      return;
    }

    // Extract grades
    const formatifTypes = [
      { key: 'Formatif TP 1', type: 'Formatif_TP1' },
      { key: 'Formatif TP 2', type: 'Formatif_TP2' },
      { key: 'Formatif TP 3', type: 'Formatif_TP3' },
      { key: 'Formatif TP 4', type: 'Formatif_TP4' },
      { key: 'Sumatif Tengah Sem (STS)', type: 'Sumatif_STS' },
      { key: 'Sumatif Akhir Sem (SAS)', type: 'Sumatif_SAS' }
    ] as const;

    formatifTypes.forEach(({ key, type }) => {
      const val = row[key];
      if (val !== undefined && val !== '' && !isNaN(Number(val))) {
        const score = Math.min(100, Math.max(0, Number(val)));
        data.push({
          id: `g_${student!.id}_${subject!.id}_${type}`,
          siswaId: student!.id,
          mapelId: subject!.id,
          jenis: type as any,
          nilai: score,
          capaianKompetensi: score >= (subject!.kktp || 75)
            ? 'Menunjukkan penguasaan yang sangat baik dalam materi.'
            : 'Perlu bimbingan dan pendampingan lebih lanjut.'
        });
      }
    });
  });

  return {
    data,
    errors,
    totalRows: rawRows.length,
    validRows: data.length
  };
}

// Parse Cash Transactions
export function parseCashFromSheet(ws: XLSX.WorkSheet): ParsedExcelResult<Partial<CashTransaction>> {
  const rawRows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
  const data: Partial<CashTransaction>[] = [];
  const errors: string[] = [];

  rawRows.forEach((row, idx) => {
    const rowNum = idx + 2;
    const tanggal = String(row['Tanggal (YYYY-MM-DD)'] || row['Tanggal'] || new Date().toISOString().split('T')[0]).trim();
    const jenisRaw = String(row['Jenis (Pemasukan/Pengeluaran)'] || row['Jenis'] || 'Pemasukan').trim();
    const jenis: 'Pemasukan' | 'Pengeluaran' = jenisRaw.toLowerCase().includes('keluar') ? 'Pengeluaran' : 'Pemasukan';
    const kategori = row['Kategori Transaksi'] || row['Kategori'] || 'Lainnya';
    const keterangan = row['Keterangan Rinci'] || row['Keterangan'] || '';
    const jumlahRaw = row['Nominal / Jumlah (Rp)'] || row['Jumlah'] || row['Nominal'] || 0;
    const jumlah = Math.abs(Number(jumlahRaw) || 0);
    const penanggungJawab = row['Penanggung Jawab / Bendahara'] || row['Penanggung Jawab'] || 'Bendahara Kelas';
    const namaSiswa = row['Nama Siswa (Jika Iuran Kas)'] || row['Nama Siswa'] || '';

    if (!keterangan || jumlah <= 0) {
      errors.push(`Baris ${rowNum}: Keterangan kosong atau jumlah nominal <= 0.`);
      return;
    }

    data.push({
      id: `tx_${Date.now()}_${idx}`,
      tanggal,
      jenis,
      kategori,
      keterangan,
      jumlah,
      penanggungJawab,
      namaSiswa: namaSiswa || undefined,
      saldoSetelah: 0
    });
  });

  return {
    data,
    errors,
    totalRows: rawRows.length,
    validRows: data.length
  };
}

// Parse Inventory Items
export function parseInventoryFromSheet(ws: XLSX.WorkSheet): ParsedExcelResult<Partial<InventoryItem>> {
  const rawRows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
  const data: Partial<InventoryItem>[] = [];
  const errors: string[] = [];

  rawRows.forEach((row, idx) => {
    const rowNum = idx + 2;
    const kodeBarang = String(row['Kode Barang'] || row['Kode'] || `BRG-${idx + 1}`).trim();
    const namaBarang = String(row['Nama Barang / Aset'] || row['Nama Barang'] || '').trim();
    const spesifikasi = row['Spesifikasi / Merk / Bahan'] || row['Spesifikasi'] || '';
    const kategori = row['Kategori'] || 'Perabot';
    const jumlah = Number(row['Jumlah'] || 1);
    const satuan = row['Satuan (Unit/Pcs/Set)'] || row['Satuan'] || 'Unit';
    const kondisiRaw = String(row['Kondisi (Baik/Rusak Ringan/Rusak Berat)'] || row['Kondisi'] || 'Baik').trim();
    let kondisi: 'Baik' | 'Rusak Ringan' | 'Rusak Berat' = 'Baik';
    if (kondisiRaw.toLowerCase().includes('berat')) kondisi = 'Rusak Berat';
    else if (kondisiRaw.toLowerCase().includes('ringan')) kondisi = 'Rusak Ringan';
    
    const tahunPengadaan = Number(row['Tahun Pengadaan'] || row['Tahun'] || new Date().getFullYear());
    const sumberDana = row['Sumber Dana (BOS/Paguyuban/Bantuan)'] || row['Sumber Dana'] || 'BOS Reguler';
    const keterangan = row['Keterangan Lokasi'] || row['Keterangan'] || '';

    if (!namaBarang) {
      errors.push(`Baris ${rowNum}: Nama barang kosong.`);
      return;
    }

    data.push({
      id: `inv_${Date.now()}_${idx}`,
      kodeBarang,
      namaBarang,
      spesifikasi,
      kategori,
      jumlah: isNaN(jumlah) || jumlah < 1 ? 1 : jumlah,
      satuan,
      kondisi,
      tahunPengadaan: isNaN(tahunPengadaan) ? 2024 : tahunPengadaan,
      sumberDana,
      keterangan
    });
  });

  return {
    data,
    errors,
    totalRows: rawRows.length,
    validRows: data.length
  };
}
