const mongoose = require('mongoose');

const photosSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'register', required: true },
    profilePhoto: { type: String, required: false },
    coverPhoto: { type: String, required: false },
});

module.exports = mongoose.model('Photos', photosSchema);