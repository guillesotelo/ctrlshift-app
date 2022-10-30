import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch } from "react-redux";
import CTAButton from '../components/CTAButton'
import InputField from '../components/InputField'
import Logo from '../assets/logo.png'
import { createUser, logIn } from '../store/reducers/user'
import { APP_COLORS } from '../constants/colors'
import { ToastContainer, toast } from 'react-toastify';
import Dropdown from 'react-bootstrap/Dropdown'
import Flag from 'react-world-flags'
import { LANGUAGES } from '../constants/languages.js'
import { MESSAGE } from '../constants/messages'
import 'react-toastify/dist/ReactToastify.css';
// import 'bootstrap/dist/css/bootstrap.min.css';

export default function Register() {
    const [data, setData] = useState({})
    const [lan, setLan] = useState(navigator.language || navigator.userLanguage)
    const [toggleContents, setToggleContents] = useState(<><Flag code={'us'} height="16" />{MESSAGE[lan].SET_LAN}</>)
    const dispatch = useDispatch()
    const history = useHistory()

    const updateData = (key, newData) => {
        setData({ ...data, [key]: newData })
    }

    const onRegister = async () => {
        try {
            if (!checkData()) return toast.error(MESSAGE[lan].CHECK_DATA)
            if (data.password.length < 4) return toast.error(MESSAGE[lan].IMPROVE_PASS)

            const newUser = await dispatch(createUser(data)).then(data => data.payload)
            if (newUser) {
                const login = await dispatch(logIn(data)).then(data => data.payload)
                if (login) {
                    localStorage.setItem('user', JSON.stringify(login))
                    toast.info(`${MESSAGE[lan].WELCOME_TOAST}, ${login.username}!`)
                    setTimeout(() => history.push('/ledger'), 2000)
                }

            } else return toast.error(MESSAGE[lan].REG_ERR)
        } catch (err) { console.error(err) }
    }

    const checkData = () => {
        if (!data.password2 || !data.password || data.password2 !== data.password) return false
        if (!data.email.includes('@') || !data.email.includes('.')) return false
        if (!data.language) updateData('language', lan)
        return true
    }

    return (
        <div className='login-container'>
            <ToastContainer autoClose={2000} />
            <div className='logo-register-container'>
                <img className='logo-img-register' src={Logo} alt="Ctrol Shiflt" />
            </div>
            <div className='login-section'>
                <h4 className='hi-login'>{MESSAGE[lan].HI_REGISTER}</h4>
                <InputField
                    label=''
                    updateData={updateData}
                    placeholder={MESSAGE[lan].NAME}
                    name='username'
                    type='text'
                    style={{ fontWeight: 'normal', fontSize: '4vw' }}
                    autoComplete='new-password'
                />
                <InputField
                    label=''
                    updateData={updateData}
                    placeholder='Email'
                    name='email'
                    type='email'
                    style={{ fontWeight: 'normal', fontSize: '4vw' }}
                    autoComplete='new-password'
                />
                <InputField
                    label=''
                    updateData={updateData}
                    placeholder={MESSAGE[lan].PASS_PHR}
                    name='password'
                    type='password'
                    style={{ fontWeight: 'normal', fontSize: '4vw' }}
                    autoComplete='new-password'
                />
                <InputField
                    label=''
                    updateData={updateData}
                    placeholder={MESSAGE[lan].PASS2}
                    name='password2'
                    type='password'
                    style={{ fontWeight: 'normal', fontSize: '4vw' }}
                    autoComplete='new-password'
                />
                <Dropdown
                    style={{ margin: '2vw 0' }}
                    onSelect={selected => {
                        const { code, title } = LANGUAGES.find(({ code }) => selected === code)

                        setLan(selected)
                        updateData('language', selected)
                        setToggleContents(<><Flag code={code} height="16" /> {title}</>)
                    }}
                >
                    <Dropdown.Toggle variant="secondary" id="cta-btn" className="text-left" style={{ width: '100%' }}>
                        {toggleContents}
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                        {LANGUAGES.map(({ code, title }) => (
                            <Dropdown.Item key={code} eventKey={code}><Flag height="16" code={code} /> {title}</Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>
                <CTAButton
                    label={MESSAGE[lan].REGISTER_BTN}
                    handleClick={onRegister}
                    size='100%'
                    color={APP_COLORS.SPACE}
                    style={{ marginTop: '6vw', fontSize: '4vw' }}
                    className='cta-register'
                />
                <CTAButton
                    label={MESSAGE[lan].BACK_BTN}
                    handleClick={() => history.goBack()}
                    size='100%'
                    color={APP_COLORS.GRAY}
                    style={{ marginTop: '10vw', fontSize: '4vw' }}
                />
            </div>
        </div>
    )
}
