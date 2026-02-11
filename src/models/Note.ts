// src/models/Note.ts
import mongoose, { Document, Model, Schema } from 'mongoose'

export interface INote extends Document {
  content: string
  author: string
  authorEmail: string
  authorRole: 'admin' | 'super_admin' | 'curator'
  page: string          // URL path where note was placed
  positionX: number     // percentage 0-100
  positionY: number     // percentage 0-100
  color: 'yellow' | 'blue' | 'green' | 'pink' | 'orange'
  resolved: boolean
  resolvedBy?: string
  resolvedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const NoteSchema = new Schema<INote>({
  content: { type: String, required: true, maxlength: 500 },
  author: { type: String, required: true },
  authorEmail: { type: String, required: true },
  authorRole: {
    type: String,
    enum: ['admin', 'super_admin', 'curator'],
    required: true
  },
  page: { type: String, required: true },
  positionX: { type: Number, required: true, min: 0, max: 100 },
  positionY: { type: Number, required: true, min: 0, max: 100 },
  color: {
    type: String,
    enum: ['yellow', 'blue', 'green', 'pink', 'orange'],
    default: 'yellow'
  },
  resolved: { type: Boolean, default: false },
  resolvedBy: { type: String },
  resolvedAt: { type: Date },
}, {
  timestamps: true
})

const Note: Model<INote> = mongoose.models.Note || mongoose.model<INote>('Note', NoteSchema)
export default Note
