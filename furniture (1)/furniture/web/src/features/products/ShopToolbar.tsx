import { SelectField } from '@/components/ui/Field'
import { SearchField } from '@/components/ui/SearchField'
import { useBrands, useCategories } from './hooks'
import { SORTS, type FilterKey, type ShopFilters } from './filters'

type ShopToolbarProps = {
  filters: ShopFilters
  /** Sets one filter in the URL. `typing` replaces the history entry instead of adding one. */
  onChange: (key: FilterKey, value: string, options?: { typing?: boolean }) => void
}

/** Search box, category and brand filters, and sort order. */
export function ShopToolbar({ filters, onChange }: ShopToolbarProps) {
  const categories = useCategories()
  const brands = useBrands()

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
      <SearchField
        label="Search"
        value={filters.q}
        onSearch={(q, { typing }) => onChange('q', q, { typing })}
        placeholder="Sofa, teak, velvet…"
      />
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
