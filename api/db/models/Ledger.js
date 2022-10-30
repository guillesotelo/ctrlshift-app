const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const ledgerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    pin: {
        type: String,
        required: true
    },
    settings: {
        type: String
    },
    notes: {
        type: String,
        default: '[]'
    },
    tasks: {
        type: String,
        default: '[]'
    },
    isEncrypted: {
        type: Boolean,
        default: false
    }
})

ledgerSchema.pre('save', function (next) {
    const ledger = this
    if(this.isModified('pin') || this.isNew) {
        bcrypt.genSalt(10, function (saltError, salt) {
            if(saltError) return next(saltError)
            else{
                bcrypt.hash(String(ledger.pin), salt, function (hashError, hash) {
                    if(hashError) return next(hashError)
                    ledger.pin = hash
                    next()
                })
            }
        })
    } else return next()
})

ledgerSchema.methods.comparePin = function (pin) {
    return bcrypt.compare(String(pin), this.pin).then(res => res)
}

const Ledger = mongoose.model('Ledger', ledgerSchema)

module.exports = Ledger