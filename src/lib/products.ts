// Backward compatibility exports - CLIENT SAFE ONLY
// For database functions, import directly from: @/lib/db/products

export { products, getRelatedProducts, getProductsByCollection, getCollections } from './data/products'
export type { Product, ProductVariant } from './data/products'

// Alias for backward compatibility (staticProducts === products)
export { products as staticProducts } from './data/products'

// NOTE: Server-only DB functions removed from here to prevent client bundle bloat
// Import these directly in server code:
//   import { getProducts, getProductById, seedProducts } from '@/lib/db/products'
