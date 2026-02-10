import mongoose from 'mongoose';

const resourceSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    type: {
      type: String,
      enum: ['aptitude', 'technical', 'company-wise', 'general'],
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    filePublicId: {
      type: String,
    },
    fileMimeType: {
      type: String,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    department: {
      type: String,
    },
    tags: [String],
  },
  {
    timestamps: true,
  }
);

const Resource = mongoose.model('Resource', resourceSchema);

export default Resource;

