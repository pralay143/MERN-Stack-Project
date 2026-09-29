import { useEffect, useRef, useState, type FormEvent } from 'react'
import { TextField } from './Field'

const SEARCH_DELAY_MS = 300

type SearchFieldProps = {
  label: string
  /** The search currently applied (e.g. from the URL). */
  value: string
  /** Called with the trimmed text once typing pauses, or at once on Enter. `typing` is false for Enter. */
  onSearch: (q: string, options: { typing: boolean }) => void
  placeholder?: string
}

/** A search box that searches as you type, after a short pause. */
export function SearchField({ label, value, onSearch, placeholder }: SearchFieldProps) {
  const [text, setText] = useState(value)
  // The last search this box sent.
  const sent = useRef(value)
  // Latest callback, so a new function each render doesn't restart the timer.
  const onSearchRef = useRef(onSearch)
  useEffect(() => {
    onSearchRef.current = onSearch
  })

  // Follow `value` when it changes from elsewhere (clear filters, back
  // button). Our own searches are skipped: by the time `value` shows one,
  // the user may have typed more.
  useEffect(() => {
    if (value !== sent.current) setText(value)
    sent.current = value
  }, [value])

  // Search once typing pauses.
  useEffect(() => {
    const q = text.trim()
    if (q === sent.current) return
    const timer = setTimeout(() => {
      sent.current = q
      onSearchRef.current(q, { typing: true })
    }, SEARCH_DELAY_MS)
    return () => clearTimeout(timer)
  }, [text])

  // Enter searches straight away.
  function submit(event: FormEvent) {
    event.preventDefault()
    const q = text.trim()
    if (q === sent.current) return
    sent.current = q
    onSearchRef.current(q, { typing: false })
  }

  return (
    <form role="search" onSubmit={submit}>
      <TextField
        label={label}
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        maxLength={100}
      />
    </form>
  )
}
