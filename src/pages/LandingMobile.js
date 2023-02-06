import React, { useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import CTAButton from '../components/CTAButton'
import Logo from '../assets/logo.png'
import Footer from '../components/Footer'

export default function LandingMobile() {
    const history = useHistory()

    useEffect(() => {
        const localUser = JSON.parse(localStorage.getItem('user'))

        if (localUser && localUser.login) {
            const login = new Date(localUser.login).getTime()
            const now = new Date().getTime()

            if (now - login > 2506000000) {
                localStorage.clear()
                return history.push('/login')
            }
        }

        if (localUser && localUser.token && localUser.app && localUser.app === 'ctrl-shift') return history.push('/home')
    }, [])

    return (
        <div className='landing-mobile-container'>
            <div className='landing-header'>
                <img className='landing-header-logo' src={Logo} alt="Ctrol Shiflt" />
                <div className='landing-header-central'>
                    <a></a>
                </div>
                <div className='landing-header-btns'>
                    <CTAButton
                        label='Login'
                        className='landing-cta'
                        color='#fff'
                        style={{ color: 'black' }}
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
                    <h1 className='landing-heading'>Empowering your financial control with CtrlShift</h1>
                    <p className='landing-text'>
                        <b>CtrlShift</b> is a comprehensive finance management app designed for homes and small businesses.<br />
                        With it, you can easily submit expenses, track income and outcome, and have full control
                        over your finances with the help of graphics and other useful modules.<br /><br />
                        Simplify your financial management with <b>CtrlShift</b>.
                    </p>
                    <CTAButton
                        label='Start for free'
                        className='landing-cta-scale'
                        color='#CCA43B'
                        style={{ color: 'black' }}
                        handleClick={() => history.push('/register')}
                    />
                </div>
                <img src='https://i.postimg.cc/K82HWw2X/Ctrl-Shift-mockup.png' alt='mobile app image' className='landing-phone-image' />
            </div>
            <Footer />
        </div>
    )
}
