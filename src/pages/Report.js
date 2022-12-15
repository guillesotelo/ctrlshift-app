import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import CTAButton from '../components/CTAButton'
import InputField from '../components/InputField'
import { APP_COLORS } from '../constants/colors'
import { getReports, saveReport, updateReport } from '../store/reducers/report';
import { getAdminCredentials } from '../store/reducers/user';
import { ToastContainer, toast } from 'react-toastify';
import { MESSAGE } from '../constants/messages'
import { getUserLanguage } from '../helpers';
import { PuffLoader } from 'react-spinners';

export default function Report() {
    const [loading, setLoading] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)
    const [reports, setReports] = useState([])
    const [data, setData] = useState({})
    const dispatch = useDispatch()
    const history = useHistory()
    const lan = getUserLanguage()

    const updateData = (key, newData) => {
        setData({ ...data, [key]: newData })
    }

    useEffect(() => {
        getAdmin()
    }, [])

    const getAdmin = async () => {
        const user = localStorage.getItem('user') && JSON.parse(localStorage.getItem('user'))
        if (!user || !user.email) return history.push('/')

        const admin = await dispatch(getAdminCredentials({ email: user.email })).then(data => data.payload)
        setIsAdmin(admin.isAdmin || false)

        if (admin.isAdmin) getAllReports()
        
        setData({
            ...data,
            username: user.username,
            email: user.email
        })
    }

    const getAllReports = async () => {
        const allReports = await dispatch(getReports()).then(data => data.payload)
        setReports(allReports)
    }

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

            if(isAdmin) setTimeout(() => getAllReports(), 200)
        } catch (err) {
            console.error(err)
            toast.error(MESSAGE[lan].SAVE_ERR)
            setLoading(false)
        }
    }

    const markAsFixed = report => {
        try {
            const updated = dispatch(updateReport({ ...report, isFixed: !report.isFixed })).then(data => data.payload)
            if (updated) {
                toast.success(MESSAGE[lan].ISSUE_SAVED)
            } else return toast.error(MESSAGE[lan].SAVE_ERR)
            setTimeout(() => getAllReports(), 200)
        } catch (err) {
            toast.success(MESSAGE[lan].ISSUE_SAVED)
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
                    {isAdmin ?
                        <div className='reports-list'>
                            {reports.map((report, i) =>
                                <div key={i} className='report-card' style={{ backgroundColor: report.isFixed && '#cbf0cb', color: report.isFixed && 'gray' }}>
                                    <h4 className='single-report-title'>{report.title}</h4>
                                    <h4 className='single-report-email'>{report.email}</h4>
                                    <h4 className='single-report-description'>{report.description}</h4>
                                    <CTAButton
                                        handleClick={() => markAsFixed(report)}
                                        label={report.isFixed ? 'Mark as not fixed' : 'Mark as fixed'}
                                        size='60%'
                                        color={report.isFixed ? APP_COLORS.GRAY : APP_COLORS.SPACE}
                                        loading={loading}
                                    />
                                </div>
                            )}
                        </div>
                        : ''}
                </div>}
        </div>
    )
}
