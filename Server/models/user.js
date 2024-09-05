const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    profilePhoto: { type: String, required: false },
    coverPhoto: { type: String, required: false },
});
  

module.exports = mongoose.model('registers', userSchema);