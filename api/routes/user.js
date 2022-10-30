const express = require('express')
const router = express.Router()
const { User } = require('../db/models')
const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(process.env.REACT_APP_GOOGLE_CLIENT_ID)
const transporter = require('../helpers/mailer')
const { encrypt, decrypt } = require('../helpers')

//User Login
router.post('/', async (req, res, next) => {
    try {
        const { email, password, isGoogleUser } = req.body

        const user = await User.findOne({ email }).exec()
        if (!user) return res.status(401).send('Email not found')

        if (!isGoogleUser) {
            const compareRes = await user.comparePassword(password)
            if (!compareRes) return res.status(401).send('Invalid credentials')
        }
        res.status(200).json({
            username: user.username,
            email,
            defaultLedger: user.defaultLedger || null,
            language: user.language || null
        })

    } catch (err) {
        console.error('Something went wrong!', err)
        res.send(500).send('Server Error')
    }
})

//Google Auth
router.post("/auth/google", async (req, res) => {
    const { credential } = req.body
    const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.REACT_APP_GOOGLE_CLIENT_ID
    })
    const userData = ticket.getPayload()
    res.status(201)
    res.json(userData)
})

//Create user
router.post('/create', async (req, res, next) => {
    try {
        const emailRegistered = await User.findOne({ email: req.body.email }).exec()
        if (emailRegistered) return res.status(401).send('Email already in use')

        const user = await User.create(req.body)
        if (!user) return res.status(400).send('Bad request')
        res.status(201).send(`User created successfully`)
    } catch (err) {
        console.error('Something went wrong!', err)
        res.send(500).send('Server Error')
    }
})

//Update User Data
router.post('/update', async (req, res, next) => {
    try {
        const { email, username, currentPass, newEmail, newName } = req.body
        let passwordChanged = false

        if (currentPass) {
            const user = await User.findOne({ email }).exec()
            if (!user) return res.status(401).json({})

            const compareRes = await user.comparePassword(currentPass)
            if (!compareRes) return res.status(401).send('Invalid credentials')
            passwordChanged = true
        }

        const newData = req.body
        if(newName) newData.username = newName

        const newUser = await User.findOneAndUpdate(
            { username, email }, newData, { returnDocument: "after", useFindAndModify: false })
        if (!newUser) return res.status(404).send('Error updating User.')

        if (passwordChanged || newEmail) {
            await transporter.sendMail({
                from: `"CtrlShift" <${process.env.EMAIL}>`,
                to: email,
                subject: `Your ${passwordChanged ? 'password' : 'email'} has been changed`,
                html: `<div style='margin-top: 3vw; text-align: center;'>
                                <h2>Hello, ${username}!</h2>
                                <h3>Your ${passwordChanged ? 'password' : 'email'} has been changed.</h3>
                                ${passwordChanged ?
                        `<h4>If it wasn't you, please <a href='https://ctrlshift.herokuapp.com/changePass?userEmail=${encrypt(email)}'>re-generate it</a> to a new one right away, or reply to this email with your registered email and username explaining the issue. We will be responding as soon as possible.</h4>`
                        :
                        `<h4>If it wasn't you, please <a href='https://ctrlshift.herokuapp.com/login'>login</a> with your new email: ${newEmail}, or reply to this email with your registered email and username explaining the issue. We will be responding as soon as possible.</h4>`
                    }
                                <img src="https://i.imgur.com/8XcuFOs.png" style='height: 50px; width: auto; margin-top: 4vw;' alt="ctrlshift-logo" border="0">
                                <a href='https://ctrlshift.herokuapp.com/login'><h5 style='margin: 4px;'>CtrlShift App</h5></a>
                            </div>`
            }).catch((err) => {
                console.error('Something went wrong!', err)
                res.send(500).send('Server Error')
            })
        }

        res.status(200).json({
            id: newUser.id,
            email: newUser.email,
            username: newUser.username,
            defaultLedger: newUser.defaultLedger,
            language: newUser.language
        })
    } catch (err) {
        console.error('Something went wrong!', err)
        res.send(500).send('Server Error')
    }
})

router.post('/changePass', async (req, res, next) => {
    try {
        const { userEmail, password, currentPass } = req.body
        if (!userEmail) res.send(404).send('Wrong parameters')

        const email = decrypt(userEmail)

        const userData = await User.findOne({ email })
        if (!userData) return res.status(404).send('Email not found.')

        const compareRes = await userData.comparePassword(currentPass)
        if (!compareRes) return res.status(401).send('Invalid credentials')

        const updatedUser = await User.findOneAndUpdate(
            { email }, { password }, { returnDocument: "after", useFindAndModify: false })
        if (!updatedUser) return res.status(404).send('Error updating User.')

        await transporter.sendMail({
            from: `"CtrlShift" <${process.env.EMAIL}>`,
            to: email,
            subject: 'Your password has been changed',
            html: `<div style='margin-top: 3vw; text-align: center;'>
                            <h2>Hello, ${userData.username}!</h2>
                            <h3>Your password has been changed.</h3>
                            <h4>If it wasn't you, please <a href='https://ctrlshift.herokuapp.com/changePass?userEmail=${userEmail}'>re-generate it</a> to a new one right away, or reply to this email with your registered email and username.</h4>
                            <img src="https://i.imgur.com/8XcuFOs.png" style='height: 50px; width: auto; margin-top: 4vw;' alt="ctrlshift-logo" border="0">
                            <a href='https://ctrlshift.herokuapp.com/login'><h5 style='margin: 4px;'>CtrlShift App</h5></a>
                        </div>`
        }).catch((err) => console.error('Something went wrong!', err))

        res.status(200).json({ messsage: 'Password updated successfully' })

    } catch (err) {
        console.error('Something went wrong!', err)
        res.send(500).send('Server Error')
    }
})

router.post('/resetByEmail', async (req, res, next) => {
    try {
        const { email } = req.body
        const user = await User.findOne({ email }).exec()
        if (!user) return res.status(404).json('Email not found.')

        await transporter.sendMail({
            from: `"CtrlShift" <${process.env.EMAIL}>`,
            to: email,
            subject: 'Password Reset',
            html: `<div style='margin-top: 3vw; text-align: center;'>
                        <h2>Hello, ${user.username}!</h2>
                        <h3>Click <a href='https://ctrlshift.herokuapp.com/changePass?userEmail=${encrypt(email)}'>here</a> to reset your password.</h3>
                        <img src="https://i.imgur.com/8XcuFOs.png" style='height: 50px; width: auto; margin-top: 4vw;' alt="ctrlshift-logo" border="0">
                        <h5 style='margin: 4px;'>CtrlShift Team</h5>
                    </div>`
        }).catch((err) => console.error('Something went wrong!', err))

        res.status(200).json({})
    } catch (err) {
        console.error('Something went wrong!', err)
        res.send(500).send('Server Error')
    }
})

//Logout
router.get("/logout", (req, res, next) => {
    req.user = null;
    res.status(200).json({});
})

module.exports = router