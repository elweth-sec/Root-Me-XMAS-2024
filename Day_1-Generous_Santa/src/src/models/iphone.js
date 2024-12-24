const mongoose = require('mongoose');

const iphoneSchema = new mongoose.Schema({
    name: { type: String, default: 'iPhone' },
    description: { type: String, default: 'The latest model of the iPhone with innovative features.' }
});

iphoneSchema.methods.store = function() {
    console.log('iPhone stored in the sack.');
    return this;
};

module.exports = mongoose.model('iPhone', iphoneSchema);
