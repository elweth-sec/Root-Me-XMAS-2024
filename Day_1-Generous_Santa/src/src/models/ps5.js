const mongoose = require('mongoose');

const ps5Schema = new mongoose.Schema({
    name: { type: String, default: 'PS5' },
    description: { type: String, default: 'The PlayStation 5, the latest video game console from Sony.' }
});

ps5Schema.methods.store = function() {
    console.log('PS5 stored in the sack.');
    return this;
};

module.exports = mongoose.model('PS5', ps5Schema);
