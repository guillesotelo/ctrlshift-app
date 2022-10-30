import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from "react-redux";
import CTAButton from '../components/CTAButton'
import InputField from '../components/InputField'
import Logo from '../assets/logo.png'
import { 
    logIn, 
    googleAuth, 
    createUser, 
    sendEmailResetPass 
} from '../store/reducers/user'
import { APP_COLORS } from '../constants/colors'
import { ToastContainer, toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
import { MESSAGE } from '../constants/messages'
import { VERSION } from '../constants/app'
import { getUserLanguage } from '../helpers';
import 'react-toastify/dist/ReactToastify.css';

export default function Login() {
    const [data, setData] = useState({})
    const [mailNModal, setMailModal] = useState(false)
    const dispatch = useDispatch()
    const history = useHistory()
    const lan = getUserLanguage()

    const updateData = (key, newData) => {
        setData({ ...data, [key]: newData })
    }

    const onLogin = async googleData => {
        try {
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
                setTimeout(() => history.push(`${hasLedger ? '/' : '/ledger'}`), 2000)
            } else toast.error(MESSAGE[lan].WRONG_CREDENTIALS)
        } catch (_) { toast.error(MESSAGE[lan].LOGIN_ERROR) }
    }

    const handleFailure = () => toast.error(MESSAGE[lan].LOGIN_ERROR)

    const resetPassword = async () => {
        try {
            const sent = await dispatch(sendEmailResetPass(data)).then(data => data.payload)
            if(sent) toast.success(MESSAGE[lan].MAIL_SENT)
            else toast.error(MESSAGE[lan].CONN_ERR)
        } catch (err) { toast.error(MESSAGE[lan].CONN_ERR) }
    }

    const goToRegister = e => {
        e.preventDefault()
        history.push('/register')
    }

    return (
        <div className='login-container'>
            <ToastContainer autoClose={2000} />
            <div className='logo-login-container'>
                <img className='logo-img' src={Logo} alt="Control Shift" />
            </div>
            {mailNModal &&
                <div className='remove-modal'>
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
                <h4 className='hi-login'>{MESSAGE[lan].HI}<br />{MESSAGE[lan].HI_MESSAGE}</h4>
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
                <CTAButton
                    label={MESSAGE[lan].LOGIN_BTN}
                    handleClick={onLogin}
                    size='100%'
                    color={APP_COLORS.SPACE}
                    style={{ margin: '10vw', fontSize: '4vw' }}
                    className='cta-login'
                    />
                {/* <GoogleLogin
                    onSuccess={googleData => onLogin(googleData)}
                    onError={handleFailure}
                    useOneTap
                    // auto_select
                    size='large'
                    text='continue_with'
                    shape='circle'
                /> */}
                <h4 className='login-register-text'>{MESSAGE[lan].LOGIN_REG_TEXT} <button onClick={goToRegister} className='login-register-link'>{MESSAGE[lan].LOGIN_REG_LINK}</button></h4>
                {data.email && <button onClick={() => setMailModal(true)} className='login-remember-link'>{MESSAGE[lan].LOGIN_REMEMBER}</button>}
                <h4 className='login-version-text'>{VERSION}</h4>
            </div>
        </div>
    )
}
