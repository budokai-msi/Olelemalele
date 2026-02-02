// src/lib/products.ts
export interface Product {
  id: string
  name: string
  category: 'archival' | 'experimental' | 'limited' | 'portrait' | 'urban'
  type: 'canvas'
  image: string
  price: number
  description?: string
  variants: { size: string; color?: string }[]
  collection?: string
  tags?: string[]
}

export const products: Product[] = [
  // === EXPERIMENTAL COLLECTION (Featured/Premium) ===
  {
    id: '0',
    name: 'PETRA MAJESTY',
    category: 'experimental',
    type: 'canvas',
    image: '/products/Petra_opt.jpg',
    price: 35000,
    description: 'The Treasury of Petra. Rose-red city half as old as time. Limited to 50 signed editions.',
    variants: [{ size: '24x36' }, { size: '36x48' }],
    collection: 'Genesis Drop',
    tags: ['petra', 'heritage', 'premium'],
  },
  {
    id: '7',
    name: 'BAMBOO SERENITY',
    category: 'experimental',
    type: 'canvas',
    image: '/products/Bamboo_Kamakura_opt.jpg',
    price: 32000,
    description: 'Ancient bamboo groves of Japan. Light filtering through centuries of tranquility.',
    variants: [{ size: '12x16' }, { size: '24x36' }],
    collection: 'Genesis Drop',
    tags: ['bamboo', 'japan', 'zen'],
  },
  {
    id: '8',
    name: 'VITOSHA MAJESTY',
    category: 'experimental',
    type: 'canvas',
    image: '/products/vitosha_final_1.jpg',
    price: 42000,
    description: 'Bulgaria\'s crown jewel. Mountain grandeur captured at golden hour.',
    variants: [{ size: '36x48' }, { size: '48x60' }],
    collection: 'Genesis Drop',
    tags: ['mountain', 'landscape', 'collector'],
  },
  {
    id: '9',
    name: 'WADI RUM SUNSET',
    category: 'experimental',
    type: 'canvas',
    image: '/products/wadi_rum_5_opt.jpg',
    price: 28000,
    description: 'Mars on Earth. The Valley of the Moon in golden desert light.',
    variants: [{ size: '16x20' }, { size: '24x30' }],
    collection: 'Spectrum Series',
    tags: ['desert', 'jordan', 'landscape'],
  },

  // === JAPAN COLLECTION ===
  {
    id: '1',
    name: 'BAMBOO SANCTUARY',
    category: 'archival',
    type: 'canvas',
    image: '/products/Bamboo_forest_opt.jpg',
    price: 24000,
    description: 'Tranquil bamboo groves of Kyoto. Archival-grade pigment on 400g canvas fibers.',
    variants: [{ size: '12x16' }, { size: '16x20' }, { size: '20x24' }],
    collection: 'Japan Series',
    tags: ['japan', 'nature', 'bamboo'],
  },
  {
    id: '2',
    name: 'BAMBOO LIGHT',
    category: 'archival',
    type: 'canvas',
    image: '/products/Bamboo_Kamakura_opt.jpg',
    price: 26000,
    description: 'Light filtering through ancient bamboo in Kamakura. Museum-quality print with deep shadow preservation.',
    variants: [{ size: 'A3' }, { size: 'A2' }],
    collection: 'Japan Series',
    tags: ['japan', 'bamboo', 'tranquil'],
  },
  {
    id: '3',
    name: 'KYOTO GOLDEN TEMPLE',
    category: 'archival',
    type: 'canvas',
    image: '/products/Kyoto_Golden_castle_opt.jpg',
    price: 29000,
    description: 'The iconic Kinkaku-ji reflected in still waters. Printed in 12-color giclée.',
    variants: [{ size: '12x16' }, { size: '24x36' }],
    collection: 'Japan Series',
    tags: ['japan', 'temple', 'iconic'],
  },
  {
    id: '4',
    name: 'NARA DEER LOVE',
    category: 'archival',
    type: 'canvas',
    image: '/products/Nara_Dear_Love_opt.jpg',
    price: 21000,
    description: 'Tender moment captured in Nara Park. A visual poem of wildlife and serenity.',
    variants: [{ size: 'A3' }, { size: '16x20' }],
    collection: 'Japan Series',
    tags: ['japan', 'wildlife', 'tender'],
  },
  {
    id: '5',
    name: 'TOKYO TOWER DUSK',
    category: 'urban',
    type: 'canvas',
    image: '/products/Tokyo_TV_tower_2_opt.jpg',
    price: 27000,
    description: 'Tokyo Tower at golden hour. High-definition perspective on premium gallery-wrapped canvas.',
    variants: [{ size: '12x16' }, { size: '24x36' }],
    collection: 'Japan Series',
    tags: ['japan', 'urban', 'iconic'],
  },
  {
    id: '6',
    name: 'HIROSHIMA BLOSSOM',
    category: 'archival',
    type: 'canvas',
    image: '/products/Hiroshima_blossom_opt.jpg',
    price: 24000,
    description: 'Cherry blossoms in Hiroshima. A symbol of renewal and hope.',
    variants: [{ size: '16x20' }, { size: '24x30' }],
    collection: 'Japan Series',
    tags: ['japan', 'blossom', 'spring'],
  },

  // === JORDAN COLLECTION ===
  {
    id: '10',
    name: 'PETRA MAJESTY',
    category: 'archival',
    type: 'canvas',
    image: '/products/Petra_opt.jpg',
    price: 38000,
    description: 'The Treasury of Petra. One of the world\'s most iconic archaeological sites.',
    variants: [{ size: '20x30' }, { size: '30x45' }],
    collection: 'Jordan Series',
    tags: ['jordan', 'petra', 'heritage'],
  },
  {
    id: '11',
    name: 'WADI RUM DESERT',
    category: 'archival',
    type: 'canvas',
    image: '/products/wadi_rum_opt.jpg',
    price: 26000,
    description: 'The Valley of the Moon. Mars on Earth captured in stunning detail.',
    variants: [{ size: '16x24' }, { size: '24x36' }],
    collection: 'Jordan Series',
    tags: ['jordan', 'desert', 'landscape'],
  },
  {
    id: '12',
    name: 'DESERT CARAVAN',
    category: 'archival',
    type: 'canvas',
    image: '/products/camels_on_the_go_opt.jpg',
    price: 24000,
    description: 'Camels crossing Wadi Rum. Timeless Arabian landscapes.',
    variants: [{ size: '24x36' }, { size: '36x48' }],
    collection: 'Jordan Series',
    tags: ['jordan', 'camels', 'desert'],
  },

  // === PORTRAIT COLLECTION ===
  {
    id: '13',
    name: 'BUDDHA SERENITY',
    category: 'portrait',
    type: 'canvas',
    image: '/products/Buddha_in_Kamakura_opt.jpg',
    price: 32000,
    description: 'The Great Buddha of Kamakura. A study in monumental tranquility.',
    variants: [{ size: '20x24' }, { size: '30x36' }],
    collection: 'Spiritual',
    tags: ['portrait', 'buddha', 'japan'],
  },
  {
    id: '14',
    name: 'KOI DANCE',
    category: 'archival',
    type: 'canvas',
    image: '/products/Koi_fish_opt.jpg',
    price: 22000,
    description: 'Koi fish in perfect harmony. Symbol of perseverance and good fortune.',
    variants: [{ size: '16x20' }, { size: '24x30' }],
    collection: 'Japan Series',
    tags: ['japan', 'koi', 'zen'],
  },

  // === VITOSHA / MOUNTAIN COLLECTION ===
  {
    id: '15',
    name: 'VITOSHA PEAK',
    category: 'limited',
    type: 'canvas',
    image: '/products/vitosha_final_1.jpg',
    price: 45000,
    description: 'Edition of 10. Vitosha mountain at dawn. Hand-numbered and signed.',
    variants: [{ size: '48x60' }, { size: '60x72' }],
    collection: 'Mountain Series',
    tags: ['limited', 'mountain', 'bulgaria'],
  },
  {
    id: '16',
    name: 'ALPINE SOLITUDE',
    category: 'limited',
    type: 'canvas',
    image: '/products/vitosha_final_5.jpg',
    price: 48000,
    description: 'Edition of 15. Where sky meets stone. Bulgaria\'s crown jewel.',
    variants: [{ size: '40x50' }, { size: '50x60' }],
    collection: 'Mountain Series',
    tags: ['limited', 'mountain', 'nature'],
  },
  {
    id: '17',
    name: 'WINTER MAJESTY',
    category: 'limited',
    type: 'canvas',
    image: '/products/vitosha_final_10.jpg',
    price: 55000,
    description: 'Edition of 25. Vitosha blanketed in pristine snow. A masterwork of frozen perfection.',
    variants: [{ size: '36x48' }],
    collection: 'Mountain Series',
    tags: ['limited', 'winter', 'snow'],
  },
]

// Get related products based on category and tags
export function getRelatedProducts(productId: string, limit = 4): Product[] {
  const product = products.find(p => p.id === productId)
  if (!product) return products.slice(0, limit)

  return products
    .filter(p => p.id !== productId)
    .map(p => {
      let score = 0
      if (p.category === product.category) score += 3
      if (p.collection === product.collection) score += 2
      if (p.tags?.some(tag => product.tags?.includes(tag))) score += 1
      return { product: p, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.product)
}

// Get products by collection
export function getProductsByCollection(collection: string): Product[] {
  return products.filter(p => p.collection === collection)
}

// Get all unique collections
export function getCollections(): string[] {
  return Array.from(new Set(products.map(p => p.collection).filter(Boolean) as string[]))
}
