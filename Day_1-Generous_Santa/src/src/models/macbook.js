const mongoose = require('mongoose');

const macbookSchema = new mongoose.Schema({
    name: { type: String, default: 'MacBook' },
    description: { type: String, default: 'The latest model of Apple\'s MacBook, lightweight and powerful.' }
});

macbookSchema.methods.store = function() {
    console.log('MacBook stored in the sack.');
    return this;
};

module.exports = mongoose.model('MacBook', macbookSchema);
