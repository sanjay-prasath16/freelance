const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'register', required: true },
  desc: { type: String, required: true },
  postPhoto: { type: String, required: false },
  likes: { type: Number, default: 0 },
  report: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);