// TTS speech helper — uses browser SpeechSynthesis (no deps, works offline).
// Provides read-aloud for lesson content with play/pause/stop + rate control.

export interface SpeakResult {
	supported: boolean;
	error?: string;
}

// Collect readable text from content blocks (plain text only, strip markdown/code).
export function collectBlockText(blocks: Array<{ type: string; title?: string; body?: string | null }>): string {
	const parts: string[] = [];
	for (const b of blocks) {
		if (b.title) parts.push(b.title);
		if (b.body) {
			// Strip markdown/code markers for cleaner reading
			const clean = b.body
				.replace(/```[\s\S]*?```/g, ' ')
				.replace(/`([^`]*)`/g, '$1 ')
				.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
				.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1 ')
				.replace(/[#>*_\-~|]+/g, ' ')
				.replace(/\s+/g, ' ')
				.trim();
			if (clean) parts.push(clean);
		}
	}
	return parts.join('. ').trim();
}

// Browser SpeechSynthesis speaking state
export class SpeechReader {
	private hasSupport = false;
	private voice: SpeechSynthesisVoice | null = null;
	private speakingFlag = false;

	constructor() {
		if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
			this.hasSupport = true;
			if (window.speechSynthesis.onvoiceschanged !== undefined) {
				window.speechSynthesis.onvoiceschanged = () => this.pickVoice();
			}
			this.pickVoice();
		}
	}

	private pickVoice() {
		if (!this.hasSupport) return;
		const voices = window.speechSynthesis.getVoices();
		// Prefer an Indonesian voice if available
		this.voice = voices.find((v) => v.lang?.toLowerCase().startsWith('id')) || voices.find((v) => v.lang?.toLowerCase().startsWith('en')) || voices[0] || null;
	}

	isSupported(): boolean {
		return this.hasSupport;
	}

	speak(text: string, rate = 1): SpeakResult {
		if (!this.hasSupport) return { supported: false, error: 'Browser tidak mendukung text-to-speech.' };
		if (!text.trim()) return { supported: true, error: 'Tidak ada teks untuk dibacakan.' };
		this.stop();
		const u = new SpeechSynthesisUtterance(text);
		if (this.voice) u.voice = this.voice;
		u.lang = this.voice?.lang || 'id-ID';
		u.rate = rate;
		u.pitch = 1;
		u.onend = () => { this.speakingFlag = false; };
		u.onerror = () => { this.speakingFlag = false; };
		this.speakingFlag = true;
		window.speechSynthesis.speak(u);
		return { supported: true };
	}

	stop() {
		if (this.hasSupport && 'speechSynthesis' in window) {
			window.speechSynthesis.cancel();
		}
		this.speakingFlag = false;
	}

	get speaking(): boolean {
		return this.hasSupport ? (window.speechSynthesis.speaking || this.speakingFlag) : false;
	}
}