import { browser } from '$app/environment';
import { modules } from './modules';
import { parseQuizHtml } from '$lib/utils/quiz';

const STORAGE_KEY = 'lms-flashcards';

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

function createFlashcardStore() {
  let version = $state(0);

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
    // Explicit intervals from button labels
    const intervalMinutes: Record<number, number> = {
      1: 5,    // Sangat Mudah → 5 minutes
      2: 10,   // Mudah → 10 minutes
      3: 1440, // Sedang → 1 day
      4: 5760, // Sulit → 4 days
    };

    // SM-2 ease factor adjustment
    const easeAdjustments: Record<number, number> = {
      1: 0.15,  // best → increase
      2: 0.05,  // good → slight increase
      3: 0,     // neutral
      4: -0.15, // worst → decrease
    };

    const newInterval = intervalMinutes[rating] / (24 * 60); // convert minutes to days
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
    return updated;
  }

  async function generateFromModule(moduleSlug: string): Promise<number> {
    const mod = modules.find(m => m.slug === moduleSlug);
    if (!mod) return 0;

    const cards = loadCards();
    let added = 0;

    // Fetch content JSON for this module
    try {
      const res = await fetch(`/content/${mod.dirName}.json`);
      if (!res.ok) return 0;
      const content: Record<string, string> = await res.json();

      // Parse quiz content
      const quizKey = Object.keys(content).find(k => k === 'quiz');
      if (!quizKey) return 0;

      const quizContent = content[quizKey];
      const questions = parseQuizHtml(quizContent);

      for (const q of questions) {
        const correctAnswer = q.options[q.correctIndex] || '';
        const front = q.question;
        const back = correctAnswer;

        // Skip duplicates (same question already has a card)
        const exists = cards.some(c => c.front === front && c.moduleSlug === moduleSlug);
        if (exists) continue;

        cards.push({
          id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          moduleSlug,
          front,
          back,
          difficulty: 'medium',
          interval: 0,
          repetitions: 0,
          easeFactor: 2.5,
          nextReview: new Date().toISOString(),
        });
        added++;
      }

      if (added > 0) saveCards(cards);
    } catch {
      return 0;
    }

    return added;
  }

  function clearCards(): void {
    saveCards([]);
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
    get version() { void version; return version; },
  };
}

export const flashcards = createFlashcardStore();
