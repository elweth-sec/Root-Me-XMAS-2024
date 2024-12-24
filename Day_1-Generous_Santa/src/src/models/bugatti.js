const mongoose = require('mongoose');

const bugattiSchema = new mongoose.Schema({
    name: { type: String, default: 'Bugatti' },
    description: { type: String, default: 'A luxury high-performance sports car.' }
});

bugattiSchema.methods.store = function() {
    console.log('Bugatti stored in the sack.');
    return this;
};

module.exports = mongoose.model('Bugatti', bugattiSchema);
