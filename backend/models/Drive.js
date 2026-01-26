import mongoose from 'mongoose';

const driveSchema = mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
    },
    jobRole: {
      type: String,
      required: true,
    },
    jobDescription: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    stipend: {
      type: String,
    },
    salary: {
      type: String,
    },
    experienceRequired: {
      type: String,
    },
    qualification: {
      type: String,
    },
    eligibilityCriteria: {
      type: String,
    },
    serviceAgreement: {
      required: {
        type: Boolean,
        default: false,
      },
      details: String,
    },
    shift: {
      type: String,
    },
    workMode: {
      type: String,
      enum: ['Onsite', 'Remote', 'Hybrid'],
    },
    applicationLink: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    department: {
      type: String,
    },
    assignedTo: [{
      coordinator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      department: String,
      assignedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    sharedWith: [{
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      sharedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    shareCriteria: {
      minCGPA: Number,
      maxCGPA: Number,
      branches: [String],
      programs: [String],
      passoutYears: [String],
      requiredSkills: [String],
    },
    status: {
      type: String,
      enum: ['Draft', 'Active', 'Closed'],
      default: 'Draft',
    },
    applicationDeadline: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Drive = mongoose.model('Drive', driveSchema);

export default Drive;

