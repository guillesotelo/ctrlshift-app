import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { getLedger } from '../../store/reducers/ledger';
import Logo from '../../assets/logo.png'
import './styles.css'

export default function SplashScreen() {

    const history = useHistory()
    const dispatch = useDispatch()

    useEffect(() => {
        try {
            const localUser = localStorage.getItem('user') && JSON.parse(localStorage.getItem('user'))
            const localLedger = localStorage.getItem('ledger') && JSON.parse(localStorage.getItem('ledger'))

            if (!localUser || !localUser.email || !localUser.token) {
                render()
                return setTimeout(() => {
                    localStorage.clear()
                    history.push('/login')
                }, 1000)
            }
            else if (!localLedger || !localLedger.email || !localLedger.id) {
                render()
                return setTimeout(() => history.push('/ledger'), 1000)
            }

            getUpdatedLedger(localLedger.id)
        } catch (err) {
            localStorage.clear()
            history.push('/login')
        }
    }, [])

    const getUpdatedLedger = async ledgerId => {
        const updatedLedger = await dispatch(getLedger(ledgerId)).then(data => data.payload)
        if (updatedLedger) setTimeout(() => history.push('/home'), 1000)
    }

    const render = () => {
        return (
            <div className='splash-container'>
                <div className='logo-login-container'>
                    <img className='logo-img' src={Logo} alt="Control Shift" />
                </div>
            </div>
        )
    }

    return render()
}
