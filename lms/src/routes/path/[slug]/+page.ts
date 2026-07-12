import { error } from '@sveltejs/kit';
import { getPathBySlug } from '$lib/stores/paths';

export function load({ params }) {
  const path = getPathBySlug(params.slug);
  if (!path) error(404, 'Path tidak ditemukan');
  return { path };
}
