import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from "react-redux";
import CTAButton from '../components/CTAButton'
import InputField from '../components/InputField'
import WhiteLogo from '../assets/logos/ctrl_new_white.png'
import DarkLogo from '../assets/logos/ctrl_new_dark.png'
import {
    logIn,
    googleAuth,
    createUser,
    sendEmailResetPass
} from '../store/reducers/user'
import { APP_COLORS } from '../constants/colors'
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
import { MESSAGE } from '../constants/messages'
import { VERSION } from '../constants/app'
import { getUserLanguage } from '../helpers';
import 'react-toastify/dist/ReactToastify.css';
import { PuffLoader } from 'react-spinners';

export default function Login() {
    const [data, setData] = useState({})
    const [mailNModal, setMailModal] = useState(false)
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()
    const history = useHistory()
    const lan = getUserLanguage()
    const darkMode = localStorage.getItem('darkMode') ? JSON.parse(localStorage.getItem('darkMode')) : false

    useEffect(() => {
        document.querySelector('body').style.backgroundColor = darkMode ? '#1E1F21' : ''
    }, [])

    const updateData = (key, newData) => {
        setData({ ...data, [key]: newData })
    }

    const onLogin = async googleData => {
        try {
            setLoading(true)
            let login = {}
            if (googleData && googleData.credential) {
                const userData = await dispatch(googleAuth(googleData)).then(data => data.payload)
                const gData = {
                    isGoogleUser: true,
                    email: userData.email,
                    username: userData.name,
                    picture: userData.picture
                }
                login = await dispatch(logIn(gData)).then(data => data.payload)

                if (!login.username) {
                    const newUser = await dispatch(createUser(gData)).then(data => data.payload)
                    if (newUser) login = await dispatch(logIn(gData)).then(data => data.payload)
                }
            } else login = await dispatch(logIn(data)).then(data => data.payload)
            if (login.username) {
                const hasLedger = login.defaultLedger
                toast.info(`${MESSAGE[lan].WELCOME_TOAST}, ${login.username}!`)
                setTimeout(() => history.push(`${hasLedger ? '/splash' : '/ledger'}`), 2000)
            } else toast.error(MESSAGE[lan].WRONG_CREDENTIALS)

            setLoading(false)
        } catch (_) {
            toast.error(MESSAGE[lan].LOGIN_ERROR)
            setLoading(false)
        }
    }

    const resetPassword = async () => {
        try {
            setLoading(true)
            const sent = await dispatch(sendEmailResetPass(data)).then(data => data.payload)
            if (sent) toast.success(MESSAGE[lan].MAIL_SENT)
            else toast.error(MESSAGE[lan].CONN_ERR)
            setLoading(false)
        } catch (err) {
            toast.error(MESSAGE[lan].CONN_ERR)
            setLoading(false)
        }
    }

    const goToRegister = e => {
        e.preventDefault()
        history.push('/register')
    }

    return (
        <div className={`login-container ${darkMode ? 'dark-mode' : ''}`}>
            <img className='logo-img' src={darkMode ? DarkLogo : WhiteLogo} alt="Control Shift" style={{ filter: darkMode ? ' invert(53%) sepia(61%) saturate(454%) hue-rotate(6deg) brightness(111%) contrast(87%)' : '' }} />
            {mailNModal &&
                <div className='remove-modal' style={{ backgroundColor: darkMode ? 'black' : '', boxShadow: darkMode ? 'none' : '' }}>
                    <h3>{MESSAGE[lan].TO_SEND_MAIL}</h3>
                    <h4>{data.email}</h4>
                    <div className='remove-btns'>
                        <CTAButton
                            label={MESSAGE[lan].CANCEL}
                            color={APP_COLORS.GRAY}
                            handleClick={() => setMailModal(false)}
                            size='fit-content'
                        />
                        <CTAButton
                            label={MESSAGE[lan].CONFIRM}
                            color={APP_COLORS.SPACE}
                            handleClick={() => {
                                resetPassword()
                                setMailModal(false)
                            }}
                            size='fit-content'
                        />
                    </div>
                </div>
            }
            <div className='login-section' style={{ filter: mailNModal && 'blur(10px)' }}>
                <h4 className='hi-login' style={{ color: darkMode ? 'lightgray' : '' }}>{MESSAGE[lan].HI}<br />{MESSAGE[lan].HI_MESSAGE}</h4>
                <InputField
                    label=''
                    updateData={updateData}
                    placeholder='Email'
                    name='email'
                    type='email'
                    style={{ fontWeight: 'normal', fontSize: '4vw' }}
                />
                <InputField
                    label=''
                    updateData={updateData}
                    placeholder={MESSAGE[lan].PASS_PHR}
                    name='password'
                    type='password'
                    style={{ fontWeight: 'normal', fontSize: '4vw' }}
                />
                {loading ? <div style={{ alignSelf: 'center', marginTop: '4vw', display: 'flex' }}><PuffLoader color='#CCA43B' /></div>
                    :
                    <CTAButton
                        label={MESSAGE[lan].LOGIN_BTN}
                        handleClick={onLogin}
                        size='100%'
                        color={APP_COLORS.SPACE}
                        style={{ margin: '10vw', fontSize: '4vw' }}
                        className='cta-login'
                    />
                }
                {/* <GoogleLogin
                    onSuccess={googleData => onLogin(googleData)}
                    onError={handleFailure}
                    useOneTap
                    // auto_select
                    size='large'
                    text='continue_with'
                    shape='circle'
                /> */}
                <h4 className='login-register-text'>{MESSAGE[lan].HI_REGISTER} <button onClick={goToRegister} className='login-register-link'>{MESSAGE[lan].LOGIN_REG_LINK}</button></h4>
                <button onClick={() => setMailModal(true)} className='login-remember-link'>{data.email ? MESSAGE[lan].LOGIN_REMEMBER : ''}</button>
                <h4 className='login-version-text' style={{ color: darkMode ? 'lightgray' : '' }}>{VERSION}</h4>
            </div>
        </div>
    )
}
