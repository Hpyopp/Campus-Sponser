const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please add a password']
    },
    role: {
        type: String,
        enum: ['student', 'sponsor'], // Sirf ye do values allowed hain
        default: 'student'
    },
    collegeName: {
        type: String, // Sirf students ke liye
    },
    companyName: {
        type: String, // Sirf sponsors ke liye
    }
}, {
    timestamps: true // CreatedAt aur UpdatedAt khud ban jayega
});

module.exports = mongoose.model('User', userSchema);