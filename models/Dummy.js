const mongoose = require('mongoose');

const dummySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        required: true
    },
    roomno: {
        type: Number,
        required: true
    }
}, {
    timestamps: true  // This will automatically add createdAt and updatedAt fields
});

module.exports = mongoose.model('Dummy', dummySchema);
