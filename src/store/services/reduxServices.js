import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'development' ? '' : process.env.REACT_APP_API_URL
// const API_URL = process.env.REACT_APP_API_URL
let { token } = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : {}
const headers = { authorization: `Bearer ${token}` }

const loginUser = async user => {
    try {
        const res = await axios.post(`${API_URL}/api/user`, user)
        const finalUser = res.data
        localStorage.setItem('user', JSON.stringify({
            ...finalUser,
            app: 'ctrl-shift',
            login: new Date()
        }))
        if (finalUser.defaultLedger !== null) localStorage.setItem('ledger', finalUser.defaultLedger)
        token = finalUser.token
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
        const user = await axios.post(`${API_URL}/api/user/update`, data, { headers })
        const localUser = JSON.parse(localStorage.getItem('user'))
        localStorage.setItem('user', JSON.stringify({
            ...localUser,
            ...user.data
        }))
        return user.data
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
        await axios.get(`${API_URL}/api/auth/logout`, { headers })
        localStorage.clear()
        return {}
    } catch (err) { console.log(err) }
}

const getAllMovements = async data => {
    try {
        const movements = await axios.get(`${API_URL}/api/movement`, { params: data, headers })
        return movements
    } catch (err) { console.log(err) }
}

const createMovement = async data => {
    try {
        const movement = await axios.post(`${API_URL}/api/movement`, data, { headers })
        return movement
    } catch (err) { console.log(err) }
}

const updateMovement = async data => {
    try {
        const movement = await axios.post(`${API_URL}/api/movement/update`, data, { headers })
        return movement
    } catch (err) { console.log(err) }
}

const deleteMovement = async data => {
    try {
        const deleted = await axios.post(`${API_URL}/api/movement/remove`, data, { headers })
        return deleted
    } catch (err) { console.log(err) }
}

const createLedger = async data => {
    try {
        const res = await axios.post(`${API_URL}/api/ledger/create`, data, { headers })
        const user = JSON.parse(localStorage.getItem('user'))
        const updatedUser = await updateUser({ ...user, defaultLedger: JSON.stringify(res.data) })

        localStorage.setItem('user', JSON.stringify({
            ...user,
            ...updatedUser.data
        }))

        return res.data
    } catch (err) { console.log(err) }
}

const updateLedger = async data => {
    try {
        const ledger = await axios.post(`${API_URL}/api/ledger/update`, data, { headers })
        return ledger
    } catch (err) { console.log(err) }
}

const getAllLedgersByEmail = async email => {
    try {
        const ledgers = await axios.get(`${API_URL}/api/ledger/all`, { params: email, headers })
        return ledgers
    } catch (err) { console.log(err) }
}

const getLedgerById = async id => {
    try {
        const ledger = await axios.get(`${API_URL}/api/ledger?id=${id}`, { headers })
        if (ledger.data && ledger.data.email) {
            localStorage.removeItem('ledger')
            localStorage.setItem('ledger', JSON.stringify(ledger.data))
            return ledger.data
        }
        else return null
    } catch (err) { console.log(err) }
}

const loginLedger = async data => {
    try {
        const res = await axios.post(`${API_URL}/api/ledger`, data, { headers })
        if (!res || !res.data) return false

        const user = JSON.parse(localStorage.getItem('user'))
        const updatedUser = await updateUser({ ...user, defaultLedger: JSON.stringify(res.data) })

        localStorage.setItem('user', JSON.stringify({
            ...user,
            ...updatedUser.data
        }))

        return res.data
    } catch (error) { console.log(error) }
}

const createReport = async data => {
    try {
        const res = await axios.post(`${API_URL}/api/report/create`, data, { headers })
        return res.data
    } catch (err) { console.log(err) }
}

const getAllReports = async data => {
    try {
        const reports = await axios.get(`${API_URL}/api/report/getAll`, { params: data, headers })
        return reports.data
    } catch (err) { console.log(err) }
}

const checkAdminCredentials = async data => {
    try {
        const user = await axios.get(`${API_URL}/api/user/admin`, { params: data, headers })
        return user.data
    } catch (err) { console.log(err) }
}

const updateReportData = async data => {
    try {
        const report = await axios.post(`${API_URL}/api/report/update`, data, { headers })
        return report
    } catch (err) { console.log(err) }
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
    deleteMovement,
    createReport,
    getAllReports,
    updateReportData,
    checkAdminCredentials
}
