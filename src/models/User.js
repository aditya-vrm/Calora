import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Please provide an email.'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password.'],
    },
    firstName: {
      type: String,
      required: [true, 'First name is required.'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required.'],
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    age: {
      type: Number,
      required: [true, 'Age is required.'],
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: [true, 'Gender is required.'],
    },
    height: {
      type: Number, // Stored in cm
      required: [true, 'Height is required.'],
    },
    weight: {
      type: Number, // Stored in kg
      required: [true, 'Weight is required.'],
    },
    workoutFrequency: {
      type: String, // '0', '1-2', '3-4', '5-6', '7'
      required: [true, 'Workout frequency is required.'],
    },
    goal: {
      type: String, // 'lose', 'maintain', 'gain'
      required: [true, 'Fitness goal is required.'],
    },
    heightUnit: {
      type: String, // 'cm', 'ft'
      default: 'cm',
    },
    weightUnit: {
      type: String, // 'kg', 'lbs'
      default: 'kg',
    },
    xp: {
      type: Number,
      default: 0,
    },
    streak: {
      type: Number,
      default: 0,
    },
    badges: {
      type: [String],
      default: [],
    },
    targetCalories: {
      type: Number,
      default: 2000,
    },
    targetMacros: {
      protein: { type: Number, default: 120 },
      carbs: { type: Number, default: 200 },
      fat: { type: Number, default: 65 },
    },
  },
  { timestamps: true }
);

// Prevent compiling model multiple times in Next.js development
export default mongoose.models.User || mongoose.model('User', UserSchema);
