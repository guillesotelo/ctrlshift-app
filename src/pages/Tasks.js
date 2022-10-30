import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import DatePicker, { registerLocale } from 'react-datepicker'
import es from "date-fns/locale/es"
import TrashCan from '../assets/trash-can.svg'
import ScheduleIcon from '../assets/schedule-icon.svg'
import WatchIcon from '../assets/watch-icon.svg'
import CTAButton from '../components/CTAButton'
import InputField from '../components/InputField'
import { APP_COLORS } from '../constants/colors'
import { updateLedgerData } from '../store/reducers/ledger';
import { ToastContainer, toast } from 'react-toastify';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { MESSAGE } from '../constants/messages'
import { getUserLanguage } from '../helpers';

export default function Tasks() {
    const [taskArr, setTaskArr] = useState([])
    const [allTasks, setAllTasks] = useState([])
    const [data, setData] = useState({ date: '', name: '', details: '' })
    const [ledgerId, setLedgerId] = useState('')
    const [openModal, setOpenModal] = useState(false)
    const [check, setCheck] = useState({})
    const [isEdit, setIsEdit] = useState(false)
    const [dateClicked, setDateClicked] = useState(false)
    const [timeClicked, setTimeClicked] = useState(false)
    const [tab, setTab] = useState('unChecked')
    const dispatch = useDispatch()
    const lan = getUserLanguage()
    registerLocale("es", es)

    useEffect(() => {
        pullTasks()
    }, [tab])

    const updateData = (key, newData) => {
        setData({ ...data, [key]: newData })
    }

    const pullTasks = () => {
        const { tasks, id } = JSON.parse(localStorage.getItem('ledger'))
        setLedgerId(id)

        if (tasks) {
            setAllTasks(JSON.parse(tasks))
            const _tasks = tab === 'isChecked' ? JSON.parse(tasks).filter(t => t.isChecked) : JSON.parse(tasks).filter(t => !t.isChecked)
            setTaskArr(_tasks)
        }
        else setTaskArr([])
    }

    const handleSave = async () => {
        try {
            if (!data.name) return toast.error(MESSAGE[lan].CHECK_DATA)
            const newTask = {
                name: data.name,
                details: data.details,
                date: data.date,
                hasTime: data.hasTime || false
            }

            let isNew = true
            const _tasks = allTasks.map(task => {
                if (compareTasks(task, check)) {
                    isNew = false
                    return newTask
                } else return task
            })

            if (isNew) _tasks.unshift(newTask)

            const newLedger = await dispatch(updateLedgerData({
                tasks: JSON.stringify(_tasks),
                id: ledgerId
            })).then(data => data.payload)

            if (newLedger) {
                setOpenModal(false)
                localStorage.removeItem('ledger')
                localStorage.setItem('ledger', JSON.stringify(newLedger.data))
                toast.success(MESSAGE[lan].T_SUCC)
                setTimeout(() => pullTasks(), 1500)
            }
            setData({
                name: '',
                details: '',
                date: ''
            })
            setIsEdit(false)
        } catch (err) { console.error(err) }
    }

    const saveTaskOrder = async newOrder => {
        try {
            if (newOrder !== allTasks) {
                const newLedger = await dispatch(updateLedgerData({
                    tasks: JSON.stringify(newOrder),
                    id: ledgerId
                })).then(data => data.payload)

                if (newLedger) {
                    setOpenModal(false)
                    localStorage.removeItem('ledger')
                    localStorage.setItem('ledger', JSON.stringify(newLedger.data))
                    setTimeout(() => pullTasks(), 200)
                }
            }
        } catch (err) { console.error(err) }
    }

    const compareTasks = (a, b) => {
        if (a.name === b.name && a.details === b.details && a.date === b.date) return true
        else return false
    }

    const checkTask = async checked => {
        try {
            const newTask = {
                name: checked.name,
                details: checked.details,
                date: checked.date,
                hasTime: checked.hasTime || false,
                isChecked: !checked.isChecked
            }
            const _tasks = allTasks.map(task => {
                return compareTasks(task, checked) ? newTask : task
            })

            const newLedger = await dispatch(updateLedgerData({
                tasks: JSON.stringify(_tasks),
                id: ledgerId
            })).then(data => data.payload)

            if (newLedger) {
                setOpenModal(false)
                localStorage.removeItem('ledger')
                localStorage.setItem('ledger', JSON.stringify(newLedger.data))
                toast.success(`${checked.isChecked ? MESSAGE[lan].T_REAC : MESSAGE[lan].T_FIN}`)
                setTimeout(() => pullTasks(), 200)
            }

        } catch (err) { console.error(err) }
    }

    const handleRemove = async () => {
        try {
            const _tasks = allTasks.filter(t => !compareTasks(t, check))

            const newLedger = await dispatch(updateLedgerData({
                tasks: JSON.stringify(_tasks),
                id: ledgerId
            })).then(data => data.payload)

            if (newLedger) {
                setOpenModal(false)
                localStorage.removeItem('ledger')
                localStorage.setItem('ledger', JSON.stringify(newLedger.data))
                toast.success(MESSAGE[lan].T_DEL)
                setTimeout(() => pullTasks(), 200)
            }

        } catch (err) { console.error(err) }
    }

    const parseDate = (date, withTime) => {
        const taskDate = new Date(date)
        const now = new Date()
        const dayBeforeYest = new Date().setDate(now.getDate() - 3)
        const dayBefore = new Date().setDate(now.getDate() - 2)
        const yesterday = new Date().setDate(now.getDate() - 1)
        const tomorrow = new Date().setDate(now.getDate() + 1)
        const dayAfter = new Date().setDate(now.getDate() + 2)
        const afterDayAfter = new Date().setDate(now.getDate() + 3)
        const days = MESSAGE[lan].DAYS
        let parsed = `${withTime ? taskDate.toLocaleDateString() + ', ' + taskDate.toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' }) : taskDate.toLocaleDateString()}`
        let color = 'black'

        if (taskDate.getDay() === now.getDay() && taskDate.getDate() === now.getDate()) {
            color = 'green'
            parsed = `${withTime ? MESSAGE[lan].TODAY + ', ' + taskDate.toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' }) : 'Hoy'}`
        }
        else if (taskDate.getDay() === new Date(yesterday).getDay() && taskDate.getDate() === new Date(yesterday).getDate()) {
            color = 'red'
            parsed = 'Ayer'
            parsed = `${withTime ? MESSAGE[lan].YESTERDAY + ', ' + taskDate.toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' }) : 'Ayer'}`
        }
        else if (taskDate.getDay() === new Date(tomorrow).getDay() && taskDate.getDate() === new Date(tomorrow).getDate()) {
            color = 'green'
            parsed = `${withTime ? MESSAGE[lan].TOMORROW + ', ' + taskDate.toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' }) : 'Mañana'}`
        }
        else if ((taskDate.getDay() === new Date(dayAfter).getDay() && taskDate.getDate() === new Date(dayAfter).getDate()) ||
            (taskDate.getDay() === new Date(afterDayAfter).getDay() && taskDate.getDate() === new Date(afterDayAfter).getDate())
        ) {
            color = 'green'
            parsed = `${withTime ? days[taskDate.getDay()] + ', ' + taskDate.toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' }) : days[taskDate.getDay()]}`
        }
        else if ((taskDate.getDay() === new Date(dayBefore).getDay() && taskDate.getDate() === new Date(dayBefore).getDate()) ||
            (taskDate.getDay() === new Date(dayBeforeYest).getDay() && taskDate.getDate() === new Date(dayBeforeYest).getDate())
        ) {
            color = 'red'
            parsed = `${withTime ? days[taskDate.getDay()] + ', ' + taskDate.toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' }) : days[taskDate.getDay()]}`
        }
        else if (taskDate.getTime() < now.getTime()) {
            color = 'red'
        }
        return { parsed, color }
    }

    const reorder = (list, startIndex, endIndex) => {
        const result = Array.from(list)
        const [removed] = result.splice(startIndex, 1)
        result.splice(endIndex, 0, removed)
        return result
    }

    const onDragEnd = result => {
        if (!result.destination) return

        const items = reorder(
            allTasks,
            result.source.index,
            result.destination.index
        )
        saveTaskOrder(items)
        setAllTasks(items)
    }

    const getItemStyle = (isDragging, draggableStyle) => ({
        userSelect: "none",
        background: isDragging ? "white" : "",
        ...draggableStyle
    })

    return (
        <div className='tasks-container'>
            <ToastContainer autoClose={1000} />
            {openModal ?
                <div className='task-modal'>
                    <h3 style={{ color: APP_COLORS.GRAY }} className='task-modal-title'>{isEdit ? MESSAGE[lan].T_EDIT : MESSAGE[lan].T_NEW}</h3>
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
                        style={{ height: 'fit-content', textAlign: 'left', marginBottom: '2vw' }}
                        value={data.details}
                    />
                    <div className='task-schedule-btns'>
                        {!dateClicked &&
                            <CTAButton
                                handleClick={() => {
                                    setTimeClicked(false)
                                    setDateClicked(!dateClicked)
                                }}
                                label={data.date instanceof Date && isFinite(data.date) ? data.date.toLocaleDateString() : MESSAGE[lan].T_ADD_DATE}
                                color={APP_COLORS.SPACE}
                                className='task-date-btn'
                            />
                        }
                        {dateClicked &&
                            <DatePicker
                                selected={data.date instanceof Date && isFinite(data.date) ? data.date : new Date()}
                                onChange={date => {
                                    updateData('date', date)
                                    setTimeout(() => {
                                        setDateClicked(false)
                                        setTimeClicked(false)
                                    }, 200)
                                }}
                                dateFormat="dd/MM/YYY"
                                inline
                                locale='es'
                            />
                        }
                        {data.date instanceof Date && isFinite(data.date) && !timeClicked &&
                            <CTAButton
                                handleClick={() => {
                                    setDateClicked(false)
                                    setTimeClicked(!timeClicked)
                                }}
                                label={data.hasTime ? data.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : <img style={{ transform: 'scale(0.7)' }} className='svg-watch' src={WatchIcon} alt="Add Time Schedule" />}
                                color={APP_COLORS.SPACE}
                                className='time-picker-container'
                                btnClass={data.hasTime ? '' : 'time-picker-btn'}
                            />}
                        {data.date instanceof Date && isFinite(data.date) && timeClicked &&
                            <DatePicker
                                selected={data.date instanceof Date && isFinite(data.date) ? data.date : new Date()}
                                onChange={date => {
                                    setData({ ...data, date, hasTime: true })
                                    setTimeout(() => {
                                        setDateClicked(false)
                                        setTimeClicked(false)
                                    }, 200)
                                }}
                                dateFormat="h:mm aa"
                                inline
                                showTimeSelect
                                showTimeSelectOnly
                                locale='es'
                            />
                        }
                    </div>
                    <div className='task-modal-btns'>
                        <CTAButton
                            handleClick={() => {
                                setData({
                                    name: '',
                                    details: '',
                                    date: ''
                                })
                                setIsEdit(false)
                                setOpenModal(false)
                                setDateClicked(false)
                                setTimeClicked(false)
                            }}
                            label={MESSAGE[lan].CANCEL}
                            size='100%'
                            color={APP_COLORS.GRAY}
                        />
                        {isEdit ? <div onClick={() => handleRemove()}>
                            <img style={{ transform: 'scale(0.7)' }} className='svg-trash' src={TrashCan} alt="Trash Can" />
                        </div>
                            : ''}
                        <CTAButton
                            handleClick={() => handleSave()}
                            label={MESSAGE[lan].SAVE}
                            size='100%'
                            color={APP_COLORS.YELLOW}
                            style={{ color: 'black' }}
                        />
                    </div>
                </div>
                : ''
            }
            <div className='task-tabs'>
                <h4 onClick={() => setTab('unChecked')} className='task-tab-title' style={{ borderBottom: tab === 'unChecked' ? '2px solid #CCA43B' : '' }}>{MESSAGE[lan].T_UNF}</h4>
                <h4>|</h4>
                <h4 onClick={() => setTab('isChecked')} className='task-tab-title' style={{ borderBottom: tab === 'isChecked' ? '2px solid #CCA43B' : '' }}>{MESSAGE[lan].T_FIN}</h4>
            </div>
            {allTasks.length ?
                <div className='task-list' style={{ filter: openModal && 'blur(10px)' }}>
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="droppable">
                            {(provided, snapshot) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                >
                                    {allTasks.map((task, i) => ((task[tab] || (tab === 'unChecked' && !task.isChecked)) &&
                                        <Draggable key={i} draggableId={String(i)} index={i}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    style={getItemStyle(
                                                        snapshot.isDragging,
                                                        provided.draggableProps.style
                                                    )}>
                                                    <div
                                                        className={`${task.isChecked ? 'task-div-checked' : 'task-div'}`}
                                                        key={i}
                                                        style={{
                                                            borderBottom: '1px solid lightgray',
                                                        }}
                                                    >
                                                        <h4 className={`${task.isChecked ? 'task-check-checked' : 'task-check'}`} onClick={() => checkTask(task)}>✓</h4>
                                                        <h4
                                                            className='task-name'
                                                            onClick={() => {
                                                                setIsEdit(true)
                                                                setCheck(task)
                                                                setData({
                                                                    ...task,
                                                                    date: task.date ? new Date(task.date) : ''
                                                                })
                                                                setOpenModal(true)
                                                            }}>{task.name}</h4>
                                                        {task.date ? <h4
                                                            className='task-date'
                                                            style={{ color: parseDate(task.date, task.hasTime || false).color }}
                                                            onClick={() => {
                                                                setIsEdit(true)
                                                                setCheck(task)
                                                                setData({
                                                                    ...task,
                                                                    date: task.date ? new Date(task.date) : ''
                                                                })
                                                                setOpenModal(true)
                                                            }}>
                                                            {parseDate(task.date, task.hasTime || false).parsed}
                                                        </h4>
                                                            :
                                                            <img
                                                                style={{ transform: 'scale(0.3)' }}
                                                                className='task-date'
                                                                src={ScheduleIcon}
                                                                alt="Schedule"
                                                                onClick={() => {
                                                                    setIsEdit(true)
                                                                    setCheck(task)
                                                                    setData({
                                                                        ...task,
                                                                        date: task.date ? new Date(task.date) : ''
                                                                    })
                                                                    setDateClicked(true)
                                                                    setOpenModal(true)
                                                                }}
                                                            />
                                                        }
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>
                :
                <h4 className='task-no-tasks' style={{ filter: openModal && 'blur(10px)' }}>
                    {MESSAGE[lan].T_NONE} 🧐
                    <br />{MESSAGE[lan].T_TEXT} ➕
                </h4>
            }
            <CTAButton
                label='+'
                color={APP_COLORS.YELLOW}
                handleClick={() => {
                    setData({
                        date: '',
                        name: '',
                        details: ''
                    })
                    setOpenModal(true)
                    setDateClicked(false)
                }}
                style={{ color: 'black', borderRadius: '10vw', fontSize: '4vw' }}
                className='new-task-btn-container'
                btnClass='new-task-btn'
                disabled={openModal}
            />
        </div>
    )
}
