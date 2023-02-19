import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import CTAButton from '../components/CTAButton'
import InputField from '../components/InputField'
import { APP_COLORS } from '../constants/colors'
import { getLedger, updateLedgerData } from '../store/reducers/ledger';
import { toast } from 'react-toastify';
import TrashCan from '../assets/trash-can.svg'
import EditPen from '../assets/edit-icon.svg'
import { MESSAGE } from '../constants/messages'
import { getUserLanguage } from '../helpers';
import { PuffLoader } from 'react-spinners';

export default function Notes() {
    const [isEdit, setIsEdit] = useState(false)
    const [loading, setLoading] = useState(false)
    const [openModal, setOpenModal] = useState(false)
    const [removeModal, setRemoveModal] = useState(false)
    const [data, setData] = useState({ name: '', details: '', notes: [] })
    const [check, setCheck] = useState({})
    const dispatch = useDispatch()
    const lan = getUserLanguage()
    const darkMode = localStorage.getItem('darkMode') ? JSON.parse(localStorage.getItem('darkMode')) : false

    useEffect(() => {
        pullNotes()
    }, [])

    const updateData = (key, newData) => {
        setData({ ...data, [key]: newData })
    }

    const handleSave = async () => {
        try {
            if (!data.name || !data.details) {
                return toast.error(MESSAGE[lan].CHECK_DATA)
            }
            const _notes = check.name ? data.notes.filter(note => note !== check) : data.notes
            const newNote = {
                name: data.name,
                details: data.details
            }

            _notes.unshift(newNote)

            const newLedger = await dispatch(updateLedgerData({
                notes: JSON.stringify(_notes),
                id: data.id
            })).then(data => data.payload)

            if (newLedger) {
                localStorage.removeItem('ledger')
                localStorage.setItem('ledger', JSON.stringify(newLedger.data))
                toast.success(MESSAGE[lan].SAVE_SUCC)
                setTimeout(() => pullNotes(), 2000)
            }
            setOpenModal(false)
            setIsEdit(false)
        } catch (err) {
            console.error(err)
        }
    }

    const handleRemoveItem = async () => {
        try {
            const _notes = data.notes.filter(note => note !== check)
            const newLedger = await dispatch(updateLedgerData({
                notes: JSON.stringify(_notes),
                id: data.id
            })).then(data => data.payload)

            if (newLedger) {
                localStorage.removeItem('ledger')
                localStorage.setItem('ledger', JSON.stringify(newLedger.data))
                toast.info(MESSAGE[lan].N_DELETED)
                setTimeout(() => pullNotes(), 1500)
            }
            setIsEdit(false)
            setCheck(-1)
        } catch (err) { console.error(err) }
    }

    const pullNotes = async () => {
        setLoading(true)
        setData({ ...data, notes: [] })

        const { id } = JSON.parse(localStorage.getItem('ledger'))
        const ledger = await dispatch(getLedger(id)).then(data => data.payload)
        const { notes } = ledger

        if (notes) {
            const _notes = JSON.parse(notes)
            setData({ ...data, notes: _notes, id })
        } else {
            setData({ ...data, notes: [], id })
        }
        setLoading(false)
    }

    return (
        <div className={`notes-container ${darkMode ? 'dark-mode' : ''}`}>
            {loading ? <div style={{ alignSelf: 'center', marginTop: '4vw', display: 'flex' }}><PuffLoader color='#CCA43B' /></div>
                : <>
                    {removeModal &&
                        <div className='remove-modal' style={{ backgroundColor: darkMode ? 'black' : '', boxShadow: darkMode ? 'none' : '' }}>
                            <h3>{MESSAGE[lan].TO_DELETE}:<br /><br />'{check.name}'</h3>
                            <div className='remove-btns'>
                                <CTAButton
                                    label={MESSAGE[lan].CANCEL}
                                    color={APP_COLORS.GRAY}
                                    handleClick={() => setRemoveModal(false)}
                                    size='fit-content'
                                />
                                <CTAButton
                                    label={MESSAGE[lan].CONFIRM}
                                    color={APP_COLORS.SPACE}
                                    handleClick={() => {
                                        setRemoveModal(false)
                                        handleRemoveItem()
                                    }}
                                    size='fit-content'
                                />
                            </div>
                        </div>
                    }
                    {!isEdit &&
                        <CTAButton
                            label='+'
                            color={APP_COLORS.YELLOW}
                            handleClick={() => {
                                setData({ ...data, name: '', details: '' })
                                setCheck(0)
                                setOpenModal(true)
                            }}
                            style={{ color: 'black', borderRadius: '10vw', fontSize: '4vw' }}
                            className='new-task-btn-container'
                            btnClass={`new-task-btn ${darkMode ? 'dark-mode-btn' : ''}`}
                            disabled={openModal}
                        />
                    }
                    {openModal &&
                        <div className='task-modal' style={{ backgroundColor: darkMode ? 'black' : '', boxShadow: darkMode ? 'none' : '' }}>
                            <h3 style={{ color: darkMode ? 'lightgray' : APP_COLORS.GRAY }} className='task-modal-title'>{isEdit ? MESSAGE[lan].N_EDIT : MESSAGE[lan].N_NEW}</h3>
                            <InputField
                                label=''
                                updateData={updateData}
                                placeholder={MESSAGE[lan].T_TITLE}
                                name='name'
                                type='text'
                                className='task-title-input'
                                style={{ height: 'fit-content', textAlign: 'left' }}
                                value={data.name}
                            />
                            <InputField
                                label=''
                                updateData={updateData}
                                placeholder={MESSAGE[lan].N_DETAIL}
                                name='details'
                                type='textarea'
                                style={{ height: '20vh', textAlign: 'left', marginBottom: '2vw' }}
                                value={data.details}
                            />
                            <div className='task-modal-btns'>
                                <CTAButton
                                    handleClick={() => {
                                        setData({ ...data, name: '', details: '' })
                                        setIsEdit(false)
                                        setOpenModal(false)
                                        setCheck(0)
                                    }}
                                    label={MESSAGE[lan].CANCEL}
                                    size='100%'
                                    color={APP_COLORS.GRAY}
                                />

                                <CTAButton
                                    handleClick={handleSave}
                                    label={MESSAGE[lan].SAVE}
                                    size='100%'
                                    color={APP_COLORS.YELLOW}
                                    style={{ color: 'black' }}
                                />
                            </div>
                        </div>
                    }
                    {data.notes && data.notes.length ?
                        <div className='note-list' style={{ filter: (removeModal || openModal) && 'blur(10px)' }}>
                            {data.notes.map((note, i) =>
                                <div
                                    key={i}
                                    className='note-container'
                                    style={{
                                        borderColor: check === note ? '#CCA43B' : 'lightgray',
                                        backgroundColor: darkMode ? 'black' : ''
                                    }}
                                    onClick={() => setCheck(note)}
                                >
                                    <h4 className='note-name'>{note.name}</h4>
                                    <textarea
                                        rows={8}
                                        cols={40}
                                        readOnly="readonly"
                                        className='note-details'
                                        defaultValue={note.details}
                                        style={{
                                            backgroundColor: darkMode ? 'black' : '',
                                            color: darkMode ? 'lightgray' : ''
                                        }}
                                    />
                                    {check === note &&
                                        <div className='note-svgs'>
                                            <img
                                                style={{ transform: 'scale(0.6)' }}
                                                onClick={() => setRemoveModal(true)}
                                                className='note-svg-trash'
                                                src={TrashCan} alt="Trash Can"
                                            />
                                            <img onClick={() => {
                                                setIsEdit(true)
                                                setOpenModal(true)
                                                setData({ ...data, name: note.name, details: note.details })
                                            }}
                                                className={`note-svg-edit ${darkMode ? 'dark-svg' : ''}`} src={EditPen} alt="Edit" />
                                        </div>
                                    }
                                </div>
                            )}
                        </div>
                        :
                        ''
                    }
                </>}
        </div>
    )
}
