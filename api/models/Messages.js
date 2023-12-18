const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    message: String,
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {timestamps: true});

const MessageModel = mongoose.model('Message', messageSchema);

module.exports = MessageModel;