const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: notGoogleUser()
    },
    defaultLedger: {
        type: String
    },
    picture: {
        type: String
    },
    isGoogleUser: {
        type: Boolean,
        default: false
    },
    language: {
        type: String
    }
})

userSchema.pre('save', function (next) {
    const user = this
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, function (saltError, salt) {
            if (saltError) return next(saltError)
            else {
                bcrypt.hash(user.password, salt, function (hashError, hash) {
                    if (hashError) return next(hashError)
                    console.log("password not hashed", user.passowrd)
                    console.log("password hashed", hash)
                    user.password = hash
                    next()
                })
            }
        })
    } else return next()
})

userSchema.pre('findOneAndUpdate', function (next) {
    const update = this.getUpdate()
    if (update.password) {
        bcrypt.genSalt(10, function (saltError, salt) {
            if (saltError) return next(saltError)
            else {
                bcrypt.hash(update.password, salt, function (hashError, hash) {
                    if (hashError) return next(hashError)
                    update.password = hash;
                    next()
                })
            }
        })
    } else return next()
})

function notGoogleUser() {
    return !this.isGoogleUser
}

userSchema.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.password).then(res => res)
}

const User = mongoose.model('User', userSchema)

module.exports = User