import mongoose from 'mongoose';

const applicationSchema = mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    drive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Drive',
      required: true,
    },
    status: {
      type: String,
      enum: ['Applied', 'Shortlisted', 'Rejected', 'Selected', 'Pending'],
      default: 'Applied',
    },
    documents: [{
      type: {
        type: String,
      },
      url: String,
      publicId: String,
    }],
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate applications
applicationSchema.index({ student: 1, drive: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);

export default Application;

