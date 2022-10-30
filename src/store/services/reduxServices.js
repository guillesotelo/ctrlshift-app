import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'development' ? '' : process.env.REACT_APP_API_URL

const loginUser = async user => {
    try {
        const res = await axios.post(`${API_URL}/api/user`, user)
        const finalUser = res.data
        localStorage.setItem('user', JSON.stringify(finalUser))
        if(finalUser.defaultLedger !== null) localStorage.setItem('ledger', finalUser.defaultLedger)
        return finalUser
    } catch (error) { console.log(error) }
}

const googleLogin = async user => {
    try {
        const res = await axios.post(`${API_URL}/api/user/auth/google`, user)
        return res.data
    } catch (error) { console.log(error) }
}

const registerUser = async data => {
    try {
        const newUser = await axios.post(`${API_URL}/api/user/create`, data)
        return newUser
    } catch (err) { console.log(err) }
}

const updateUser = async data => {
    try {
        const user = await axios.post(`${API_URL}/api/user/update`, data)
        return user
    } catch (err) { console.log(err) }
}

const resetPassordByEmail = async data => {
    try {
        const user = await axios.post(`${API_URL}/api/user/resetByEmail`, data)
        return user
    } catch (err) { console.log(err) }
}

const changePass = async data => {
    try {
        const user = await axios.post(`${API_URL}/api/user/changePass`, data)
        return user
    } catch (err) { console.log(err) }
}

const setUserVoid = async () => {
    try {
        await axios.get(`${API_URL}/api/auth/logout`)
        localStorage.removeItem('user')
        return {}
    } catch (err) { console.log(err) }
}

const getAllMovements = async data => {
    try {
        const movements = await axios.get(`${API_URL}/api/movement`, { params: data })
        return movements
    } catch (err) { console.log(err) }
}

const createMovement = async data => {
    try {
        const movement = await axios.post(`${API_URL}/api/movement`, data)
        return movement
    } catch (err) { console.log(err) }
}

const updateMovement = async data => {
    try {
        const movement = await axios.post(`${API_URL}/api/movement/update`, data)
        return movement
    } catch (err) { console.log(err) }
}

const deleteMovement = async data => {
    try {
        const deleted = await axios.post(`${API_URL}/api/movement/remove`, data)
        return deleted
    } catch (err) { console.log(err) }
}

const createLedger = async data => {
    try {
        const res = await axios.post(`${API_URL}/api/ledger/create`, data)
        const user = JSON.parse(localStorage.getItem('user'))
        const updatedUser = await updateUser({ user, newData: { defaultLedger: JSON.stringify(res.data) }})
        localStorage.removeItem('user')
        localStorage.setItem('user', JSON.stringify(updatedUser.data))
        return res.data
    } catch (err) { console.log(err) }
}

const updateLedger = async data => {
    try {
        const ledger = await axios.post(`${API_URL}/api/ledger/update`, data)
        return ledger
    } catch (err) { console.log(err) }
}

const getAllLedgersByEmail = async email => {
    try {
        const ledgers = await axios.get(`${API_URL}/api/ledger/all`, email)
        return ledgers
    } catch (err) { console.log(err) }
}

const getLedgerById = async id => {
    try {
        const ledger = await axios.get(`${API_URL}/api/ledger?id=${id}`)
        localStorage.removeItem('ledger')
        localStorage.setItem('ledger', JSON.stringify(ledger.data))
        return ledger.data
    } catch (err) { console.log(err) }
}

const loginLedger = async data => {
    try {
        const res = await axios.post(`${API_URL}/api/ledger`, data)
        if(!res || !res.data) return false
        const user = JSON.parse(localStorage.getItem('user'))
        const updatedUser = await updateUser({ user, newData: { defaultLedger: JSON.stringify(res.data) }})
        localStorage.removeItem('user')
        localStorage.setItem('user', JSON.stringify(updatedUser.data))
        return res.data
    } catch (error) { console.log(error) }
}

export {
    loginUser,
    registerUser,
    googleLogin,
    setUserVoid,
    updateUser,
    changePass,
    resetPassordByEmail,
    getAllMovements,
    createMovement,
    updateMovement,
    createLedger,
    getAllLedgersByEmail,
    getLedgerById,
    loginLedger,
    updateLedger,
    deleteMovement
}
