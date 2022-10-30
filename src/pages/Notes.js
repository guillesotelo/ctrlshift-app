import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import CTAButton from '../components/CTAButton'
import InputField from '../components/InputField'
import { APP_COLORS } from '../constants/colors'
import { updateLedgerData } from '../store/reducers/ledger';
import { ToastContainer, toast } from 'react-toastify';
import TrashCan from '../assets/trash-can.svg'
import EditPen from '../assets/edit-icon.svg'
import { MESSAGE } from '../constants/messages'
import { getUserLanguage } from '../helpers';

export default function Notes() {
    const [isEdit, setIsEdit] = useState(false)
    const [removeModal, setRemoveModal] = useState(false)
    const [data, setData] = useState({ name: '', details: '', notes: [] })
    const [check, setCheck] = useState({})
    const dispatch = useDispatch()
    const lan = getUserLanguage()

    useEffect(() => {
        pullNotes()
    }, [])

    const updateData = (key, newData) => {
        setData({ ...data, [key]: newData })
    }

    const handleSave = async () => {
        try {
            if (!data.name || !data.details) return toast.error(MESSAGE[lan].CHECK_DATA)
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
                setTimeout(() => pullNotes(), 1500)
            }
            setIsEdit(false)
        } catch (err) { console.error(err) }
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

    const pullNotes = () => {
        setData({...data, notes: []})
        const { notes, id } = JSON.parse(localStorage.getItem('ledger'))
        if (notes) {
            const _notes = JSON.parse(notes)
            setData({ ...data, notes: _notes, id })
        } else {
            setData({ ...data, notes: [], id })
        }
    }

    return (
        <div className='notes-container'>
            <ToastContainer autoClose={2000} />
            {removeModal &&
                <div className='remove-modal'>
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
                    label={MESSAGE[lan].N_NEW}
                    color={APP_COLORS.YELLOW}
                    handleClick={() => {
                        setData({...data, name: '', details: ''})
                        setCheck(0)
                        setIsEdit(true)
                    }}
                    size='100%'
                    style={{ color: 'black', fontSize: '5vw' }}
                />
            }
            {isEdit &&
                <div className='new-note-container' style={{ filter: removeModal && 'blur(10px)' }}>
                    <InputField
                        label=''
                        updateData={updateData}
                        placeholder={MESSAGE[lan].N_NAME}
                        name='name'
                        type='text'
                        style={{ height: 'fit-content', textAlign: 'left' }}
                        value={data.name}
                    />
                    <InputField
                        label=''
                        updateData={updateData}
                        placeholder={MESSAGE[lan].N_DETAIL}
                        name='details'
                        type='textarea'
                        rows={8}
                        value={data.details}
                    />
                    {((data.name || data.details || check) && isEdit) ?
                        <div className='new-note-btns'>
                            <CTAButton
                                label={MESSAGE[lan].DISCARD}
                                color={APP_COLORS.LIGHT}
                                handleClick={() => {
                                    setCheck(0)
                                    setIsEdit(false)
                                }}
                                size='100%'
                                style={{ color: 'black', fontSize: '5vw' }}
                            />
                            <CTAButton
                                label={MESSAGE[lan].SAVE}
                                color={APP_COLORS.YELLOW}
                                handleClick={() => {
                                    handleSave()
                                }}
                                size='100%'
                                style={{ color: 'black', fontSize: '5vw' }}
                            />
                        </div>
                        :
                        ''
                    }
                </div>
            }
            {data.notes.length ?
                <div className='note-list' style={{ filter: removeModal && 'blur(10px)' }}>
                    {data.notes.map((note, i) =>
                        <div
                            key={i}
                            className='note-container'
                            style={{ borderColor: check === note ? '#CCA43B' : 'lightgray' }}
                            onClick={() => setCheck(note)}
                        >
                            <h4 className='note-name'>{note.name}</h4>
                            <textarea
                                rows={8}
                                cols={40}
                                readOnly="readonly"
                                className='note-details'
                                defaultValue={note.details}
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
                                        setData({ ...data, name: note.name, details: note.details })
                                    }}
                                        className='note-svg-edit' src={EditPen} alt="Edit" />
                                </div>
                            }
                        </div>
                    )}
                </div>
                :
                ''
            }
        </div>
    )
}
