"""Bulk-replace hardcoded Indonesian strings with t() calls in admin pages."""
import re
import os
import glob

ADMIN_DIR = 'src/routes/(backoffice)/admin'
IMPORT_LINE = "import { t } from '$lib/stores/i18n.svelte';"

# Strings to replace: (exact_match, t_key)
# Ordered by length descending so longer matches hit first
STRINGS = [
    # Dashboard
    ("Dashboard — Admin", "admin.title"),
    ("Selamat datang di panel admin. Pilih modul dari sidebar.", "admin.welcome"),
    ("Welcome to the admin panel. Select a module from the sidebar.", "admin.welcome"),
    ("Pilih modul dari sidebar.", "admin.select_module"),
    ("Selamat Datang di Panel Admin", "admin.welcome"),

    # Common words - longer first
    ("Program Studi", "admin.program_studi"),
    ("Program studi", "admin.program_studi"),
    ("Mata Pelajaran", "admin.mapel"),
    ("Mata pelajaran", "admin.mapel"),
    ("Mata Kuliah", "admin.mata_kuliah"),
    ("Mata kuliah", "admin.mata_kuliah"),
    ("Belum ada data", "common.no_data"),
    ("Nilai Maks", "admin.nilai"),
    ("Nilai", "admin.nilai"),
    ("Nama", "common.name"),
    ("Kode", "common.code"),
    ("Deskripsi", "common.description"),
    ("Status", "common.status"),
    ("Aksi", "common.action"),
    ("Actions", "common.action"),
    ("Judul", "admin.judul"),
    ("Tipe", "admin.tipe"),
    ("Tingkat", "admin.tingkat"),
    ("Ruangan", "admin.ruangan"),
    ("Kapasitas", "admin.kapasitas"),
    ("Lokasi", "admin.lokasi"),
    ("Catatan", "admin.catatan"),
    ("Channel", "admin.channel"),
    ("Semester", "admin.semester"),
    ("Waktu", "admin.waktu"),
    ("Tanggal", "admin.tanggal"),
    ("kelola", "admin.kelola"),
    ("Kelola", "admin.kelola"),
    ("Filter", "common.filter"),
    ("Semua", "common.all"),
    ("Aktif", "common.active"),
    ("Non-aktif", "common.inactive"),
    ("Dibuat", "admin.dibuat"),
    ("Pilih", "admin.pilih"),

    # Common UI actions
    ("← Sebelumnya", "admin.prev"),
    ("Sebelumnya", "admin.prev"),
    ("Selanjutnya →", "admin.next_page"),
    ("Selanjutnya", "admin.next_page"),
    ("Berikutnya →", "admin.berikutnya"),
    ("← Prev", "admin.prev"),
    ("Prev", "admin.prev"),
    ("Next →", "admin.next_page"),
    ("Next", "admin.next_page"),
    ("Batal", "common.cancel"),
    ("Cancel", "common.cancel"),
    ("Simpan", "common.save"),
    ("Save", "common.save"),
    ("Menyimpan...", "common.saving"),
    ("Saving...", "common.saving"),
    ("Edit", "common.edit"),
    ("Hapus", "common.delete"),
    ("Delete", "common.delete"),
    ("Buat", "common.create"),
    ("Create", "common.create"),
    ("Tambah", "common.add"),
    ("Add", "common.add"),
    ("Coba Lagi", "common.retry"),
    ("Retry", "common.retry"),
    ("Coba Lagi", "common.retry"),
    ("Refresh", "common.refresh"),
    ("Tutup", "common.close"),
    ("Close", "common.close"),
    ("Kembali", "common.back"),
    ("Back", "common.back"),
    ("Preview", "common.preview"),
    ("Pratinjau", "common.preview"),
    ("Ya", "common.yes"),
    ("Yes", "common.yes"),
    ("No", "common.no"),
    ("Tidak", "common.no"),
    ("Upload", "common.upload"),
    ("Download", "common.download"),
    ("Export", "common.export"),
    ("Ekspor", "common.export"),
    ("Import", "common.import"),
    ("Impor", "common.import"),
    ("Berhasil", "common.berhasil"),
    ("Gagal", "common.gagal"),
    ("Total", "common.total"),
    ("Baru", "common.new"),
    ("New", "common.new"),

    # Title pattern: "Something — Admin"
    # We'll handle <title> tags separately

    # Admin pages
    ("Tindakan ini tidak dapat dibatalkan.", "common.confirm_action"),
    ("This action cannot be undone.", "common.confirm_action"),
    ("Yakin ingin menghapus?", "common.confirm_delete"),
    ("Menunggu", "admin.menunggu"),
    ("Disetujui", "admin.disetujui"),
    ("Ditolak", "admin.ditolak"),
    ("Draft", "admin.draft"),
    ("Published", "admin.published"),
    ("Ongoing", "admin.ongoing"),
    ("Completed", "admin.completed"),
    ("Cancelled", "admin.cancelled"),
    ("Tersedia", "admin.tersedia"),
    ("Tidak Tersedia", "admin.tidak_tersedia"),
    ("Wajib", "admin.wajib"),
    ("Peminatan", "admin.peminatan"),
    ("Muatan Lokal", "admin.muatan_lokal"),
    ("Pilihan", "admin.pilihan"),
    ("Pagi", "admin.pagi"),
    ("Siang", "admin.siang"),
    ("Sore", "admin.sore"),
    ("Senin", "admin.senin"),
    ("Selasa", "admin.selasa"),
    ("Rabu", "admin.rabu"),
    ("Kamis", "admin.kamis"),
    ("Jumat", "admin.jumat"),
    ("SKS", "admin.sks"),
    ("Sifat", "admin.sifat"),
    ("Ganjil", "admin.ganjil"),
    ("Genap", "admin.genap"),
    ("Hadir", "admin.hadir"),
    ("Terlambat", "admin.terlambat"),
    ("Absen", "admin.absen"),
    ("Selesai", "admin.selesai"),

    # Semester
    ("Nama Semester", "admin.nama_semester"),
    ("Tahun Ajaran", "admin.tahun_ajaran"),

    # Class
    ("Nama Kelas", "admin.nama_kelas"),
    ("Wali Kelas", "admin.wali_kelas"),
    ("Shift", "admin.shift"),
    ("Tanpa Jurusan", "admin.tanpa_jurusan"),

    # Subject
    ("Nama Mapel", "admin.nama_mapel"),
    ("JP per Minggu", "admin.jp_per_minggu"),
    ("Jenis", "admin.jenis"),
    ("Kelompok", "admin.kelompok"),

    # Grade levels
    ("Nama Tingkat", "admin.nama_tingkat"),
    ("Slug", "admin.slug"),
    ("Jenjang Pendidikan", "admin.jenjang_pendidikan"),

    # Sessions / Attendance
    ("Kelas / Mata Kuliah", "admin.kelas_matkul"),
    ("Waktu Mulai", "admin.waktu_mulai"),
    ("QR Token untuk sesi ini:", "admin.qr_token"),
    ("Sesi Berhasil Dibuat!", "admin.sesi_berhasil_dibuat"),
    ("Buat Sesi Presensi Baru", "admin.buat_sesi_baru"),
    ("Buat Sesi Baru", "admin.buat_sesi_baru"),
    ("Buat Sesi", "admin.buat_sesi"),

    # Exam
    ("Nama Ujian", "admin.nama_ujian"),
    ("Nama Ruangan", "admin.nama_ruangan"),
    ("Tipe Ujian", "admin.tipe_ujian"),

    # Course catalog
    ("Kode MK", "admin.kode"),
    ("Nama Mata Kuliah", "admin.mata_kuliah"),

    # Import
    ("Import Berhasil", "admin.import_berhasil"),
    ("Import Lagi", "admin.import_lagi"),
    ("Lihat Kelas", "admin.lihat_kelas"),

    # Gradebook
    ("Lihat Gradebook →", "admin.lihat_gradebook"),
    ("Lihat Gradebook", "admin.lihat_gradebook"),

    # Faculty
    ("Nama Fakultas", "admin.nama_fakultas"),
    
    # Prodi
    ("Nama Program Studi", "admin.prodi"),

    # Question bank
    ("Opsi Jawaban", "admin.opsi_jawaban"),
]

def replace_in_html(content, old, new_key):
    """Replace a hardcoded string with t(key) in HTML template context."""
    # Skip if already has t() call
    if f"t('{new_key}')" in content or f't("{new_key}")' in content:
        return content

    # Match inside HTML tags: >text< 
    # But not inside { } expressions, <script>, or existing t() calls
    lines = content.split('\n')
    new_lines = []
    for line in lines:
        # Skip lines that are inside script blocks
        # Replace hardcoded text between > and <
        # Pattern: >exact_text<  or  >exact_text</
        # But only if not already inside t()
        if old in line and 't(' not in line.split(old)[0] if old in line else True:
            # Replace >text< with >{t('key')}<
            line = re.sub(
                re.escape(f'>{old}<'),
                f'>{{t(\'{new_key}\')}}<',
                line
            )
            # Replace >text</... with >{t('key')}</...
            line = re.sub(
                re.escape(f'>{old}</') + r'(\w+)',
                lambda m: f'>{{t(\'{new_key}\')}}</' + m.group(1),
                line
            )
            # Replace >text\n to handle multiline
            # But handle title="text"
            line = re.sub(
                re.escape(f'title="{old}"'),
                f'title={{t(\'{new_key}\')}}',
                line
            )
            line = re.sub(
                re.escape(f"title='{old}'"),
                f"title={{t('{new_key}')}}",
                line
            )
            # placeholder="text"
            line = re.sub(
                re.escape(f'placeholder="{old}"'),
                f'placeholder={{t(\'{new_key}\')}}',
                line
            )
            line = re.sub(
                re.escape(f"placeholder='{old}'"),
                f"placeholder={{t('{new_key}')}}",
                line
            )
        new_lines.append(line)
    return '\n'.join(new_lines)

def process_file(filepath):
    """Process a single admin page file."""
    with open(filepath, 'r') as f:
        content = f.read()

    # Add import if not already present
    if IMPORT_LINE not in content and 'from \'$lib/stores/i18n' not in content:
        # Find the first line that's not a comment or blank
        lines = content.split('\n')
        script_end = None
        for i, line in enumerate(lines):
            if '<script' in line:
                script_end = i
                break
            if line.strip() and not line.strip().startswith('<!--'):
                script_end = i
                break
        
        if script_end is not None and '<script' in lines[script_end]:
            # Find closing </script>
            for j in range(script_end, len(lines)):
                if '</script>' in lines[j]:
                    # Add import before </script>
                    lines.insert(j, f'  {IMPORT_LINE}')
                    content = '\n'.join(lines)
                    break
        elif script_end is not None:
            # Add <script> block at top
            lines.insert(script_end, '<script>')
            lines.insert(script_end + 1, f'  {IMPORT_LINE}')
            lines.insert(script_end + 2, '</script>')
            lines.insert(script_end + 3, '')
            content = '\n'.join(lines)
    
    original = content
    
    # Apply replacements
    for old, key in STRINGS:
        content = replace_in_html(content, old, key)
    
    # Handle title tags: <title>text — Admin</title>
    content = re.sub(
        r'<title>([^<]+) — Admin</title>',
        r'<title>{t(\'admin.title\')}</title>',
        content
    )
    
    # Handle simple title: <title>Admin</title>
    content = re.sub(
        r'<title>Admin</title>',
        r'<title>{t(\'admin.title\')}</title>',
        content
    )
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        return True
    return False

def main():
    files = sorted(glob.glob(f'{ADMIN_DIR}/**/+page.svelte', recursive=True))
    print(f"Found {len(files)} page files")
    modified = 0
    for fp in files:
        if process_file(fp):
            print(f"  MODIFIED: {fp}")
            modified += 1
    print(f"Modified {modified}/{len(files)} files")

if __name__ == '__main__':
    main()
