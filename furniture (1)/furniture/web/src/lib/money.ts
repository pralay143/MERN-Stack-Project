// The API stores money as integer paise (₹1 = 100 paise). Convert only when
// showing a price or reading one the user typed.

const wholeRupees = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
const withPaise = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 })

/** 2550000 → "₹25,500"; 2550050 → "₹25,500.50" (Indian digit grouping). */
export function formatPaise(paise: number): string {
  const rupees = paise / 100
  return (Number.isInteger(rupees) ? wholeRupees : withPaise).format(rupees)
}

/** Rupees typed by a user ("25,500.5") → paise (2550050), or NaN if not a number. */
export function rupeesToPaise(rupees: string | number): number {
  const value = typeof rupees === 'number' ? rupees : Number(rupees.replace(/[₹,\s]/g, ''))
  return Number.isFinite(value) ? Math.round(value * 100) : Number.NaN
}
