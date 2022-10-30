const mongoose = require('mongoose')

const revealSchema = new mongoose.Schema({
    date: {
        type: String,
    },
    email: {
        type: String,
        required: true
    },
    gender: {
        type: String
    },
    name: {
        type: String
    }
})

const Reveal = mongoose.model('Reveal', revealSchema)

module.exports = Reveal