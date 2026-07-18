#!/usr/bin/env python3
"""
Carefully add t() import and replace hardcoded Indonesian text in backoffice pages.
ONLY replaces in template section (after </script>, before <style>).
"""
import re, os, sys

IMPORT_LINE = "import { t } from '$lib/stores/i18n';"

# (search, replace) pairs - applied only in template section
REPLACEMENTS = [
    # ===== PAGE TITLES (svelte:head) =====
    ('<title>📋 Curriculum Builder — Admin — RPL AI Curriculum</title>', '<title>{t(\'curriculum.page_title\')} — Admin — RPL AI Curriculum</title>'),
    ('<title>Rapor — {data.offering.name} — RPL AI Curriculum</title>', '<title>{t(\'rapor.gradebook_title\')} — {data.offering.name} — RPL AI Curriculum</title>'),
    ('<title>Bimbel Dashboard — RPL AI Curriculum</title>', '<title>{t(\'bimbel.page_title\')} — RPL AI Curriculum</title>'),
    ('<title>Batch Bimbel — RPL AI Curriculum</title>', '<title>{t(\'batch.page_title\')} — RPL AI Curriculum</title>'),
    ('<title>Try Out — Bimbel — RPL AI Curriculum</title>', '<title>{t(\'tryout.page_title\')} — Bimbel — RPL AI Curriculum</title>'),
    ('<title>Dashboard Guru — RPL AI Curriculum</title>', '<title>{t(\'guru.dashboard_title\')} — RPL AI Curriculum</title>'),
    ('<title>Absensi — Guru — RPL AI Curriculum</title>', '<title>{t(\'absensi.title\')} — Guru — RPL AI Curriculum</title>'),
    ('<title>Kelas Saya — Guru — RPL AI Curriculum</title>', '<title>{t(\'guru.my_classes\')} — Guru — RPL AI Curriculum</title>'),
    ('<title>Input Nilai — Guru</title>', '<title>{t(\'guru.input_grades_title\')} — Guru</title>'),
    ('<title>Rapor — Wali Kelas — RPL AI Curriculum</title>', '<title>{t(\'rapor.homeroom_title\')} — RPL AI Curriculum</title>'),
    ('<title>Rapor Saya — Siswa — RPL AI Curriculum</title>', '<title>{t(\'siswa.my_rapor\')} — Siswa — RPL AI Curriculum</title>'),
    ('<title>Dashboard — LMS RPL</title>', '<title>{t(\'nav.dashboard\')} — LMS RPL</title>'),
    ('<title>Tutor Dashboard — RPL AI Curriculum</title>', '<title>{t(\'tutor.dashboard_title\')} — RPL AI Curriculum</title>'),
    ('<title>Jadwal Privat — Tutor — RPL AI Curriculum</title>', '<title>{t(\'tutor.schedule_title\')} — Tutor — RPL AI Curriculum</title>'),

    # ===== CURRICULUM PAGE =====
    ('<h1>📋 Curriculum Builder</h1>', '<h1>{t(\'curriculum.page_title\')}</h1>'),
    ('<p class="page-desc">Drag & drop untuk mengurutkan pelajaran. Perubahan otomatis tersimpan.</p>',
     '<p class="page-desc">{t(\'curriculum.page_desc\')}</p>'),
    ('— Pilih Course Offering —', '{t(\'curriculum.select_offering\')}'),
    ('{filteredLessons.length} pelajaran', '{filteredLessons.length} {t(\'curriculum.lessons_count_unit\')}'),
    ('title="Pilih Course Offering"', 'title={t(\'curriculum.select_offering\')}'),
    ('description="Pilih course offering di atas untuk mulai mengatur urutan pelajaran."',
     'description={t(\'curriculum.select_offering_desc\')}'),
    ('title="Tidak ada pelajaran"', 'title={t(\'curriculum.no_lessons\')}'),
    ('description="Offering ini belum memiliki pelajaran. Buat lesson terlebih dahulu."',
     'description={t(\'curriculum.no_lessons_desc\')}'),
    ('aria-label="Daftar pelajaran"', 'aria-label={t(\'curriculum.lessons_list_label\')}'),
    ('aria-label="Pindahkan ke atas"', 'aria-label={t(\'curriculum.move_up\')}'),
    ('title="Naik"', 'title={t(\'curriculum.up\')}'),
    ('aria-label="Pindahkan ke bawah"', 'aria-label={t(\'curriculum.move_down\')}'),
    ('title="Turun"', 'title={t(\'curriculum.down\')}'),
    ('⚡ Tambahan', '{t(\'curriculum.optional_badge\')}'),
    ('💡 Seret item atau gunakan tombol ↑↓ untuk mengubah urutan. Perubahan auto-save.',
     '{t(\'curriculum.drag_hint\')}'),
    ('case \'saving\': return \'💾 Menyimpan...\'', 'case \'saving\': return t(\'common.saving_icon\')'),
    ('case \'saved\': return \'✅ Tersimpan\'', 'case \'saved\': return t(\'common.saved\')'),
    ('case \'error\': return \'❌ Gagal simpan\'', 'case \'error\': return t(\'common.save_failed\')'),

    # ===== GRADEBOOK RAPOR =====
    ('← Gradebook', '{t(\'gradebook.back\')}'),
    ('<h1>📄 Rapor —', '<h1>{t(\'rapor.gradebook_title\')} —'),
    ('{data.students.length} mahasiswa', '{data.students.length} {t(\'gradebook.student_unit\')}'),
    ('🖨 Cetak Rapor', '{t(\'rapor.print\')}'),
    ('emptyMessage="Belum ada data siswa"', 'emptyMessage={t(\'rapor.no_students\')}'),
    ('Total Siswa: {data.students.length}', '{t(\'rapor.total_students\')}: {data.students.length}'),
    ('Tgl Cetak: {formatDate()}', '{t(\'rapor.print_date_label\')}: {formatDate()}'),
    ('Tanggal: {formatDate()}</div>', '{t(\'rapor.date_label\')}: {formatDate()}</div>'),

    # ===== BIMBEL DASHBOARD =====
    ('<h1>📚 Bimbel Dashboard</h1>', '<h1>{t(\'bimbel.page_title\')}</h1>'),
    ('<p class="page-desc">Panel manajemen bimbingan belajar</p>', '<p class="page-desc">{t(\'bimbel.subtitle\')}</p>'),
    ('Batch Aktif', '{t(\'bimbel.active_batches\')}'),
    ('Total Siswa', '{t(\'bimbel.total_students\')}'),
    ('Try Out Mendatang', '{t(\'bimbel.upcoming_tryouts\')}'),
    ('Tagihan Belum Dibayar', '{t(\'bimbel.unpaid_invoices\')}'),
    ('🔄 Muat Ulang', '{t(\'common.reload\')}'),
    ('message="Memuat statistik..."', 'message={t(\'common.loading_stats\')}'),

    # ===== BIMBEL BATCH =====
    ('← Bimbel Dashboard', '{t(\'bimbel.back_to_dashboard\')}'),
    ('<h1>📦 Batch Bimbel</h1>', '<h1>{t(\'batch.page_title\')}</h1>'),
    ('<p class="subtitle">Daftar grup bimbingan belajar</p>', '<p class="subtitle">{t(\'batch.list_title\')}</p>'),
    ('"Buat Batch Baru"', '{t(\'batch.create_title\')}'),
    ('Nama Batch', '{t(\'batch.name_label\')}'),
    ('placeholder="Contoh: Bimbel Intensif IPA"', 'placeholder={t(\'batch.name_placeholder\')}'),
    ('Belum Ada Batch', '{t(\'batch.no_batches_title\')}'),
    ('Buat batch baru untuk memulai.', '{t(\'batch.no_batches_desc\')}'),
    ('message="Memuat batch..."', 'message={t(\'common.loading\')}'),
    ('Batal', '{t(\'common.cancel\')}'),
    ('+ Buat Batch', '{t(\'batch.create\')}'),
    ('>Siswa<', '>{t(\'admin.siswa\')}<'),
    ('label: \'Privat\'', 'label: t(\'common.privat\')'),

    # ===== BIMBEL TRYOUT =====
    ('<h1>📝 Try Out</h1>', '<h1>{t(\'tryout.page_title\')}</h1>'),
    ('<p class="subtitle">Daftar try out bimbingan belajar</p>', '<p class="subtitle">{t(\'tryout.list_title\')}</p>'),
    ('"Buat Try Out Baru"', '{t(\'tryout.create_title\')}'),
    ('placeholder="Contoh: Try Out UTBK #1"', 'placeholder={t(\'tryout.title_placeholder\')}'),
    ('Belum Ada Try Out', '{t(\'tryout.no_tryouts_title\')}'),
    ('Buat try out baru untuk memulai.', '{t(\'tryout.no_tryouts_desc\')}'),
    ('message="Memuat try out..."', 'message={t(\'common.loading\')}'),
    ('Batal', '{t(\'common.cancel\')}'),
    ('+ Buat Try Out', '{t(\'tryout.create\')}'),
    ('saving ? \'Menyimpan...\' : \'Buat\'', 'saving ? t(\'common.saving\') : t(\'common.create\')'),
    ('Muat Ulang', '{t(\'common.reload\')}'),

    # ===== GURU DASHBOARD =====
    ('<h1>Dashboard Guru</h1>', '<h1>{t(\'guru.dashboard_title\')}</h1>'),
    ('<p class="subtitle">Panel guru</p>', '<p class="subtitle">{t(\'guru.panel_subtitle\')}</p>'),
    ('← Dashboard Guru', '{t(\'guru.back_to_dashboard\')}'),
    ('message="Memuat..."', 'message={t(\'common.loading\')}'),

    # ===== GURU KELAS =====
    ('<h1>📚 Kelas Saya</h1>', '<h1>{t(\'guru.my_classes\')}</h1>'),
    ('<p class="subtitle">Daftar kelas dan mata pelajaran yang Anda ajar</p>', '<p class="subtitle">{t(\'guru.my_classes_desc\')}</p>'),
    ('message="Memuat kelas..."', 'message={t(\'common.loading\')}'),
    ('Input Nilai →', '{t(\'guru.input_grades_link\')}'),

    # ===== GURU NILAI =====
    ('<h2>Input Nilai</h2>', '<h2>{t(\'guru.input_grades_title\')}</h2>'),
    ('Belum ada penugasan mengajar.', '{t(\'guru.no_teaching_assignment\')}'),
    ('Hubungi admin untuk penugasan kelas', '{t(\'guru.contact_admin_hint\')}'),

    # ===== GURU NILAI [classSubjectId] =====
    ('← Kelas Saya', '{t(\'guru.back_to_classes\')}'),
    ('Semua KD', '{t(\'guru.all_kd\')}'),
    ('Rata-rata Kelas', '{t(\'guru.class_average\')}'),
    ('auto-save aktif', '{t(\'guru.autosave_active\')}'),
    ('message="Memuat data kelas..."', 'message={t(\'common.loading\')}'),
    ('Semester:', '{t(\'common.semester_label\')}'),

    # ===== GURU NILAI PH =====
    ('<h1>📝 Pengetahuan Harian (PH)</h1>', '<h1>{t(\'guru.ph_title\')}</h1>'),
    ('<p class="page-desc">Input nilai harian per KD</p>', '<p class="page-desc">{t(\'guru.daily_score_desc\')}</p>'),
    ('Belum ada KD Pengetahuan untuk kelas ini.', '{t(\'guru.no_kd_knowledge\')}'),
    ('Admin perlu menambahkan KD terlebih dahulu.', '{t(\'guru.no_kd_knowledge_desc\')}'),
    ('Belum ada siswa di kelas ini.', '{t(\'guru.no_students_in_class\')}'),
    ('message="Memuat data PH..."', 'message={t(\'common.loading\')}'),
    ('⏳ Menyimpan...\' : \'💾 Simpan Semua', '{t(\'common.saving\')}\' : \'{t(\'guru.save_all\')}'),
    ('Semester:', '{t(\'common.semester_label\')}'),
    ('>Siswa<', '>{t(\'admin.siswa\')}<'),

    # ===== GURU NILAI KETERAMPILAN =====
    ('<h1>🔧 Nilai Keterampilan</h1>', '<h1>{t(\'guru.skill_title\')}</h1>'),
    ('<p class="page-desc">Praktik, produk, proyek, portofolio</p>', '<p class="page-desc">{t(\'guru.skill_types_desc\')}</p>'),
    ('Belum ada KD Keterampilan untuk kelas ini.', '{t(\'guru.no_kd_skill\')}'),
    ('message="Memuat data keterampilan..."', 'message={t(\'common.loading\')}'),
    ('⏳ Menyimpan...\' : \'💾 Simpan', '{t(\'common.saving\')}\' : \'{t(\'common.save\')}'),
    ('Th: Siswa</span>', 't(\'admin.siswa\')}</span>'),
    # Handle <th>Siswa</th>
    ('>Siswa<', '>{t(\'admin.siswa\')}<'),

    # ===== GURU RAPOR =====
    ('<h1>📄 Rapor — Wali Kelas</h1>', '<h1>{t(\'rapor.homeroom_title\')}</h1>'),
    ('<p class="subtitle">Daftar kelas yang Anda ampu sebagai wali kelas</p>', '<p class="subtitle">{t(\'rapor.homeroom_classes_desc\')}</p>'),
    ('Belum ada kelas wali.', '{t(\'rapor.no_homeroom_title\')}'),
    ('Anda belum ditugaskan sebagai wali kelas. Hubungi admin untuk penugasan.', '{t(\'rapor.no_homeroom_desc\')}'),
    ('Kelola Rapor →', '{t(\'rapor.manage_link\')}'),
    ('message="Memuat kelas..."', 'message={t(\'common.loading\')}'),

    # ===== GURU TUTOR =====
    ('← Tutor Dashboard', '{t(\'tutor.back_to_dashboard\')}'),
    ('<h1>📖 Tutor Dashboard</h1>', '<h1>{t(\'tutor.dashboard_title\')}</h1>'),
    ('<p class="subtitle">Panel manajemen les privat</p>', '<p class="subtitle">{t(\'tutor.subtitle\')}</p>'),
    ('message="Memuat statistik..."', 'message={t(\'common.loading_stats\')}'),
    ('Sesi Hari Ini', '{t(\'tutor.today_sessions\')}'),
    ('Siswa Aktif', '{t(\'tutor.active_students\')}'),

    # ===== GURU TUTOR JADWAL =====
    ('<h1>📅 Jadwal Sesi Privat</h1>', '<h1>{t(\'tutor.schedule_title\')}</h1>'),
    ('<p class="subtitle">Kelola jadwal les privat mingguan</p>', '<p class="subtitle">{t(\'tutor.manage_schedule_desc\')}</p>'),
    ('‹ Sebelumnya', '{t(\'tutor.prev_week\')}'),
    ('Minggu Ini', '{t(\'tutor.this_week\')}'),
    ('Berikutnya ›', '{t(\'tutor.next_week\')}'),
    ('"Tambah Sesi"', '{t(\'tutor.add_session\')}'),
    ('"Edit Sesi"', '{t(\'tutor.edit_session\')}'),
    ('Nama Siswa', '{t(\'tutor.student_name_label\')}'),
    ('Catatan Sesi', '{t(\'tutor.session_notes_label\')}'),
    ('message="Memuat jadwal..."', 'message={t(\'tutor.loading_schedule\')}'),
    ('saving ? \'Menyimpan...\' : (editingSession ? \'Simpan\' : \'Tambah\')',
     'saving ? t(\'common.saving\') : (editingSession ? t(\'common.save\') : t(\'common.add\'))'),
    ('Batal', '{t(\'common.cancel\')}'),
    ('Tanggal', '>{t(\'common.date\')}<'),
    # Partial - just the label part
    ('<Input label="Mata Pelajaran"', '<Input label={t(\'common.subject\')}'),

    # ===== GURU ABSENSI =====
    ('<h1>📋 Input Absensi</h1>', '<h1>{t(\'absensi.title\')}</h1>'),
    ('<p class="subtitle">Catat kehadiran siswa per hari</p>', '<p class="subtitle">{t(\'absensi.subtitle\')}</p>'),
    ('Pilih Kelas', '{t(\'guru.select_class\')}'),
    ('Pilih kelas dan tanggal untuk mulai mencatat absensi.', '{t(\'absensi.select_class_desc\')}'),
    ('📊 Rekap Bulanan →', '{t(\'absensi.rekap_link\')}'),
    ('message="Memuat kelas..."', 'message={t(\'common.loading\')}'),
    ('saving ? \'Menyimpan...\' : \'💾 Simpan\'', 'saving ? t(\'common.saving\') : {t(\'common.save\')}'),
    ('<label for="date-picker">Tanggal</label>', '<label for="date-picker">{t(\'common.date\')}</label>'),
    ('Mata Pelajaran (opsional)', '{t(\'guru.subject_optional\')}'),
    ('>Status<', '>{t(\'common.status\')}<'),
    ('>Keterangan<', '>{t(\'common.description\')}<'),

    # ===== SISWA RAPOR =====
    ('<h1>📄 Rapor Saya</h1>', '<h1>{t(\'siswa.my_rapor\')}</h1>'),
    ('Lihat rapor pembelajaran Anda per semester', '{t(\'siswa.view_rapor_desc\')}'),
    ('Semester Ganjil', '{t(\'nilai.semester_ganjil\')}'),
    ('Semester Genap', '{t(\'nilai.semester_genap\')}'),
    ('Belum ada rapor tersedia.', '{t(\'rapor.no_rapor_title\')}'),
    ('Rapor akan muncul setelah guru wali kelas meng-generate-nya.', '{t(\'rapor.no_rapor_desc\')}'),
    ('message="Memuat rapor..."', 'message={t(\'common.loading\')}'),

    # ===== MY DASHBOARD =====
    ('<h1>Halo,', '<h1>{t(\'dashboard.greeting\')},'),
    ('Lanjutkan perjalanan belajar RPL AI-mu', '{t(\'dashboard.subtitle\')}'),
    ('{currentStreak} hari berturut-turut', '{currentStreak} {t(\'dashboard.streak_days\')}'),
    ('Kursus aktif', '{t(\'dashboard.active_courses\')}'),
    ('Rata-rata progres', '{t(\'dashboard.avg_progress\')}'),
    ('Pelajaran selesai', '{t(\'dashboard.lessons_completed\')}'),
    ('Kursus selesai', '{t(\'dashboard.courses_completed\')}'),
    ('Total XP', '{t(\'common.xp\')}'),
    ('Streak belajar', '{t(\'dashboard.study_streak\')}'),
    ('<h2>📖 Kursus Aktif</h2>', '<h2>{t(\'dashboard.active_courses_title\')}</h2>'),
    ('Tampilkan sedikit', '{t(\'dashboard.show_less\')}'),
    ('Belum ada kursus aktif', '{t(\'dashboard.no_active_courses\')}'),
    ('Kamu belum terdaftar di kursus manapun. Jelajahi path belajar yang tersedia!', '{t(\'dashboard.no_active_courses_desc\')}'),
    ('Jelajahi Path', '{t(\'dashboard.explore_paths\')}'),
    ('Terakhir:', '{t(\'dashboard.last_lesson\')}'),
    ('Lanjut Belajar →', '{t(\'dashboard.continue_learning\')}'),
    ('<h2>📅 Jadwal Mendatang</h2>', '<h2>{t(\'dashboard.upcoming_schedule\')}</h2>'),
    ('Lihat Semua', '{t(\'dashboard.view_all\')}'),
    ('Tidak ada jadwal dalam waktu dekat', '{t(\'dashboard.no_upcoming_schedule\')}'),
    ('<h2>📋 Tugas Mendatang</h2>', '<h2>{t(\'dashboard.upcoming_tasks\')}</h2>'),
    ('Tidak ada tugas mendatang. Santai dulu! 🎉', '{t(\'dashboard.no_upcoming_tasks\')}'),
    ('Penilaian', '{t(\'dashboard.assessment\')}'),
    ('Tugas', '{t(\'dashboard.task\')}'),
    ('Tenggat hari ini', '{t(\'dashboard.due_today\')}'),
    ('Besok', '{t(\'dashboard.due_tomorrow\')}'),
    ('hari lagi', '{t(\'dashboard.days_left\')}'),
    ('<h2>📢 Pengumuman Terbaru</h2>', '<h2>{t(\'dashboard.recent_announcements\')}</h2>'),
    ('Belum ada pengumuman', '{t(\'announcements.empty\')}'),
    ('<h2>🕐 Aktivitas Terbaru</h2>', '<h2>{t(\'dashboard.recent_activity\')}</h2>'),
    ('Belum ada aktivitas. Mulai belajar! 🚀', '{t(\'dashboard.no_activity\')}'),
    ('Menyelesaikan pelajaran', '{t(\'dashboard.completed_lesson\')}'),
    ('Mulai pelajaran', '{t(\'dashboard.started_lesson\')}'),
    ('Melihat kursus', '{t(\'dashboard.viewed_course\')}'),
    ('Mengumpulkan tugas', '{t(\'dashboard.submitted_assignment\')}'),
    ('Mulai penilaian', '{t(\'dashboard.started_assessment\')}'),
    ('Menyelesaikan penilaian', '{t(\'dashboard.completed_assessment\')}'),
    ('Aktivitas', '{t(\'dashboard.activity\')}'),

    # ===== LABEL SUFFIXES (these appear after labels) =====
    # Handle <th> headers for tables
    ('<th class="col-status">Status</th>', '<th class="col-status">{t(\'common.status\')}</th>'),
    ('<th class="col-reason">Keterangan</th>', '<th class="col-reason">{t(\'common.description\')}</th>'),
]

# Files with Indonesian text that need processing
FILES = [
    "src/routes/(backoffice)/admin/curriculum/+page.svelte",
    "src/routes/(backoffice)/admin/gradebook/[offeringId]/rapor/+page.svelte",
    "src/routes/(backoffice)/bimbel/+page.svelte",
    "src/routes/(backoffice)/bimbel/batch/+page.svelte",
    "src/routes/(backoffice)/bimbel/tryout/+page.svelte",
    "src/routes/(backoffice)/guru/+page.svelte",
    "src/routes/(backoffice)/guru/absensi/+page.svelte",
    "src/routes/(backoffice)/guru/kelas/+page.svelte",
    "src/routes/(backoffice)/guru/nilai/+page.svelte",
    "src/routes/(backoffice)/guru/nilai/[classSubjectId]/+page.svelte",
    "src/routes/(backoffice)/guru/nilai/[classSubjectId]/keterampilan/+page.svelte",
    "src/routes/(backoffice)/guru/nilai/[classSubjectId]/ph/+page.svelte",
    "src/routes/(backoffice)/guru/rapor/+page.svelte",
    "src/routes/(backoffice)/guru/tutor/+page.svelte",
    "src/routes/(backoffice)/guru/tutor/jadwal/+page.svelte",
    "src/routes/(backoffice)/siswa/rapor/+page.svelte",
    "src/routes/my/dashboard/+page.svelte",
]


def process_file(filepath):
    """Process a single file: add import, replace text in template section only."""
    full_path = os.path.join(BASE_DIR, filepath)
    if not os.path.exists(full_path):
        print(f"  SKIP (not found): {filepath}")
        return False

    with open(full_path, 'r') as f:
        content = f.read()
    original = content

    # Step 1: Add import
    if IMPORT_LINE not in content:
        # Find <script lang="ts"> line
        lines = content.split('\n')
        insert_idx = -1
        for i, line in enumerate(lines):
            if '<script' in line:
                for j in range(i+1, len(lines)):
                    stripped = lines[j].strip()
                    if stripped.startswith('import ') or stripped.startswith('$:'):
                        insert_idx = j
                        break
                    elif stripped == '':
                        continue
                    else:
                        insert_idx = j
                        break
                break
        
        if insert_idx >= 0:
            indent = re.match(r'^(\s*)', lines[insert_idx]).group(1) if lines[insert_idx].strip() else '\t'
            lines.insert(insert_idx, indent + IMPORT_LINE)
            content = '\n'.join(lines)
            print(f"  [IMPORT] Added import to {filepath}")

    # Step 2: Split into script / template / style
    script_end = re.search(r'</script>', content)
    if not script_end:
        print(f"  [SKIP] No </script> in {filepath}")
        return False
    
    template_start = script_end.end()
    style_start = re.search(r'<style', content[template_start:])
    
    if style_start:
        template_end = template_start + style_start.start()
    else:
        template_end = len(content)
    
    before = content[:template_start]
    template = content[template_start:template_end]
    after = content[template_end:]
    
    # Step 3: Apply replacements in template area only
    modified_template = template
    applied = []
    for old, new in REPLACEMENTS:
        if old in modified_template:
            modified_template = modified_template.replace(old, new)
            applied.append(old)
    
    if applied:
        content = before + modified_template + after
        with open(full_path, 'w') as f:
            f.write(content)
        print(f"  [WROTE] {filepath} - {len(applied)} replacement(s)")
        for a in applied[:5]:
            print(f"    -> {a[:70]}")
        if len(applied) > 5:
            print(f"    ... and {len(applied)-5} more")
        return True
    else:
        print(f"  [NOCHG] {filepath}")
        return False


if __name__ == '__main__':
    BASE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    changed = 0
    for fp in FILES:
        if process_file(fp):
            changed += 1
    print(f"\nTotal files changed: {changed}")
