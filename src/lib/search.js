const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'between',
  'by',
  'do',
  'does',
  'for',
  'from',
  'how',
  'i',
  'in',
  'is',
  'it',
  'of',
  'on',
  'or',
  'that',
  'the',
  'their',
  'there',
  'this',
  'to',
  'was',
  'what',
  'when',
  'where',
  'which',
  'who',
  'why',
  'with',
])

export function normalizeText(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function getKeywords(value) {
  return normalizeText(value)
    .split(' ')
    .filter((word) => word && !STOP_WORDS.has(word))
}

function scoreEntry(question, entry) {
  const normalizedQuestion = normalizeText(question)
  const questionTokens = [...new Set(getKeywords(question))]
  const normalizedEntryQuestion = normalizeText(entry.question)
  const normalizedEntryAnswer = normalizeText(entry.answer)
  const entryTokens = new Set(
    getKeywords(`${entry.question} ${entry.answer} ${(entry.keywords ?? []).join(' ')}`),
  )

  let score = 0

  for (const token of questionTokens) {
    if (normalizedEntryQuestion.includes(token)) score += 3
    if (normalizedEntryAnswer.includes(token)) score += 2
    if ((entry.keywords ?? []).some((k) => normalizeText(k).includes(token))) score += 3
    if (entryTokens.has(token)) score += 1
  }

  if (normalizedQuestion.includes(normalizedEntryQuestion)) score += 5

  return score
}

export function rankEntries(question, knowledgeBase = []) {
  if (!normalizeText(question) || !Array.isArray(knowledgeBase) || !knowledgeBase.length) {
    return []
  }

  return knowledgeBase
    .map((entry) => ({ ...entry, score: scoreEntry(question, entry) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
}

export function findBestAnswer(question, knowledgeBase = []) {
  return rankEntries(question, knowledgeBase)[0] ?? null
}