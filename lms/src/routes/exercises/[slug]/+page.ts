import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
  const res = await fetch('/content/exercises.json');
  const data = await res.json();
  const exercise = data.exercises.find((e: any) => e.slug === params.slug);
  if (!exercise) throw new Error('Exercise tidak ditemukan');
  return { exercise };
};
