import mongoose from 'mongoose';

const RecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['food', 'weight', 'steps', 'water'],
      required: true,
      index: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    // Used when type === 'food'
    foodDetails: {
      foodName: { type: String },
      mealType: { type: String, enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'] },
      weightGrams: { type: Number },
      calories: { type: Number },
      protein: { type: Number },
      carbs: { type: Number },
      fat: { type: Number },
      fiber: { type: Number, default: 0 },
      sugar: { type: Number, default: 0 },
    },
    // Used when type === 'weight'
    weightVal: {
      type: Number,
    },
    // Used when type === 'steps'
    stepsVal: {
      type: Number,
    },
    // Used when type === 'water'
    waterVal: {
      type: Number, // volume in ml
    },
  },
  { timestamps: true }
);

// Compound index for queries like: find all records for userId on date
RecordSchema.index({ userId: 1, date: 1 });

export default mongoose.models.Record || mongoose.model('Record', RecordSchema);
