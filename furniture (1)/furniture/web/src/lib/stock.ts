/** At or below this many, shoppers see "Only N left". */
export const LOW_STOCK_AT = 3

export type StockStatus = { label: string; tone: 'ok' | 'low' | 'out' }

/** What to tell a shopper about a product's stock. */
export function stockStatus(stock: number): StockStatus {
  if (stock <= 0) return { label: 'Sold out', tone: 'out' }
  if (stock <= LOW_STOCK_AT) return { label: `Only ${stock} left`, tone: 'low' }
  return { label: 'In stock', tone: 'ok' }
}
