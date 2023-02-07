import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import CTAButton from '../components/CTAButton'
import Logo from '../assets/logo.png'
import Footer from '../components/Footer'
import MoonSon from '../assets/moon-sun.svg'
import Landing from './Landing'

export default function LandingMobile() {
    const [darkMode, setDarkMode] = useState(false)
    const isMobile = window.innerWidth < 640
    const history = useHistory()

    useEffect(() => {
        const mode = localStorage.getItem('darkMode') ? JSON.parse(localStorage.getItem('darkMode')) : false
        setDarkMode(mode)
    }, [])

    // useEffect(() => {
    //     const localUser = JSON.parse(localStorage.getItem('user'))

    //     if (localUser && localUser.login) {
    //         const login = new Date(localUser.login).getTime()
    //         const now = new Date().getTime()

    //         if (now - login > 2506000000) {
    //             localStorage.clear()
    //             return history.push('/login')
    //         }
    //     }

    //     if (localUser && localUser.token && localUser.app && localUser.app === 'ctrl-shift') return history.push('/home')
    // }, [])

    return isMobile ?
        <div className='landing-mobile-container' style={{ backgroundColor: darkMode ? '#202020' : '', color: darkMode ? 'lightgray' : '' }}>
            <div className='landing-header move-y'>
                <img className='landing-header-logo' src={Logo} alt="Ctrol Shiflt" />
                <div className='landing-header-central'>
                    <a></a>
                </div>
                <div className='landing-header-btns'>
                    <img
                        src={MoonSon}
                        alt='Dark Mode'
                        className='landing-dark-mode'
                        onClick={() => {
                            setDarkMode(!darkMode)
                            localStorage.setItem('darkMode', !darkMode)
                        }} style={{ filter: darkMode ? 'invert(97%) sepia(0%) saturate(4674%) hue-rotate(353deg) brightness(80%) contrast(99%)' : '' }}
                    />                    <CTAButton
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
                    <h1 className='landing-heading move-x'>Empowering your financial control with CtrlShift</h1>
                    <CTAButton
                        label='Start for free'
                        className='landing-cta-scale move-x-back'
                        color='#CCA43B'
                        style={{ color: 'black', transform: 'scale(1.3)' }}
                        handleClick={() => history.push('/register')}
                    />
                </div>
                <img src='https://i.postimg.cc/GtVz8x3L/smartmockups-ldue73hz.png' alt='mobile app image' className='landing-phone-image move-y-back' />
                <div className='landing-text-div2'>
                    <p className='landing-text move-x-back'>
                        <b>CtrlShift</b> is a comprehensive finance management app designed for homes and small businesses.<br />
                        With it, you can easily submit expenses, track income and outcome, and have full control
                        over your finances with the help of graphics and other useful modules.<br /><br />
                        Simplify your financial management with <b>CtrlShift</b>.
                    </p>
                </div>
            </div>
            <Footer />
        </div>
        :
        <Landing />
}
