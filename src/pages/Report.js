import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import CTAButton from '../components/CTAButton'
import InputField from '../components/InputField'
import { APP_COLORS } from '../constants/colors'
import { saveReport } from '../store/reducers/report';
import { ToastContainer, toast } from 'react-toastify';
import { MESSAGE } from '../constants/messages'
import { getUserLanguage } from '../helpers';
import { PuffLoader } from 'react-spinners';

export default function Report() {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState({})
    const dispatch = useDispatch()
    const history = useHistory()
    const lan = getUserLanguage()

    const updateData = (key, newData) => {
        setData({ ...data, [key]: newData })
    }

    useEffect(() => {
        const user = localStorage.getItem('user') && JSON.parse(localStorage.getItem('user'))
        if (!user || !user.email) return history.push('/')

        setData({
            ...data,
            username: user.username,
            email: user.email
        })
    }, [])

    const handleSave = async () => {
        try {
            setLoading(true)
            if (!data.title || !data.description) {
                setLoading(false)
                return toast.error(MESSAGE[lan].CHECK_DATA)
            }

            const saved = await dispatch(saveReport(data)).then(data => data.payload)
            if (saved) {
                toast.success(MESSAGE[lan].ISSUE_SAVED)
                toast.success(MESSAGE[lan].ISSUE_TX)
                setData({})
            }
            else {
                setLoading(false)
                return toast.error(MESSAGE[lan].SAVE_ERR)
            }
            setLoading(false)
        } catch (err) {
            console.error(err)
            toast.error(MESSAGE[lan].SAVE_ERR)
            setLoading(false)
        }
    }

    return (
        <div className='reports-container'>
            <ToastContainer autoClose={2000} />
            <h4 className='reports-title'>{MESSAGE[lan].REPORTS_TITLE}</h4>
            <h4 className='reports-text'>{MESSAGE[lan].REPORTS_TEXT}</h4>
            {loading ? <div style={{ alignSelf: 'center', marginTop: '4vw', display: 'flex' }}><PuffLoader color='#CCA43B' /></div>
                :
                <div className='reports-fill'>
                    <InputField
                        label=''
                        updateData={updateData}
                        placeholder={MESSAGE[lan].ISSUE_TITLE}
                        name='title'
                        type='text'
                        size='100%'
                    />
                    <InputField
                        label=''
                        updateData={updateData}
                        placeholder={`${MESSAGE[lan].ISSUE_DESC}...`}
                        name='description'
                        type='textarea'
                        size='100%'
                    />
                    <div className='reports-btns'>
                        <CTAButton
                            handleClick={() => history.goBack()}
                            label={MESSAGE[lan].CANCEL}
                            size='100%'
                            color={APP_COLORS.GRAY}
                        />
                        <CTAButton
                            handleClick={handleSave}
                            label={MESSAGE[lan].SAVE}
                            size='100%'
                            color={APP_COLORS.YELLOW}
                            loading={loading}
                            style={{ color: '#263d42' }}
                        />
                    </div>
                </div>}
        </div>
    )
}
