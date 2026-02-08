// Backward compatibility re-exports
// Client components should import from: @/lib/data/products
// Server components/APIs should import DB functions from: @/lib/db/products

export { products, getRelatedProducts, getProductsByCollection, getCollections } from './data/products'
export { getProducts, getProductById, seedProducts } from './db/products'
export type { Product, ProductVariant } from './data/products'

// Alias for backward compatibility (staticProducts === products)
export { products as staticProducts } from './data/products'
