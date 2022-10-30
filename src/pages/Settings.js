import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer, toast } from 'react-toastify';
import { APP_COLORS } from '../constants/colors'
import CTAButton from '../components/CTAButton'
import InputField from '../components/InputField'
import { updateLedgerData } from '../store/reducers/ledger';
import { MESSAGE } from '../constants/messages'
import { getUserLanguage } from '../helpers';

export default function Settings() {
    const [data, setData] = useState({
        authors: [],
        payTypes: [],
        categories: [],
        salary: ''
    })
    const [newAuthor, setNewAuthor] = useState(false)
    const [newPayType, setNewPayType] = useState(false)
    const [newCategory, setNewCategory] = useState(false)
    const [newSalary, setNewSalary] = useState(false)
    const [budget, setBudget] = useState({ total: 100 })
    const [edited, setEdited] = useState(false)
    const dispatch = useDispatch()
    const lan = getUserLanguage()

    useEffect(() => {
        pullSettings()
    }, [])

    const updateData = (key, newData) => {
        if (key === 'newSalary') setNewSalary(true)
        setData({ ...data, [key]: newData })
    }

    const handleRemoveItem = (kind, index) => {
        setEdited(true)
        const newItems = data[kind]
        newItems.splice(index, 1)
        const newData = { ...data }
        newData[kind] = newItems
        setData(newData)

        setBudget({ ...budget, total: getNewTotalBudget() })
    }

    const pullSettings = () => {
        const { settings, id } = JSON.parse(localStorage.getItem('ledger'))
        const _settings = JSON.parse(settings)
        setData({
            ..._settings,
            id,
            newAuthor: '',
            newCategory: '',
            newPayType: '',
            newSalary: -1
        })
        if (_settings.budget) {
            const filteredBudget = {}
            _settings.categories.forEach(cat => {
                if (_settings.budget[cat]) filteredBudget[cat] = _settings.budget[cat]
                else filteredBudget[cat] = 0
            })
            filteredBudget.total = _settings.budget.total || 100

            setBudget({ ...filteredBudget, total: getNewTotalBudget(_settings.budget) })
        }
    }

    const handleSave = async () => {
        try {
            const filteredBudget = {}
            data.categories.forEach(cat => {
                if (budget[cat]) filteredBudget[cat] = budget[cat]
                else filteredBudget[cat] = 0
            })
            filteredBudget.total = budget.total || 100

            const newLedger = await dispatch(updateLedgerData({
                settings: JSON.stringify({ ...data, budget: filteredBudget }),
                id: data.id
            })).then(data => data.payload)

            if (newLedger) {
                localStorage.removeItem('ledger')
                localStorage.setItem('ledger', JSON.stringify(newLedger.data))
                toast.success(MESSAGE[lan].SAVE_SUCC)
                setTimeout(() => pullSettings(), 1500)
            }
            setEdited(false)
        } catch (err) { console.error(err) }
    }

    const updateBudget = (category, type) => {
        const newValue = Number(budget[category]) || 0

        if (type === '-' && newValue > 0 && budget.total < 100) {
            setEdited(true)
            setBudget({
                ...budget,
                [category]: newValue.toFixed(1) <= 1 ? Number((newValue - 0.1).toFixed(1)) : newValue - 1,
                total: newValue.toFixed(1) <= 1 ? Number((budget.total + 0.1).toFixed(1)) : budget.total + 1
            })
        }
        if (type === '+' && newValue < 100 && budget.total > 0) {
            setEdited(true)
            setBudget({
                ...budget,
                [category]: newValue.toFixed(1) < 1 ? Number((newValue + 0.1).toFixed(1)) : newValue + 1,
                total: newValue.toFixed(1) < 1 ? Number((budget.total).toFixed(1)) - 0.1 : budget.total - 1
            })
        }
    }

    const getNewTotalBudget = newBudget => {
        let sum = 0
        if (newBudget) {
            Object.keys(newBudget).forEach(category => {
                sum += category !== 'total' && newBudget[category]
            })
        } else {
            Object.keys(budget).forEach(category => {
                sum += category !== 'total' && budget[category]
            })
        }
        return 100 - sum
    }

    return (
        <div className='settings-container'>
            <ToastContainer autoClose={2000} />
            <h4 className='settings-title'>{MESSAGE[lan].SET_TITLE}</h4>

            <h4 className='settings-module-title' style={{ marginBottom: 0 }}>{MESSAGE[lan].SET_SALARY}</h4>
            <div className='settings-salary'>
                <InputField
                    label=''
                    updateData={updateData}
                    placeholder={`${MESSAGE[lan].SET_SALARY} -`}
                    name='newSalary'
                    type='text'
                    value={data.newSalary >= 0 ? data.newSalary : data.salary}
                    style={{ textAlign: 'center' }}
                />
            </div>

            {newSalary &&
                <CTAButton
                    handleClick={() => {
                        setData({ ...data, salary: data.newSalary })
                        setNewSalary(false)
                        setEdited(true)
                    }}
                    label={MESSAGE[lan].SET_UPDATE}
                    size='25%'
                    color={APP_COLORS.YELLOW}
                    style={{ color: 'black', marginTop: '3vw' }}
                />
            }

            <div className='separator' style={{ width: '85%' }}></div>

            <h4 className='settings-module-title'>{MESSAGE[lan].SET_CAT}</h4>
            <div className='div-settings-module'>
                {
                    data.categories.map((cat, i) =>
                        <div key={i} className='settings-list-item'>
                            <h4 className='settings-list-item-text'>{cat}</h4>
                            <h4 onClick={() => handleRemoveItem('categories', i)} className='settings-list-item-text'>X</h4>
                        </div>
                    )
                }
            </div>
            {newCategory ?
                <div className='settings-new-item'>
                    <InputField
                        label=''
                        updateData={updateData}
                        placeholder={MESSAGE[lan].SET_CATNAME}
                        name='newCategory'
                        type='text'
                        style={{ margin: '0 20vw' }}
                    />
                    <CTAButton
                        handleClick={() => {
                            if (data.newCategory && data.newCategory !== '') {
                                setData({
                                    ...data,
                                    categories: data.categories.concat(data.newCategory),
                                    newCategory: ''
                                })
                                setNewAuthor(false)
                                setNewPayType(false)
                                setNewCategory(false)
                                setEdited(true)
                            } else setNewCategory(false)
                        }}
                        label={MESSAGE[lan].SET_ADD}
                        size='25%'
                        color={APP_COLORS.YELLOW}
                        style={{ color: 'black', marginTop: '2vw' }}
                    />
                </div>
                :
                <CTAButton
                    handleClick={() => setNewCategory(true)}
                    label='+'
                    size='12%'
                    color={APP_COLORS.YELLOW}
                    style={{ color: 'black', fontWeight: 'bold', marginTop: '2vw' }}
                />
            }

            <div className='separator' style={{ width: '85%' }}></div>


            <h4 className='settings-module-title'>{MESSAGE[lan].SET_BUD}</h4>
            <div className='div-budget-module'>
                {
                    data.categories.map((cat, i) =>
                        <div key={i} className='settings-list-budget'>
                            <h4 className='settings-budget-item-text'>{cat}</h4>
                            <CTAButton
                                handleClick={() => updateBudget(cat, '-')}
                                label='-'
                                color={APP_COLORS.YELLOW}
                                style={{ color: 'black', fontWeight: 'bold', width: 'auto' }}
                                className='category-budget-setter'
                            />
                            <h4 className='settings-budget-item-percent'>{budget[cat] && budget[cat].toFixed(1) || 0}%</h4>
                            <h4 className='settings-budget-item-percent'>(${budget[cat] && (data.salary * budget[cat].toFixed(1) / 100).toFixed(0) || 0}))</h4>
                            <CTAButton
                                handleClick={() => updateBudget(cat, '+')}
                                label='+'
                                color={APP_COLORS.YELLOW}
                                style={{ color: 'black', fontWeight: 'bold', width: 'auto' }}
                                className='category-budget-setter'
                            />
                        </div>
                    )
                }
                <div className='settings-budget-rest' style={{ justifyContent: 'center' }}>
                    <h4 className='settings-budget-item-text'>{MESSAGE[lan].SET_RES}:</h4>
                    <h4 className='settings-budget-item-percent'>%{budget.total.toFixed(1)}</h4>
                    <h4 className='settings-budget-item-percent'>(${(data.salary * budget.total.toFixed(1) / 100).toFixed(0)})</h4>
                </div>
            </div>

            <div className='separator' style={{ width: '85%' }}></div>

            <h4 className='settings-module-title'>{MESSAGE[lan].SET_AU}</h4>
            <div className='div-settings-module'>
                {
                    data.authors.map((author, i) =>
                        <div key={i} className='settings-list-item'>
                            <h4 className='settings-list-item-text'>{author}</h4>
                            <h4 onClick={() => handleRemoveItem('authors', i)} className='settings-list-item-text'>X</h4>
                        </div>
                    )
                }
            </div>
            {newAuthor ?
                <div className='settings-new-item'>
                    <InputField
                        label=''
                        updateData={updateData}
                        placeholder={MESSAGE[lan].SET_CATNAME}
                        name='newAuthor'
                        type='text'
                        style={{ margin: '0 20vw' }}
                    />
                    <CTAButton
                        handleClick={() => {
                            if (data.newAuthor && data.newAuthor !== '') {
                                setData({
                                    ...data,
                                    authors: data.authors.concat(data.newAuthor),
                                    newAuthor: ''
                                })
                                setNewAuthor(false)
                                setNewPayType(false)
                                setNewCategory(false)
                                setEdited(true)
                            } else setNewAuthor(false)
                        }}
                        label={MESSAGE[lan].SET_ADD}
                        size='25%'
                        color={APP_COLORS.YELLOW}
                        style={{ color: 'black', marginTop: '2vw' }}
                    />
                </div>
                :
                <CTAButton
                    handleClick={() => setNewAuthor(true)}
                    label='+'
                    size='12%'
                    color={APP_COLORS.YELLOW}
                    style={{ color: 'black', fontWeight: 'bold', marginTop: '2vw' }}
                />
            }

            <div className='separator' style={{ width: '85%' }}></div>

            <h4 className='settings-module-title'>{MESSAGE[lan].SET_PAYTYPES}</h4>
            <div className='div-settings-module'>
                {
                    data.payTypes.map((pay, i) =>
                        <div key={i} className='settings-list-item'>
                            <h4 className='settings-list-item-text'>{pay}</h4>
                            <h4 onClick={() => handleRemoveItem('payTypes', i)} className='settings-list-item-text'>X</h4>
                        </div>
                    )
                }
            </div>
            {newPayType ?
                <div className='settings-new-item'>
                    <InputField
                        label=''
                        updateData={updateData}
                        placeholder={MESSAGE[lan].SET_CATNAME}
                        name='newPayType'
                        type='text'
                        style={{ margin: '0 20vw' }}
                    />
                    <CTAButton
                        handleClick={() => {
                            if (data.newPayType && data.newPayType !== '') {
                                setData({
                                    ...data,
                                    payTypes: data.payTypes.concat(data.newPayType),
                                    newPayType: ''
                                })
                                setNewAuthor(false)
                                setNewPayType(false)
                                setNewCategory(false)
                                setEdited(true)
                            } else setNewPayType(false)
                        }}
                        label={MESSAGE[lan].SET_ADD}
                        size='25%'
                        color={APP_COLORS.YELLOW}
                        style={{ color: 'black', marginTop: '2vw' }}
                    />
                </div>
                :
                <CTAButton
                    handleClick={() => setNewPayType(true)}
                    label='+'
                    size='12%'
                    color={APP_COLORS.YELLOW}
                    style={{ color: 'black', fontWeight: 'bold', marginTop: '2vw' }}
                />
            }

            {edited &&
                <div className='save-div'>
                    <div className='save-div-btns'>
                        <CTAButton
                            handleClick={() => {
                                pullSettings()
                                setEdited(false)
                            }}
                            label={MESSAGE[lan].DISCARD}
                            color='#8c8c8c'
                            size='fit-content'
                            disabled={!Object.keys(data).length}
                            style={{ marginTop: '8vw', color: 'black' }}
                        />
                        <CTAButton
                            handleClick={handleSave}
                            label={MESSAGE[lan].SET_SAVE}
                            color={APP_COLORS.YELLOW}
                            size='fit-content'
                            disabled={!Object.keys(data).length}
                            style={{ marginTop: '8vw', color: 'black' }}
                        />
                    </div>
                </div>
            }
        </div>
    )
}
