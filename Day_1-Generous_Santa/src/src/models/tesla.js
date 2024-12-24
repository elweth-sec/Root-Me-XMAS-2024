const mongoose = require('mongoose');

const teslaSchema = new mongoose.Schema({
    name: { type: String, default: 'Tesla' },
    description: { type: String, default: 'An innovative and high-performance electric car from Tesla.' }
});

teslaSchema.methods.store = function() {
    console.log('Tesla stored in the sack.');
    return this;
};

module.exports = mongoose.model('Tesla', teslaSchema);
