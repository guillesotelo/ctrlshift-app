import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { getLedger } from '../../store/reducers/ledger';
import WhiteLogo from '../../assets/logos/ctrl_new_white.png'
import DarkLogo from '../../assets/logos/ctrl_new_dark.png'
import './styles.css'

export default function SplashScreen() {
    const history = useHistory()
    const dispatch = useDispatch()
    const darkMode = localStorage.getItem('darkMode') ? JSON.parse(localStorage.getItem('darkMode')) : false

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
                return setTimeout(() => history.push('/ledger'), 2000)
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
            <div className={darkMode ? 'splash-dark' : 'splash-container'} >
                <div className='logo-login-container'>
                    <img className='logo-img' src={darkMode ? DarkLogo : WhiteLogo} alt="Control Shift" style={{ filter: darkMode ? ' invert(53%) sepia(61%) saturate(454%) hue-rotate(6deg) brightness(111%) contrast(87%)' : '' }} />
                </div>
            </div >
        )
    }

    return render()
}
