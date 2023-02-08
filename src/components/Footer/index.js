import React from 'react'
import './styles.css'
import Logo from '../../assets/logo.png'

export default function Footer({ darkMode }) {
    return (
        <div className='footer-container' style={{ backgroundColor: darkMode ? '#202020' : '' }}>
            <img className='logo-footer' src={darkMode ? 'https://i.postimg.cc/t4bmrHsG/ctrlshift-logo.png' : Logo} alt="Ctrol Shiflt" />
            <div className='footer-text'>
                <p style={{ color: darkMode ? 'lightgray' : '' }}>
                    CtrlShift © 2022
                </p>
            </div>
        </div>
    )
}
