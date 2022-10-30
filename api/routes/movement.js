const express = require('express')
const router = express.Router()
const { Movement } = require('../db/models')
const { encrypt, decrypt } = require('../helpers')

//Get all Movements by Ledger
router.get('/', async (req, res, next) => {
    try {
        const { ledger } = req.query
        if (ledger) {
            const movements = await Movement.find({ ledger }).sort([['date', 'descending']])
            if (!movements) return res.status(404).send('No movements found.')

            const decryptedMovs = movements.map(mov => {
                if (mov.isEncrypted) {
                    const movData = mov

                    movData.author = decrypt(mov.author)
                    movData.detail = decrypt(mov.detail)
                    movData.amount = decrypt(mov.amount)
                    movData.category = decrypt(mov.category)
                    movData.pay_type = decrypt(mov.pay_type)
                    movData.user = decrypt(mov.user)

                    return movData
                } else return mov
            })

            res.status(200).json(decryptedMovs)
        }
    } catch (err) {
        console.error('Something went wrong!', err)
        res.send(500).send('Server Error')
    }
})

//Create new Movement
router.post('/', async (req, res, next) => {
    try {
        const movData = {
            date: req.body.date,
            ledger: req.body.ledger,
            author: encrypt(req.body.author),
            detail: encrypt(req.body.detail),
            amount: encrypt(req.body.amount),
            category: encrypt(req.body.category),
            pay_type: encrypt(req.body.pay_type),
            installments: req.body.installments,
            user: encrypt(req.body.user),
            isEncrypted: true
        }

        const newMovement = await Movement.create(movData)
        res.status(200).json({ newMovement })
    } catch (err) {
        console.error('Something went wrong!', err)
        res.send(500).send('Server Error')
    }
})

//Update Movement by ID
router.post('/update', async (req, res, next) => {
    try {
        const { _id } = req.body
        let movData = { ...req.body }

        for (let key in movData) {
            const toEncrypt = ['author', 'detail', 'amount', 'category', 'pay_type', 'user']
            if (toEncrypt.includes(key)) {
                movData[key] = encrypt(movData[key])
                movData.isEncrypted = true
            }
        }
        const updated = await Movement.findByIdAndUpdate(_id, movData, { useFindAndModify: false })
        if (!updated) return res.status(404).send('Error updating Movement.')

        res.status(200).json({ message: 'Updated' })
    } catch (err) {
        console.error('Something went wrong!', err)
        res.send(500).send('Server Error')
    }
})

//Remove Mocement by ID
router.post('/remove', async (req, res, next) => {
    try {
        const { _id } = req.body
        const removed = await Movement.deleteOne({ _id })
        if (!removed) return res.status(404).send('Error deleting Movement.')

        res.status(200).json({ message: 'Removed' })
    } catch (err) {
        console.error('Something went wrong!', err)
        res.send(500).send('Server Error')
    }
})

module.exports = router