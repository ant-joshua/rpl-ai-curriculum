import type { PageLoad } from './$types';
import { caseStudies, getCaseStudyBySlug } from '$lib/stores/case-studies';

export const load: PageLoad = ({ params }) => {
  const cs = getCaseStudyBySlug(params.slug);
  return {
    slug: params.slug,
    caseStudy: cs ?? null
  };
};
