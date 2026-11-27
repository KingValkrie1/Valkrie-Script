export type CatalogCopy = {
  summary: string;
  useCases: string[];
};

export const catalogCopy: Record<string, CatalogCopy> = {
  photopea: {
    summary: 'Editor gambar berbasis web untuk mengolah foto, desain, dan file PSD langsung dari browser.',
    useCases: ['Edit gambar dan foto', 'Membuka file PSD', 'Membuat aset grafis sederhana'],
  },
  canva: {
    summary: 'Platform desain untuk membuat presentasi, poster, konten media sosial, dan materi visual.',
    useCases: ['Membuat desain siap pakai', 'Menyusun presentasi', 'Kolaborasi desain'],
  },
  figma: {
    summary: 'Ruang kerja desain antarmuka dan prototipe yang mendukung kolaborasi tim.',
    useCases: ['Merancang UI/UX', 'Membuat prototipe interaktif', 'Meninjau desain bersama tim'],
  },
  vscode: {
    summary: 'Editor kode untuk mengembangkan aplikasi dengan dukungan ekstensi dan banyak bahasa pemrograman.',
    useCases: ['Menulis dan mengelola kode', 'Memakai ekstensi pengembangan', 'Bekerja dengan Git'],
  },
  notion: {
    summary: 'Workspace untuk menyusun catatan, dokumen, tugas, dan basis pengetahuan dalam satu tempat.',
    useCases: ['Menyimpan catatan dan dokumen', 'Mengatur tugas dan proyek', 'Menyusun wiki pribadi atau tim'],
  },
  docs: {
    summary: 'Editor dokumen online untuk menulis dan berkolaborasi melalui browser.',
    useCases: ['Menulis dokumen', 'Memberi komentar dan saran', 'Berbagi dokumen untuk kolaborasi'],
  },
  sheets: {
    summary: 'Spreadsheet online untuk mengatur data, memakai rumus, dan bekerja bersama.',
    useCases: ['Mengolah tabel dan daftar', 'Menggunakan rumus spreadsheet', 'Berbagi data dengan tim'],
  },
  pdf24: {
    summary: 'Kumpulan utilitas PDF berbasis web untuk menggabungkan, memisahkan, dan mengelola dokumen.',
    useCases: ['Menggabungkan atau memisahkan PDF', 'Mengubah format dokumen', 'Mengelola file PDF'],
  },
};
