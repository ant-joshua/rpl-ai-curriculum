// AIEdu — shared AI generation helper (9router)

const NINE_ROUTER_URL = 'https://9router.ant-joshua.my.id/v1/chat/completions';
const DEFAULT_MODEL = 'ocg/deepseek-v4-flash';

export type DocType =
	| 'atp'
	| 'modul_ajar'
	| 'lkpd'
	| 'soal'
	| 'rubrik'
	| 'ppt';

export const DOC_TYPE_META: Record<DocType, { label: string; icon: string; prompt: string }> = {
	atp: {
		label: 'Alur Tujuan Pembelajaran (ATP)',
		icon: '🗺️',
		prompt: `Buatkan Alur Tujuan Pembelajaran (ATP) Kurikulum Merdeka yang lengkap dan profesional.
Struktur wajib:
1. Identitas: mata pelajaran, fase (A/B/C/D/E/F), kelas, semester, penyusun
2. Rasional & tujuan mata pelajaran
3. Capaian Pembelajaran (CP) yang diacu
4. Tabel ATP: kolom [Elemen | Capaian Pembelajaran | Tujuan Pembelajaran | Indikator Ketercapaian | Alokasi Waktu | Kelas/Semester]
5. Alur urutan TP yang logis dan berjenjang (sederhana ke kompleks)
6. Catatan asesmen & diferensiasi
Format markdown. Gunakan tabel markdown untuk ATP.`,
	},
	modul_ajar: {
		label: 'Modul Ajar',
		icon: '📘',
		prompt: `Buatkan Modul Ajar Kurikulum Merdeka yang lengkap dan siap pakai.
Struktur wajib:
1. Informasi Umum: identitas modul (mapel, fase, kelas, semester, penyusun, tahun), kompetensi awal, profil pelajar Pancasila, sarana prasarana, target peserta didik, model pembelajaran
2. Komponen Inti: Capaian Pembelajaran, Tujuan Pembelajaran, pemahaman bermakna, pertanyaan pemantik, kegiatan pembelajaran (pendahuluan-inti-penutup dengan alokasi waktu), asesmen (diagnostik, formatif, sumatif), pengayaan & remedial, refleksi
3. Lampiran: lembar kerja, bahan bacaan, glosarium
Format markdown. Berikan contoh konkret dan bahasa yang jelas untuk guru.`,
	},
	lkpd: {
		label: 'Lembar Kerja Peserta Didik (LKPD)',
		icon: '📝',
		prompt: `Buatkan Lembar Kerja Peserta Didik (LKPD) Kurikulum Merdeka.
Struktur wajib:
1. Identitas LKPD: mapel, kelas, materi, tujuan
2. Petunjuk pengerjaan
3. Kegiatan berkelompok/individu berbasis discovery learning atau problem based learning
4. Pertanyaan/lembar observasi dengan ruang jawaban
5. Refleksi peserta didik
Format markdown. Sesuaikan tingkat kesulitan dengan kelas yang diminta.`,
	},
	soal: {
		label: 'Bank Soal / Asesmen',
		icon: '🧩',
		prompt: `Buatkan soal asesmen Kurikulum Merdeka.
Struktur wajib:
1. Identitas: mapel, kelas, fase, materi, bentuk asesmen (diagnostik/formatif/sumatif)
2. Soal pilihan ganda minimal 10 butir (4 opsi A-D) + kunci jawaban
3. Soal esai minimal 3 butir dengan pedoman penskoran
4. Indikator soal mengacu pada TP/CP
5. Kunci jawaban di akhir
Format markdown. Soal sesuai tingkat berpikir (LOTS/MOTS/HOTS seimbang).`,
	},
	rubrik: {
		label: 'Rubrik Penilaian',
		icon: '📊',
		prompt: `Buatkan rubrik penilaian Kurikulum Merdeka yang profesional.
Struktur wajib:
1. Identitas: mapel, kelas, tugas/proyek yang dinilai, CP/TP yang diacu
2. Tabel rubrik: kolom [Kriteria | Sangat Baik (4) | Baik (3) | Cukup (2) | Perlu Bimbingan (1)]
3. Minimal 5 kriteria penilaian
4. Predikat (A/B/C/D) dan deskripsi
5. Format skor akhir + konversi nilai
Format markdown dengan tabel.`,
	},
	ppt: {
		label: 'Materi PPT',
		icon: '📊',
		prompt: `Buatkan outline materi presentasi (PPT) pembelajaran Kurikulum Merdeka.
Struktur wajib:
1. Slide judul (mapel, kelas, materi, penyusun)
2. CP & TP yang relevan
3. Peta konsep materi
4. 8-12 slide isi materi dengan poin-poin ringkas per slide
5. Slide latihan/pemantik
6. Slide kesimpulan + refleksi
Format markdown, tiap slide diawali dengan "## Slide N: Judul".`,
	},
};

export async function generateDoc(
	platform: App.Platform,
	docType: DocType,
	subject: string,
	grade: string,
	topic: string,
	extraContext?: string,
	curriculumContext?: string
): Promise<string> {
	const meta = DOC_TYPE_META[docType];
	const apiKey = platform.env?.AI_API_KEY || '';
	const model = DEFAULT_MODEL;

	const userPrompt = `Mapel: ${subject}
Kelas/Fase: ${grade}
Materi/Topik: ${topic}
${curriculumContext ? `Kurikulum: ${curriculumContext}` : 'Kurikulum: Kurikulum Merdeka'}
${extraContext ? `Konteks tambahan: ${extraContext}` : ''}`;

	const payload = {
		model,
		messages: [
			{ role: 'system', content: `Kamu adalah asisten AI untuk guru (AIEdu). Selalu jawab dalam Bahasa Indonesia. ${meta.prompt}` },
			{ role: 'user', content: userPrompt },
		],
		temperature: 0.7,
		max_tokens: 4096,
	};

	const headers: Record<string, string> = { 'Content-Type': 'application/json' };
	if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

	const res = await fetch(NINE_ROUTER_URL, {
		method: 'POST',
		headers,
		body: JSON.stringify(payload),
	});

	if (!res.ok) {
		const errText = await res.text();
		throw new Error(`AI API error ${res.status}: ${errText.slice(0, 300)}`);
	}

	const data = await res.json();
	return data?.choices?.[0]?.message?.content || '';
}
