import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from "react-redux";
import CTAButton from '../CTAButton'
import InputField from '../InputField'
import { APP_COLORS } from '../../constants/colors'
import { ToastContainer, toast } from 'react-toastify';
import {
    getUserLedgers,
    saveLedger,
    logLedger
} from '../../store/reducers/ledger'
import { getUserLanguage } from '../../helpers';
import { MESSAGE } from '../../constants/messages'
import 'react-toastify/dist/ReactToastify.css';
import './styles.css'

export default function Ledger() {
    const [data, setData] = useState({})
    const [newLedger, setNewLedger] = useState(false)
    const [connect, setConnect] = useState(false)
    const history = useHistory()
    const dispatch = useDispatch()
    const ledger = JSON.parse(localStorage.getItem('ledger'))
    const lan = getUserLanguage()

    useEffect(() => {
        const localUser = JSON.parse(localStorage.getItem('user'))

        if (!localUser) return history.push('/')
        const { email, username } = localUser

        const _settings = {
            authors: [`${username}`],
            payTypes: MESSAGE[lan].L_PAY_TYPES,
            categories: MESSAGE[lan].L_CATEGORIES,
            salary: 0
        }

        setData({ ...data, email, settings: JSON.stringify(_settings) })
    }, [])

    const updateData = (key, newData) => {
        setData({ ...data, [key]: newData })
    }

    const handleSaveLedger = async () => {
        try {
            const ledgerBook = await dispatch(saveLedger(data)).then(d => d.payload)

            if (ledgerBook) {
                localStorage.removeItem('ledger')
                localStorage.setItem('ledger', JSON.stringify(ledgerBook))
                toast.success(MESSAGE[lan].L_SAVED)

                setTimeout(() => history.push('/home'), 2000)

            } else toast.error(MESSAGE[lan].SAVE_ERR,)
        } catch (err) { toast.error(MESSAGE[lan].SAVE_ERR) }
    }

    const handleConnect = async () => {
        try {
            const loginLedger = await dispatch(logLedger(data)).then(d => d.payload)

            if (loginLedger) {
                localStorage.removeItem('ledger')
                localStorage.setItem('ledger', JSON.stringify(loginLedger))
                toast.success(MESSAGE[lan].L_CONNECTED)

                setTimeout(() => history.push('/home'), 2000)

            } else toast.error(MESSAGE[lan].CONN_ERR)
        } catch (err) { toast.error(MESSAGE[lan].CONN_ERR) }
    }

    const handleDisconnect = () => {
        localStorage.removeItem('ledger')
        toast.success(MESSAGE[lan].L_DISCONNECTED)
        setTimeout(() => history.go(0), 2000)
    }

    return (
        <div className='user-group-container'>
            <ToastContainer autoClose={2000} />
            {
                ledger && ledger.name ?
                    <>
                        <h4 className='group-text'>{MESSAGE[lan].L_TEXT1}</h4>
                        <h4 className='group-text'>{MESSAGE[lan].L_TEXT1_2}</h4>
                        <h4 className='group-text'>{MESSAGE[lan].L_TEXT2_4}</h4>
                    </>
                    :
                    <>
                        <h4 className='group-text'>{MESSAGE[lan].L_TEXT2}</h4>
                        <h4 className='group-text'>{MESSAGE[lan].L_TEXT2_2}</h4>
                        <h4 className='group-text'>{MESSAGE[lan].L_TEXT2_3}</h4>
                        <h4 className='group-text'>{MESSAGE[lan].L_TEXT2_4}</h4>
                    </>
            }
            {
                ledger && ledger.name ?
                    <div className='div-ledger-connected'>
                        <h4 className='ledger-connected'>{MESSAGE[lan].L_CURRENT}: <br /><br /><i>{ledger.name}</i></h4>
                        <CTAButton
                            label={MESSAGE[lan].L_DISCONNECT}
                            color='#363636'
                            handleClick={handleDisconnect}
                            style={{ marginTop: '4vw', fontSize: '4vw' }}
                        />
                    </div>
                    :
                    <div className='no-ledger-section'>
                        <CTAButton
                            label={MESSAGE[lan].L_NEW}
                            color='#CCA43B'
                            handleClick={() => {
                                setNewLedger(!newLedger)
                                setConnect(false)
                            }}
                            style={{ marginBottom: '4vw', color: 'black' }}
                            className='cta-new-ledger'
                        />
                        <CTAButton
                            label={MESSAGE[lan].L_CONN}
                            color='#263d42'
                            handleClick={() => {
                                setConnect(!connect)
                                setNewLedger(false)
                            }}
                        />
                        {
                            newLedger &&
                            <div className='new-group-section'>
                                <InputField
                                    label={MESSAGE[lan].L_NEW_LABEL}
                                    updateData={updateData}
                                    placeholder={MESSAGE[lan].L_NAME}
                                    name='name'
                                    type='text'
                                    autoComplete='new-password'
                                    style={{ marginTop: '1vw', alignSelf: 'center', fontWeight: 'normal', width: '45%' }}
                                />
                                <InputField
                                    label=''
                                    updateData={updateData}
                                    placeholder={MESSAGE[lan].PASSWORD}
                                    name='pin'
                                    type='password'
                                    autoComplete='new-password'
                                    style={{ marginBottom: '1vw', alignSelf: 'center', fontWeight: 'normal', width: '45%' }}
                                />
                                <CTAButton
                                    label={MESSAGE[lan].SAVE}
                                    color='#263d42'
                                    handleClick={handleSaveLedger}
                                    style={{ margin: '1vw', color: '#CCA43B' }}
                                    className='cta-connect-ledger'
                                />
                            </div>
                        }
                        {
                            connect &&
                            <div className='connect-group-section'>
                                <InputField
                                    label={MESSAGE[lan].L_CONN_LABEL}
                                    updateData={updateData}
                                    placeholder={MESSAGE[lan].L_NAME}
                                    name='name'
                                    type='text'
                                    autoComplete='new-password'
                                    style={{ marginTop: '1vw', alignSelf: 'center', fontWeight: 'normal', width: '45%' }}
                                />
                                <InputField
                                    label=''
                                    updateData={updateData}
                                    placeholder={MESSAGE[lan].PASSWORD}
                                    name='pin'
                                    type='password'
                                    autoComplete='new-password'
                                    style={{ marginBottom: '1vw', alignSelf: 'center', fontWeight: 'normal', width: '45%' }}
                                />
                                <CTAButton
                                    label={MESSAGE[lan].L_CONNECT}
                                    color='#263d42'
                                    handleClick={handleConnect}
                                    style={{ margin: '1vw', color: '#CCA43B' }}
                                    className='cta-connect-ledger'
                                />
                            </div>
                        }
                    </div>
            }
        </div>
    )
}
