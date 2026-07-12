import { browser } from '$app/environment';
import { modules } from './modules';
import { parseQuizHtml } from '$lib/utils/quiz';
import { api } from '$lib/utils/api';

const STORAGE_KEY = 'lms-flashcards';
const SYNC_QUEUE_KEY = 'lms-flashcards-sync-queue';

export interface Flashcard {
  id: string;
  moduleSlug: string;
  sessionId?: string;
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
  interval: number;
  repetitions: number;
  easeFactor: number;
  nextReview: string;
}

export interface SyncQueueItem {
  card_id: string;
  module_slug: string;
  question: string;
  answer: string;
  ease_factor: number;
  interval: number;
  repetitions: number;
  next_review: string;
  last_reviewed?: string;
}

function createFlashcardStore() {
  let version = $state(0);
  let loadedFromApi = $state(false);

  function loadCards(): Flashcard[] {
    if (!browser) return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveCards(cards: Flashcard[]): void {
    if (!browser) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    version++;
  }

  function getQueue(): SyncQueueItem[] {
    if (!browser) return [];
    try {
      const raw = localStorage.getItem(SYNC_QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveQueue(items: SyncQueueItem[]): void {
    if (!browser) return;
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(items));
  }

  function getCards(): Flashcard[] {
    void version;
    return loadCards();
  }

  function addCard(card: Omit<Flashcard, 'id'>): Flashcard {
    const cards = loadCards();
    const newCard: Flashcard = {
      ...card,
      id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    };
    cards.push(newCard);
    saveCards(cards);
    syncSingleCard(newCard);
    return newCard;
  }

  function deleteCard(id: string): void {
    const cards = loadCards().filter(c => c.id !== id);
    saveCards(cards);
  }

  function getCardsDueToday(): Flashcard[] {
    const cards = loadCards();
    const today = new Date().toISOString().split('T')[0];
    return cards.filter(c => c.nextReview <= today);
  }

  function getCardCounts(): { total: number; dueToday: number; known: number; learning: number } {
    const cards = loadCards();
    const today = new Date().toISOString().split('T')[0];
    const dueToday = cards.filter(c => c.nextReview <= today).length;
    const known = cards.filter(c => c.repetitions >= 3 && c.easeFactor >= 2.5).length;
    const learning = cards.filter(c => c.repetitions > 0 && c.repetitions < 3).length;
    return {
      total: cards.length,
      dueToday,
      known,
      learning,
    };
  }

  function reviewCard(id: string, rating: 1 | 2 | 3 | 4): Flashcard | null {
    const cards = loadCards();
    const idx = cards.findIndex(c => c.id === id);
    if (idx === -1) return null;

    const card = cards[idx];

    // Rating: 1=Sangat Mudah, 2=Mudah, 3=Sedang, 4=Sulit
    const intervalMinutes: Record<number, number> = {
      1: 5,    // 5 minutes
      2: 10,   // 10 minutes
      3: 1440, // 1 day
      4: 5760, // 4 days
    };

    const easeAdjustments: Record<number, number> = {
      1: 0.15,
      2: 0.05,
      3: 0,
      4: -0.15,
    };

    const newInterval = intervalMinutes[rating] / (24 * 60);
    let newEase = card.easeFactor + easeAdjustments[rating];
    if (newEase < 1.3) newEase = 1.3;

    const newRepetitions = rating <= 2 ? card.repetitions + 1 : Math.max(0, card.repetitions - 1);

    const nextDate = new Date();
    nextDate.setMinutes(nextDate.getMinutes() + intervalMinutes[rating]);

    const updated: Flashcard = {
      ...card,
      interval: newInterval,
      repetitions: newRepetitions,
      easeFactor: newEase,
      nextReview: nextDate.toISOString(),
    };

    cards[idx] = updated;
    saveCards(cards);

    // Sync to API
    if (navigator.onLine) {
      api('/api/flashcards', {
        method: 'POST',
        body: JSON.stringify({
          card_id: updated.id,
          module_slug: updated.moduleSlug,
          question: updated.front,
          answer: updated.back,
          ease_factor: updated.easeFactor,
          interval: updated.interval,
          repetitions: updated.repetitions,
          next_review: updated.nextReview,
          last_reviewed: new Date().toISOString(),
        }),
      }).catch(() => {
        // offline — queue for later
        queueSync(updated);
      });
    } else {
      queueSync(updated);
    }

    return updated;
  }

  /** Queue a single card for later batch sync */
  function queueSync(card: Flashcard): void {
    const queue = getQueue();
    const existing = queue.findIndex(q => q.card_id === card.id);
    const item: SyncQueueItem = {
      card_id: card.id,
      module_slug: card.moduleSlug,
      question: card.front,
      answer: card.back,
      ease_factor: card.easeFactor,
      interval: card.interval,
      repetitions: card.repetitions,
      next_review: card.nextReview,
      last_reviewed: new Date().toISOString(),
    };
    if (existing >= 0) {
      queue[existing] = item;
    } else {
      queue.push(item);
    }
    saveQueue(queue);
  }

  /** Sync a single card directly */
  function syncSingleCard(card: Flashcard): void {
    if (!navigator.onLine) {
      queueSync(card);
      return;
    }
    api('/api/flashcards', {
      method: 'POST',
      body: JSON.stringify({
        card_id: card.id,
        module_slug: card.moduleSlug,
        question: card.front,
        answer: card.back,
        ease_factor: card.easeFactor,
        interval: card.interval,
        repetitions: card.repetitions,
        next_review: card.nextReview,
      }),
    }).catch(() => {
      queueSync(card);
    });
  }

  /** Batch sync all local flashcards to D1 */
  async function syncAll(): Promise<number> {
    if (!browser || !navigator.onLine) return 0;

    // Sync queue first
    const queue = getQueue();
    let synced = 0;
    if (queue.length > 0) {
      try {
        const res = await fetch('/api/flashcards', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-sync': 'true',
          },
          body: JSON.stringify({ cards: queue }),
        });
        if (res.ok) {
          synced = queue.length;
          saveQueue([]);
        }
      } catch {
        // still offline
      }
    }

    // Also sync all local cards (in case they were added offline)
    const localCards = loadCards();
    const unsynced = localCards.filter(c => {
      // Consider any card without recent sync as needing sync
      // Simple heuristic: send all cards that aren't in the queue already
      return !queue.some(q => q.card_id === c.id);
    });

    if (unsynced.length > 0) {
      const payload = unsynced.map(c => ({
        card_id: c.id,
        module_slug: c.moduleSlug,
        question: c.front,
        answer: c.back,
        ease_factor: c.easeFactor,
        interval: c.interval,
        repetitions: c.repetitions,
        next_review: c.nextReview,
        last_reviewed: new Date().toISOString(),
      }));
      try {
        await fetch('/api/flashcards', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-sync': 'true',
          },
          body: JSON.stringify({ cards: payload }),
        });
      } catch {
        // ignore
      }
    }

    return synced;
  }

  /** Load flashcards from D1 API, fallback to localStorage */
  async function initFromApi(): Promise<void> {
    if (!browser || loadedFromApi) return;
    loadedFromApi = true;

    try {
      const res = await api<Array<{
        id: string; card_id: string; module_slug: string;
        question: string; answer: string; ease_factor: number;
        interval: number; repetitions: number; next_review: string | null;
      }>>('/api/flashcards');

      if (res.success && res.data && res.data.length > 0) {
        // Merge with existing local cards — API wins
        const local = loadCards();
        const apiCards: Flashcard[] = res.data.map(row => ({
          id: row.card_id,
          moduleSlug: row.module_slug,
          front: row.question,
          back: row.answer,
          difficulty: 'medium' as const,
          interval: row.interval,
          repetitions: row.repetitions,
          easeFactor: row.ease_factor,
          nextReview: row.next_review || new Date().toISOString(),
        }));

        // Merge: keep local cards not in API, add API cards
        const localIds = new Set(local.map(c => c.id));
        const merged = [...apiCards];
        for (const c of local) {
          if (!localIds.has(c.id)) {
            merged.push(c);
          }
        }
        saveCards(merged);
      }
    } catch {
      // offline — use localStorage only
    }

    // Then try to flush any queued syncs
    syncAll().catch(() => {});
  }

  async function generateFromModule(moduleSlug: string): Promise<number> {
    const mod = modules.find(m => m.slug === moduleSlug);
    if (!mod) return 0;

    const cards = loadCards();
    let added = 0;

    try {
      const res = await fetch(`/content/${mod.dirName}.json`);
      if (!res.ok) return 0;
      const content: Record<string, string> = await res.json();

      const quizKey = Object.keys(content).find(k => k === 'quiz');
      if (!quizKey) return 0;

      const quizContent = content[quizKey];
      const questions = parseQuizHtml(quizContent);

      for (const q of questions) {
        const correctAnswer = q.options[q.correctIndex] || '';
        const front = q.question;
        const back = correctAnswer;

        const exists = cards.some(c => c.front === front && c.moduleSlug === moduleSlug);
        if (exists) continue;

        const newCard: Flashcard = {
          id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          moduleSlug,
          front,
          back,
          difficulty: 'medium',
          interval: 0,
          repetitions: 0,
          easeFactor: 2.5,
          nextReview: new Date().toISOString(),
        };
        cards.push(newCard);
        added++;
      }

      if (added > 0) {
        saveCards(cards);
        // Sync newly generated cards
        if (browser && navigator.onLine) {
          const payload = cards.filter(c =>
            cards.some(nc => nc.id === c.id)
          ).map(c => ({
            card_id: c.id,
            module_slug: c.moduleSlug,
            question: c.front,
            answer: c.back,
            ease_factor: c.easeFactor,
            interval: c.interval,
            repetitions: c.repetitions,
            next_review: c.nextReview,
          }));
          fetch('/api/flashcards', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-sync': 'true' },
            body: JSON.stringify({ cards: payload.filter(c => c.card_id === cards.find(lc => lc.id === c.card_id)?.id) }),
          }).catch(() => {});
        }
      }
    } catch {
      return 0;
    }

    return added;
  }

  function clearCards(): void {
    saveCards([]);
    saveQueue([]);
  }

  // Auto-init on browser
  if (browser) {
    // Defer init so it doesn't block rendering
    setTimeout(() => initFromApi(), 100);
  }

  return {
    getCards,
    addCard,
    deleteCard,
    getCardsDueToday,
    getCardCounts,
    reviewCard,
    generateFromModule,
    clearCards,
    syncAll,
    get version() { void version; return version; },
  };
}

export const flashcards = createFlashcardStore();
