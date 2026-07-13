#! /usr/bin/env node
/**
 * Prebuild projects: validate static/content/projects.json and inject to SvelteKit
 * Run: node scripts/prebuild-projects.mjs
 * Called from package.json prebuild step
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECTS_FILE = resolve(__dirname, '..', 'static', 'content', 'projects.json');

let ok = true;

try {
  if (!existsSync(PROJECTS_FILE)) {
    console.error('[prebuild-projects] projects.json not found at', PROJECTS_FILE);
    process.exit(1);
  }

  const raw = readFileSync(PROJECTS_FILE, 'utf-8');
  const data = JSON.parse(raw);

  if (!Array.isArray(data)) {
    console.error('[prebuild-projects] projects.json must be an array');
    process.exit(1);
  }

  const slugs = new Set();

  for (const project of data) {
    // Validate required fields
    const required = ['slug', 'title', 'description', 'techs', 'difficulty', 'timeEstimate', 'steps'];
    for (const field of required) {
      if (!(field in project)) {
        console.error(`[prebuild-projects] Project "${project.title || 'unknown'}" missing field: ${field}`);
        ok = false;
      }
    }

    if (!project.slug) {
      console.error('[prebuild-projects] Project missing slug');
      ok = false;
      continue;
    }

    if (slugs.has(project.slug)) {
      console.error(`[prebuild-projects] Duplicate slug: ${project.slug}`);
      ok = false;
    }
    slugs.add(project.slug);

    if (!['beginner', 'intermediate', 'advanced'].includes(project.difficulty)) {
      console.error(`[prebuild-projects] "${project.slug}": invalid difficulty "${project.difficulty}"`);
      ok = false;
    }

    if (!Array.isArray(project.steps) || project.steps.length === 0) {
      console.error(`[prebuild-projects] "${project.slug}": must have at least 1 step`);
      ok = false;
      continue;
    }

    const stepIds = new Set();
    for (const step of project.steps) {
      if (!step.id) { console.error(`[prebuild-projects] "${project.slug}": step missing id`); ok = false; }
      if (!step.title) { console.error(`[prebuild-projects] "${project.slug}": step ${step.id || '?'} missing title`); ok = false; }
      if (!step.instruction) { console.error(`[prebuild-projects] "${project.slug}": step ${step.id || '?'} missing instruction`); ok = false; }
      if (stepIds.has(step.id)) { console.error(`[prebuild-projects] "${project.slug}": duplicate step id ${step.id}`); ok = false; }
      stepIds.add(step.id);
    }
  }

  if (!ok) {
    console.error('[prebuild-projects] ❌ Validation failed');
    process.exit(1);
  }

  console.log(`[prebuild-projects] ✅ ${data.length} projects, ${data.reduce((s, p) => s + p.steps.length, 0)} steps validated`);
} catch (e) {
  console.error('[prebuild-projects] ❌ Error:', e.message);
  process.exit(1);
}
