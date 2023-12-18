const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        // required: [true, 'Username is required'],
        unique: true,
        // trim: true,
        // lowercase: true,
        // minlength: [3, 'Username must be at least 3 characters long'],
        // maxlength: [20, 'Username must be at most 20 characters long'],
    },
    password: {
        type: String,
        // required: [true, 'Password is required'],
        // trim: true,
        // minlength: [6, 'Password must be at least 6 characters long'],
        // maxlength: [50, 'Password must be at most 50 characters long'],
    },
}, {timestamps: true});

const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;