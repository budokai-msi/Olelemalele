// src/models/Order.ts
import mongoose, { Document, Model, Schema, Types } from 'mongoose'

export interface IOrder extends Document {
  userId: Types.ObjectId
  items: {
    productId: string
    name: string
    price: number
    quantity: number
    variant: string
  }[]
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered'
  shippingAddress: {
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
  createdAt: Date
  updatedAt: Date
}

const OrderSchema = new Schema<IOrder>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    variant: { type: String, required: true }
  }],
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered'],
    default: 'pending'
  },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, required: true }
  }
}, {
  timestamps: true
})

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema)
export default Order
