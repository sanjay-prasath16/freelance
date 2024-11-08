const mongoose = require('mongoose');

const connectionsSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Register', required: true },
    followers: { 
        type: [{ type: String, required: true }],
        default: []
    },
    followings: { 
        type: [{ type: String, required: true }],
        default: []
    },
});

module.exports = mongoose.model('Connections', connectionsSchema);