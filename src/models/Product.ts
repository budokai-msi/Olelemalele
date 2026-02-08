import mongoose, { Document, Model, Schema } from 'mongoose'

export interface IProductVariant {
  size: string
  color?: string
  sku?: string
  price?: number
}

export interface IProduct extends Document {
  id: string
  name: string
  slug: string
  category: 'archival' | 'experimental' | 'limited' | 'portrait' | 'urban'
  type: 'canvas'
  image: string
  gallery?: string[]
  price: number
  compareAtPrice?: number
  description: string
  shortDescription?: string
  variants: IProductVariant[]
  productCollection?: string
  tags: string[]
  inventory: number
  lowStockThreshold: number
  isActive: boolean
  isFeatured: boolean
  metadata: {
    weight?: number
    dimensions?: string
    materials?: string[]
    care?: string
  }
  seo: {
    title?: string
    description?: string
    keywords?: string[]
  }
  createdAt: Date
  updatedAt: Date
}

const ProductVariantSchema = new Schema<IProductVariant>({
  size: { type: String, required: true },
  color: String,
  sku: String,
  price: Number
})

const ProductSchema = new Schema<IProduct>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  category: {
    type: String,
    enum: ['archival', 'experimental', 'limited', 'portrait', 'urban'],
    required: true
  },
  type: { type: String, enum: ['canvas'], default: 'canvas' },
  image: { type: String, required: true },
  gallery: [String],
  price: { type: Number, required: true },
  compareAtPrice: Number,
  description: { type: String, required: true },
  shortDescription: String,
  variants: [ProductVariantSchema],
  productCollection: String,
  tags: [String],
  inventory: { type: Number, default: 100 },
  lowStockThreshold: { type: Number, default: 10 },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  metadata: {
    weight: Number,
    dimensions: String,
    materials: [String],
    care: String
  },
  seo: {
    title: String,
    description: String,
    keywords: [String]
  }
}, {
  timestamps: true
})

// Indexes for performance
ProductSchema.index({ category: 1 })
ProductSchema.index({ collection: 1 })
ProductSchema.index({ tags: 1 })
ProductSchema.index({ isActive: 1 })
ProductSchema.index({ isFeatured: 1 })
ProductSchema.index({ price: 1 })

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema)
export default Product
