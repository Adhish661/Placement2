import mongoose from 'mongoose';

const accomplishmentSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['Certificate', 'Award', 'Workshop', 'Competition'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    fileUrl: {
      type: String,
    },
    filePublicId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Accomplishment = mongoose.model('Accomplishment', accomplishmentSchema);

export default Accomplishment;

