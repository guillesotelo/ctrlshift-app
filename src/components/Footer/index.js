import React from 'react'
import './styles.css'
import Logo from '../../assets/logo.png'

export default function Footer() {
    return (
        <div className='footer-container'>
            <img className='logo-footer' src={Logo} alt="Ctrol Shiflt" />
            <div className='footer-text'>
                <p>
                    CtrlShift © 2022
                </p>
            </div>
        </div>
    )
}
