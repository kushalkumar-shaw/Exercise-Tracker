const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  description: String,
  duration: Number,
  date: Date
});

module.exports = mongoose.model('Exercise', exerciseSchema);
