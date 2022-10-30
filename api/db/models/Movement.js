const mongoose = require('mongoose')

const movementSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    amount: {
        type: String,
        required: true
    },
    detail: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    pay_type: {
        type: String,
        required: true
    },
    installments: {
        type: String,
        default: '1/1'
    },
    category: {
        type: String
    },
    ledger: {
        type: String
    },
    user: {
        type: String
    },
    isEncrypted: {
        type: Boolean,
        default: false
    }
})

const Movement = mongoose.model('Movement', movementSchema)

module.exports = Movement