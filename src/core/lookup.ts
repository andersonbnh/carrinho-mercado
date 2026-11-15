export async function lookupName(ean: string, fetchFn: typeof fetch = fetch): Promise<string | null> {
  try {
    const r = await fetchFn(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(ean)}.json?fields=product_name`)
    if (!r.ok) return null
    const j = await r.json()
    return j.status === 1 && j.product?.product_name ? String(j.product.product_name) : null
  } catch {
    return null
  }
}
