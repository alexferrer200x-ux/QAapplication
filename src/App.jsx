import { useEffect, useMemo, useState } from 'react'
import { rankEntries } from './lib/search'
import { REFERENCE_MATERIAL, REFERENCE_UPDATED, SAMPLE_QUESTIONS } from './data/reference'

function useOnline() {
  const [online, setOnline] = useState(() => navigator.onLine)

  useEffect(() => {
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  return online
}

function App() {
  const [question, setQuestion] = useState('')
  const [selected, setSelected] = useState(null)
  const online = useOnline()

  const results = useMemo(
    () => rankEntries(question, REFERENCE_MATERIAL),
    [question],
  )

  const topResult = results[0] ?? null
  const isSearching = question.trim().length > 0
  const alternatives = results.slice(1, 4)
  const active = selected ?? topResult

  function submit(event) {
    event.preventDefault()
    setSelected(null)
  }

  function pick(entry) {
    setSelected(entry)
    setQuestion(entry.question)
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">QA App</p>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              online
                ? 'bg-emerald-500/15 text-emerald-300'
                : 'bg-amber-500/15 text-amber-300'
            }`}
          >
            {online ? 'Online' : 'Offline'}
          </span>
        </div>
        <h1 className="text-2xl font-semibold text-white sm:text-3xl">
          Ask about your reference guide
        </h1>
        <p className="text-sm text-slate-400">
          Searches {REFERENCE_MATERIAL.length} entries bundled with the app. Works offline.
        </p>
      </header>

      <form onSubmit={submit} className="flex flex-col gap-3">
        <label htmlFor="question" className="sr-only">
          Ask a question
        </label>
        <textarea
          id="question"
          value={question}
          onChange={(event) => {
            setQuestion(event.target.value)
            setSelected(null)
          }}
          placeholder="Ask about QA, testing, or the release process..."
          rows={3}
          className="w-full resize-y rounded-xl border border-white/10 bg-surface-raised px-4 py-3 text-base text-slate-100 placeholder:text-slate-500 focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          disabled={!isSearching}
          className="rounded-xl bg-accent px-5 py-3 font-semibold text-slate-900 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Search
        </button>
      </form>

      <section aria-label="Sample questions" className="flex flex-col gap-2">
        <h2 className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
          Try a sample
        </h2>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_QUESTIONS.map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => pick(sample)}
              className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-slate-300 transition hover:border-accent hover:text-white"
            >
              {sample}
            </button>
          ))}
        </div>
      </section>

      <section
        aria-live="polite"
        className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-surface-raised p-5"
      >
        {active ? (
          <>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold tracking-wider text-accent uppercase">
                Best match
              </span>
              <h2 className="text-lg font-semibold text-white">{active.question}</h2>
            </div>
            <p className="text-sm leading-relaxed text-slate-300">{active.answer}</p>
            {alternatives.length > 0 && (
              <div className="flex flex-col gap-2 border-t border-white/10 pt-4">
                <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  Other matches
                </span>
                <ul className="flex flex-col gap-1.5">
                  {alternatives.map((entry) => (
                    <li key={entry.question}>
                      <button
                        type="button"
                        onClick={() => pick(entry)}
                        className="text-left text-sm text-slate-400 underline-offset-4 hover:text-accent hover:underline"
                      >
                        {entry.question}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-slate-400">
            {isSearching
              ? 'No related answer found. Try different wording or pick a sample question.'
              : 'Enter a question or choose a sample to search the reference guide.'}
          </p>
        )}
      </section>

      <footer className="mt-auto flex flex-col gap-1 border-t border-white/10 pt-4 text-xs text-slate-500">
        <span>Reference material updated {REFERENCE_UPDATED}</span>
        <span>Bundled locally &middot; no network required</span>
      </footer>
    </div>
  )
}

export default App