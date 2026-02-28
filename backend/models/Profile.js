import mongoose from 'mongoose';

const profileSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    // Basic Details
    basicDetails: {
      fullName: String,
      dateOfBirth: Date,
      gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
      },
      currentCollege: String,
      permanentAddress: {
        street: String,
        city: String,
        state: String,
        pincode: String,
        country: String,
      },
      currentAddress: {
        street: String,
        city: String,
        state: String,
        pincode: String,
        country: String,
      },
    },
    // Education Details
    education: {
      current: {
        institutionName: String,
        department: String,
        program: String,
        branch: String,
        currentSemester: String,
        rollNumber: String,
        passoutBatch: String,
        cgpa: Number,
      },
      classX: {
        institution: String,
        board: String,
        program: String,
        educationType: {
          type: String,
          enum: ['Regular', 'Private'],
        },
        startingYear: Number,
        endingYear: Number,
        percentage: Number,
      },
      classXII: {
        institution: String,
        board: String,
        program: String,
        branch: String,
        educationType: {
          type: String,
          enum: ['Regular', 'Private'],
        },
        startingYear: Number,
        endingYear: Number,
        percentage: Number,
      },
    },
    // Skills - dynamic sections with named groups of skills
    skills: {
      sections: [
        {
          name: String,
          items: [String],
        },
      ],
    },
    // Profile Photo
    profilePhoto: {
      url: String,
      publicId: String,
    },
    // Profile completion status
    profileCompletion: {
      basicDetails: { type: Boolean, default: false },
      education: { type: Boolean, default: false },
      skills: { type: Boolean, default: false },
      overall: { type: Number, default: 0 }, // Percentage
    },
  },
  {
    timestamps: true,
  }
);

const Profile = mongoose.model('Profile', profileSchema);

export default Profile;

