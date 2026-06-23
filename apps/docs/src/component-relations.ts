import type { ComponentDoc } from "./catalog.js";

const RELATED_COMPONENT_LIMIT = 4;

export function getRelatedComponents(
  doc: ComponentDoc,
  catalog: readonly ComponentDoc[],
  limit = RELATED_COMPONENT_LIMIT
): ComponentDoc[] {
  return catalog
    .filter((component) => component.slug !== doc.slug)
    .map((component) => ({
      component,
      score: scoreRelatedComponent(doc, component)
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score || left.component.title.localeCompare(right.component.title))
    .slice(0, limit)
    .map((entry) => entry.component);
}

function scoreRelatedComponent(source: ComponentDoc, candidate: ComponentDoc): number {
  const sourceSlugTokens = tokenize(source.slug);
  const candidateSlugTokens = tokenize(candidate.slug);
  const sourceTitleTokens = tokenize(source.title);
  const candidateTitleTokens = tokenize(candidate.title);
  const sharedSlugTokens = countSharedTokens(sourceSlugTokens, candidateSlugTokens);
  const sharedTitleTokens = countSharedTokens(sourceTitleTokens, candidateTitleTokens);
  const sharedPrefixTokens = countSharedPrefixTokens(sourceSlugTokens, candidateSlugTokens);
  const sharedSequenceTokens = countSharedSequenceTokens(sourceSlugTokens, candidateSlugTokens);
  const directFamilyMatch =
    source.slug.startsWith(`${candidate.slug}-`) ||
    candidate.slug.startsWith(`${source.slug}-`);

  let score = 0;

  if (source.category === candidate.category) {
    score += 24;
  }

  if (source.layer === candidate.layer) {
    score += 8;
  }

  if (source.nativeFoundation === candidate.nativeFoundation) {
    score += 14;
  }

  score += sharedSlugTokens * 18;
  score += sharedTitleTokens * 10;

  if (sharedPrefixTokens > 0) {
    score += 80 + sharedPrefixTokens * 30;
  }

  if (sharedSequenceTokens > 0) {
    score += 40 + sharedSequenceTokens * 24;
  }

  if (directFamilyMatch) {
    score += 120;
  }

  return score;
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/u)
    .filter(Boolean);
}

function countSharedTokens(left: readonly string[], right: readonly string[]): number {
  const rightTokens = new Set(right);
  return [...new Set(left)].filter((token) => rightTokens.has(token)).length;
}

function countSharedPrefixTokens(left: readonly string[], right: readonly string[]): number {
  let count = 0;

  while (count < left.length && count < right.length && left[count] === right[count]) {
    count += 1;
  }

  return count;
}

function countSharedSequenceTokens(left: readonly string[], right: readonly string[]): number {
  let best = 0;

  for (let leftIndex = 0; leftIndex < left.length; leftIndex += 1) {
    for (let rightIndex = 0; rightIndex < right.length; rightIndex += 1) {
      let length = 0;

      while (
        leftIndex + length < left.length &&
        rightIndex + length < right.length &&
        left[leftIndex + length] === right[rightIndex + length]
      ) {
        length += 1;
      }

      if (length > best) {
        best = length;
      }
    }
  }

  return best;
}
