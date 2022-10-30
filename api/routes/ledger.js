const express = require('express')
const router = express.Router()
const { Ledger } = require('../db/models')
const { encrypt, decrypt } = require('../helpers')

//Get all Ledgers by Email (currently not used)
router.get('/all', async (req, res, next) => {
    try {
        const email = req.body
        const ledgers = await Ledger.find({ email })
        if (!ledgers) return res.status(404).send('No ledgers found.')

        res.status(200).json(ledgers)
    } catch (err) {
        console.error('Something went wrong!', err)
        res.send(500).send('Server Error')
    }
})

// Get Ledger by ID
router.get('/', async (req, res, next) => {
    try {
        const { id } = req.query
        const ledger = await Ledger.findById(id)
        if (!ledger) return res.status(404).send('Ledger not found.')

        if (ledger.isEncrypted) {
            res.status(200).json({
                id: ledger.id,
                email: ledger.email,
                name: ledger.name,
                settings: ledger.settings.includes('authors') ? ledger.settings : decrypt(ledger.settings),
                notes: ledger.notes === '[]' ? ledger.notes : decrypt(ledger.notes),
                tasks: ledger.tasks === '[]' ? ledger.tasks : decrypt(ledger.tasks)
            })
        } else {
            res.status(200).json({
                id: ledger.id,
                email: ledger.email,
                name: ledger.name,
                settings: ledger.settings,
                notes: ledger.notes || [],
                tasks: ledger.tasks || []
            })
        }
    } catch (err) {
        console.error('Something went wrong!', err)
        res.send(500).send('Server Error')
    }
})

//Login Ledger
router.post('/', async (req, res, next) => {
    try {
        const { name, pin } = req.body
        const ledger = await Ledger.findOne({ name })
        if (!ledger) return res.status(404).send('No ledger found.')

        const compareRes = await ledger.comparePin(pin)
        if (!compareRes) return res.status(401).send('Invalid credentials')

        if (ledger.isEncrypted) {
            res.status(200).json({
                id: ledger.id,
                email: ledger.email,
                name: ledger.name,
                settings: ledger.settings.includes('authors') ? ledger.settings : decrypt(ledger.settings),
                notes: ledger.notes === '[]' ? ledger.notes : decrypt(ledger.notes),
                tasks: ledger.tasks === '[]' ? ledger.tasks : decrypt(ledger.tasks)
            })
        } else {
            res.status(200).json({
                id: ledger.id,
                email: ledger.email,
                name: ledger.name,
                settings: ledger.settings,
                notes: ledger.notes || [],
                tasks: ledger.tasks || []
            })
        }
    } catch (err) {
        console.error('Something went wrong!', err)
        res.send(500).send('Server Error')
    }
})

//Create new Ledger
router.post('/create', async (req, res, next) => {
    try {
        const ledgerData = {
            name: req.body.name,
            email: req.body.email,
            pin: req.body.pin,
            settings: encrypt(req.body.settings),
            notes: encrypt('[]'),
            tasks: encrypt('[]'),
            isEncrypted: true
        }
        const newLedger = await Ledger.create(ledgerData)
        if (!newLedger) return res.status(404).send('Error creating Ledger.')

        res.status(200).json({
            id: newLedger.id,
            email: newLedger.email,
            name: newLedger.name,
            settings: decrypt(newLedger.settings),
            notes: decrypt(newLedger.notes),
            tasks: decrypt(newLedger.tasks)
        })
    } catch (err) {
        console.error('Something went wrong!', err)
        res.send(500).send('Server Error')
    }
})

//Update Ledger Data
router.post('/update', async (req, res, next) => {
    try {
        const { id } = req.body

        let ledgerData = { ...req.body }

        for (let key in ledgerData) {
            const toEncrypt = ['settings', 'notes', 'tasks']
            if (toEncrypt.includes(key)) {
                ledgerData[key] = encrypt(ledgerData[key])
                ledgerData.isEncrypted = true
            }
        }
        const _ = await Ledger.findByIdAndUpdate(id, ledgerData, { useFindAndModify: false })
        const newLedger = await Ledger.findById(id)
        if (!newLedger) return res.status(404).send('Error updating Ledger.')

        if (newLedger.isEncrypted) {
            res.status(200).json({
                id: newLedger.id,
                email: newLedger.email,
                name: newLedger.name,
                settings: newLedger.settings.includes('authors') ? newLedger.settings : decrypt(newLedger.settings),
                notes: newLedger.notes === '[]' ? newLedger.notes : decrypt(newLedger.notes),
                tasks: newLedger.tasks === '[]' ? newLedger.tasks : decrypt(newLedger.tasks)
            })
        } else {
            res.status(200).json({
                id: newLedger.id,
                email: newLedger.email,
                name: newLedger.name,
                settings: newLedger.settings,
                notes: newLedger.notes || [],
                tasks: newLedger.tasks || []
            })
        }
    } catch (err) {
        console.error('Something went wrong!', err)
        res.send(500).send('Server Error')
    }
})

module.exports = router