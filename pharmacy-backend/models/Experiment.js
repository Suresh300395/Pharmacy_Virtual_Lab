const mongoose = require('mongoose');

const experimentSchema = new mongoose.Schema(
  {
    experimentId: {
      type: Number,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: [true, 'Experiment title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    info: {
      type: String,
      default: '',
    },
    equipment: {
      type: String,
      default: '',
    },
    equipmentImage: {
      type: String,
      default: '',
    },
    principle: {
      type: String,
      default: '',
    },
    principleImage: {
      type: String,
      default: '',
    },
    instructions: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Experiment', experimentSchema);
