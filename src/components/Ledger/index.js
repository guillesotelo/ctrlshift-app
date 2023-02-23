import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from "react-redux";
import CTAButton from '../CTAButton'
import InputField from '../InputField'
import { APP_COLORS } from '../../constants/colors'
import { toast } from 'react-toastify';
import {
    getUserLedgers,
    saveLedger,
    logLedger,
    logLocalLedger
} from '../../store/reducers/ledger'
import { getUserLanguage } from '../../helpers';
import { MESSAGE } from '../../constants/messages'
import 'react-toastify/dist/ReactToastify.css';
import './styles.css'
import Dropdown from '../Dropdown';

export default function Ledger() {
    const [data, setData] = useState({})
    const [newLedger, setNewLedger] = useState(false)
    const [connect, setConnect] = useState(false)
    const [userLedgers, setUserLedgers] = useState([])
    const [isEdit, setIsEdit] = useState(false)
    const [loading, setLoading] = useState(false)
    const history = useHistory()
    const dispatch = useDispatch()
    const ledger = JSON.parse(localStorage.getItem('ledger'))
    const lan = getUserLanguage()
    const darkMode = localStorage.getItem('darkMode') ? JSON.parse(localStorage.getItem('darkMode')) : false
    const localUser = JSON.parse(localStorage.getItem('user'))

    console.log("data", data)

    useEffect(() => {
        const { email, username } = localUser

        if (!localUser || !localUser.token || !localUser.app || localUser.app !== 'ctrl-shift') {
            localStorage.clear()
            return history.push('/login')
        }

        const _settings = {
            authors: [`${username}`],
            payTypes: MESSAGE[lan].L_PAY_TYPES,
            categories: MESSAGE[lan].L_CATEGORIES,
            salary: 0
        }

        getLedgers()
        setData({ email, settings: JSON.stringify(_settings) })
        if (ledger?.name) updateData('name', ledger.name)
    }, [])

    const updateData = (key, newData) => {
        setData({ ...data, [key]: newData })
    }

    const getLedgers = async () => {
        try {
            const ledgers = await dispatch(getUserLedgers({ email: localUser.email })).then(data => data.payload)
            setUserLedgers(ledgers.map(ledger => ledger.name))
        } catch (err) {
            console.error(err)
        }
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
        if (isEdit && data.name) connectLocalLedger()
        else connectNewLedger()
    }

    const connectLocalLedger = async () => {
        try {
            const loginLedger = await dispatch(logLocalLedger(data)).then(d => d.payload)

            if (loginLedger) {
                localStorage.removeItem('ledger')
                localStorage.setItem('ledger', JSON.stringify(loginLedger))
                toast.success(MESSAGE[lan].L_CONNECTED)

                setTimeout(() => history.push('/home'), 2000)

            } else toast.error(MESSAGE[lan].CONN_ERR)
        } catch (err) { toast.error(MESSAGE[lan].CONN_ERR) }
    }

    const connectNewLedger = async () => {
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

    const handleCancel = () => {
        setIsEdit(false)
        setConnect(false)
        setNewLedger(false)
        setLoading(false)
        setData({})
        if (ledger?.name) updateData('name', ledger.name)
    }

    return (
        <div className={`user-group-container ${darkMode ? 'dark-mode' : ''}`}>
            {
                ledger && ledger.name ?
                    <>
                        <h4 className='group-text' style={{ color: darkMode ? 'black' : '' }}>{MESSAGE[lan].L_TEXT1}</h4>
                        <h4 className='group-text' style={{ color: darkMode ? 'black' : '' }}>{MESSAGE[lan].L_TEXT1_2}</h4>
                        <h4 className='group-text' style={{ color: darkMode ? 'black' : '' }}>{MESSAGE[lan].L_TEXT2_4}</h4>
                    </>
                    :
                    <>
                        <h4 className='group-text' style={{ color: darkMode ? 'black' : '' }}>{MESSAGE[lan].L_TEXT2}</h4>
                        <h4 className='group-text' style={{ color: darkMode ? 'black' : '' }}>{MESSAGE[lan].L_TEXT2_2}</h4>
                        <h4 className='group-text' style={{ color: darkMode ? 'black' : '' }}>{MESSAGE[lan].L_TEXT2_3}</h4>
                        <h4 className='group-text' style={{ color: darkMode ? 'black' : '' }}>{MESSAGE[lan].L_TEXT2_4}</h4>
                    </>
            }

            <div className='div-ledger-connected' style={{
                boxShadow: darkMode ? 'none' : '',
                border: darkMode ? '1px solid lightgray' : ''
            }}>
                <Dropdown
                    options={userLedgers}
                    label={MESSAGE[lan].L_CURRENT}
                    name='name'
                    updateData={updateData}
                    value={data.name}
                    darkMode={darkMode}
                    bg='#1E1F21'
                    setIsEdit={setIsEdit}
                />
                {isEdit ?
                    <div style={{ display: 'flex', flexDirection: 'row', gap: '3vw' }}>
                        <CTAButton
                            label={MESSAGE[lan].CANCEL}
                            color='#363636'
                            handleClick={handleCancel}
                            style={{ margin: '1vw', color: 'lightgray' }}
                            className='cta-connect-ledger'
                        />
                        <CTAButton
                            label={MESSAGE[lan].L_CONNECT}
                            color='#263d42'
                            handleClick={handleConnect}
                            style={{ margin: '1vw', color: '#CCA43B' }}
                            className='cta-connect-ledger'
                        />
                    </div>
                    : ''}
            </div>

            <div className='no-ledger-section'>
                {!newLedger && !connect && !isEdit ?
                    <>
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
                    </> : ''}
                {
                    newLedger &&
                    <div className='new-group-section' style={{
                        boxShadow: darkMode ? 'none' : '',
                        border: darkMode ? '1px solid lightgray' : ''
                    }}>
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
                            placeholder={MESSAGE[lan].PASS_PHR}
                            name='pin'
                            type='password'
                            autoComplete='new-password'
                            style={{ marginBottom: '1vw', alignSelf: 'center', fontWeight: 'normal', width: '45%' }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <CTAButton
                                label={MESSAGE[lan].CANCEL}
                                color='#363636'
                                handleClick={handleCancel}
                                style={{ margin: '1vw', color: 'lightgray' }}
                                className='cta-connect-ledger'
                            />
                            <CTAButton
                                label={MESSAGE[lan].SAVE}
                                color='#263d42'
                                handleClick={handleSaveLedger}
                                style={{ margin: '1vw', color: '#CCA43B' }}
                                className='cta-connect-ledger'
                            />
                        </div>
                    </div>
                }
                {
                    connect &&
                    <div className='connect-group-section' style={{
                        boxShadow: darkMode ? 'none' : '',
                        border: darkMode ? '1px solid lightgray' : ''
                    }}>
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
                            placeholder={MESSAGE[lan].PASS_PHR}
                            name='pin'
                            type='password'
                            autoComplete='new-password'
                            style={{ marginBottom: '1vw', alignSelf: 'center', fontWeight: 'normal', width: '45%' }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <CTAButton
                                label={MESSAGE[lan].CANCEL}
                                color='#363636'
                                handleClick={handleCancel}
                                style={{ margin: '1vw', color: 'lightgray' }}
                                className='cta-connect-ledger'
                            />
                            <CTAButton
                                label={MESSAGE[lan].L_CONNECT}
                                color='#263d42'
                                handleClick={handleConnect}
                                style={{ margin: '1vw', color: '#CCA43B' }}
                                className='cta-connect-ledger'
                            />
                        </div>
                    </div>
                }
            </div>

        </div>
    )
}
