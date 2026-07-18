#!/usr/bin/env node
/**
 * Bulk i18n transform for public pages.
 * Phase 1: Adds needed keys to i18n store (if missing)
 * Phase 2: Adds t() import + replaces hardcoded ID text
 *
 * Usage: node scripts/i18n-public-pages.cjs
 */

const fs = require('fs');
const path = require('path');

const PAGE_FILES = [
  'src/routes/(public)/login/+page.svelte',
  'src/routes/register/instructor/+page.svelte',
  'src/routes/(public)/certificate/+page.svelte',
  'src/routes/(public)/announcements/+page.svelte',
  'src/routes/(public)/feed/+page.svelte',
  'src/routes/catalog/+page.svelte',
  'src/routes/dashboard/+page.svelte',
  'src/routes/search/+page.svelte',
  'src/routes/badges/+page.svelte',
  'src/routes/challenges/+page.svelte',
  'src/routes/exercises/+page.svelte',
  'src/routes/flashcards/+page.svelte',
  'src/routes/glossary/+page.svelte',
  'src/routes/history/+page.svelte',
  'src/routes/insights/+page.svelte',
  'src/routes/leaderboard/+page.svelte',
  'src/routes/path/+page.svelte',
  'src/routes/profile/+page.svelte',
  'src/routes/projects/+page.svelte',
  'src/routes/resources/+page.svelte',
  'src/routes/reviews/+page.svelte',
  'src/routes/study/+page.svelte',
  'src/routes/videos/+page.svelte',
];

// === ALL NEEDED I18N KEYS (id + en) ===
// These are the keys needed by the pages above.
// Format: { key: { id: 'indonesian', en: 'english' } }
const NEW_KEYS = {
  // --- Login ---
  'login.title': { id: 'Selamat datang di RPL AI Curriculum', en: 'Welcome to RPL AI Curriculum' },
  'login.subtitle': { id: 'Masuk untuk melanjutkan perjalanan belajar', en: 'Sign in to continue your learning journey' },
  'login.email_or_nisn': { id: 'Email atau NISN', en: 'Email or NISN' },
  'login.password': { id: 'Kata Sandi', en: 'Password' },
  'login.signin': { id: 'Masuk', en: 'Sign In' },
  'login.no_account': { id: 'Belum punya akun?', en: "Don't have an account?" },
  'login.register_here': { id: 'Daftar di sini', en: 'Register here' },
  'login.error_generic': { id: 'Email/NISN atau kata sandi salah.', en: 'Invalid email/NISN or password.' },
  'login.or_continue_with': { id: 'Atau lanjutkan dengan', en: 'Or continue with' },
  'login.continue_as_guest': { id: 'Lanjut sebagai Tamu', en: 'Continue as Guest' },
  'login.test_credentials': { id: 'Akun Demo', en: 'Demo Account' },
  // --- Register ---
  'register.title': { id: 'Daftar Akun Baru', en: 'Create New Account' },
  'register.subtitle': { id: 'Daftar untuk mulai belajar', en: 'Register to start learning' },
  'register.fullname': { id: 'Nama Lengkap', en: 'Full Name' },
  'register.email': { id: 'Email', en: 'Email' },
  'register.nisn': { id: 'NISN', en: 'NISN' },
  'register.password': { id: 'Kata Sandi', en: 'Password' },
  'register.confirm_password': { id: 'Konfirmasi Kata Sandi', en: 'Confirm Password' },
  'register.phone': { id: 'Nomor Telepon', en: 'Phone Number' },
  'register.role_student': { id: 'Siswa', en: 'Student' },
  'register.role_instructor': { id: 'Instruktur', en: 'Instructor' },
  'register.register_btn': { id: 'Daftar', en: 'Register' },
  'register.have_account': { id: 'Sudah punya akun?', en: 'Already have an account?' },
  'register.login_here': { id: 'Masuk di sini', en: 'Sign in here' },
  'register.as_instructor': { id: 'Daftar sebagai Instruktur', en: 'Register as Instructor' },
  'register.bio': { id: 'Bio / Pengalaman', en: 'Bio / Experience' },
  'register.specialization': { id: 'Spesialisasi', en: 'Specialization' },
  'register.required': { id: 'Wajib diisi', en: 'Required' },
  // --- Certificate ---
  'certificate.title': { id: 'Sertifikat Kelulusan', en: 'Certificate of Completion' },
  'certificate.subtitle': { id: 'Cetak sertifikat kelulusan untuk setiap modul yang sudah kamu selesaikan.', en: 'Print completion certificates for each module you have completed.' },
  'certificate.empty': { id: 'Belum ada sertifikat yang tersedia.', en: 'No certificates available yet.' },
  'certificate.empty_hint': { id: 'Selesaikan modul untuk mendapatkan sertifikat.', en: 'Complete modules to earn certificates.' },
  'certificate.view': { id: 'Lihat Sertifikat', en: 'View Certificate' },
  'certificate.download': { id: 'Download PDF', en: 'Download PDF' },
  'certificate.completed_on': { id: 'Diselesaikan pada', en: 'Completed on' },
  'certificate.module': { id: 'Modul', en: 'Module' },
  'certificate.student': { id: 'Siswa', en: 'Student' },
  'certificate.date': { id: 'Tanggal', en: 'Date' },
  'certificate.print': { id: 'Cetak', en: 'Print' },
  // --- Announcements ---
  'announcements.title': { id: 'Pengumuman', en: 'Announcements' },
  'announcements.loading': { id: 'Memuat pengumuman...', en: 'Loading announcements...' },
  'announcements.empty': { id: 'Belum ada pengumuman.', en: 'No announcements yet.' },
  'announcements.error': { id: 'Gagal memuat pengumuman.', en: 'Failed to load announcements.' },
  'announcements.pinned': { id: '📌 Disematkan', en: '📌 Pinned' },
  'announcements.by': { id: 'oleh', en: 'by' },
  'announcements.read_more': { id: 'Baca selengkapnya', en: 'Read more' },
  'announcements.show_less': { id: 'Tutup', en: 'Show less' },
  // --- Feed ---
  'feed.title': { id: 'Aktivitas Terbaru', en: 'Recent Activity' },
  'feed.empty': { id: 'Belum ada aktivitas. Mulai belajar!', en: 'No activity yet. Start learning!' },
  // --- Catalog ---
  'catalog.title': { id: 'Katalog Mata Pelajaran', en: 'Course Catalog' },
  'catalog.loading': { id: 'Memuat katalog...', en: 'Loading catalog...' },
  'catalog.empty': { id: 'Tidak ada mata pelajaran.', en: 'No courses available.' },
  'catalog.search': { id: 'Cari mata pelajaran...', en: 'Search courses...' },
  'catalog.all_levels': { id: 'Semua Tingkat', en: 'All Levels' },
  'catalog.beginner': { id: 'Pemula', en: 'Beginner' },
  'catalog.chapters': { id: 'bab', en: 'chapters' },
  'catalog.sessions': { id: 'sesi', en: 'sessions' },
  'catalog.start': { id: 'Mulai Belajar', en: 'Start Learning' },
  'catalog.continue': { id: 'Lanjutkan', en: 'Continue' },
  // --- Dashboard ---
  'dashboard.title': { id: 'Dashboard', en: 'Dashboard' },
  'dashboard.welcome': { id: 'Selamat datang', en: 'Welcome' },
  'dashboard.modules_completed': { id: 'Modul Selesai', en: 'Modules Completed' },
  'dashboard.sessions_done': { id: 'Sesi Selesai', en: 'Sessions Done' },
  'dashboard.total_sessions': { id: 'Total Sesi', en: 'Total Sessions' },
  'dashboard.streak': { id: 'Streak', en: 'Streak' },
  'dashboard.overall_progress': { id: 'Progress', en: 'Progress' },
  'dashboard.recent_activity': { id: 'Aktivitas Terbaru', en: 'Recent Activity' },
  'dashboard.continue_learning': { id: 'Lanjut Belajar', en: 'Continue Learning' },
  'dashboard.xp': { id: 'XP', en: 'XP' },
  'dashboard.badges': { id: 'Lencana', en: 'Badges' },
  'dashboard.quick_links': { id: 'Akses Cepat', en: 'Quick Links' },
  // --- Search ---
  'search.title': { id: 'Cari', en: 'Search' },
  'search.placeholder': { id: 'Cari pelajaran, kursus, kelas...', en: 'Search lessons, courses, classes...' },
  'search.lessons': { id: 'Pelajaran', en: 'Lessons' },
  'search.courses': { id: 'Kursus', en: 'Courses' },
  'search.classes': { id: 'Kelas', en: 'Classes' },
  'search.no_results': { id: 'Tidak ada hasil', en: 'No results' },
  'search.loading': { id: 'Mencari...', en: 'Searching...' },
  'search.error': { id: 'Gagal mencari', en: 'Search failed' },
  // --- Badges ---
  'badges.page_title': { id: '🏆 Badges', en: '🏆 Badges' },
  'badges.level': { id: 'Level', en: 'Level' },
  'badges.unlocked_count': { id: '{unlocked}/{total} badges unlocked', en: '{unlocked}/{total} badges unlocked' },
  'badges.locked_hint': { id: 'Selesaikan tantangan untuk membuka', en: 'Complete challenges to unlock' },
  'badges.earned_on': { id: 'Diraih:', en: 'Earned:' },
  'badges.share_title': { id: 'Badges RPL AI - {count} badges', en: 'Badges RPL AI - {count} badges' },
  'badges.share_text': { id: 'Aku sudah membuka {unlocked} dari {total} badges di RPL AI Curriculum! 🏆', en: 'I have unlocked {unlocked} of {total} badges in RPL AI Curriculum! 🏆' },
  // --- Challenges ---
  'challenges.title': { id: '🏋️ Daily Challenges', en: '🏋️ Daily Challenges' },
  'challenges.desc': { id: 'Latihan coding harian dari level dasar sampai mahir. Klik tantangan untuk melihat soal dan coba selesaikan.', en: 'Daily coding exercises from beginner to advanced. Click a challenge to see the problem and try to solve it.' },
  'challenges.search': { id: 'Cari tantangan...', en: 'Search challenges...' },
  'challenges.no_results': { id: 'Tidak ada hasil', en: 'No results' },
  'challenges.loading': { id: 'Memuat...', en: 'Loading...' },
  'challenges.select_hint': { id: 'Pilih tantangan dari daftar di samping untuk melihat soal.', en: 'Select a challenge from the list to view the problem.' },
  'challenges.error_load': { id: 'Gagal memuat challenges', en: 'Failed to load challenges' },
  // --- Exercises ---
  'exercises.page_title': { id: '🏋️ Latihan Soal', en: '🏋️ Exercises' },
  'exercises.page_desc': { id: 'Latihan interaktif untuk setiap modul — tambah pemahaman sebelum lanjut.', en: 'Interactive exercises for each module — deepen understanding before moving on.' },
  'exercises.loading': { id: 'Memuat latihan...', en: 'Loading exercises...' },
  'exercises.error': { id: 'Gagal memuat data latihan.', en: 'Failed to load exercise data.' },
  'exercises.search': { id: 'Cari latihan...', en: 'Search exercises...' },
  'exercises.all_levels': { id: 'Semua Level', en: 'All Levels' },
  'exercises.all_types': { id: 'Semua Tipe', en: 'All Types' },
  'exercises.count': { id: '{filtered} dari {total} latihan', en: '{filtered} of {total} exercises' },
  'exercises.recommendation_title': { id: '🎯 Rekomendasi untukmu (level {level})', en: '🎯 Recommendations for you (level {level})' },
  'exercises.rec_beginner': { id: 'Mulai dengan latihan dasar untuk membangun fondasi.', en: 'Start with basic exercises to build a foundation.' },
  'exercises.rec_intermediate': { id: 'Kamu sudah siap untuk latihan tingkat menengah. Terus tingkatkan!', en: 'You are ready for intermediate exercises. Keep improving!' },
  'exercises.rec_advanced': { id: 'Kamu sudah mahir! Coba latihan tingkat lanjut.', en: 'You are advanced! Try challenging exercises.' },
  'exercises.rec_badge': { id: '🎯 Rekomendasi', en: '🎯 Recommendation' },
  'exercises.no_desc': { id: 'Tidak ada deskripsi.', en: 'No description.' },
  'exercises.empty_rec': { id: 'Tidak ada latihan untuk level ini. Coba filter lain.', en: 'No exercises for this level. Try another filter.' },
  'exercises.empty_filtered': { id: 'Tidak ada latihan yang cocok dengan filter.', en: 'No exercises match the current filter.' },
  // --- Flashcards ---
  'flashcards.page_title': { id: '🃏 Flashcards', en: '🃏 Flashcards' },
  'flashcards.subtitle': { id: 'Kartu belajar dengan sistem pengulangan terjadwal (spaced repetition)', en: 'Study cards with spaced repetition system' },
  'flashcards.due_today': { id: 'Jatuh Tempo Hari Ini', en: 'Due Today' },
  'flashcards.total_cards': { id: 'Total Kartu', en: 'Total Cards' },
  'flashcards.known': { id: 'Diketahui', en: 'Known' },
  'flashcards.learning': { id: 'Sedang Dipelajari', en: 'Learning' },
  'flashcards.new_cards': { id: 'Kartu Baru', en: 'New Cards' },
  'flashcards.decks_label': { id: 'Deck', en: 'Decks' },
  'flashcards.correct': { id: 'benar', en: 'correct' },
  'flashcards.accuracy': { id: '{pct}% akurasi', en: '{pct}% accuracy' },
  'flashcards.streak': { id: '🔥 Streak: {streak} (rekor: {best})', en: '🔥 Streak: {streak} (best: {best})' },
  'flashcards.total_reviewed': { id: '📅 Total review: {count}', en: '📅 Total reviews: {count}' },
  'flashcards.decks_by_module': { id: '📂 Deck Berdasarkan Modul', en: '📂 Decks by Module' },
  'flashcards.cards_count': { id: '{count} kartu', en: '{count} cards' },
  'flashcards.cat_quiz': { id: '📝 Quiz', en: '📝 Quiz' },
  'flashcards.cat_summary': { id: '📖 Ringkasan', en: '📖 Summary' },
  'flashcards.cat_custom': { id: '✏️ Custom', en: '✏️ Custom' },
  'flashcards.review_btn': { id: 'Review', en: 'Review' },
  'flashcards.delete_btn': { id: 'Hapus', en: 'Delete' },
  'flashcards.manage_title': { id: '⚙️ Kelola Flashcards', en: '⚙️ Manage Flashcards' },
  'flashcards.select_module': { id: 'Pilih Modul:', en: 'Select Module:' },
  'flashcards.select_placeholder': { id: '-- Pilih Modul --', en: '-- Select Module --' },
  'flashcards.generate_btn': { id: '🎴 Generate Flashcards', en: '🎴 Generate Flashcards' },
  'flashcards.generating': { id: '⏳ Membuat...', en: '⏳ Generating...' },
  'flashcards.generated': { id: '✅ {count} kartu baru dibuat!', en: '✅ {count} new cards created!' },
  'flashcards.start_review': { id: '🚀 Mulai Review ({count} kartu jatuh tempo)', en: '🚀 Start Review ({count} cards due)' },
  'flashcards.delete_confirm': { id: 'Hapus semua kartu dari deck "{slug}"?', en: 'Delete all cards from deck "{slug}"?' },
  // --- Glossary ---
  'glossary.title': { id: '📖 Glossary', en: '📖 Glossary' },
  'glossary.desc': { id: 'Istilah-istilah penting seputar web development, JavaScript, TypeScript, database, DevOps, AI, dan framework.', en: 'Important terms about web development, JavaScript, TypeScript, database, DevOps, AI, and frameworks.' },
  'glossary.search': { id: 'Cari istilah...', en: 'Search terms...' },
  'glossary.no_results': { id: 'Tidak ada hasil', en: 'No results' },
  'glossary.loading': { id: 'Memuat...', en: 'Loading...' },
  'glossary.select_hint': { id: 'Pilih istilah dari daftar di samping untuk melihat penjelasan.', en: 'Select a term from the list to view the explanation.' },
  'glossary.error_load': { id: 'Gagal memuat data glossary', en: 'Failed to load glossary data' },
  // --- History ---
  'history.title': { id: '📜 Riwayat Aktivitas', en: '📜 Activity History' },
  'history.clear': { id: '🗑️ Hapus Riwayat', en: '🗑️ Clear History' },
  'history.filter_all': { id: 'Semua', en: 'All' },
  'history.filter_viewed': { id: '👁️ Dilihat', en: '👁️ Viewed' },
  'history.filter_completed': { id: '✅ Selesai', en: '✅ Completed' },
  'history.confirm_clear': { id: 'Hapus seluruh riwayat aktivitas?', en: 'Clear entire activity history?' },
  'history.confirm_cancel': { id: 'Batal', en: 'Cancel' },
  'history.confirm_yes': { id: 'Ya, Hapus', en: 'Yes, Delete' },
  'history.empty': { id: 'Belum ada aktivitas', en: 'No activity yet' },
  'history.action_view': { id: 'Melihat', en: 'Viewed' },
  'history.action_complete': { id: 'Menyelesaikan', en: 'Completed' },
  'history.action_quiz': { id: 'Mengerjakan Quiz', en: 'Took Quiz' },
  'history.time_just_now': { id: 'baru saja', en: 'just now' },
  'history.time_min_ago': { id: '{min} menit lalu', en: '{min} min ago' },
  'history.time_hour_ago': { id: '{hour} jam lalu', en: '{hour} hour ago' },
  'history.time_day_ago': { id: '{day} hari lalu', en: '{day} day ago' },
  // --- Insights ---
  'insights.title': { id: '📊 Learning Insights', en: '📊 Learning Insights' },
  'insights.subtitle': { id: 'Wawasan belajar dan analisis progress', en: 'Learning insights and progress analysis' },
  'insights.loading': { id: 'Memuat insights...', en: 'Loading insights...' },
  'insights.error': { id: 'Gagal memuat insights', en: 'Failed to load insights' },
  'insights.total_activity': { id: 'Total Aktivitas', en: 'Total Activity' },
  'insights.sessions_done': { id: 'Sesi Selesai', en: 'Sessions Done' },
  'insights.streak_days': { id: 'Streak (hari)', en: 'Streak (days)' },
  'insights.daily_avg': { id: 'Rata-rata Harian', en: 'Daily Average' },
  'insights.heatmap': { id: '🔥 Activity Heatmap', en: '🔥 Activity Heatmap' },
  'insights.time_per_hour': { id: '⏰ Waktu Belajar per Jam', en: '⏰ Study Time per Hour' },
  'insights.weak_topics': { id: '⚠️ Topik Lemah (<50% completion)', en: '⚠️ Weak Topics (<50% completion)' },
  'insights.weak_hint': { id: 'Selesaikan modul-modul ini untuk memperkuat pemahamanmu.', en: 'Complete these modules to strengthen your understanding.' },
  'insights.predictions': { id: '📈 Prediksi Penyelesaian', en: '📈 Completion Predictions' },
  'insights.pred_if_study': { id: 'Jika kamu belajar', en: 'If you study' },
  'insights.pred_sessions_per_day': { id: 'sesi/hari', en: 'sessions/day' },
  'insights.pred_calculate': { id: 'Hitung', en: 'Calculate' },
  'insights.pred_sessions_progress': { id: '{done}/{total} sesi', en: '{done}/{total} sessions' },
  'insights.pred_no_data': { id: 'Belum cukup data untuk prediksi. Mulai belajar!', en: 'Not enough data for predictions. Start studying!' },
  'insights.recent_activity': { id: '📜 Aktivitas Terbaru', en: '📜 Recent Activity' },
  'insights.no_activity': { id: 'Belum ada aktivitas tercatat.', en: 'No recorded activity.' },
  'insights.tooltip_activity': { id: '{count} aktivitas jam {hour}:00', en: '{count} activities at {hour}:00' },
  // --- Leaderboard ---
  'leaderboard.page_title': { id: '🏆 Papan Peringkat', en: '🏆 Leaderboard' },
  'leaderboard.subtitle': { id: 'Top users ranked by XP — terus belajar untuk naik peringkat!', en: 'Top users ranked by XP — keep learning to climb the ranks!' },
  'leaderboard.share_text': { id: 'Lihat papan peringkat RPL AI Curriculum! 🏆', en: 'Check out the RPL AI Curriculum leaderboard! 🏆' },
  'leaderboard.global_tab': { id: '🌍 Global', en: '🌍 Global' },
  'leaderboard.path_tab': { id: '📚 Per Path', en: '📚 By Path' },
  'leaderboard.select_path': { id: 'Pilih Path', en: 'Select Path' },
  'leaderboard.you': { id: 'Kamu', en: 'You' },
  'leaderboard.you_badge': { id: 'Kamu', en: 'You' },
  'leaderboard.level': { id: 'Level {level}', en: 'Level {level}' },
  'leaderboard.stat_xp': { id: 'XP', en: 'XP' },
  'leaderboard.stat_badges': { id: 'Badges', en: 'Badges' },
  'leaderboard.empty': { id: 'Belum ada data peringkat.', en: 'No ranking data yet.' },
  'leaderboard.empty_hint': { id: 'Selesaikan sesi untuk mendapat XP dan muncul di papan peringkat!', en: 'Complete sessions to earn XP and appear on the leaderboard!' },
  // --- Path ---
  'path.tab_paths': { id: '🗺️ Learning Paths', en: '🗺️ Learning Paths' },
  'path.tab_timeline': { id: '📋 Module Timeline', en: '📋 Module Timeline' },
  'path.header_title': { id: '🗺️ Learning Paths', en: '🗺️ Learning Paths' },
  'path.header_desc': { id: 'Pilih jalur belajar yang sesuai dengan tujuan karirmu', en: 'Choose a learning path that matches your career goals' },
  'path.stat_path': { id: 'Path', en: 'Path' },
  'path.stat_module': { id: 'Modul', en: 'Modules' },
  'path.stat_session': { id: 'Sesi', en: 'Sessions' },
  'path.sessions_unit': { id: 'sesi', en: 'sessions' },
  'path.prereq': { id: '📌 Prasyarat', en: '📌 Prerequisites' },
  'path.continue': { id: 'Lanjutkan →', en: 'Continue →' },
  'path.module_count': { id: '{count} modul', en: '{count} modules' },
  'path.session_count': { id: '{count} sesi', en: '{count} sessions' },
  'path.total_modules': { id: 'Total Modul', en: 'Total Modules' },
  'path.total_sessions': { id: 'Total Sesi', en: 'Total Sessions' },
  'path.est_minutes': { id: 'Perkiraan Menit', en: 'Est. Minutes' },
  'path.modules_completed': { id: 'Modul Selesai', en: 'Modules Completed' },
  'path.timeline_title': { id: 'Module Timeline', en: 'Module Timeline' },
  'path.timeline_badge': { id: '{count} modul', en: '{count} modules' },
  // --- Profile ---
  'profile.loading': { id: 'Memuat profil...', en: 'Loading profile...' },
  'profile.default_name': { id: 'Pengguna', en: 'User' },
  'profile.joined': { id: 'Bergabung {date}', en: 'Joined {date}' },
  'profile.sessions_completed': { id: 'Sesi Selesai', en: 'Sessions Completed' },
  'profile.total_sessions': { id: 'Total Sesi', en: 'Total Sessions' },
  'profile.modules_completed': { id: 'Modul Selesai', en: 'Modules Completed' },
  'profile.daily_streak': { id: 'Daily Streak', en: 'Daily Streak' },
  'profile.active_days': { id: 'Hari Aktif', en: 'Active Days' },
  'profile.total_xp': { id: 'Total XP', en: 'Total XP' },
  'profile.progress': { id: '📊 Progress', en: '📊 Progress' },
  'profile.pct_complete': { id: '{pct}% selesai', en: '{pct}% complete' },
  'profile.sessions_of_total': { id: '✅ {done} sesi dari {total}', en: '✅ {done} sessions of {total}' },
  'profile.modules_of_total': { id: '📦 {done} modul dari {total}', en: '📦 {done} modules of {total}' },
  'profile.badges_section': { id: '🏅 Badge ({count})', en: '🏅 Badges ({count})' },
  'profile.badges_empty': { id: 'Selesaikan sesi untuk membuka badge!', en: 'Complete sessions to unlock badges!' },
  'profile.recent_activity': { id: '📜 Aktivitas Terakhir', en: '📜 Recent Activity' },
  'profile.no_activity': { id: 'Belum ada aktivitas', en: 'No activity' },
  'profile.action_complete': { id: '✅ Menyelesaikan sesi', en: '✅ Completed session' },
  'profile.action_view': { id: '📖 Melihat', en: '📖 Viewed' },
  'profile.motivation_ontrack': { id: '✅ Semua baik! Kamu on track dengan progress belajar. Tetap semangat! 🚀', en: '✅ All good! You are on track with your learning progress. Keep it up! 🚀' },
  'profile.motivation_offtrack': { id: '💪 Yuk lanjutkan belajar! Setiap sesi membawamu lebih dekat ke tujuan. 🎯', en: '💪 Keep studying! Every session brings you closer to your goal. 🎯' },
  'profile.share_title': { id: 'Progres RPL AI - {name}', en: 'RPL AI Progress - {name}' },
  'profile.share_text': { id: 'Aku sudah menyelesaikan {count} sesi di RPL AI Curriculum! 🎯', en: 'I have completed {count} sessions in RPL AI Curriculum! 🎯' },
  'profile.time_just_now': { id: 'baru saja', en: 'just now' },
  'profile.time_min_ago': { id: '{m}m lalu', en: '{m}m ago' },
  'profile.time_hour_ago': { id: '{j}j lalu', en: '{h}h ago' },
  // --- Projects ---
  'projects.title': { id: '🚀 Project Studio', en: '🚀 Project Studio' },
  'projects.subtitle': { id: 'Belajar dengan bikin project nyata, step-by-step. Pilih project, ikuti instruksi, verifikasi kode, dapatkan XP!', en: 'Learn by building real projects, step-by-step. Pick a project, follow instructions, verify code, earn XP!' },
  'projects.filter_all': { id: 'Semua', en: 'All' },
  'projects.filter_beginner': { id: '🌱 Pemula', en: '🌱 Beginner' },
  'projects.filter_intermediate': { id: '📐 Menengah', en: '📐 Intermediate' },
  'projects.filter_advanced': { id: '🚀 Mahir', en: '🚀 Advanced' },
  'projects.empty_title': { id: 'Tidak ada project ditemukan', en: 'No projects found' },
  'projects.empty_desc_filtered': { id: 'Tidak ada project dengan tingkat {level}. Coba pilih filter lain.', en: 'No projects at {level} level. Try another filter.' },
  'projects.empty_desc_generic': { id: 'Belum ada project yang tersedia. Silakan cek lagi nanti.', en: 'No projects available yet. Please check again later.' },
  'projects.empty_cta': { id: 'Lihat Semua Project', en: 'View All Projects' },
  'projects.steps_count': { id: '{count} langkah', en: '{count} steps' },
  // --- Resources ---
  'resources.title': { id: 'PDF Resources', en: 'PDF Resources' },
  'resources.subtitle': { id: 'Download semua modul sebagai PDF — offline-friendly, printable, shareable.', en: 'Download all modules as PDFs — offline-friendly, printable, shareable.' },
  'resources.search': { id: 'Cari modul...', en: 'Search modules...' },
  'resources.loading': { id: 'Memuat...', en: 'Loading...' },
  'resources.empty': { id: 'Tidak ada PDF yang cocok.', en: 'No matching PDFs.' },
  'resources.download': { id: '⬇ Download', en: '⬇ Download' },
  // --- Reviews ---
  'reviews.title': { id: '🔍 Peer Code Review', en: '🔍 Peer Code Review' },
  'reviews.subtitle': { id: 'Minta review kode atau review kode teman', en: 'Request code review or review peer code' },
  'reviews.tab_request': { id: '📝 Minta Review', en: '📝 Request Review' },
  'reviews.tab_review': { id: '👀 Review Teman', en: '👀 Review Peers' },
  'reviews.back': { id: '← Kembali', en: '← Back' },
  'reviews.by_author': { id: 'oleh {author}', en: 'by {author}' },
  'reviews.existing_reviews': { id: 'Review yang sudah diberikan', en: 'Existing Reviews' },
  'reviews.score': { id: 'Nilai: {score}/10', en: 'Score: {score}/10' },
  'reviews.give_review': { id: 'Beri Review', en: 'Give Review' },
  'reviews.feedback_label': { id: 'Feedback', en: 'Feedback' },
  'reviews.feedback_placeholder': { id: 'Tulis review konstruktif...', en: 'Write constructive feedback...' },
  'reviews.score_label': { id: 'Nilai (1-10)', en: 'Score (1-10)' },
  'reviews.submit_review': { id: 'Kirim Review', en: 'Submit Review' },
  'reviews.submitting_review': { id: 'Mengirim...', en: 'Submitting...' },
  'reviews.submit_code': { id: 'Kirim Kode untuk Review', en: 'Submit Code for Review' },
  'reviews.exercise_label': { id: 'Exercise', en: 'Exercise' },
  'reviews.select_exercise': { id: 'Pilih exercise...', en: 'Select exercise...' },
  'reviews.code_label': { id: 'Kode', en: 'Code' },
  'reviews.code_placeholder': { id: 'Tempel kode kamu di sini...', en: 'Paste your code here...' },
  'reviews.submit': { id: 'Kirim', en: 'Submit' },
  'reviews.submitting': { id: 'Mengirim...', en: 'Submitting...' },
  'reviews.my_reviews': { id: 'Review Saya', en: 'My Reviews' },
  'reviews.empty_requests': { id: 'Belum ada permintaan review.', en: 'No review requests yet.' },
  'reviews.empty_reviews': { id: 'Belum ada permintaan review dari teman.', en: 'No peer review requests yet.' },
  'reviews.loading': { id: 'Memuat...', en: 'Loading...' },
  'reviews.status_open': { id: '⏳ Open', en: '⏳ Open' },
  'reviews.status_closed': { id: '✅ Closed', en: '✅ Closed' },
  'reviews.review_count': { id: '{count} review', en: '{count} reviews' },
  'reviews.error_submit': { id: 'Gagal mengirim', en: 'Failed to submit' },
  // --- Study ---
  'study.page_title': { id: '🔬 Study Tools', en: '🔬 Study Tools' },
  'study.page_subtitle': { id: 'Alat bantu belajar untuk meningkatkan fokus dan produktivitas', en: 'Study aids to improve focus and productivity' },
  'study.pomodoro_title': { id: '🍅 Pomodoro Timer', en: '🍅 Pomodoro Timer' },
  'study.pomodoro_desc': { id: '{focus} menit fokus / {break} menit istirahat', en: '{focus} min focus / {break} min break' },
  'study.pomodoro_focus_duration': { id: 'Durasi Fokus:', en: 'Focus Duration:' },
  'study.pomodoro_focus': { id: '🎯 Fokus', en: '🎯 Focus' },
  'study.pomodoro_break': { id: '☕ Istirahat', en: '☕ Break' },
  'study.pomodoro_start': { id: '▶ Mulai', en: '▶ Start' },
  'study.pomodoro_pause': { id: '⏸ Jeda', en: '⏸ Pause' },
  'study.pomodoro_reset': { id: '↺ Reset', en: '↺ Reset' },
  'study.pomodoro_completed': { id: '🍅 {count} pomodoro selesai', en: '🍅 {count} pomodoros completed' },
  'study.reminder_title': { id: '🔔 Reminder', en: '🔔 Reminder' },
  'study.reminder_desc': { id: 'Atur pengingat belajar harian', en: 'Set daily study reminders' },
  'study.reminder_toggle': { id: 'Aktifkan Reminder', en: 'Enable Reminder' },
  'study.reminder_time': { id: 'Waktu', en: 'Time' },
  'study.reminder_days': { id: 'Hari', en: 'Days' },
  'study.reminder_save': { id: 'Simpan', en: 'Save' },
  'study.reminder_saved': { id: '✓ Tersimpan', en: '✓ Saved' },
  'study.reminder_test': { id: 'Test Notification', en: 'Test Notification' },
  'study.quick_links': { id: '🔗 Akses Cepat', en: '🔗 Quick Links' },
  'study.quick_links_desc': { id: 'Lompat ke alat belajar lainnya', en: 'Jump to other study tools' },
  'study.flashcards_today': { id: '{count} kartu hari ini', en: '{count} cards today' },
  'study.ai_tutor_desc': { id: 'Tanya materi RPL', en: 'Ask about RPL material' },
  'study.daily_goal': { id: '🎯 Target Harian', en: '🎯 Daily Goal' },
  'study.goal_save': { id: 'Simpan', en: 'Save' },
  'study.goal_cancel': { id: 'Batal', en: 'Cancel' },
  'study.goal_change': { id: 'Ubah target ({target} sesi/hari)', en: 'Change target ({target} sessions/day)' },
  'study.goal_achieved': { id: '🎉 Target hari ini tercapai!', en: '🎉 Today\'s goal achieved!' },
  'study.goal_sessions': { id: 'sesi', en: 'sessions' },
  'study.streak_calendar': { id: '📅 Streak Kalender', en: '📅 Streak Calendar' },
  'study.streak_desc': { id: '30 hari terakhir — 🔥 {streak} hari streak', en: 'Last 30 days — 🔥 {streak} day streak' },
  'study.streak_active': { id: 'Aktif', en: 'Active' },
  'study.streak_inactive': { id: 'Tidak aktif', en: 'Inactive' },
  'study.streak_legend_active': { id: 'Aktif', en: 'Active' },
  'study.streak_legend_inactive': { id: 'Tidak aktif', en: 'Inactive' },
  'study.stats_title': { id: '📊 Statistik Belajar', en: '📊 Study Statistics' },
  'study.stats_desc': { id: 'Rangkuman progress belajarmu', en: 'Summary of your learning progress' },
  'study.stats_sessions_completed': { id: 'Sesi selesai', en: 'Sessions completed' },
  'study.stats_total_progress': { id: 'Progress total', en: 'Total progress' },
  'study.stats_streak': { id: 'Streak (hari)', en: 'Streak (days)' },
  'study.stats_today_sessions': { id: 'Sesi hari ini', en: 'Today sessions' },
  'study.stats_total_modules': { id: 'Total modul', en: 'Total modules' },
  'study.stats_minutes_studied': { id: 'Menit belajar', en: 'Minutes studied' },
  'study.calendar_title': { id: '📅 Google Calendar', en: '📅 Google Calendar' },
  'study.calendar_desc': { id: 'Sinkronkan jadwal belajar ke Google Calendar', en: 'Sync study schedule to Google Calendar' },
  'study.calendar_info': { id: 'Download file .ics untuk diimpor ke Google Calendar, Apple Calendar, atau Outlook.', en: 'Download .ics file to import into Google Calendar, Apple Calendar, or Outlook.' },
  'study.calendar_sync': { id: '📥 Sync ke Google Calendar', en: '📥 Sync to Google Calendar' },
  'study.discord_title': { id: '🔔 Discord', en: '🔔 Discord' },
  'study.discord_desc': { id: 'Notifikasi belajar via Discord webhook', en: 'Study notifications via Discord webhook' },
  'study.discord_info': { id: 'Notifikasi Discord akan dikirim untuk pengingat belajar, streak, dan pencapaian.', en: 'Discord notifications will be sent for study reminders, streaks, and achievements.' },
  'study.discord_note': { id: 'Konfigurasi webhook URL melalui environment variable', en: 'Configure webhook URL via environment variable' },
  'study.notification_test_title': { id: 'Test Notifikasi', en: 'Test Notification' },
  'study.notification_test_body': { id: 'Notifikasi berhasil! 🔔', en: 'Notification successful! 🔔' },
  'study.notification_denied': { id: 'Izin notifikasi belum diberikan. Periksa pengaturan browser.', en: 'Notification permission not granted. Check browser settings.' },
  'study.day_min': { id: 'Min', en: 'Sun' },
  'study.day_mon': { id: 'Sen', en: 'Mon' },
  'study.day_tue': { id: 'Sel', en: 'Tue' },
  'study.day_wed': { id: 'Rab', en: 'Wed' },
  'study.day_thu': { id: 'Kam', en: 'Thu' },
  'study.day_fri': { id: 'Jum', en: 'Fri' },
  'study.day_sat': { id: 'Sab', en: 'Sat' },
  // --- Videos ---
  'videos.page_title': { id: '🎬 Video Pembelajaran', en: '🎬 Learning Videos' },
  'videos.subtitle': { id: 'Koleksi video pembelajaran RPL AI Curriculum. {modules} modul · {videos} video', en: 'RPL AI Curriculum video collection. {modules} modules · {videos} videos' },
  'videos.filter_module': { id: 'Semua Modul', en: 'All Modules' },
  'videos.filter_level': { id: 'Semua Level', en: 'All Levels' },
  'videos.search': { id: 'Cari video...', en: 'Search videos...' },
  'videos.loading': { id: 'Memuat video...', en: 'Loading videos...' },
  'videos.empty': { id: 'Tidak ada video ditemukan.', en: 'No videos found.' },
  'videos.error': { id: 'Gagal memuat data video.', en: 'Failed to load video data.' },
  'videos.playlist_link': { id: '📺 Lihat Playlist Lengkap →', en: '📺 View Full Playlist →' },
  'videos.level_beginner': { id: '🔵 Beginner', en: '🔵 Beginner' },
  'videos.level_intermediate': { id: '🟡 Intermediate', en: '🟡 Intermediate' },
  'videos.level_advanced': { id: '🟣 Advanced', en: '🟣 Advanced' },
};

// === PAGE-SPECIFIC TRANSFORMATIONS ===
// Each entry: [filePath, replacements]
// replacements: array of [oldString, newString]
const PAGE_TRANSFORMS = {};

function addImport(content) {
  if (content.includes("import { t } from '$lib/stores/i18n.svelte'")) return content;
  return content.replace(
    /<script lang="ts">/,
    `<script lang="ts">\n\timport { t } from '$lib/stores/i18n.svelte';`
  );
}

function safeReplace(content, oldStr, newStr) {
  if (content.includes(oldStr)) {
    // Unique check - if multiple occurrences, warn
    const idx = content.indexOf(oldStr);
    const idx2 = content.indexOf(oldStr, idx + 1);
    if (idx2 !== -1) {
      console.warn(`  WARNING: multiple occurrences of "${oldStr.substring(0, 40)}" - replacing first only`);
    }
    return content.replace(oldStr, newStr);
  }
  console.warn(`  NOT FOUND: "${oldStr.substring(0, 60)}..."`);
  return content;
}

// ============================================================
// Build replacement maps for each file
// ============================================================

// --- Login ---
PAGE_TRANSFORMS['src/routes/(public)/login/+page.svelte'] = [
  ["Selamat datang di RPL AI Curriculum", "{t('login.title')}"],
  ["Masuk untuk melanjutkan perjalanan belajar", "{t('login.subtitle')}"],
  ["Email atau NISN", "{t('login.email_or_nisn')}"],
  ["Kata Sandi", "{t('login.password')}"],
  ["Masuk", "{t('login.signin')}"],
  ["Belum punya akun?", "{t('login.no_account')}"],
  ["Daftar di sini", "{t('login.register_here')}"],
  ["Email/NISN atau kata sandi salah.", "{t('login.error_generic')}"],
  ["Atau lanjutkan dengan", "{t('login.or_continue_with')}"],
  ["Lanjut sebagai Tamu", "{t('login.continue_as_guest')}"],
  ["Akun Demo", "{t('login.test_credentials')}"],
  // The svelte:head title
  ["Login — RPL AI Curriculum", "{t('login.title')} — RPL AI Curriculum"],
];

// --- Register ---
PAGE_TRANSFORMS['src/routes/register/instructor/+page.svelte'] = [
  ["Daftar Akun Baru", "{t('register.title')}"],
  ["Daftar untuk mulai belajar", "{t('register.subtitle')}"],
  ["Nama Lengkap", "{t('register.fullname')}"],
  ["Email", "{t('register.email')}"],
  ["NISN", "{t('register.nisn')}"],
  ["Kata Sandi", "{t('register.password')}"],
  ["Konfirmasi Kata Sandi", "{t('register.confirm_password')}"],
  ["Nomor Telepon", "{t('register.phone')}"],
  ["Siswa", "{t('register.role_student')}"],
  ["Instruktur", "{t('register.role_instructor')}"],
  ["Daftar", "{t('register.register_btn')}"],
  ["Sudah punya akun?", "{t('register.have_account')}"],
  ["Masuk di sini", "{t('register.login_here')}"],
  ["Daftar sebagai Instruktur", "{t('register.as_instructor')}"],
  ["Bio / Pengalaman", "{t('register.bio')}"],
  ["Spesialisasi", "{t('register.specialization')}"],
  ["Wajib diisi", "{t('register.required')}"],
  ["Register Instruktur — RPL AI Curriculum", "{t('register.as_instructor')} — RPL AI Curriculum"],
];

// --- Certificate ---
PAGE_TRANSFORMS['src/routes/(public)/certificate/+page.svelte'] = [
  ["Sertifikat Kelulusan", "{t('certificate.title')}"],
  ["Cetak sertifikat kelulusan untuk setiap modul yang sudah kamu selesaikan.", "{t('certificate.subtitle')}"],
  ["Belum ada sertifikat yang tersedia.", "{t('certificate.empty')}"],
  ["Selesaikan modul untuk mendapatkan sertifikat.", "{t('certificate.empty_hint')}"],
  ["Lihat Sertifikat", "{t('certificate.view')}"],
  ["Download PDF", "{t('certificate.download')}"],
  ["Diselesaikan pada", "{t('certificate.completed_on')}"],
  ["Modul", "{t('certificate.module')}"],
  ["Siswa", "{t('certificate.student')}"],
  ["Tanggal", "{t('certificate.date')}"],
  ["Cetak", "{t('certificate.print')}"],
  ["Sertifikat — RPL AI Curriculum", "{t('certificate.title')} — RPL AI Curriculum"],
];

// --- Announcements ---
PAGE_TRANSFORMS['src/routes/(public)/announcements/+page.svelte'] = [
  ["Pengumuman", "{t('announcements.title')}"],
  ["Memuat pengumuman...", "{t('announcements.loading')}"],
  ["Belum ada pengumuman.", "{t('announcements.empty')}"],
  ["Gagal memuat pengumuman.", "{t('announcements.error')}"],
  ["📌 Disematkan", "{t('announcements.pinned')}"],
  ["oleh", "{t('announcements.by')}"],
  ["Baca selengkapnya", "{t('announcements.read_more')}"],
  ["Tutup", "{t('announcements.show_less')}"],
  ["Pengumuman — RPL AI Curriculum", "{t('announcements.title')} — RPL AI Curriculum"],
];

// --- Feed ---
PAGE_TRANSFORMS['src/routes/(public)/feed/+page.svelte'] = [
  ["Aktivitas Terbaru", "{t('feed.title')}"],
  ["Belum ada aktivitas. Mulai belajar!", "{t('feed.empty')}"],
  ["Feed Aktivitas — RPL AI Curriculum", "{t('feed.title')} — RPL AI Curriculum"],
];

// --- Catalog ---
PAGE_TRANSFORMS['src/routes/catalog/+page.svelte'] = [
  ["Katalog Mata Pelajaran", "{t('catalog.title')}"],
  ["Memuat katalog...", "{t('catalog.loading')}"],
  ["Tidak ada mata pelajaran.", "{t('catalog.empty')}"],
  ["Cari mata pelajaran...", "{t('catalog.search')}"],
  ["Semua Tingkat", "{t('catalog.all_levels')}"],
  ["Pemula", "{t('catalog.beginner')}"],
  ["bab", "{t('catalog.chapters')}"],
  ["sesi", "{t('catalog.sessions')}"],
  ["Mulai Belajar", "{t('catalog.start')}"],
  ["Lanjutkan", "{t('catalog.continue')}"],
  ["Katalog Mata Pelajaran — RPL AI Curriculum", "{t('catalog.title')} — RPL AI Curriculum"],
];

// --- Dashboard ---
PAGE_TRANSFORMS['src/routes/dashboard/+page.svelte'] = [
  ["Dashboard", "{t('dashboard.title')}"],
  ["Selamat datang", "{t('dashboard.welcome')}"],
  ["Modul Selesai", "{t('dashboard.modules_completed')}"],
  ["Sesi Selesai", "{t('dashboard.sessions_done')}"],
  ["Total Sesi", "{t('dashboard.total_sessions')}"],
  ["Streak", "{t('dashboard.streak')}"],
  ["Progress", "{t('dashboard.overall_progress')}"],
  ["Aktivitas Terbaru", "{t('dashboard.recent_activity')}"],
  ["Lanjut Belajar", "{t('dashboard.continue_learning')}"],
  ["XP", "{t('dashboard.xp')}"],
  ["Lencana", "{t('dashboard.badges')}"],
  ["Akses Cepat", "{t('dashboard.quick_links')}"],
  ["Dashboard — RPL AI Curriculum", "{t('dashboard.title')} — RPL AI Curriculum"],
];

// --- Search ---
PAGE_TRANSFORMS['src/routes/search/+page.svelte'] = [
  ["Cari", "{t('search.title')}"],
  ["Cari pelajaran, kursus, kelas...", "{t('search.placeholder')}"],
  ["Pelajaran", "{t('search.lessons')}"],
  ["Kursus", "{t('search.courses')}"],
  ["Kelas", "{t('search.classes')}"],
  ["Tidak ada hasil", "{t('search.no_results')}"],
  ["Mencari...", "{t('search.loading')}"],
  ["Cari — RPL AI Curriculum", "{t('search.title')} — RPL AI Curriculum"],
];

// --- Badges ---
PAGE_TRANSFORMS['src/routes/badges/+page.svelte'] = [
  [`<title>🏆 Badges — RPL AI Curriculum</title>`, `<title>{t('badges.page_title')} — RPL AI Curriculum</title>`],
  [`<h1>🏆 Badges</h1>`, `<h1>{t('badges.page_title')}</h1>`],
  [`Level `, `{t('badges.level')} `],
  [`badges unlocked`, `{t('badges.unlocked_count', { unlocked: totalUnlocked, total: totalBadges })}`],
  [`Selesaikan tantangan untuk membuka`, `{t('badges.locked_hint')}`],
  [`Diraih:`, `{t('badges.earned_on')}`],
  [`title="Badges RPL AI - {totalUnlocked} badges"`, `title={t('badges.share_title', { count: totalUnlocked })}`],
  [`text="Aku sudah membuka {totalUnlocked} dari {totalBadges} badges di RPL AI Curriculum! 🏆"`, `text={t('badges.share_text', { unlocked: totalUnlocked, total: totalBadges })}`],
];

// --- Challenges ---
PAGE_TRANSFORMS['src/routes/challenges/+page.svelte'] = [
  ["<h1>🏋️ Daily Challenges</h1>", "<h1>{t('challenges.title')}</h1>"],
  ["Latihan coding harian dari level dasar sampai mahir. Klik tantangan untuk melihat soal dan coba selesaikan.", "{t('challenges.desc')}"],
  ["Cari tantangan...", "{t('challenges.search')}"],
  ["Tidak ada hasil", "{t('challenges.no_results')}"],
  [`loading = $state(true);\n\tlet errorMsg = $state('');`, `loading = $state(true);\n\tlet errorMsg = $state('');\n\tlet _ = $derived(t(''));`],
  // Replace the loading text
  ["Memuat...", "{t('challenges.loading')}"],
  ["Pilih tantangan dari daftar di samping untuk melihat soal.", "{t('challenges.select_hint')}"],
  ["Gagal memuat challenges", "{t('challenges.error_load')}"],
];

// --- Exercises ---
PAGE_TRANSFORMS['src/routes/exercises/+page.svelte'] = [
  [`<title>🏋️ Latihan Soal — RPL AI Curriculum</title>`, `<title>{t('exercises.page_title')} — RPL AI Curriculum</title>`],
  [`<h1>🏋️ Latihan Soal</h1>`, `<h1>{t('exercises.page_title')}</h1>`],
  ["Latihan interaktif untuk setiap modul — tambah pemahaman sebelum lanjut.", "{t('exercises.page_desc')}"],
  ["Memuat latihan...", "{t('exercises.loading')}"],
  ["Gagal memuat data latihan.", "{t('exercises.error')}"],
  ["Cari latihan...", "{t('exercises.search')}"],
  ["Semua Level", "{t('exercises.all_levels')}"],
  ["Semua Tipe", "{t('exercises.all_types')}"],
  [`filtered.length} dari `, `{t('exercises.count', { filtered: filtered.length, total: exercisesData.exercises.length })}`],
  // Complex: the count span
  [`<span class=\"count\">{filtered.length} dari {exercisesData.exercises.length} latihan</span>`, `<span class=\"count\">{t('exercises.count', { filtered: filtered.length, total: exercisesData.exercises.length })}</span>`],
  // Recommendation section
  [`🎯 Rekomendasi untukmu (level `, `{t('exercises.recommendation_title', { level: `],
  [`)</h2>`, `})}</h2>`],
  ["Mulai dengan latihan dasar untuk membangun fondasi.", "{t('exercises.rec_beginner')}"],
  ["Kamu sudah siap untuk latihan tingkat menengah. Terus tingkatkan!", "{t('exercises.rec_intermediate')}"],
  ["Kamu sudah mahir! Coba latihan tingkat lanjut.", "{t('exercises.rec_advanced')}"],
  [`<span class="badge rec-badge">🎯 Rekomendasi</span>`, `<span class="badge rec-badge">{t('exercises.rec_badge')}</span>`],
  ["Tidak ada deskripsi.", "{t('exercises.no_desc')}"],
  ["Tidak ada latihan untuk level ini. Coba filter lain.", "{t('exercises.empty_rec')}"],
  ["Tidak ada latihan yang cocok dengan filter.", "{t('exercises.empty_filtered')}"],
];

// --- Flashcards ---
PAGE_TRANSFORMS['src/routes/flashcards/+page.svelte'] = [
  [`<h1>🃏 Flashcards</h1>`, `<h1>{t('flashcards.page_title')}</h1>`],
  ["Kartu belajar dengan sistem pengulangan terjadwal (spaced repetition)", "{t('flashcards.subtitle')}"],
  ["Jatuh Tempo Hari Ini", "{t('flashcards.due_today')}"],
  ["Total Kartu", "{t('flashcards.total_cards')}"],
  ["Diketahui", "{t('flashcards.known')}"],
  ["Sedang Dipelajari", "{t('flashcards.learning')}"],
  ["Kartu Baru", "{t('flashcards.new_cards')}"],
  ["Deck", "{t('flashcards.decks_label')}"],
  [`benar`, `{t('flashcards.correct')}`],
  [`{counts.total > 0 ? Math.round((reviewStats.totalCorrect / Math.max(reviewStats.totalReviewed, 1)) * 100) : 0}% akurasi`, `t('flashcards.accuracy', { pct: counts.total > 0 ? Math.round((reviewStats.totalCorrect / Math.max(reviewStats.totalReviewed, 1)) * 100) : 0 })`],
  ["🔥 Streak: {reviewStats.streak} (rekor: {reviewStats.bestStreak})", `{t('flashcards.streak', { streak: reviewStats.streak, best: reviewStats.bestStreak })}`],
  ["📅 Total review: {reviewStats.totalReviewed}", `{t('flashcards.total_reviewed', { count: reviewStats.totalReviewed })}`],
  ["📂 Deck Berdasarkan Modul", "{t('flashcards.decks_by_module')}"],
  [`{deck.cardCount} kartu`, `{t('flashcards.cards_count', { count: deck.cardCount })}`],
  ["📝 Quiz", "{t('flashcards.cat_quiz')}"],
  ["📖 Ringkasan", "{t('flashcards.cat_summary')}"],
  ["✏️ Custom", "{t('flashcards.cat_custom')}"],
  ["Review", "{t('flashcards.review_btn')}"],
  ["Hapus", "{t('flashcards.delete_btn')}"],
  ["⚙️ Kelola Flashcards", "{t('flashcards.manage_title')}"],
  ["Pilih Modul:", "{t('flashcards.select_module')}"],
  ["-- Pilih Modul --", "{t('flashcards.select_placeholder')}"],
  ["🎴 Generate Flashcards", "{t('flashcards.generate_btn')}"],
  ["⏳ Membuat...", "{t('flashcards.generating')}"],
  ["✅ {generationResult.count} kartu baru dibuat!", `{t('flashcards.generated', { count: generationResult.count })}`],
  ["🚀 Mulai Review ({counts.dueToday} kartu jatuh tempo)", `{t('flashcards.start_review', { count: counts.dueToday })}`],
  [`Hapus semua kartu dari deck "`, `t('flashcards.delete_confirm', { slug: `],
  [`"?` , ` }) + "?`],
  [`if (!confirm(\`Hapus semua kartu dari deck "`, `if (!confirm(t('flashcards.delete_confirm', { slug: `],
  [`\"?\`)) return;`, `}) + "\"?`],

];

// --- Glossary ---
PAGE_TRANSFORMS['src/routes/glossary/+page.svelte'] = [
  [`<h1>📖 Glossary</h1>`, `<h1>{t('glossary.title')}</h1>`],
  ["Istilah-istilah penting seputar web development, JavaScript, TypeScript, database, DevOps, AI, dan framework.", "{t('glossary.desc')}"],
  ["Cari istilah...", "{t('glossary.search')}"],
  ["Tidak ada hasil", "{t('glossary.no_results')}"],
  ["Memuat...", "{t('glossary.loading')}"],
  ["Pilih istilah dari daftar di samping untuk melihat penjelasan.", "{t('glossary.select_hint')}"],
  ["Gagal memuat data glossary", "{t('glossary.error_load')}"],
];

// --- History ---
PAGE_TRANSFORMS['src/routes/history/+page.svelte'] = [
  [`<h1>📜 Riwayat Aktivitas</h1>`, `<h1>{t('history.title')}</h1>`],
  ["🗑️ Hapus Riwayat", "{t('history.clear')}"],
  ["Semua", "{t('history.filter_all')}"],
  ["👁️ Dilihat", "{t('history.filter_viewed')}"],
  ["✅ Selesai", "{t('history.filter_completed')}"],
  ["Hapus seluruh riwayat aktivitas?", "{t('history.confirm_clear')}"],
  ["Batal", "{t('history.confirm_cancel')}"],
  ["Ya, Hapus", "{t('history.confirm_yes')}"],
  ["Belum ada aktivitas", "{t('history.empty')}"],
  // actionLabel function - these are in JS context, use string concat
  // Actually these are function returns, needs special handling
  // We'll handle these separately
  ["return 'Melihat'", `return t('history.action_view')`],
  ["return 'Menyelesaikan'", `return t('history.action_complete')`],
  ["return 'Mengerjakan Quiz'", `return t('history.action_quiz')`],
  // relativeTime function
  ["return 'baru saja'", `return t('history.time_just_now')`],
  ["return `${min} menit lalu`", `return t('history.time_min_ago', { min })`],
  ["return `${hour} jam lalu`", `return t('history.time_hour_ago', { hour })`],
  ["return `${day} hari lalu`", `return t('history.time_day_ago', { day })`],
];

// --- Insights ---
PAGE_TRANSFORMS['src/routes/insights/+page.svelte'] = [
  [`<h1 class="page-title">📊 Learning Insights</h1>`, `<h1 class="page-title">{t('insights.title')}</h1>`],
  ["Wawasan belajar dan analisis progress", "{t('insights.subtitle')}"],
  ["Memuat insights...", "{t('insights.loading')}"],
  ["Gagal memuat insights", "{t('insights.error')}"],
  ["Total Aktivitas", "{t('insights.total_activity')}"],
  ["Sesi Selesai", "{t('insights.sessions_done')}"],
  ["Streak (hari)", "{t('insights.streak_days')}"],
  ["Rata-rata Harian", "{t('insights.daily_avg')}"],
  [`<h2>🔥 Activity Heatmap</h2>`, `<h2>{t('insights.heatmap')}</h2>`],
  [`<h2>⏰ Waktu Belajar per Jam</h2>`, `<h2>{t('insights.time_per_hour')}</h2>`],
  [`title="{count} aktivitas jam {i}:00"`, `title={t('insights.tooltip_activity', { count, hour: i })}`],
  [`<h2>⚠️ Topik Lemah (&lt;50% completion)</h2>`, `<h2>{t('insights.weak_topics')}</h2>`],
  ["Selesaikan modul-modul ini untuk memperkuat pemahamanmu.", "{t('insights.weak_hint')}"],
  [`<h2>📈 Prediksi Penyelesaian</h2>`, `<h2>{t('insights.predictions')}</h2>`],
  ["Jika kamu belajar", "{t('insights.pred_if_study')}"],
  ["sesi/hari", "{t('insights.pred_sessions_per_day')}"],
  ["Hitung", "{t('insights.pred_calculate')}"],
  ["{pred.sessionsDone}/{pred.totalSessions} sesi", `{t('insights.pred_sessions_progress', { done: pred.sessionsDone, total: pred.totalSessions })}`],
  ["Belum cukup data untuk prediksi. Mulai belajar!", "{t('insights.pred_no_data')}"],
  [`<h2>📜 Aktivitas Terbaru</h2>`, `<h2>{t('insights.recent_activity')}</h2>`],
  ["Belum ada aktivitas tercatat.", "{t('insights.no_activity')}"],
];

// --- Leaderboard ---
PAGE_TRANSFORMS['src/routes/leaderboard/+page.svelte'] = [
  [`<title>🏆 Papan Peringkat — RPL AI Curriculum</title>`, `<title>{t('leaderboard.page_title')} — RPL AI Curriculum</title>`],
  [`<h1 class="page-title">🏆 Papan Peringkat</h1>`, `<h1 class="page-title">{t('leaderboard.page_title')}</h1>`],
  ["Top users ranked by XP — terus belajar untuk naik peringkat!", "{t('leaderboard.subtitle')}"],
  ["text=\"Lihat papan peringkat RPL AI Curriculum! 🏆\"", `text={t('leaderboard.share_text')}`],
  ["🌍 Global", "{t('leaderboard.global_tab')}"],
  ["📚 Per Path", "{t('leaderboard.path_tab')}"],
  ["Pilih Path", "{t('leaderboard.select_path')}"],
  // formatUserId returns 'Kamu'
  ["if (id === currentUserId) return 'Kamu'", `if (id === currentUserId) return t('leaderboard.you')`],
  [`Kamu</span>`, `{t('leaderboard.you_badge')}</span>`],
  [`Level `, `{t('leaderboard.level', { level: `],
  // The Level N in template - need to handle carefully
  [`Level {entry.level}`, `{t('leaderboard.level', { level: entry.level })}`],
  [`XP</span>`, `{t('leaderboard.stat_xp')}</span>`],
  [`Badges</span>`, `{t('leaderboard.stat_badges')}</span>`],
  ["Belum ada data peringkat.", "{t('leaderboard.empty')}"],
  ["Selesaikan sesi untuk mendapat XP dan muncul di papan peringkat!", "{t('leaderboard.empty_hint')}"],
];

// --- Path ---
PAGE_TRANSFORMS['src/routes/path/+page.svelte'] = [
  [">🗺️ Learning Paths</button>", `>{t('path.tab_paths')}</button>`],
  [">📋 Module Timeline</button>", `>{t('path.tab_timeline')}</button>`],
  [`<h1>🗺️ Learning Paths</h1>`, `<h1>{t('path.header_title')}</h1>`],
  ["Pilih jalur belajar yang sesuai dengan tujuan karirmu", "{t('path.header_desc')}"],
  ["Path", "{t('path.stat_path')}"],
  ["Modul", "{t('path.stat_module')}"],
  ["Sesi", "{t('path.stat_session')}"],
  ["sesi", "{t('path.sessions_unit')}"],
  ["📌 Prasyarat", "{t('path.prereq')}"],
  ["Lanjutkan &rarr;", "{t('path.continue')}"],
  ["<strong>{stat.count}</strong> modul", `<strong>{stat.count}</strong> {t('path.module_count', { count: stat.count })}`],
  ["<strong>{stat.sessions}</strong> sesi", `<strong>{stat.sessions}</strong> {t('path.session_count', { count: stat.sessions })}`],
  ["Total Modul", "{t('path.total_modules')}"],
  ["Total Sesi", "{t('path.total_sessions')}"],
  ["Perkiraan Menit", "{t('path.est_minutes')}"],
  ["Modul Selesai", "{t('path.modules_completed')}"],
  ["Module Timeline", "{t('path.timeline_title')}"],
  ["{totalModules} modul", `{t('path.timeline_badge', { count: totalModules })}`],
  [`{mod.sessions.length} sesi`, `{t('path.session_count', { count: mod.sessions.length })}`],
  [`{path.estimatedSessions} sesi`, `{t('path.session_count', { count: path.estimatedSessions })}`],
];

// --- Profile ---
PAGE_TRANSFORMS['src/routes/profile/+page.svelte'] = [
  ["Memuat profil...", "{t('profile.loading')}"],
  ["Pengguna", "{t('profile.default_name')}"],
  ["Bergabung {userData?.created_at ? formatDate(userData.created_at) : '—'}", `{t('profile.joined', { date: userData?.created_at ? formatDate(userData.created_at) : '—' })}`],
  ["Sesi Selesai", "{t('profile.sessions_completed')}"],
  ["Total Sesi", "{t('profile.total_sessions')}"],
  ["Modul Selesai", "{t('profile.modules_completed')}"],
  ["Daily Streak", "{t('profile.daily_streak')}"],
  ["Hari Aktif", "{t('profile.active_days')}"],
  ["Total XP", "{t('profile.total_xp')}"],
  [`<h2>📊 Progress</h2>`, `<h2>{t('profile.progress')}</h2>`],
  ["{completionPct}% selesai", `{t('profile.pct_complete', { pct: completionPct })}`],
  ["✅ {stats.completedSessions} sesi dari {stats.totalSessions}", `{t('profile.sessions_of_total', { done: stats.completedSessions, total: stats.totalSessions })}`],
  ["📦 {stats.modulesCompleted} modul dari {modules.length}", `{t('profile.modules_of_total', { done: stats.modulesCompleted, total: modules.length })}`],
  ["🏅 Badge ({badges.length})", `{t('profile.badges_section', { count: badges.length })}`],
  ["Selesaikan sesi untuk membuka badge!", "{t('profile.badges_empty')}"],
  [`<h2>📜 Aktivitas Terakhir</h2>`, `<h2>{t('profile.recent_activity')}</h2>`],
  ["Belum ada aktivitas", "{t('profile.no_activity')}"],
  ["✅ Menyelesaikan sesi", "{t('profile.action_complete')}"],
  ["📖 Melihat", "{t('profile.action_view')}"],
  ["✅ Semua baik! Kamu on track dengan progress belajar. Tetap semangat! 🚀", "{t('profile.motivation_ontrack')}"],
  ["💪 Yuk lanjutkan belajar! Setiap sesi membawamu lebih dekat ke tujuan. 🎯", "{t('profile.motivation_offtrack')}"],
  ["baru saja", "{t('profile.time_just_now')}"],
  ["${Math.floor(diff / 60000)}m lalu", `{t('profile.time_min_ago', { m: Math.floor(diff / 60000) })}`],
  ["${Math.floor(diff / 3600000)}j lalu", `{t('profile.time_hour_ago', { j: Math.floor(diff / 3600000) })}`],
  ['title="Progres RPL AI - {userData?.username || \'Pengguna\'}"', `title={t('profile.share_title', { name: userData?.username || t('profile.default_name') })}`],
  [`text="Aku sudah menyelesaikan {stats.completedSessions} sesi di RPL AI Curriculum! 🎯"`, `text={t('profile.share_text', { count: stats.completedSessions })}`],
];

// --- Projects ---
PAGE_TRANSFORMS['src/routes/projects/+page.svelte'] = [
  [`<h1>🚀 Project Studio</h1>`, `<h1>{t('projects.title')}</h1>`],
  ["Belajar dengan bikin project nyata, step-by-step. Pilih project, ikuti instruksi, verifikasi kode, dapatkan XP!", "{t('projects.subtitle')}"],
  ["Semua", "{t('projects.filter_all')}"],
  ["🌱 Pemula", "{t('projects.filter_beginner')}"],
  ["📐 Menengah", "{t('projects.filter_intermediate')}"],
  ["🚀 Mahir", "{t('projects.filter_advanced')}"],
  ["Tidak ada project ditemukan", "{t('projects.empty_title')}"],
  ["Tidak ada project dengan tingkat <strong>{filterDifficulty}</strong>. Coba pilih filter lain.", `{t('projects.empty_desc_filtered', { level: filterDifficulty })}`],
  ["Belum ada project yang tersedia. Silakan cek lagi nanti.", "{t('projects.empty_desc_generic')}"],
  ["Lihat Semua Project", "{t('projects.empty_cta')}"],
  ["{project.steps.length} langkah", `{t('projects.steps_count', { count: project.steps.length })}`],
];

// --- Resources ---
PAGE_TRANSFORMS['src/routes/resources/+page.svelte'] = [
  [`<h1>PDF Resources</h1>`, `<h1>{t('resources.title')}</h1>`],
  ["Download semua modul sebagai PDF — offline-friendly, printable, shareable.", "{t('resources.subtitle')}"],
  ["Cari modul...", "{t('resources.search')}"],
  ["Memuat...", "{t('resources.loading')}"],
  ["Tidak ada PDF yang cocok.", "{t('resources.empty')}"],
  ["⬇ Download", "{t('resources.download')}"],
  ["PDF Resources — RPL AI", `{t('resources.title')} — RPL AI`],
];

// --- Reviews ---
PAGE_TRANSFORMS['src/routes/reviews/+page.svelte'] = [
  [`<h1>🔍 Peer Code Review</h1>`, `<h1>{t('reviews.title')}</h1>`],
  ["Minta review kode atau review kode teman", "{t('reviews.subtitle')}"],
  ["📝 Minta Review", "{t('reviews.tab_request')}"],
  ["👀 Review Teman", "{t('reviews.tab_review')}"],
  ["← Kembali", "{t('reviews.back')}"],
  ["oleh {selectedRequest.author_name || selectedRequest.user_id?.slice(0, 8)}", `{t('reviews.by_author', { author: selectedRequest.author_name || selectedRequest.user_id?.slice(0, 8) })}`],
  [`<h4>Review yang sudah diberikan</h4>`, `<h4>{t('reviews.existing_reviews')}</h4>`],
  ["Nilai: {rev.score ?? '-'}/10", `{t('reviews.score', { score: rev.score ?? '-' })}`],
  [`<h4>Beri Review</h4>`, `<h4>{t('reviews.give_review')}</h4>`],
  ["<label for=\"feedback\">Feedback</label>", "<label for=\"feedback\">{t('reviews.feedback_label')}</label>"],
  ["Tulis review konstruktif...", "{t('reviews.feedback_placeholder')}"],
  ["<label for=\"score\">Nilai (1-10)</label>", "<label for=\"score\">{t('reviews.score_label')}</label>"],
  ["Kirim Review", "{t('reviews.submit_review')}"],
  ["Mengirim...", "{t('reviews.submitting_review')}"],
  [`<h3>Kirim Kode untuk Review</h3>`, `<h3>{t('reviews.submit_code')}</h3>`],
  ["<label for=\"ex-slug\">Exercise</label>", "<label for=\"ex-slug\">{t('reviews.exercise_label')}</label>"],
  ["Pilih exercise...", "{t('reviews.select_exercise')}"],
  ["<label for=\"code-input\">Kode</label>", "<label for=\"code-input\">{t('reviews.code_label')}</label>"],
  ["Tempel kode kamu di sini...", "{t('reviews.code_placeholder')}"],
  ["Kirim", "{t('reviews.submit')}"],
  [`<h3>Review Saya</h3>`, `<h3>{t('reviews.my_reviews')}</h3>`],
  ["Belum ada permintaan review.", "{t('reviews.empty_requests')}"],
  ["Belum ada permintaan review dari teman.", "{t('reviews.empty_reviews')}"],
  ["⏳ Open", "{t('reviews.status_open')}"],
  ["✅ Closed", "{t('reviews.status_closed')}"],
  ["{req.review_count} review", `{t('reviews.review_count', { count: req.review_count })}`],
  ["Gagal mengirim", "{t('reviews.error_submit')}"],
  ["Memuat...", "{t('reviews.loading')}"],
];

// --- Study ---
PAGE_TRANSFORMS['src/routes/study/+page.svelte'] = [
  [`<h1>🔬 Study Tools</h1>`, `<h1>{t('study.page_title')}</h1>`],
  ["Alat bantu belajar untuk meningkatkan fokus dan produktivitas", "{t('study.page_subtitle')}"],
  // Pomodoro
  [`<h2>🍅 Pomodoro Timer</h2>`, `<h2>{t('study.pomodoro_title')}</h2>`],
  ["{focusMinutes} menit fokus / {breakMinutes} menit istirahat", `{t('study.pomodoro_desc', { focus: focusMinutes, break: breakMinutes })}`],
  ["Durasi Fokus:", "{t('study.pomodoro_focus_duration')}"],
  ["🎯 Fokus", "{t('study.pomodoro_focus')}"],
  ["☕ Istirahat", "{t('study.pomodoro_break')}"],
  ["▶ Mulai", "{t('study.pomodoro_start')}"],
  ["⏸ Jeda", "{t('study.pomodoro_pause')}"],
  ["↺ Reset", "{t('study.pomodoro_reset')}"],
  ["🍅 {pomodoroCount} pomodoro selesai", `{t('study.pomodoro_completed', { count: pomodoroCount })}`],
  // {timerMode === 'focus' ? '🎯 Fokus' : '☕ Istirahat'} - already handled
  // Reminder
  [`<h2>🔔 Reminder</h2>`, `<h2>{t('study.reminder_title')}</h2>`],
  ["Atur pengingat belajar harian", "{t('study.reminder_desc')}"],
  ["Aktifkan Reminder", "{t('study.reminder_toggle')}"],
  ["Waktu", "{t('study.reminder_time')}"],
  ["Hari", "{t('study.reminder_days')}"],
  ["Simpan", "{t('study.reminder_save')}"],
  ["✓ Tersimpan", "{t('study.reminder_saved')}"],
  ["Test Notification", "{t('study.reminder_test')}"],
  // Quick Links
  [`<h2>🔗 Akses Cepat</h2>`, `<h2>{t('study.quick_links')}</h2>`],
  ["Lompat ke alat belajar lainnya", "{t('study.quick_links_desc')}"],
  ["{flashcardCounts.dueToday} kartu hari ini", `{t('study.flashcards_today', { count: flashcardCounts.dueToday })}`],
  ["Tanya materi RPL", "{t('study.ai_tutor_desc')}"],
  // Daily Goal
  [`<h3>🎯 Target Harian</h3>`, `<h3>{t('study.daily_goal')}</h3>`],
  ["Simpan", "{t('study.goal_save')}"],
  ["Batal", "{t('study.goal_cancel')}"],
  ["Ubah target ({dailyTarget} sesi/hari)", `{t('study.goal_change', { target: dailyTarget })}`],
  ["🎉 Target hari ini tercapai!", "{t('study.goal_achieved')}"],
  ["sesi", "{t('study.goal_sessions')}"],
  // Streak Calendar
  [`<h2>📅 Streak Kalender</h2>`, `<h2>{t('study.streak_calendar')}</h2>`],
  ["30 hari terakhir — 🔥 {streak} hari streak", `{t('study.streak_desc', { streak })}`],
  ["Aktif", "{t('study.streak_active')}"],
  ["Tidak aktif", "{t('study.streak_inactive')}"],
  // Stats
  [`<h2>📊 Statistik Belajar</h2>`, `<h2>{t('study.stats_title')}</h2>`],
  ["Rangkuman progress belajarmu", "{t('study.stats_desc')}"],
  ["Sesi selesai", "{t('study.stats_sessions_completed')}"],
  ["Progress total", "{t('study.stats_total_progress')}"],
  ["Streak (hari)", "{t('study.stats_streak')}"],
  ["Sesi hari ini", "{t('study.stats_today_sessions')}"],
  ["Total modul", "{t('study.stats_total_modules')}"],
  ["Menit belajar", "{t('study.stats_minutes_studied')}"],
  // Calendar
  [`<h2>📅 Google Calendar</h2>`, `<h2>{t('study.calendar_title')}</h2>`],
  ["Sinkronkan jadwal belajar ke Google Calendar", "{t('study.calendar_desc')}"],
  ["Download file .ics untuk diimpor ke Google Calendar, Apple Calendar, atau Outlook.", "{t('study.calendar_info')}"],
  ["📥 Sync ke Google Calendar", "{t('study.calendar_sync')}"],
  // Discord
  [`<h2>🔔 Discord</h2>`, `<h2>{t('study.discord_title')}</h2>`],
  ["Notifikasi belajar via Discord webhook", "{t('study.discord_desc')}"],
  ["Notifikasi Discord akan dikirim untuk pengingat belajar, streak, dan pencapaian.", "{t('study.discord_info')}"],
  ["Konfigurasi webhook URL melalui environment variable", "{t('study.discord_note')}"],
  // Day labels
  ["'Min'", "t('study.day_min')"],
  ["'Sen'", "t('study.day_mon')"],
  ["'Sel'", "t('study.day_tue')"],
  ["'Rab'", "t('study.day_wed')"],
  ["'Kam'", "t('study.day_thu')"],
  ["'Jum'", "t('study.day_fri')"],
  ["'Sab'", "t('study.day_sat')"],
  // Notification test
  ["'Test Notifikasi'", "t('study.notification_test_title')"],
  ["'Notifikasi berhasil! 🔔'", "t('study.notification_test_body')"],
  ["Izin notifikasi belum diberikan. Periksa pengaturan browser.", "{t('study.notification_denied')}"],
  // Stats card labels
  ['<StatCard icon="📦" value={totalModules} label="Total modul" />', `<StatCard icon="📦" value={totalModules} label={t('study.stats_total_modules')} />`],
];

// --- Videos ---
PAGE_TRANSFORMS['src/routes/videos/+page.svelte'] = [
  [`<title>Video Pembelajaran — RPL AI</title>`, `<title>{t('videos.page_title')} — RPL AI</title>`],
  [`<h1>🎬 Video Pembelajaran</h1>`, `<h1>{t('videos.page_title')}</h1>`],
  // The subtitle is a complex JS expression
  ["Koleksi video pembelajaran RPL AI Curriculum.\n\t\t\t{totalModules} modul &middot; {totalVideos} video", `{t('videos.subtitle', { modules: totalModules, videos: totalVideos })}`],
  ["Semua Modul", "{t('videos.filter_module')}"],
  ["Semua Level", "{t('videos.filter_level')}"],
  ["Cari video...", "{t('videos.search')}"],
  ["Memuat video...", "{t('videos.loading')}"],
  ["Tidak ada video ditemukan.", "{t('videos.empty')}"],
  ["Gagal memuat data video.", "{t('videos.error')}"],
  ["📺 Lihat Playlist Lengkap &rarr;", "{t('videos.playlist_link')}"],
  ["🔵 Beginner", "{t('videos.level_beginner')}"],
  ["🟡 Intermediate", "{t('videos.level_intermediate')}"],
  ["🟣 Advanced", "{t('videos.level_advanced')}"],
];

// ============================================================
// MAIN
// ============================================================
const rootDir = path.resolve(__dirname, '..');

// Phase 1: Verify all keys exist in i18n store
const i18nPath = path.join(rootDir, 'src/lib/stores/i18n.svelte.ts');
let i18nContent = fs.readFileSync(i18nPath, 'utf-8');

// Check which keys already exist
const existingKeys = new Set();
const keyRegex = /'([\w.]+)':\s*'/g;
let match;
while ((match = keyRegex.exec(i18nContent)) !== null) {
  existingKeys.add(match[1]);
}

const missingKeys = [];
for (const [key, vals] of Object.entries(NEW_KEYS)) {
  if (!existingKeys.has(key)) {
    missingKeys.push({ key, id: vals.id, en: vals.en });
  }
}

console.log(`\n=== PHASE 1: Adding ${missingKeys.length} new keys to i18n store ===`);
if (missingKeys.length > 0) {
  // Find the last 'id' entry before the 'en' section starts
  const idEndMarker = "  },\n  en: {";
  const idEndIdx = i18nContent.indexOf(idEndMarker);
  if (idEndIdx === -1) throw new Error("Could not find transition to 'en' section");

  // Build the new ID entries
  let newIdEntries = '';
  for (const { key, id } of missingKeys) {
    newIdEntries += `    '${key}': '${id}',\n`;
  }

  // Build the new EN entries
  let newEnEntries = '';
  // Find last EN entry position
  const enEndMarker = "\n  },\n};";
  // Actually find the position after the last en entry before };
  const enSectionStart = i18nContent.indexOf("  en: {") + "  en: {".length;
  const enSectionEnd = i18nContent.lastIndexOf("  },\n};");
  const enContent = i18nContent.slice(enSectionStart, enSectionEnd);
  
  for (const { key, en } of missingKeys) {
    newEnEntries += `    '${key}': '${en}',\n`;
  }

  // Insert ID entries before the "  },\n  en: {" section
  const idInsertPos = idEndIdx;
  i18nContent = i18nContent.slice(0, idInsertPos) + newIdEntries + i18nContent.slice(idInsertPos);

  // Now EN entries - find the updated position
  const enSectionStartNew = i18nContent.indexOf("  en: {") + "  en: {".length;
  const enSectionEndNew = i18nContent.lastIndexOf("  },\n};");
  
  i18nContent = i18nContent.slice(0, enSectionEndNew) + newEnEntries + i18nContent.slice(enSectionEndNew);

  fs.writeFileSync(i18nPath, i18nContent, 'utf-8');
  console.log(`  ✓ Added ${missingKeys.length} keys to i18n store`);
} else {
  console.log(`  ✓ All keys already exist in i18n store`);
}

// Phase 2: Transform each page
console.log(`\n=== PHASE 2: Transforming ${Object.keys(PAGE_TRANSFORMS).length} pages ===`);

for (const [fileRel, replacements] of Object.entries(PAGE_TRANSFORMS)) {
  const filePath = path.join(rootDir, fileRel);
  if (!fs.existsSync(filePath)) {
    console.warn(`  ⚠ File not found: ${fileRel} - skipping`);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Add import
  content = addImport(content);

  // Apply replacements
  let replacedCount = 0;
  for (const [oldStr, newStr] of replacements) {
    if (content.includes(oldStr)) {
      content = content.replace(oldStr, newStr);
      replacedCount++;
    } else {
      console.warn(`  ⚠ [${fileRel}] Not found: "${oldStr.substring(0, 60)}..."`);
    }
  }

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`  ✓ ${fileRel} - ${replacedCount}/${replacements.length} replacements applied`);
}

console.log(`\n=== Transformation complete! ===`);
console.log(`Keys added to i18n store: ${missingKeys.length}`);
