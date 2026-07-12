import { browser } from '$app/environment';

type Lang = 'id' | 'en';

const translations: Record<Lang, Record<string, string>> = {
  id: {
    'nav.dashboard': 'Dashboard',
    'nav.paths': 'Learning Paths',
    'nav.flashcards': 'Flashcards',
    'nav.tutor': 'AI Tutor',
    'nav.study': 'Belajar',
    'nav.videos': 'Video',
    'nav.exercises': 'Latihan',
    'nav.badges': 'Lencana',
    'nav.planner': 'Rencana',
    'nav.profile': 'Profil',
    'nav.export': 'Ekspor',
    'nav.leaderboard': 'Peringkat',
    'nav.search': 'Cari',
    'nav.settings': 'Pengaturan',

    'common.loading': 'Memuat...',
    'common.error': 'Terjadi kesalahan',
    'common.save': 'Simpan',
    'common.cancel': 'Batal',
    'common.delete': 'Hapus',
    'common.edit': 'Edit',
    'common.back': 'Kembali',
    'common.next': 'Lanjut',
    'common.done': 'Selesai',
    'common.search': 'Cari...',
    'common.filter': 'Filter',
    'common.all': 'Semua',
    'common.level': 'Level',
    'common.badges': 'Lencana',
    'common.xp': 'XP',

    'module.title': 'Modul',
    'module.sessions': 'Sesi',
    'module.completed': 'Selesai',
    'module.level': 'Tingkat',
    'module.exercises': 'Latihan Soal',
    'module.discussion': 'Diskusi',

    'study.pomodoro': 'Pomodoro',
    'study.goal': 'Target Harian',
    'study.streak': 'Streak',
    'study.reminder': 'Pengatur Waktu',

    'flashcards.due': 'Jatuh Tempo',
    'flashcards.review': 'Review',
    'flashcards.known': 'Diketahui',
    'flashcards.learning': 'Diproses',

    'tutor.title': 'Tutor AI',
    'tutor.ask': 'Tanya sesuatu...',
    'tutor.thinking': 'Berpikir...',
    'tutor.offline': 'Mode offline - gunakan keyword match',

    'path.title': 'Learning Path',
    'path.prerequisites': 'Prasyarat',
    'path.progress': 'Kemajuan',
    'path.next': 'Lanjut Belajar',

    'exercises.title': 'Latihan',
    'exercises.difficulty': 'Kesulitan',
    'exercises.type': 'Tipe',
    'exercises.run': 'Jalankan',

    'badges.title': 'Lencana',
    'badges.unlocked': 'Terbuka',
    'badges.locked': 'Terkunci',

    'planner.title': 'Rencana Belajar',
    'planner.create': 'Buat Rencana',
    'planner.deadline': 'Target Selesai',
    'planner.daily': 'Target Harian',
    'planner.ontrack': 'Tepat Waktu',
    'planner.behind': 'Tertinggal',

    'profile.title': 'Profil',
    'profile.stats': 'Statistik',
    'profile.join': 'Bergabung',
    'profile.activity': 'Aktivitas',

    'leaderboard.title': 'Papan Peringkat',
    'leaderboard.global': 'Global',
    'leaderboard.perpath': 'Per Path',
    'leaderboard.rank': 'Peringkat',

    'export.title': 'Ekspor Data',
    'export.csv': 'Download CSV',
    'export.json': 'Download JSON',
    'export.certificate': 'Sertifikat',

    'home.title': 'Beranda',
    'nav.progress': 'Progres',
    'nav.history': 'Riwayat',
    'nav.certificate': 'Sertifikat',
    'nav.references': 'Referensi',
  },
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.paths': 'Learning Paths',
    'nav.flashcards': 'Flashcards',
    'nav.tutor': 'AI Tutor',
    'nav.study': 'Study',
    'nav.videos': 'Videos',
    'nav.exercises': 'Exercises',
    'nav.badges': 'Badges',
    'nav.planner': 'Planner',
    'nav.profile': 'Profile',
    'nav.export': 'Export',
    'nav.leaderboard': 'Leaderboard',
    'nav.search': 'Search',
    'nav.settings': 'Settings',

    'common.loading': 'Loading...',
    'common.error': 'Something went wrong',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.done': 'Done',
    'common.search': 'Search...',
    'common.filter': 'Filter',
    'common.all': 'All',
    'common.level': 'Level',
    'common.badges': 'Badges',
    'common.xp': 'XP',

    'module.title': 'Module',
    'module.sessions': 'Sessions',
    'module.completed': 'Completed',
    'module.level': 'Level',
    'module.exercises': 'Exercises',
    'module.discussion': 'Discussion',

    'study.pomodoro': 'Pomodoro',
    'study.goal': 'Daily Goal',
    'study.streak': 'Streak',
    'study.reminder': 'Reminder',

    'flashcards.due': 'Due',
    'flashcards.review': 'Review',
    'flashcards.known': 'Known',
    'flashcards.learning': 'Learning',

    'tutor.title': 'AI Tutor',
    'tutor.ask': 'Ask something...',
    'tutor.thinking': 'Thinking...',
    'tutor.offline': 'Offline mode - using keyword match',

    'path.title': 'Learning Path',
    'path.prerequisites': 'Prerequisites',
    'path.progress': 'Progress',
    'path.next': 'Continue',

    'exercises.title': 'Exercises',
    'exercises.difficulty': 'Difficulty',
    'exercises.type': 'Type',
    'exercises.run': 'Run',

    'badges.title': 'Badges',
    'badges.unlocked': 'Unlocked',
    'badges.locked': 'Locked',

    'planner.title': 'Study Plan',
    'planner.create': 'Create Plan',
    'planner.deadline': 'Target Date',
    'planner.daily': 'Daily Target',
    'planner.ontrack': 'On Track',
    'planner.behind': 'Behind',

    'profile.title': 'Profile',
    'profile.stats': 'Statistics',
    'profile.join': 'Joined',
    'profile.activity': 'Activity',

    'leaderboard.title': 'Leaderboard',
    'leaderboard.global': 'Global',
    'leaderboard.perpath': 'Per Path',
    'leaderboard.rank': 'Rank',

    'export.title': 'Export Data',
    'export.csv': 'Download CSV',
    'export.json': 'Download JSON',
    'export.certificate': 'Certificate',

    'home.title': 'Home',
    'nav.progress': 'Progress',
    'nav.history': 'History',
    'nav.certificate': 'Certificate',
    'nav.references': 'References',
  }
};

let currentLang = $state<Lang>('id');

if (browser) {
  const saved = localStorage.getItem('lms-lang');
  if (saved === 'id' || saved === 'en') {
    currentLang = saved;
  }
}

export function getLang(): Lang {
  return currentLang;
}

export function setLang(l: Lang) {
  currentLang = l;
  if (browser) localStorage.setItem('lms-lang', l);
}

export function toggleLang() {
  setLang(currentLang === 'id' ? 'en' : 'id');
}

export function t(key: string): string {
  const l = currentLang;
  return translations[l]?.[key] ?? key;
}
