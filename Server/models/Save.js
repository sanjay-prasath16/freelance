const mongoose = require('mongoose');

const saveSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'register', required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    saved: { type: Boolean, default: true },
});

module.exports = mongoose.model('Save', saveSchema);