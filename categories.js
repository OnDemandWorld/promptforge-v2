// categories.js — canonical category registry (v3 feature C4)
//
// Categories have a stable, English, kebab-case `id` (the stored canonical
// value) and a display `name` (English here; localised display names come
// from the i18n catalogs in v3 D-III). The AI classifier prompt and
// cleanCategory() keep matching on English names for model reliability; IDs
// make data portable across locales and UI languages.
//
// Pure module — safe in every context (app, service worker, content bundle,
// web-accessible import).

export const CATEGORIES = Object.freeze([
  Object.freeze({ id: 'writing', name: 'Writing & Content', description: 'blog posts, articles, stories, copywriting, content generation' }),
  Object.freeze({ id: 'coding', name: 'Coding & Development', description: 'code generation, debugging, code review, technical documentation' }),
  Object.freeze({ id: 'analysis', name: 'Analysis & Research', description: 'summarization, research, fact-finding, comparison, synthesis' }),
  Object.freeze({ id: 'creative', name: 'Creative & Design', description: 'creative writing, brainstorming, design ideas, naming, visual concepts' }),
  Object.freeze({ id: 'business', name: 'Business & Marketing', description: 'marketing copy, sales, strategy, branding, customer-facing content' }),
  Object.freeze({ id: 'education', name: 'Education & Learning', description: 'explanations, tutorials, study aids, lesson plans, quizzes' }),
  Object.freeze({ id: 'data', name: 'Data & Technical', description: 'data analysis, SQL, spreadsheets, technical specs, system design' }),
  Object.freeze({ id: 'communication', name: 'Communication & Email', description: 'emails, messages, letters, professional communication' }),
  Object.freeze({ id: 'productivity', name: 'Productivity & Planning', description: 'task lists, planning, scheduling, project management, meeting notes' }),
  Object.freeze({ id: 'other', name: 'Other', description: 'anything that does not clearly fit the above' }),
]);

// Display names for UI consumers (category selects, pills).
export const CATEGORY_NAMES = CATEGORIES.map(c => c.name);

const BY_NAME = new Map(CATEGORIES.map(c => [c.name.toLowerCase(), c]));
const BY_ID = new Map(CATEGORIES.map(c => [c.id, c]));

/** Map a legacy/stored category NAME (any casing) to its canonical id. */
export function categoryIdFromName(name) {
  if (typeof name !== 'string') return null;
  const hit = BY_NAME.get(name.trim().toLowerCase());
  return hit ? hit.id : null;
}

/** Map a canonical id back to its English display name. */
export function categoryNameFromId(id) {
  if (typeof id !== 'string') return null;
  const hit = BY_ID.get(id);
  return hit ? hit.name : null;
}

/** Accept either an id or a name; return the canonical id or null. */
export function canonicalCategoryId(value) {
  if (typeof value !== 'string' || value.length === 0) return null;
  return BY_ID.has(value) ? value : categoryIdFromName(value);
}
