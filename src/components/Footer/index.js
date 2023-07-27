import React, { useContext } from 'react'
import './styles.css'
import Logo from '../../assets/logo.png'
import { AppContext } from '../../AppContext'

export default function Footer() {
    const { darkMode } = useContext(AppContext)

    return (
        <div className='footer-container' style={{
            backgroundColor: darkMode ? '#202020' : '',
            color: darkMode ? 'lightgray' : ''
        }}>
            <img className='logo-footer' src={darkMode ? 'https://i.postimg.cc/t4bmrHsG/ctrlshift-logo.png' : Logo} alt="Ctrol Shiflt" />
            <div className='footer-text'>
                <p style={{ color: darkMode ? 'lightgray' : '' }}>
                    CtrlShift © 2022
                </p>
            </div>
        </div>
    )
}
