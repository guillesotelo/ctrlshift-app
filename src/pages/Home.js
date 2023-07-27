import React, { useContext, useEffect, useState } from 'react'
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from 'react-router-dom'
import { ExportToCsv } from 'export-to-csv';
import DatePicker from 'react-datepicker'
import CTAButton from '../components/CTAButton'
import Dropdown from '../components/Dropdown'
import InputField from '../components/InputField'
import MovementsTable from '../components/MovementsTable'
import BarChart from '../components/BarChart'
import PieChart from '../components/PieChart'
import PolarChart from '../components/PolarChart'
import Calculator from '../components/Calculator'
import TrashCan from '../assets/trash-can.svg'
import ChangeIcon from '../assets/change-icon.svg'
import CalculatorIcon from '../assets/calculator-icon2.svg'
import EyeClosed from '../assets/eye-closed.svg'
import UpDownIcon from '../assets/up-down-icon.svg'
import { getMovements, saveMovement, editMovement, removeMovement } from '../store/reducers/movement'
import { updateLedgerData, getLedger } from '../store/reducers/ledger';
import { APP_COLORS, PALETTE2 } from '../constants/colors'
import { toast } from 'react-toastify';
import "react-datepicker/dist/react-datepicker.css";
import 'react-toastify/dist/ReactToastify.css';
import SwitchBTN from '../components/SwitchBTN';
import { MESSAGE } from '../constants/messages'
import { getUserLanguage } from '../helpers';
import { PuffLoader } from 'react-spinners';
import { AppContext } from '../AppContext';

export default function Home() {
  const [data, setData] = useState({})
  const [user, setUser] = useState({})
  const [ledger, setLedger] = useState('')
  const [settings, setSettings] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingBtn, setLoadingBtn] = useState(false)
  const [arrData, setArrData] = useState([])
  const [allMovs, setAllMovs] = useState([])
  const [dropSuggestions, setDropSuggestions] = useState([])
  const [showDropDown, setShowDropDown] = useState(false)
  const [dropSelected, setDropSelected] = useState(false)
  const [allUsers, setAllUsers] = useState([])
  const [allPayTypes, setAllPayTypes] = useState([])
  const [allCategories, setAllCategories] = useState([])
  const [withInstallments, setWithInstallments] = useState(false)
  const [installments, setInstallments] = useState(2)
  const [categoryChart, setCategoryChart] = useState({ labels: [], datasets: [] })
  const [balanceChart, setBalanceChart] = useState({ labels: [], datasets: [] })
  const [typeChart, setTypeChart] = useState({ labels: [], datasets: [] })
  const [authorChart, setAuthorChart] = useState({ labels: [], datasets: [] })
  const [budgetChart, setBudgetChart] = useState({ labels: [], datasets: [] })
  const [budgetChart2, setBudgetChart2] = useState({ labels: [], datasets: [] })
  const [openModal, setOpenModal] = useState(false)
  const [removeModal, setRemoveModal] = useState(false)
  const [dateClicked, setDateClicked] = useState(false)
  const [lastData, setLastData] = useState({})
  const [isEdit, setIsEdit] = useState(false)
  const [salary, setSalary] = useState(0)
  const [viewSalary, setViewSalary] = useState(false)
  const [budget, setBudget] = useState({})
  const [check, setCheck] = useState(-1)
  const [month, setMonth] = useState(new Date().getMonth())
  const [year, setYear] = useState(new Date().getFullYear())
  const [sw, setSw] = useState(false)
  const [extraordinary, setExtraordinary] = useState(false)
  const [extraType, setExtraType] = useState(false)
  const [calculator, setCalculator] = useState(false)
  const [negativeBalance, setNegativeBalance] = useState(0)
  const dispatch = useDispatch()
  const history = useHistory()
  const lan = getUserLanguage()
  const months = MESSAGE[lan].MONTHS
  const { darkMode, isMobile } = useContext(AppContext)

  // console.log('data', data)

  useEffect(() => {
    const localUser = JSON.parse(localStorage.getItem('user'))
    const localLedger = JSON.parse(localStorage.getItem('ledger'))

    if (!localUser || !localUser.token || !localUser.app || localUser.app !== 'ctrl-shift') {
      localStorage.clear()
      return history.push('/login')
    }

    if (localUser.login) {
      const login = new Date(localUser.login).getTime()
      const now = new Date().getTime()

      if (now - login > 2506000000) {
        localStorage.clear()
        return history.push('/login')
      }
    }

    if (!localLedger || !localLedger.email || !localLedger.settings) return history.push('/ledger')

    setUser(localUser)
    setLedger(localLedger)

    const {
      isMonthly,
      authors,
      categories,
      payTypes,
      salary
    } = JSON.parse(localLedger.settings)
    if (isMonthly) setSw(isMonthly)

    setAllUsers(authors)
    setAllPayTypes(payTypes)
    setAllCategories(categories)

    const newData = {
      ...data,
      category: categories[0],
      pay_type: payTypes[0],
      author: authors[0],
      amount: '',
      detail: '',
      installments: 2,
      date: new Date(),
      ledger: localLedger.id || -1,
      user: localUser.email,
      salary
    }

    setData(newData)
    getAllMovements(newData)
    pullSettings()
  }, [])

  useEffect(() => {
    const debited = data.salary - arrData.reduce((item, current) => item + Number(current.amount), 0)
    if (!isNaN(debited)) setSalary(debited)
  }, [data, arrData])

  useEffect(() => {
    if (data.detail) {
      const newSuggestions = allMovs.map(mov => {
        if (mov.detail !== data.detail && mov.detail.toLowerCase().includes(data.detail.toLowerCase())) {
          setShowDropDown(true)
          return mov.detail
        }
      }).filter(defined => defined)
      setDropSuggestions([...new Set(newSuggestions)])
    } else {
      setShowDropDown(false)
      setDropSelected(false)
    }

    renderCharts()
  }, [data, allCategories, allPayTypes, arrData])

  useEffect(() => {
    toggleDatePickerColors()
  }, [dateClicked])

  useEffect(() => {
    if (allCategories.length) getAllMovements(data)
  }, [month])

  const toggleDatePickerColors = () => {
    const body = document.querySelector('.react-datepicker')
    const header = document.querySelector('.react-datepicker__header')

    if (body) body.style.backgroundColor = darkMode ? 'gray' : ''
    if (header) header.style.backgroundColor = darkMode ? '#A1A1A1' : ''
  }

  const randomColors = array => {
    return array.map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value)
  }

  const renderCharts = () => {
    const categoryPattern = allCategories.map(_ => randomColors(PALETTE2)[0])
    const payTypePattern = allPayTypes.map(_ => randomColors(PALETTE2)[0])
    const authorPattern = allUsers.map(_ => randomColors(PALETTE2)[0])

    const localLedger = JSON.parse(localStorage.getItem('ledger'))
    const { salary, isMonthly } = JSON.parse(localLedger?.settings || '{}')

    const budgetArr = allCategories.map(cat => {
      const num = chartCalculator(arrData, cat, 'category')
      return (Number(budget[cat]).toFixed(1) * Number(salary) / 100) - num
    })

    if (isMonthly) setSw(isMonthly)

    const budgetPattern = budgetArr.map(item => item > 0 ? '#A5DF6A' : '#DF736A')
    const balancePattern = months.map(month => {
      if (balanceCalculator(arrData, month) > 0) return '#A5DF6A'
      else return '#DF736A'
    })

    setCategoryChart({
      labels: allCategories,
      datasets: [{
        data: allCategories.map(cat => chartCalculator(arrData, cat, 'category')),
        backgroundColor: categoryPattern
      }]
    })

    setBalanceChart({
      labels: months,
      datasets: [{
        data: months.map(month => balanceCalculator(arrData, month)),
        backgroundColor: balancePattern
      }]
    })

    setTypeChart({
      labels: allPayTypes,
      datasets: [{
        data: allPayTypes.map(type => chartCalculator(arrData, type, 'pay_type')),
        backgroundColor: payTypePattern
      }]
    })

    setAuthorChart({
      labels: allUsers,
      datasets: [{
        data: allUsers.map(author => chartCalculator(arrData, author, 'author')),
        backgroundColor: authorPattern
      }]
    })

    setBudgetChart({
      labels: allCategories,
      datasets: [{
        data: budgetArr,
        backgroundColor: budgetPattern
      }]
    })

    setBudgetChart2({
      labels: allCategories.map(c => c + ' %'),
      datasets: [{
        data: allCategories.map(cat => budget[cat]),
        backgroundColor: categoryPattern
      }]
    })
  }

  const getAllMovements = async newData => {
    try {
      if (!arrData.length) setLoading(true)
      const { data } = await dispatch(getMovements(newData)).then(d => d.payload)

      if (data && Array.isArray(data)) {
        let filteredMovs = [...data]
        const localLedger = JSON.parse(localStorage.getItem('ledger'))
        const localSettings = JSON.parse(localLedger.settings)

        setSettings(localSettings)

        const { isMonthly } = localSettings
        const _arrData = isMonthly ? processMonthlyData(filteredMovs) : filteredMovs
        setArrData(_arrData)
        setAllMovs(filteredMovs)

        setLastData(_arrData[0] || {})
        const updatedNegativeBalance = getNegativeBalance(_arrData)
        setNegativeBalance(updatedNegativeBalance)
      }
      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  const getNegativeBalance = data => {
    let total = 0
    data.forEach(mov => {
      if (mov.amount) total += Number(mov.amount)
    })
    return total
  }

  const processMonthlyData = allData => {
    if (allData && Array.isArray(allData)) {
      return allData.filter(item => {
        const itemDate = new Date(item.date)
        return month === itemDate.getMonth() && year === itemDate.getFullYear()
      })
    } else return []
  }

  const pullSettings = () => {
    const { settings } = JSON.parse(localStorage.getItem('ledger'))
    const _settings = JSON.parse(settings)
    if (_settings.budget) setBudget(_settings.budget)
  }

  const handleEdit = () => {
    if (isEdit) {
      const item = arrData[check]
      setData({
        ...item,
        date: new Date(item.date)
      })
      if (item.extraordinary) {
        setExtraordinary(true)
        setExtraType(item.extraordinary === 'down' ? true : false)
      }
    }
    setOpenModal(!openModal)
  }

  const handleRemoveItem = async () => {
    try {
      const removed = await dispatch(removeMovement(arrData[check])).then(d => d.payload)
      if (removed) {
        toast.info(MESSAGE[lan].MOV_DEL)
        setTimeout(() => getAllMovements(data), 1000)
      }
      else toast.error(MESSAGE[lan].MOV_ERR)
      setCheck(-1)
      setIsEdit(false)
    } catch (err) {
      console.error(err)
      toast.error(MESSAGE[lan].MOV_ERR)
    }
  }

  const checkDataOk = dataToCheck => {
    const num = dataToCheck.amount
    if (!num || isNaN(num) || num === 0) return false
    return true
  }

  const chartCalculator = (data, col, type) => {
    let sum = 0
    data.forEach(mov => {
      if (mov[type] === col) sum += parseInt(mov.amount)
    })
    return sum
  }

  const balanceCalculator = (data, period) => {
    let monthSalary = salary
    data.forEach(mov => {
      if (new Date(mov.date).getMonth() === months.indexOf(period)) {
        monthSalary -= mov.amount
      }
    })
    if (monthSalary === salary) return 0
    else return monthSalary
  }

  const saveInstallments = async (movData, i) => {
    try {
      let saved = {}
      const partial = (movData.amount / i).toFixed(2)

      for (let j = 1; j <= i; j++) {
        movData.installments = `${j}/${i}`
        movData.amount = partial
        const newDate = new Date(movData.date)
        if (j > 1) movData.date = newDate.setMonth(newDate.getMonth() + 1, 1)
        saved = await dispatch(saveMovement(movData)).then(d => d.payload)
      }
      return saved
    } catch (err) { console.error(Error) }
  }

  const handleSave = async () => {
    try {
      setLoadingBtn(true)
      if (checkDataOk(data)) {
        let saved = {}
        const submitData = {
          ...data,
          extraordinary: extraordinary ? extraType ? 'down' : 'up' : '',
          amount: extraordinary ? !extraType && !data.amount.includes('-') ? `-${data.amount}` : `${data.amount.replace('-', '')}` : data.amount
        }
        if (!submitData.detail) submitData.detail = '-'

        if (isEdit) {
          console.log('submitData', submitData)
          saved = await dispatch(editMovement(submitData)).then(d => d.payload)
        }
        else {
          if (withInstallments) {
            saved = await saveInstallments(submitData, installments)
          } else {
            saved = await dispatch(saveMovement(submitData)).then(d => d.payload)
          }
        }

        if (saved && saved.status === 200) toast.success(MESSAGE[lan].MOV_SAVED)
        else toast.error(MESSAGE[lan].SAVE_ERR)

        setTimeout(() => getAllMovements(submitData), 500)

        setData({
          ...data,
          pay_type: allPayTypes[0],
          category: allCategories[0],
          author: allUsers[0],
          amount: '',
          detail: '',
          installments: 2,
          date: new Date(),
          ledger: ledger.id,
          user: user.email,
          extraordinary: extraordinary ? extraType ? 'down' : 'up' : ''
        })
        setOpenModal(false)
        setIsEdit(false)
        setWithInstallments(false)
        setInstallments(2)
        setCheck(-1)

        setTimeout(() => {
          renderCharts()
          setExtraType(false)
          setExtraordinary(false)
        }, 500)
      } else toast.error(MESSAGE[lan].CHECK_FIELDS)
      setLoadingBtn(false)
    } catch (err) {
      toast.error(MESSAGE[lan].SAVE_ERR)
      setLoadingBtn(false)
    }
  }

  const handleCancel = () => {
    setIsEdit(false)
    setCheck(-1)
    setOpenModal(false)
    setWithInstallments(false)
    setInstallments(2)
    setExtraType(false)
    setExtraordinary(false)
    setData({
      ...data,
      amount: '',
      detail: '',
      installments: 2,
      pay_type: allPayTypes[0],
      category: allCategories[0],
      author: allUsers[0],
      date: new Date(),
    })
  }

  const downloadCSV = () => {
    if (arrData.length) {
      const csvData = arrData.map(mov => {
        const csvRow = {}

        csvRow[MESSAGE[lan].DATE] = (new Date(mov.date)).toLocaleDateString()
        csvRow[MESSAGE[lan].DETAIL] = mov.detail
        csvRow[MESSAGE[lan].AUTHOR] = mov.author
        csvRow[MESSAGE[lan].CATEGORY] = mov.category
        csvRow[MESSAGE[lan].PAY_TYPE] = mov.pay_type
        csvRow[MESSAGE[lan].INSTALLMENT] = mov.installments !== '2' ? mov.installments : '1/1'
        csvRow[MESSAGE[lan].AMOUNT] = mov.amount

        return csvRow
      })

      const options = {
        fieldSeparator: ',',
        quoteStrings: '"',
        decimalSeparator: '.',
        showLabels: true,
        showTitle: true,
        title: `${MESSAGE[lan].CSV_NAME} "${ledger.name}"`,
        useTextFile: false,
        useBom: true,
        useKeysAsHeaders: true,
        filename: `${MESSAGE[lan].CSV_TITLE} ${ledger.name}`
      }
      const csvExporter = new ExportToCsv(options);

      csvExporter.generateCsv(csvData);
    } else toast.info(MESSAGE[lan].CSV_NONE)
  }

  const triggerSearch = newData => {
    const searchWords = newData.split(' ')
    const filteredMovs = arrData.filter(mov => {
      const stringMov = JSON.stringify({
        detail: mov.detail,
        author: mov.author,
        category: mov.category,
        pay_type: mov.pay_type,
        amount: mov.amount
      })
      let matches = true
      searchWords.forEach(word => {
        if (!stringMov.toLowerCase().includes(word.toLowerCase())) matches = false
      })
      if (matches) return mov
    })
    if (newData) {
      setData({ ...data, 'search': newData })
      setArrData(filteredMovs)
    }
    else {
      const newData = {
        ...data,
        ledger: ledger.id || -1,
        user: ledger.email
      }
      setData({ ...data, 'search': '' })
      getAllMovements(newData)
    }
  }

  const updateData = (key, newData) => {
    if (key === 'search') triggerSearch(newData)
    else {
      setData({ ...data, [key]: key === 'amount' ? newData.toString().replace(/[^.0-9]/, '') : newData })
    }
  }

  const onChangeSw = async () => {
    try {
      const newSettings = JSON.parse(ledger.settings)

      const newLedger = await dispatch(updateLedgerData({
        settings: JSON.stringify({ ...newSettings, isMonthly: !sw }),
        id: ledger.id
      })).then(data => data.payload)

      if (newLedger) {
        localStorage.removeItem('ledger')
        localStorage.setItem('ledger', JSON.stringify(newLedger.data))
        toast.info(`${!sw ? MESSAGE[lan].SW_MON : MESSAGE[lan].SW_ALL}`)
        setTimeout(() => {
          pullSettings()
          history.go(0)
        }, 2000)
        setSw(!sw)
      }
    } catch (err) {
      console.error(err)
      toast.error(MESSAGE[lan].CONN_ERR)
    }
  }

  return (
    <div className={`home-container ${darkMode ? 'dark-mode' : ''}`}>
      {removeModal &&
        <div className='remove-modal' style={{ backgroundColor: darkMode ? 'black' : '', boxShadow: darkMode ? 'none' : '' }}>
          <h3>{MESSAGE[lan].TO_DELETE}:<br /><br />{arrData[check].detail} <br /> ${arrData[check].amount}</h3>
          <div className='remove-btns'>
            <CTAButton
              label={MESSAGE[lan].CANCEL}
              color={APP_COLORS.GRAY}
              handleClick={() => setRemoveModal(false)}
            // size='fit-content'
            />
            <CTAButton
              label={MESSAGE[lan].CONFIRM}
              color={APP_COLORS.SPACE}
              handleClick={() => {
                setRemoveModal(false)
                handleRemoveItem()
              }}
              loading={loading}
            // size='70%'
            />
          </div>
        </div>
      }
      {openModal &&
        <div className='fill-section-container' style={{
          backgroundColor: darkMode ? 'black' : '',
          boxShadow: darkMode ? '5px 5px 11px #1b1b1b' : '5px 5px 11px #9b9b9b'
        }} onClick={() => setShowDropDown(false)}>
          <h3 style={{ color: darkMode ? 'lightgray' : APP_COLORS.GRAY }}>{extraordinary ? MESSAGE[lan].EXTRA_INFO : MESSAGE[lan].MOV_INFO}:</h3>
          <div className='fill-section'>
            <CTAButton
              handleClick={() => setDateClicked(!dateClicked)}
              label={data.date.toLocaleDateString()}
              size='100%'
              color={darkMode ? APP_COLORS.YELLOW : APP_COLORS.SPACE}
              style={{ color: darkMode ? 'black' : 'white' }}
            />
            {dateClicked &&
              <DatePicker
                selected={data.date || ''}
                onChange={date => {
                  updateData('date', date)
                  setTimeout(() => setDateClicked(false), 200)
                }
                }
                dateFormat="dd/MM/YYY"
                inline
              />
            }
            < div className='fill-amount-row'>
              <InputField
                label=''
                updateData={updateData}
                placeholder={`${MESSAGE[lan].FIAT} -`}
                name='amount'
                type='text'
                value={data.amount || ''}
                // size='80%'
                style={{ textAlign: 'center', backgroundColor: '#fff8e8', color: '#263d42', fontWeight: 'bold' }}
              />
              <img
                onClick={() => setCalculator(!calculator)}
                className='svg-calculator'
                src={CalculatorIcon}
                alt="Calculate"
                style={{
                  filter: darkMode ?
                    'invert(65%) sepia(60%) saturate(455%) hue-rotate(6deg) brightness(90%) contrast(89%)'
                    : 'invert(18%) sepia(30%) saturate(612%) hue-rotate(143deg) brightness(95%) contrast(87%)'
                }}
              />
              {extraordinary ?
                <img
                  onClick={() => setExtraType(!extraType)}
                  className='svg-updown'
                  style={{
                    filter: extraType ? 'invert(13%) sepia(95%) saturate(5247%) hue-rotate(358deg) brightness(77%) contrast(116%)'
                      : 'invert(42%) sepia(100%) saturate(1403%) hue-rotate(82deg) brightness(105%) contrast(110%)',
                    transform: !extraType && 'rotate(180deg)'
                  }}
                  src={UpDownIcon}
                  alt="Up-Down"
                />
                : ''}
              <img
                style={{ opacity: extraordinary ? 1 : .5 }}
                className='svg-add'
                src={ChangeIcon}
                alt="Add Movement"
                onClick={() => {
                  setOpenModal(true)
                  setExtraordinary(!extraordinary)
                }}
              />
            </div>
            {calculator ?
              <Calculator
                updateData={updateData}
                value={data.amount || 0}
                setCalculator={setCalculator}
                darkMode={darkMode}
              />
              :
              <>
                <InputField
                  label=''
                  updateData={updateData}
                  placeholder={MESSAGE[lan].MOV_DETAIL}
                  name='detail'
                  type='text'
                  value={data.detail}
                  items={dropSuggestions}
                  setItems={setDropSuggestions}
                  showDropDown={showDropDown}
                  setShowDropDown={setShowDropDown}
                  dropSelected={dropSelected}
                  setDropSelected={setDropSelected}
                  style={{ width: '93%' }}
                />
                <div className='fill-section-dd'>
                  <Dropdown
                    options={allUsers}
                    label={MESSAGE[lan].AUTHOR}
                    name='author'
                    updateData={updateData}
                    value={data.author}
                    darkMode={darkMode}
                  />
                  <Dropdown
                    options={allPayTypes}
                    label={MESSAGE[lan].PAY_TYPE}
                    name='pay_type'
                    updateData={updateData}
                    value={data.pay_type}
                    darkMode={darkMode}
                  />
                  {!isEdit && !extraordinary &&
                    <div className='installments-section' style={{ border: withInstallments ? '1px solid #CCA43B' : 'none' }}>
                      <SwitchBTN
                        sw={withInstallments}
                        onChangeSw={() => setWithInstallments(!withInstallments)}
                        label={MESSAGE[lan].INSTALLMENTS}
                        style={{ margin: 0, transform: 'scale(.9)' }}
                      />
                      {withInstallments &&
                        <div className='installments-count'>
                          <CTAButton
                            handleClick={() => installments < 120 ? setInstallments(installments + 1) : {}}
                            label='+'
                            color={APP_COLORS.YELLOW}
                            style={{ color: 'black', fontWeight: 'bold', transform: 'scale(0.7)' }}
                            className='category-budget-setter'
                          />
                          <h4 style={{ alignSelf: 'center', margin: 0 }}>{installments}</h4>
                          <CTAButton
                            handleClick={() => installments > 2 ? setInstallments(installments - 1) : {}}
                            label='─'
                            color={APP_COLORS.YELLOW}
                            style={{ color: 'black', fontWeight: 'bold', transform: 'scale(0.7)' }}
                            className='category-budget-setter'
                          />
                        </div>
                      }
                    </div>
                  }
                  <Dropdown
                    options={allCategories}
                    label={MESSAGE[lan].CATEGORY}
                    name='category'
                    updateData={updateData}
                    value={data.category}
                    darkMode={darkMode}
                  />
                </div>
                <div className='div-modal-btns'>
                  <CTAButton
                    handleClick={handleCancel}
                    label={MESSAGE[lan].CANCEL}
                    size='100%'
                    color={APP_COLORS.GRAY}
                  />
                  <CTAButton
                    handleClick={handleSave}
                    label={MESSAGE[lan].SAVE}
                    size='100%'
                    color={APP_COLORS.YELLOW}
                    loading={loadingBtn}
                    style={{ color: '#263d42' }}
                  />
                </div>
              </>
            }
          </div>
        </div>
      }
      {
        <div className='main-section' style={{ filter: (openModal || removeModal) && 'blur(10px)' }}>
          <CTAButton
            handleClick={handleEdit}
            label={MESSAGE[lan].EDIT}
            size='80%'
            color={darkMode ? '#263d42' : APP_COLORS.GRAY}
            disabled={!isEdit}
            style={{ fontSize: '4vw' }}
          />
          {isEdit ?
            <div onClick={() => setRemoveModal(true)}>
              <img style={{ transform: 'scale(0.7)' }} className='svg-trash' src={TrashCan} alt="Trash Can" />
            </div>
            : ''}
          <CTAButton
            handleClick={() => {
              if (lastData.category) {
                setData({
                  ...data,
                  author: lastData.author,
                  pay_type: lastData.pay_type,
                  category: lastData.category
                })
              }
              setIsEdit(false)
              setOpenModal(!openModal)
            }}
            label={MESSAGE[lan].MOV_NEW}
            size='80%'
            color={APP_COLORS.YELLOW}
            style={{ color: 'black', fontSize: '4vw' }}
          />
        </div>
      }

      {settings.isMonthly ?
        <div className='salary-div' onClick={() => setViewSalary(!viewSalary)} style={{ filter: (openModal || removeModal) && 'blur(10px)' }}>
          <h4 className='salary-text'>{MESSAGE[lan].SALARY}:</h4>
          {
            viewSalary ?
              <div className=''>
                <h4 className='salary'>▴ {MESSAGE[lan].FIAT !== 'Kr' ? MESSAGE[lan].FIAT : ''} {salary.toLocaleString('us-US', { currency: 'ARS' })} {MESSAGE[lan].FIAT === 'Kr' ? 'Kr' : ''}</h4>
                <h4 className='negative-balance'>▾ {MESSAGE[lan].FIAT !== 'Kr' ? MESSAGE[lan].FIAT : ''} {negativeBalance.toLocaleString('us-US', { currency: 'ARS' })} {MESSAGE[lan].FIAT === 'Kr' ? 'Kr' : ''}</h4>
              </div>
              : <img className='svg-eye' src={EyeClosed} alt="Show Salary" />
          }
        </div> : <div style={{ height: '4vw' }}></div>
      }
      {/* {viewSalary && settings.isMonthly ? <div className='home-balance' onClick={() => setViewSalary(!viewSalary)}>
        <h4 className='negative-balance'>▾ {MESSAGE[lan].FIAT} {negativeBalance.toLocaleString('us-US', { currency: 'ARS' })}</h4>
      </div> : ''} */}

      {settings.isMonthly ?
        <div className={darkMode ? 'home-month-dark' : 'home-month-tab'} style={{ filter: (openModal || removeModal) && 'blur(10px)' }}>
          <h4 className={darkMode ? 'month-before-dark' : 'month-before'} onClick={() => {
            if (months[month - 1]) {
              setMonth(month - 1)
            } else {
              setMonth(11)
              setYear(year - 1)
            }
          }}>
            {months[month - 1] ? months[month - 1] : months[11]}
          </h4>
          <h4 className={darkMode ? 'actual-month-dark' : 'actual-month'}>{months[month]}</h4>
          <h4 className={darkMode ? 'month-after-dark' : 'month-after'} onClick={() => {
            if (months[month + 1]) {
              setMonth(month + 1)
            } else {
              setMonth(0)
              setYear(year + 1)
            }
          }}>
            {months[month + 1] ? months[month + 1] : months[0]}
          </h4>
        </div>
        : ''}

      {loading ?
        <div style={{ alignSelf: 'center', marginTop: '18vw', display: 'flex', height: '20vw' }}><PuffLoader color='#CCA43B' /></div>
        :
        <div style={{ filter: (openModal || removeModal) && 'blur(10px)' }} className='table-div'>
          <MovementsTable
            tableData={arrData}
            tableTitle={`${MESSAGE[lan].MOVEMENTS} (${arrData.length})`}
            tableYear={year}
            setIsEdit={setIsEdit}
            isEdit={isEdit}
            setCheck={setCheck}
            check={check}
            darkMode={darkMode}
          />
          <div className='sub-table-btns'>
            <SwitchBTN
              sw={sw}
              onChangeSw={onChangeSw}
              label={MESSAGE[lan].MONTHLY}
            />
            <div className='search-container'>
              <InputField
                label=''
                updateData={updateData}
                placeholder={MESSAGE[lan].MOV_SEARCH}
                type='text'
                name='search'
                value={data.search || ''}
              />
              {data.search && data.search !== '' &&
                <h3
                  className='search-erase-btn'
                  onClick={() => {
                    updateData('search', '')
                    renderCharts()
                  }}>✖</h3>}
            </div>
            <CTAButton
              handleClick={downloadCSV}
              label={`⇩ ${MESSAGE[lan].CSV_BTN}`}
              color={APP_COLORS.SPACE}
              className='csv-cta-btn'
              style={{ fontSize: '1vw', margin: '2vw', alignSelf: 'flex-end', cursor: 'pointer' }}
            />
          </div>
          {
            arrData.length || data.search ? <div className='div-charts'>
              {isMobile ? <div className='separator' style={{ width: '85%', borderColor: darkMode ? 'gray' : 'lightgray' }}></div> : ''}
              {Object.keys(budget).length > 1 && settings.isMonthly ?
                <>
                  <BarChart chartData={budgetChart} title={MESSAGE[lan].CAT_REST} darkMode={darkMode} />
                  {isMobile ? <div className='separator' style={{ width: '85%', borderColor: darkMode ? 'gray' : 'lightgray' }}></div> : ''}
                </>
                : ''}
              {settings.isMonthly ?
                <>
                  <BarChart chartData={categoryChart} title={MESSAGE[lan].CAT_EXP} darkMode={darkMode} />
                  {isMobile ? <div className='separator' style={{ width: '85%', borderColor: darkMode ? 'gray' : 'lightgray' }}></div> : ''}
                </> : ''}
              {budget.total && Number(budget.total) !== 100 ?
                <>
                  <PieChart chartData={budgetChart2} title={`${MESSAGE[lan].CAT_BUD} %`} darkMode={darkMode} />
                  {isMobile ? <div className='separator' style={{ width: '85%', borderColor: darkMode ? 'gray' : 'lightgray' }}></div> : ''}
                </> : ''}
              {!settings.isMonthly ?
                <>
                  <BarChart chartData={balanceChart} title={MESSAGE[lan].AN_BAL} darkMode={darkMode} />
                  {isMobile ? <div className='separator' style={{ width: '85%', borderColor: darkMode ? 'gray' : 'lightgray' }}></div> : ''}
                </> : ''}
              {settings.isMonthly ?
                <PolarChart chartData={typeChart} title={MESSAGE[lan].PAY_TYPES} darkMode={darkMode} />
                : ''}
              {isMobile && settings.isMonthly ? <div className='separator' style={{ width: '85%', borderColor: darkMode ? 'gray' : 'lightgray' }}></div> : ''}
              <PolarChart chartData={authorChart} title={MESSAGE[lan].AUTHORS} darkMode={darkMode} />
            </div> : ''}
        </div>}
    </div>
  )
}
