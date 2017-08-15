var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = Schema({
    cipherText: {
        type: Buffer,
        required: true
    },
    iv: {
        type: Buffer,
        required: true
    },
    salt: {
        type: Buffer,
        required: true
    },
    publicKey: {
        type: Buffer,
        required: true
    },
    label: {
        type: String,
        required: true
    }
});