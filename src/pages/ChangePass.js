import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from "react-redux";
import CTAButton from '../components/CTAButton'
import InputField from '../components/InputField'
import Logo from '../assets/logo.png'
import { APP_COLORS } from '../constants/colors'
import { ToastContainer, toast } from 'react-toastify';
import { MESSAGE } from '../constants/messages'
import { VERSION } from '../constants/app'
import { getUserLanguage } from '../helpers';
import 'react-toastify/dist/ReactToastify.css';
import { changePassword } from '../store/reducers/user';
import MoonLoader from "react-spinners/MoonLoader";

export default function ChangePass() {
    const [data, setData] = useState({})
    const [emailFound, setEmailFound] = useState(null)
    const [loading, setLoading] = useState(false)

    const dispatch = useDispatch()
    const history = useHistory()
    const lan = getUserLanguage()

    useEffect(() => {
        const { userEmail } = new Proxy(new URLSearchParams(window.location.search), {
            get: (searchParams, prop) => searchParams.get(prop),
        })
        if (userEmail) {
            let _userEmail = userEmail.replace(' ','+')
            setEmailFound(_userEmail)
            updateData('userEmail', _userEmail)
        }
    }, [])

    const updateData = (key, newData) => {
        setData({ ...data, [key]: newData })
    }

    const saveNewPassword = async () => {
        try {
            if (!data.password || !data.currentPass) return toast.error(MESSAGE[lan].CHECK_FIELDS)
            if(data.password === data.currentPass) return toast.error(MESSAGE[lan].SAME_PASS)
            
            setLoading(true)
            const saved = await dispatch(changePassword(data)).then(d => d.payload)

            if (saved) {
                setLoading(false)
                toast.success(MESSAGE[lan].L_SAVED)
                setTimeout(() => history.push('/login'), 2500)
            } else {
                setLoading(false)
                toast.error(MESSAGE[lan].WRONG_CREDENTIALS)
            }
        } catch (err) { toast.error(MESSAGE[lan].SAVE_ERR) }
    }

    return (
        <div className='login-container'>
            <ToastContainer autoClose={2000} />
            <div className='logo-login-container'>
                <img className='logo-img' src={Logo} alt="Control Shift" />
            </div>
            {loading ? <MoonLoader color='#CCA43B'/> : emailFound ?
                <div className='new-pass-container'>
                    <h4 className='hi-login'>{MESSAGE[lan].CHANGE_PASS}</h4>
                    <InputField
                        updateData={updateData}
                        placeholder={MESSAGE[lan].ACTUAL_PASS}
                        name='currentPass'
                        type='password'
                        style={{ fontWeight: 'normal', fontSize: '4vw' }}
                    />
                    <InputField
                        updateData={updateData}
                        placeholder={MESSAGE[lan].NEW_PASS}
                        name='password'
                        type='password'
                        style={{ fontWeight: 'normal', fontSize: '4vw' }}
                    />
                    <CTAButton
                        label={MESSAGE[lan].SAVE}
                        handleClick={saveNewPassword}
                        size='100%'
                        color={APP_COLORS.SPACE}
                        style={{ margin: '10vw', fontSize: '4vw' }}
                        className='cta-login'
                    />
                </div>
                :
                <div className='new-pass-container'>
                    <h4 className='hi-login'>{MESSAGE[lan].HI}<br />{MESSAGE[lan].EMAIL_NOT_FOUND}</h4>
                    <CTAButton
                        label={MESSAGE[lan].LOGIN_BTN}
                        handleClick={() => history.push('/login')}
                        size='100%'
                        color={APP_COLORS.SPACE}
                        style={{ margin: '10vw', fontSize: '4vw' }}
                        className='cta-login'
                    />
                </div>
            }
            <h4 className='login-version-text'>{VERSION}</h4>
        </div>
    )
}
