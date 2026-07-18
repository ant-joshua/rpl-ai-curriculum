#!/usr/bin/env python3
import re, os, sys

files = [
    'src/routes/(backoffice)/admin/curriculum/+page.svelte',
    'src/routes/(backoffice)/admin/gradebook/[offeringId]/rapor/+page.svelte',
    'src/routes/(backoffice)/bimbel/+page.svelte',
    'src/routes/(backoffice)/bimbel/batch/+page.svelte',
    'src/routes/(backoffice)/bimbel/tryout/+page.svelte',
    'src/routes/(backoffice)/guru/+page.svelte',
    'src/routes/(backoffice)/guru/absensi/+page.svelte',
    'src/routes/(backoffice)/guru/kelas/+page.svelte',
    'src/routes/(backoffice)/guru/nilai/+page.svelte',
    'src/routes/(backoffice)/guru/nilai/[classSubjectId]/+page.svelte',
    'src/routes/(backoffice)/guru/nilai/[classSubjectId]/keterampilan/+page.svelte',
    'src/routes/(backoffice)/guru/nilai/[classSubjectId]/ph/+page.svelte',
    'src/routes/(backoffice)/guru/rapor/+page.svelte',
    'src/routes/(backoffice)/guru/tutor/+page.svelte',
    'src/routes/(backoffice)/guru/tutor/jadwal/+page.svelte',
    'src/routes/(backoffice)/siswa/rapor/+page.svelte',
    'src/routes/my/dashboard/+page.svelte',
]

ID_WORDS = [
    'Gagal', 'Memuat', 'Simpan', 'Batal', 'Nama', 'Tanggal', 'Pilih',
    'Daftar', 'Dashboard', 'Belum', 'Total', 'Siswa', 'Rapor',
    'Jadwal', 'Absen', 'Pelajaran', 'Sesi', 'Catatan', 'Aktif', 'Tutor',
    'Bimbing', 'Privat', 'Batch', 'Offering', 'Keterampilan',
    'Mendatang', 'Peserta', 'Santai', 'pengumuman', 'penugasan',
    'wali', 'sebelumnya', 'Berikutnya', 'Minggu',
    'Les', 'Try', 'Semester', 'Tipe', 'Rata-rata', 'Peringkat',
    'Guru', 'Hubung', 'Kembali', 'Buat', 'Tambah', 'Peserta',
    'Mata', 'Detail', 'Rekap', 'Dibuat', 'Selesai', 'Dibatalkan',
]

for fp in files:
    full = os.path.join(os.getcwd(), fp)
    with open(full) as f:
        content = f.read()
    
    script_end = content.find('</script>')
    style_start = content.find('<style', script_end)
    template = content[script_end+9:style_start] if style_start > script_end else content[script_end+9:]
    
    found = []
    for word in ID_WORDS:
        idx = 0
        while True:
            idx = template.find(word, idx)
            if idx == -1:
                break
            before = template[max(0,idx-15):idx]
            after = template[idx+len(word):idx+len(word)+15]
            if "t('" not in before and 't("' not in before:
                line_no = template[:idx].count('\n') + 1
                snippet = template[max(0,idx-15):idx+len(word)+15].replace('\n', ' ').strip()
                found.append(f'  L{line_no}: ...{snippet}...')
            idx += 1
    
    if found:
        print(f'=== {fp} ({len(found)} remaining) ===')
        for f_item in found[:10]:
            print(f_item)
        if len(found) > 10:
            print(f'  ... and {len(found)-10} more')

print()
print('Scan complete')
