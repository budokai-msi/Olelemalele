// src/models/User.ts
import mongoose, { Document, Model, Schema } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  password: string
  role: 'user' | 'admin' | 'super_admin' | 'curator'
  cart: {
    productId: string
    quantity: number
    variant: string
  }[]
  orders: string[]
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['user', 'admin', 'super_admin', 'curator'],
    default: 'user'
  },
  cart: [{
    productId: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    variant: { type: String, required: true }
  }],
  orders: [{ type: Schema.Types.ObjectId, ref: 'Order' }]
}, {
  timestamps: true
})

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
export default User
