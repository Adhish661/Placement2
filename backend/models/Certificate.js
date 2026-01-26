import mongoose from 'mongoose';

const certificateSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    type: {
      type: String,
      enum: ['Certificate', 'Competition', 'Award', 'Other'],
      default: 'Certificate',
    },
    fileUrl: {
      type: String,
      required: true,
    },
    filePublicId: {
      type: String,
    },
    issuedBy: {
      type: String,
    },
    issuedDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Certificate = mongoose.model('Certificate', certificateSchema);

export default Certificate;

