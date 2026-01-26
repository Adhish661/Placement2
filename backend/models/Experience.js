import mongoose from 'mongoose';

const experienceSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    companySector: {
      type: String,
    },
    jobTitle: {
      type: String,
      required: true,
    },
    jobLocation: {
      type: String,
    },
    positionType: {
      type: String,
      enum: ['Internship', 'Full-Time', 'Part-Time'],
      required: true,
    },
    jobFunction: {
      type: String,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    currentlyWorking: {
      type: Boolean,
      default: false,
    },
    salary: {
      type: String,
    },
    description: {
      type: String,
    },
    proofUrl: {
      type: String,
    },
    proofPublicId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Experience = mongoose.model('Experience', experienceSchema);

export default Experience;

