import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { SelectField, TextField } from '@/components/ui/Field'
import { useBrands, useCategories } from './hooks'
import { SORTS, type FilterKey, type ShopFilters } from './filters'

const SEARCH_DELAY_MS = 300

type ShopToolbarProps = {
  filters: ShopFilters
  /** Sets one filter in the URL. `typing` replaces the history entry instead of adding one. */
  onChange: (key: FilterKey, value: string, options?: { typing?: boolean }) => void
}

/** Search box, category and brand filters, and sort order. */
export function ShopToolbar({ filters, onChange }: ShopToolbarProps) {
  const categories = useCategories()
  const brands = useBrands()
  const [text, setText] = useState(filters.q)
  // The last search this box put in the URL.
  const sent = useRef(filters.q)

  const search = useCallback(
    (q: string, options?: { typing?: boolean }) => {
      sent.current = q
      onChange('q', q, options)
    },
    [onChange],
  )

  // Follow the URL when it changes from elsewhere (header search, clear
  // filters, back button). Our own searches are skipped: by the time the URL
  // shows one, the user may have typed more.
  useEffect(() => {
    if (filters.q !== sent.current) setText(filters.q)
    sent.current = filters.q
  }, [filters.q])

  // Search once typing pauses.
  useEffect(() => {
    const q = text.trim()
    if (q === sent.current) return
    const timer = setTimeout(() => search(q, { typing: true }), SEARCH_DELAY_MS)
    return () => clearTimeout(timer)
  }, [text, search])

  // Enter searches straight away.
  function submit(event: FormEvent) {
    event.preventDefault()
    const q = text.trim()
    if (q !== sent.current) search(q)
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
      <form role="search" onSubmit={submit}>
        <TextField
          label="Search"
          type="search"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Sofa, teak, velvet…"
          maxLength={100}
        />
      </form>
      <SelectField
        label="Category"
        value={filters.category}
        onChange={(e) => onChange('category', e.target.value)}
        disabled={!categories.data}
      >
        <option value="">All categories</option>
        {categories.data
          ?.filter((c) => c.isActive || c._id === filters.category)
          .map((c) => (
            <option key={c._id} value={c._id}>
              {c.categoryName}
            </option>
          ))}
      </SelectField>
      <SelectField label="Brand" value={filters.brand} onChange={(e) => onChange('brand', e.target.value)} disabled={!brands.data}>
        <option value="">All brands</option>
        {brands.data?.map((b) => (
          <option key={b._id} value={b._id}>
            {b.brandName}
          </option>
        ))}
      </SelectField>
      <SelectField label="Sort by" value={filters.sort} onChange={(e) => onChange('sort', e.target.value)}>
        {SORTS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </SelectField>
    </div>
  )
}
