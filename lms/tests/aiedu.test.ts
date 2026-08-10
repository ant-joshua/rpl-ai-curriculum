import { describe, it, expect, vi, afterEach } from 'vitest';
import {
	DOC_TYPE_META,
	generateDoc,
	chatGuru,
	analyzeGrades,
	generateRapor,
	gradeEssay,
} from '../src/lib/server/aiedu';

afterEach(() => {
	vi.unstubAllGlobals();
});

const AI_URL = 'https://9router.ant-joshua.my.id/v1/chat/completions';

const platformNoKey = { env: {} } as any;
const platformWithKey = { env: { AI_API_KEY: 'ak-123' } } as any;

function stubOk(content: string, status = 200) {
	vi.stubGlobal('fetch', vi.fn(async () =>
		new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status })
	));
}

function stubError(status: number, text: string) {
	vi.stubGlobal('fetch', vi.fn(async () => new Response(text, { status })));
}

function lastFetchCall(): [string, any] {
	const calls = (vi as any).mocked(fetch).mock.calls;
	return calls[calls.length - 1] as unknown as [string, any];
}

describe('DOC_TYPE_META', () => {
	it('has all 6 doc types with prompts', () => {
		const types = ['atp', 'modul_ajar', 'lkpd', 'soal', 'rubrik', 'ppt'];
		for (const t of types) {
			expect(DOC_TYPE_META[t as keyof typeof DOC_TYPE_META].label).toBeTruthy();
			expect(DOC_TYPE_META[t as keyof typeof DOC_TYPE_META].icon).toBeTruthy();
			expect(DOC_TYPE_META[t as keyof typeof DOC_TYPE_META].prompt.length).toBeGreaterThan(100);
		}
	});
});

describe('generateDoc', () => {
	it('builds payload with system+user messages and returns content', async () => {
		stubOk('# ATP Matematika');
		const out = await generateDoc(platformWithKey, 'atp', 'Matematika', 'Fase D', 'Aljabar', 'Kelas 8', 'Kurikulum Merdeka');
		expect(out).toBe('# ATP Matematika');
		const [url, init] = lastFetchCall();
		expect(url).toBe(AI_URL);
		expect(init.headers.Authorization).toBe('Bearer ak-123');
		const payload = JSON.parse(init.body);
		expect(payload.model).toBe('ocg/deepseek-v4-flash');
		expect(payload.messages[0].role).toBe('system');
		expect(payload.messages[0].content).toContain('ATP');
		expect(payload.messages[1].content).toContain('Mapel: Matematika');
		expect(payload.messages[1].content).toContain('Kelas/Fase: Fase D');
	});

	it('omits Authorization when no API key', async () => {
		stubOk('ok');
		await generateDoc(platformNoKey, 'soal', 'IPA', '7', 'Cahaya');
		const [, init] = lastFetchCall();
		expect(init.headers.Authorization).toBeUndefined();
	});

	it('includes optional context lines when provided', async () => {
		stubOk('ok');
		await generateDoc(platformWithKey, 'rubrik', 'Sejarah', '10', 'Kerajaan', 'PBL', 'KRIS');
		const [, init] = lastFetchCall();
		const content = JSON.parse(init.body).messages[1].content as string;
		expect(content).toContain('Kurikulum: KRIS');
		expect(content).toContain('Konteks tambahan: PBL');
	});

	it('defaults curriculum to Kurikulum Merdeka', async () => {
		stubOk('ok');
		await generateDoc(platformWithKey, 'ppt', 'Biologi', '11', 'Sel');
		const [, init] = lastFetchCall();
		const content = JSON.parse(init.body).messages[1].content as string;
		expect(content).toContain('Kurikulum: Kurikulum Merdeka');
		expect(content).not.toContain('Konteks tambahan');
	});

	it('throws on non-ok response with status text', async () => {
		stubError(500, 'upstream exploded');
		await expect(generateDoc(platformWithKey, 'atp', 'A', 'B', 'C')).rejects.toThrow('AI API error 500');
	});

	it('throws when platform is null (no env access)', async () => {
		stubOk('ok');
		await expect(generateDoc(null as any, 'atp', 'A', 'B', 'C')).rejects.toThrow();
	});

	it('returns empty string when content missing', async () => {
		vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ choices: [{ message: {} }] }), { status: 200 })));
		const out = await generateDoc(platformWithKey, 'atp', 'A', 'B', 'C');
		expect(out).toBe('');
	});
});

describe('chatGuru', () => {
	it('prepends system prompt and preserves history', async () => {
		stubOk('Halo guru!');
		const history = [
			{ role: 'user' as const, content: 'Buat soal' },
			{ role: 'assistant' as const, content: 'Siap' },
		];
		const out = await chatGuru(platformWithKey, history, 'Kamu guru AI');
		expect(out).toBe('Halo guru!');
		const [, init] = lastFetchCall();
		const payload = JSON.parse(init.body);
		expect(payload.messages[0].content).toBe('Kamu guru AI');
		expect(payload.messages).toHaveLength(3);
		expect(payload.messages[1].content).toBe('Buat soal');
	});

	it('throws on error response', async () => {
		stubError(429, 'rate limited');
		await expect(chatGuru(platformWithKey, [], 'sys')).rejects.toThrow('AI API error 429');
	});
});

describe('analyzeGrades', () => {
	it('builds compact table with null → dash', async () => {
		stubOk('analisis');
		const data = {
			students: ['Andi', 'Budi'],
			scores: [
				[80, null],
				[null, 90],
				[75, 85],
			],
		};
		const out = await analyzeGrades(platformWithKey, 'Matematika', '8', 'Merdeka', data);
		expect(out).toBe('analisis');
		const [, init] = lastFetchCall();
		const payload = JSON.parse(init.body);
		const userContent = payload.messages[1].content as string;
		expect(userContent).toContain('Andi: 80, -, 75');
		expect(userContent).toContain('Budi: -, 90, 85');
		expect(userContent).toContain('Mapel: Matematika');
		expect(payload.temperature).toBe(0.5);
	});

	it('handles empty students list', async () => {
		stubOk('x');
		await analyzeGrades(platformWithKey, 'M', '8', 'K', { students: [], scores: [] });
		const [, init] = lastFetchCall();
		const userContent = JSON.parse(init.body).messages[1].content as string;
		expect(userContent).toContain('KKM/KKTP default 75');
	});
});

describe('generateRapor', () => {
	it('builds score lines and includes attitude when provided', async () => {
		stubOk('rapor');
		const scores = [
			{ name: 'PH1', score: 85 },
			{ name: 'PTS', score: 78 },
		];
		const out = await generateRapor(platformWithKey, 'Siti', '7', 'IPA', 'Merdeka', scores, 'Sangat baik');
		expect(out).toBe('rapor');
		const [, init] = lastFetchCall();
		const userContent = JSON.parse(init.body).messages[1].content as string;
		expect(userContent).toContain('- PH1: 85');
		expect(userContent).toContain('- PTS: 78');
		expect(userContent).toContain('Catatan sikap: Sangat baik');
		expect(userContent).toContain('Nama siswa: Siti');
	});

	it('omits attitude line when absent', async () => {
		stubOk('rapor');
		await generateRapor(platformWithKey, 'Siti', '7', 'IPA', 'Merdeka', [{ name: 'PH', score: 90 }]);
		const [, init] = lastFetchCall();
		const userContent = JSON.parse(init.body).messages[1].content as string;
		expect(userContent).not.toContain('Catatan sikap');
	});
});

describe('gradeEssay', () => {
	it('parses plain JSON response', async () => {
		stubOk('{"score": 8, "feedback": "Bagus", "keywords_missed": ["x"]}');
		const res = await gradeEssay(platformWithKey, 'Q', 'A', 10);
		expect(res).toEqual({ score: 8, feedback: 'Bagus' });
		const [, init] = lastFetchCall();
		expect(JSON.parse(init.body).temperature).toBe(0.2);
	});

	it('parses JSON inside markdown fences', async () => {
		stubOk('```json\n{"score": 6, "feedback": "Cukup"}\n```');
		const res = await gradeEssay(platformWithKey, 'Q', 'A', 10);
		expect(res.score).toBe(6);
	});

	it('clamps score to maxPoints', async () => {
		stubOk('{"score": 15, "feedback": "ok"}');
		const res = await gradeEssay(platformWithKey, 'Q', 'A', 10);
		expect(res.score).toBe(10);
	});

	it('clamps negative score to 0', async () => {
		stubOk('{"score": -3, "feedback": "bad"}');
		const res = await gradeEssay(platformWithKey, 'Q', 'A', 10);
		expect(res.score).toBe(0);
	});

	it('throws on missing JSON', async () => {
		stubOk('no json here');
		await expect(gradeEssay(platformWithKey, 'Q', 'A', 10)).rejects.toThrow('AI returned invalid format');
	});

	it('throws on invalid JSON', async () => {
		stubOk('{"score": 5, x}'); // has braces but invalid JSON
		await expect(gradeEssay(platformWithKey, 'Q', 'A', 10)).rejects.toThrow('AI returned invalid JSON');
	});

	it('throws on non-numeric score', async () => {
		stubOk('{"score": "lima", "feedback": "x"}');
		await expect(gradeEssay(platformWithKey, 'Q', 'A', 10)).rejects.toThrow('AI returned invalid score');
	});

	it('throws on API error', async () => {
		stubError(502, 'bad gateway');
		await expect(gradeEssay(platformWithKey, 'Q', 'A', 10)).rejects.toThrow('AI API error 502');
	});

	it('rounds fractional scores', async () => {
		stubOk('{"score": 8.4, "feedback": "ok"}');
		const res = await gradeEssay(platformWithKey, 'Q', 'A', 10);
		expect(res.score).toBe(8);
	});

	it('handles empty student answer with 0 score', async () => {
		stubOk('{"score": 0, "feedback": "Kosong"}');
		const res = await gradeEssay(platformWithKey, 'Q', '', 5);
		expect(res).toEqual({ score: 0, feedback: 'Kosong' });
	});

	it('escapes nothing — passes model answer and rubric when provided', async () => {
		stubOk('{"score": 7, "feedback": "f"}');
		await gradeEssay(platformWithKey, 'Q', 'A', 10, 'Rubrik ketat', 'Kunci lengkap');
		const [, init] = lastFetchCall();
		const userContent = JSON.parse(init.body).messages[1].content as string;
		expect(userContent).toContain('Kunci jawaban/referensi: Kunci lengkap');
		expect(userContent).toContain('Rubrik penilaian: Rubrik ketat');
	});
});