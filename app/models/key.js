module.exports = {
    cipherText: {
        type: String,
        required: true
    },
    iv: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    },
    publicKey: {
        type: String,
        required: true
    },
    label: {
        type: String,
        required: true
    }
};