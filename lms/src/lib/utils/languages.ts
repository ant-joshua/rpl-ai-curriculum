/**
 * Shared highlight.js language definitions.
 * Only languages used in curriculum content — ~15KB vs ~886KB with all 190+.
 *
 * highlight.js grammars already include aliases (e.g., 'js' is aliased to 'javascript').
 * To add a new language, import from highlight.js/lib/languages/<name> and add to grammars.
 */
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import xml from 'highlight.js/lib/languages/xml'; // handles HTML
import css from 'highlight.js/lib/languages/css';
import scss from 'highlight.js/lib/languages/scss';
import bash from 'highlight.js/lib/languages/bash';
import sql from 'highlight.js/lib/languages/sql';
import json from 'highlight.js/lib/languages/json';
import java from 'highlight.js/lib/languages/java';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import csharp from 'highlight.js/lib/languages/csharp';
import php from 'highlight.js/lib/languages/php';
import ruby from 'highlight.js/lib/languages/ruby';
import diff from 'highlight.js/lib/languages/diff';
import shell from 'highlight.js/lib/languages/shell';
import yaml from 'highlight.js/lib/languages/yaml';
import plaintext from 'highlight.js/lib/languages/plaintext';

/**
 * Curated set of languages for the curriculum LMS.
 * Each grammar definition includes its own aliases (e.g., 'js' → javascript).
 */
export const curriculumGrammars = {
  javascript,
  typescript,
  python,
  xml,
  css,
  scss,
  bash,
  shell,
  sql,
  json,
  java,
  go,
  rust,
  c,
  cpp,
  csharp,
  php,
  ruby,
  diff,
  yaml,
  plaintext,
};
