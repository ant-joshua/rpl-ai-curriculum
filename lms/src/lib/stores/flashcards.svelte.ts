import { browser } from '$app/environment';
import { modules } from './modules';
import { parseQuizHtml } from '$lib/utils/quiz';
import { api } from '$lib/utils/api';

const STORAGE_KEY = 'lms-flashcards';
const SYNC_QUEUE_KEY = 'lms-flashcards-sync-queue';
const DECK_META_KEY = 'lms-flashcard-decks';
const STATS_KEY = 'lms-flashcard-stats';

export type Difficulty = 'easy' | 'medium' | 'hard';
export type DeckCategory = 'quiz' | 'summary' | 'custom';

export interface Flashcard {
  id: string;
  moduleSlug: string;
  front: string;
  back: string;
  difficulty: Difficulty;
  deckCategory: DeckCategory;
  interval: number;
  repetitions: number;
  easeFactor: number;
  nextReview: string;
  lastReviewed?: string;
  tags: string[];
}

export interface DeckMeta {
  slug: string;
  title: string;
  category: DeckCategory;
  cardCount: number;
}

export interface ReviewStats {
  totalReviewed: number;
  totalCorrect: number;
  streak: number;
  bestStreak: number;
  lastReviewDate: string;
  reviewsByDay: Record<string, number>;
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

  // ── Storage helpers ──

  function loadCards(): Flashcard[] {
    if (!browser) return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  function saveCards(cards: Flashcard[]): void {
    if (!browser) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    version++;
  }

  function loadStats(): ReviewStats {
    if (!browser) return emptyStats();
    try {
      const raw = localStorage.getItem(STATS_KEY);
      return raw ? JSON.parse(raw) : emptyStats();
    } catch { return emptyStats(); }
  }

  function saveStats(s: ReviewStats): void {
    if (!browser) return;
    localStorage.setItem(STATS_KEY, JSON.stringify(s));
  }

  function emptyStats(): ReviewStats {
    return { totalReviewed: 0, totalCorrect: 0, streak: 0, bestStreak: 0, lastReviewDate: '', reviewsByDay: {} };
  }

  function getQueue(): SyncQueueItem[] {
    if (!browser) return [];
    try {
      const raw = localStorage.getItem(SYNC_QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  function saveQueue(items: SyncQueueItem[]): void {
    if (!browser) return;
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(items));
  }

  // ── Deck categories ──

  function getDecks(): DeckMeta[] {
    const cards = loadCards();
    const map = new Map<string, { title: string; category: DeckCategory; count: number }>();
    for (const c of cards) {
      const mod = modules.find(m => m.slug === c.moduleSlug);
      const title = mod?.title || c.moduleSlug;
      if (!map.has(c.moduleSlug)) {
        map.set(c.moduleSlug, { title, category: c.deckCategory || 'quiz', count: 0 });
      }
      const entry = map.get(c.moduleSlug)!;
      entry.count++;
    }
    return Array.from(map.entries()).map(([slug, meta]) => ({
      slug,
      title: meta.title,
      category: meta.category,
      cardCount: meta.count,
    }));
  }

  function getCardsByDeck(moduleSlug: string): Flashcard[] {
    return loadCards().filter(c => c.moduleSlug === moduleSlug);
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

  function getCardsDueByDeck(moduleSlug: string): Flashcard[] {
    const cards = loadCards();
    const today = new Date().toISOString().split('T')[0];
    return cards.filter(c => c.moduleSlug === moduleSlug && c.nextReview <= today);
  }

  function getCardCounts(): { total: number; dueToday: number; known: number; learning: number; newCards: number; decks: number } {
    const cards = loadCards();
    const today = new Date().toISOString().split('T')[0];
    const dueToday = cards.filter(c => c.nextReview <= today).length;
    const known = cards.filter(c => c.repetitions >= 3 && c.easeFactor >= 2.5).length;
    const learning = cards.filter(c => c.repetitions > 0 && c.repetitions < 3).length;
    const newCards = cards.filter(c => c.repetitions === 0).length;
    const decks = new Set(cards.map(c => c.moduleSlug)).size;
    return { total: cards.length, dueToday, known, learning, newCards, decks };
  }

  // ── Spaced repetition (SM-2 derived) ──
  // Rating: 1=Sangat Mudah, 2=Mudah, 3=Sedang, 4=Sulit
  function reviewCard(id: string, rating: 1 | 2 | 3 | 4): Flashcard | null {
    const cards = loadCards();
    const idx = cards.findIndex(c => c.id === id);
    if (idx === -1) return null;

    const card = cards[idx];

    // SM-2 algorithm
    let newInterval: number;
    let newEase: number;
    let newRepetitions: number;

    if (rating <= 2) {
      // Correct — increase interval
      newRepetitions = card.repetitions + 1;
      if (newRepetitions === 1) {
        newInterval = 1; // 1 day
      } else if (newRepetitions === 2) {
        newInterval = 6; // 6 days
      } else {
        newInterval = Math.round(card.interval * card.easeFactor);
      }
    } else {
      // Incorrect — reset
      newRepetitions = 0;
      newInterval = 1; // 1 day
    }

    // Ease factor adjustments
    const easeDelta: Record<number, number> = {
      1: 0.15,  // Sangat Mudah — increase ease
      2: 0.05,  // Mudah — slight increase
      3: -0.10, // Sedang — slight decrease
      4: -0.20, // Sulit — decrease more
    };

    if (rating === 1) {
      // Bonus for very easy
      newEase = card.easeFactor + 0.15;
    } else if (rating === 2) {
      newEase = card.easeFactor + 0.05;
    } else if (rating === 3) {
      newEase = card.easeFactor - 0.10;
    } else {
      newEase = card.easeFactor - 0.20;
    }

    if (newEase < 1.3) newEase = 1.3;
    if (newEase > 3.0) newEase = 3.0;

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + newInterval);
    nextDate.setHours(0, 0, 0, 0);

    const updated: Flashcard = {
      ...card,
      interval: newInterval,
      repetitions: newRepetitions,
      easeFactor: newEase,
      nextReview: nextDate.toISOString(),
      lastReviewed: new Date().toISOString(),
    };

    cards[idx] = updated;
    saveCards(cards);

    // Update review stats
    const stats = loadStats();
    stats.totalReviewed++;
    if (rating <= 2) stats.totalCorrect++;
    if (rating <= 2) {
      stats.streak++;
      if (stats.streak > stats.bestStreak) stats.bestStreak = stats.streak;
    } else {
      stats.streak = 0;
    }
    stats.lastReviewDate = new Date().toISOString().split('T')[0];
    const today = stats.lastReviewDate;
    stats.reviewsByDay[today] = (stats.reviewsByDay[today] || 0) + 1;
    saveStats(stats);

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
      }).catch(() => queueSync(updated));
    } else {
      queueSync(updated);
    }

    return updated;
  }

  function getReviewStats(): ReviewStats {
    return loadStats();
  }

  function resetStats(): void {
    saveStats(emptyStats());
  }

  // ── Sync ──

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
    if (existing >= 0) queue[existing] = item;
    else queue.push(item);
    saveQueue(queue);
  }

  function syncSingleCard(card: Flashcard): void {
    if (!navigator.onLine) { queueSync(card); return; }
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
    }).catch(() => queueSync(card));
  }

  async function syncAll(): Promise<number> {
    if (!browser || !navigator.onLine) return 0;
    const queue = getQueue();
    let synced = 0;
    if (queue.length > 0) {
      try {
        const res = await fetch('/api/flashcards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-sync': 'true' },
          body: JSON.stringify({ cards: queue }),
        });
        if (res.ok) { synced = queue.length; saveQueue([]); }
      } catch { /* offline */ }
    }
    const localCards = loadCards();
    const unsynced = localCards.filter(c => !queue.some(q => q.card_id === c.id));
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
          headers: { 'Content-Type': 'application/json', 'x-sync': 'true' },
          body: JSON.stringify({ cards: payload }),
        });
      } catch { /* ignore */ }
    }
    return synced;
  }

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
        const local = loadCards();
        const apiCards: Flashcard[] = res.data.map(row => ({
          id: row.card_id,
          moduleSlug: row.module_slug,
          front: row.question,
          back: row.answer,
          difficulty: 'medium' as Difficulty,
          deckCategory: 'quiz' as DeckCategory,
          interval: row.interval,
          repetitions: row.repetitions,
          easeFactor: row.ease_factor,
          nextReview: row.next_review || new Date().toISOString(),
          tags: [],
        }));
        const apiIds = new Set(apiCards.map(c => c.id));
        const merged = [...apiCards, ...local.filter(c => !apiIds.has(c.id))];
        saveCards(merged);
      }
    } catch { /* offline — use localStorage */ }
    syncAll().catch(() => {});
  }

  async function generateFromModule(moduleSlug: string, deckCategory?: DeckCategory): Promise<number> {
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
          deckCategory: deckCategory || 'quiz',
          interval: 0,
          repetitions: 0,
          easeFactor: 2.5,
          nextReview: new Date().toISOString(),
          tags: [],
        };
        cards.push(newCard);
        added++;
      }

      if (added > 0) {
        saveCards(cards);
        if (browser && navigator.onLine) {
          const newCards = cards.slice(-added);
          fetch('/api/flashcards', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-sync': 'true' },
            body: JSON.stringify({
              cards: newCards.map(c => ({
                card_id: c.id,
                module_slug: c.moduleSlug,
                question: c.front,
                answer: c.back,
                ease_factor: c.easeFactor,
                interval: c.interval,
                repetitions: c.repetitions,
                next_review: c.nextReview,
              }))
            }),
          }).catch(() => {});
        }
      }
    } catch { return 0; }

    return added;
  }

  function clearCards(): void {
    saveCards([]);
    saveQueue([]);
  }

  if (browser) {
    setTimeout(() => initFromApi(), 100);
  }

  return {
    getCards,
    addCard,
    deleteCard,
    getCardsDueToday,
    getCardsDueByDeck,
    getCardCounts,
    getDecks,
    getCardsByDeck,
    reviewCard,
    getReviewStats,
    resetStats,
    generateFromModule,
    clearCards,
    syncAll,
    get version() { void version; return version; },
  };
}

export const flashcards = createFlashcardStore();
