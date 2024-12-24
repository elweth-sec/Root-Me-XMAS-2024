const mongoose = require('mongoose');

const rolexSchema = new mongoose.Schema({
    name: { type: String, default: 'Rolex' },
    description: { type: String, default: 'An iconic luxury watch from the Rolex brand.' }
});

rolexSchema.methods.store = function() {
    console.log('Rolex stored in the sack.');
    return this;
};

module.exports = mongoose.model('Rolex', rolexSchema);
