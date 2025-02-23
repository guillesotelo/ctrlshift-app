import React, { useContext, useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import CTAButton from '../components/CTAButton'
import LandingMobile from './LandingMobile'
import Logo from '../assets/logo.png'
import MoonSon from '../assets/moon-sun.svg'
import { AppContext } from '../AppContext'
import PhoneApp from '../assets/phoneapp.png'

export default function Landing() {
    const history = useHistory()
    const { darkMode, setDarkMode, isMobile } = useContext(AppContext)

    useEffect(() => {
        const localUser = JSON.parse(localStorage.getItem('user') || '{}')
        const mode = localStorage.getItem('darkMode') ? JSON.parse(localStorage.getItem('darkMode') || 'false') : false
        setDarkMode(mode)

        if (localUser && localUser.login) {
            const login = new Date(localUser.login).getTime()
            const now = new Date().getTime()

            if (now - login > 15552000000) {
                return localStorage.clear()
            }
        }

        if (localUser && localUser.token && localUser.app && localUser.app === 'ctrl-shift') return history.push('/home')
    }, [])

    return isMobile ? <LandingMobile darkMode={darkMode} setDarkMode={setDarkMode} />
        :
        <div className='landing-container' style={{ backgroundColor: darkMode ? '#202020' : '', color: darkMode ? 'lightgray' : '' }}>
            <div className='landing-header'>
                <img className='landing-header-logo' src={Logo} alt="Ctrol Shiflt" style={{ filter: darkMode ? ' invert(53%) sepia(61%) saturate(454%) hue-rotate(6deg) brightness(111%) contrast(87%)' : '' }} />
                <div className='landing-header-central'>
                    <a></a>
                </div>
                <div className='landing-header-btns'>
                    <img
                        src={MoonSon}
                        alt='Dark Mode'
                        className='landing-dark-mode'
                        onClick={() => {
                            const mode = !darkMode
                            setDarkMode(mode)
                            localStorage.setItem('darkMode', mode)
                        }}
                        style={{ filter: darkMode ? 'invert(97%) sepia(0%) saturate(4674%) hue-rotate(353deg) brightness(80%) contrast(99%)' : '' }}
                    />
                    <CTAButton
                        label='Login'
                        className='landing-cta'
                        color='transparent'
                        style={{ color: darkMode ? 'lightgray' : 'black' }}
                        handleClick={() => history.push('/login')}
                    />
                    <CTAButton
                        label='Get started'
                        className='landing-cta'
                        color='#CCA43B'
                        style={{ color: 'black' }}
                        handleClick={() => history.push('/register')}
                    />
                </div>
            </div>
            <div className='landing-body'>
                <div className='landing-text-div'>
                    <h1 className='landing-heading move-x-back'>Empowering your financial control<br /> with CtrlShift</h1>
                    <p className='landing-text move-x-back'>
                        <b>CtrlShift</b> is a comprehensive finance management app designed for homes and small businesses.<br />
                        With it, you can easily submit expenses, track income and outcome, and have full control
                        over your finances with the help of graphics and other useful modules.<br /><br />
                        Simplify your financial management with <b>CtrlShift</b>.
                    </p>
                    <CTAButton
                        label='Start for free'
                        className='landing-cta move-x'
                        color='#CCA43B'
                        style={{ color: 'black' }}
                        handleClick={() => history.push('/register')}
                    />
                </div>
                <div className='landing-phone-div'>
                    <img src={PhoneApp} alt='mobile app image' className='landing-phone-image move-x' />
                </div>
            </div>
        </div>

}
