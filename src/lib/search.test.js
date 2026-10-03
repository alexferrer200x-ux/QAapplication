import { describe, expect, it } from 'vitest'
import { findBestAnswer, getKeywords, normalizeText, rankEntries } from './search'
import { REFERENCE_MATERIAL } from '../data/reference'

describe('normalizeText', () => {
  it('lowercases and strips punctuation', () => {
    expect(normalizeText('What is QA?')).toBe('what is qa')
    expect(normalizeText('Regression-Testing_101')).toBe('regression testing 101')
  })

  it('collapses repeated whitespace', () => {
    expect(normalizeText('  smoke   test \n\n run ')).toBe('smoke test run')
  })

  it('handles null and undefined', () => {
    expect(normalizeText(null)).toBe('')
    expect(normalizeText(undefined)).toBe('')
  })
})

describe('getKeywords', () => {
  it('removes stop words', () => {
    expect(getKeywords('What is the difference between QA and QC')).toEqual([
      'difference',
      'qa',
      'qc',
    ])
  })

  it('returns empty array for only stop words', () => {
    expect(getKeywords('what is it')).toEqual([])
  })
})

describe('rankEntries', () => {
  it('returns empty for blank questions', () => {
    expect(rankEntries('', REFERENCE_MATERIAL)).toEqual([])
    expect(rankEntries('   ', REFERENCE_MATERIAL)).toEqual([])
  })

  it('returns empty for empty knowledge base', () => {
    expect(rankEntries('quality assurance', [])).toEqual([])
  })

  it('ranks the most relevant entry first', () => {
    const results = rankEntries('How do I report a bug?', REFERENCE_MATERIAL)
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].question).toBe('How do I report a bug?')
  })

  it('excludes entries with no score', () => {
    const results = rankEntries('zzzz qqqq wwww', REFERENCE_MATERIAL)
    expect(results).toEqual([])
  })

  it('orders results by descending score', () => {
    const results = rankEntries('test coverage percentage', REFERENCE_MATERIAL)
    const scores = results.map((entry) => entry.score)
    expect([...scores].sort((a, b) => b - a)).toEqual(scores)
  })

  it('tolerates entries missing a keywords array', () => {
    const kb = [{ question: 'What is QA?', answer: 'Quality assurance definition' }]
    expect(rankEntries('quality assurance', kb)).toHaveLength(1)
  })
})

describe('findBestAnswer', () => {
  it('returns the top ranked entry', () => {
    const match = findBestAnswer('What is regression testing?', REFERENCE_MATERIAL)
    expect(match.question).toBe('What is regression testing?')
  })

  it('returns null when nothing matches', () => {
    expect(findBestAnswer('zzzz qqqq', REFERENCE_MATERIAL)).toBeNull()
  })

  it('returns null for an empty question', () => {
    expect(findBestAnswer('   ', REFERENCE_MATERIAL)).toBeNull()
  })

  it('matches every sample question in the shipped reference', () => {
    const samples = [
      'What is QA?',
      'How do I report a bug?',
      'What is regression testing?',
      'What is test coverage?',
    ]
    for (const sample of samples) {
      expect(findBestAnswer(sample, REFERENCE_MATERIAL)?.question).toBe(sample)
    }
  })
})

describe('reference material integrity', () => {
  it('every entry has question, answer, and keywords', () => {
    for (const entry of REFERENCE_MATERIAL) {
      expect(typeof entry.question).toBe('string')
      expect(typeof entry.answer).toBe('string')
      expect(Array.isArray(entry.keywords)).toBe(true)
    }
  })

  it('has no duplicate questions', () => {
    const questions = REFERENCE_MATERIAL.map((entry) => entry.question)
    expect(new Set(questions).size).toBe(questions.length)
  })
})