// src/models/Upload.ts
import mongoose, { Document, Model, Schema } from 'mongoose'

export interface IUpload extends Document {
  productId: string
  originalFilename: string
  storedFilename: string
  imagePath: string
  mimeType: string
  fileSize: number
  submittedBy: string
  submittedByEmail: string
  status: 'pending' | 'approved' | 'rejected'
  reviewedBy?: string
  reviewNote?: string
  createdAt: Date
  updatedAt: Date
}

const UploadSchema = new Schema<IUpload>({
  productId: { type: String, required: true },
  originalFilename: { type: String, required: true },
  storedFilename: { type: String, required: true },
  imagePath: { type: String, required: true },
  mimeType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  submittedBy: { type: String, required: true },
  submittedByEmail: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: { type: String },
  reviewNote: { type: String },
}, {
  timestamps: true
})

const Upload: Model<IUpload> = mongoose.models.Upload || mongoose.model<IUpload>('Upload', UploadSchema)
export default Upload
