import React, { useContext, useEffect, useState, useMemo } from 'react'
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
import { getUserLanguage, sortArray } from '../helpers';
import { PuffLoader } from 'react-spinners';
import { AppContext } from '../AppContext';

export default function Home() {
  const localLedger = JSON.parse(localStorage.getItem('ledger') || '')
  const localArrData = JSON.parse(localStorage.getItem('localArrData') || '[]')
  const [data, setData] = useState({})
  const [user, setUser] = useState({})
  const [ledger, setLedger] = useState(localLedger)
  const [settings, setSettings] = useState(JSON.parse(localLedger.settings || '{}'))
  const [loading, setLoading] = useState(false)
  const [loadingBtn, setLoadingBtn] = useState(false)
  const [arrData, setArrData] = useState(localArrData)
  const [allMovs, setAllMovs] = useState([])
  const [monthlyMovs, setMonthtlyMovs] = useState([])
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
  const [lastData, setLastData] = useState(sortArray(localArrData, 'updatedAt', true)[0] || {})
  const [isEdit, setIsEdit] = useState(false)
  const [salary, setSalary] = useState(0)
  const [viewSalary, setViewSalary] = useState(false)
  const [budget, setBudget] = useState({})
  const [check, setCheck] = useState(-1)
  const [month, setMonth] = useState(localArrData[0] ? new Date(localArrData[0].date).getMonth() : new Date().getMonth())
  const [year, setYear] = useState(new Date().getFullYear())
  const [sw, setSw] = useState(false)
  const [extraordinary, setExtraordinary] = useState(false)
  const [extraType, setExtraType] = useState(false)
  const [calculator, setCalculator] = useState(false)
  const [negativeBalance, setNegativeBalance] = useState(0)
  const [closeAnimation, setCloseAnimation] = useState('')
  const [useLastDate, setUseLastDate] = useState(null)
  const dispatch = useDispatch()
  const history = useHistory()
  const lan = getUserLanguage()
  const months = MESSAGE[lan].MONTHS
  const { darkMode, isMobile } = useContext(AppContext)

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
      salary,
      useLastDate
    } = JSON.parse(localLedger.settings)
    if (isMonthly) setSw(isMonthly)

    setAllUsers(authors)
    setAllPayTypes(payTypes)
    setAllCategories(categories)
    setUseLastDate(useLastDate || false)

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
  }, [arrData])

  useEffect(() => {
    if (data.detail && allMovs && allMovs.length) {
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
  }, [data.detail])

  useEffect(() => {
    renderCharts()
  }, [allCategories, allPayTypes, arrData])

  useEffect(() => {
    toggleDatePickerColors()
  }, [dateClicked, darkMode])

  useEffect(() => {
    if (allCategories.length) {
      const localLedger = JSON.parse(localStorage.getItem('ledger'))
      const localSettings = JSON.parse(localLedger.settings)
      const { isMonthly } = localSettings
      const filteredMovs = isMonthly ? processMonthlyData(allMovs) : allMovs
      setArrData(filteredMovs)
      setLastData(sortArray(allMovs, 'updatedAt', true)[0] || {})
      setMonthtlyMovs(filteredMovs)
      localStorage.setItem('localArrData', JSON.stringify(filteredMovs))
    }
  }, [month])

  useEffect(() => {
    const html = document.querySelector('html')
    if (html) {
      if (openModal) html.classList.add('overflow-hidden')
      else html.classList.remove('overflow-hidden')
    }
  }, [openModal])

  useEffect(() => {
    updateLastDate()
  }, [lastData, useLastDate])

  const updateLastDate = () => {
    const lastDate = new Date(useLastDate ? lastData.date || new Date() : new Date())

    if (useLastDate !== null) {
      setMonth(lastDate.getMonth())
      updateLedgerSettings({ useLastDate })
    }

    if (lastData.category) {
      setData(prev => ({
        ...prev,
        author: lastData.author,
        pay_type: lastData.pay_type,
        category: lastData.category,
        date: lastDate
      }))
    }
  }

  useEffect(() => {
    if (data.detail && data.category) {
      const words = data.detail.toLowerCase().split(' ')
      let newCategory = null

      allCategories.forEach((cat, i) => {
        words.forEach(word => {
          if (word && cat.toLowerCase().includes(word)) {
            newCategory = allCategories[i]
          }
        })
      })

      if (newCategory) updateData('category', newCategory)
    }
  }, [data.detail])

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

  const getAllMovements = useMemo(() => {
    return async newData => {
      try {
        setLoading(true)
        const payload = await dispatch(getMovements(newData)).then(d => d.payload)
        const data = payload?.data || null

        if (data && Array.isArray(data)) {
          let allMovs = [...data]

          const { id } = JSON.parse(localStorage.getItem('ledger') || '{}')
          if (!id) return
          const ledger = await dispatch(getLedger(id)).then(d => d.payload)

          if (ledger) {
            localStorage.setItem('ledger', JSON.stringify(ledger))
            const _settings = JSON.parse(ledger.settings)

            setSettings(_settings)

            const { isMonthly } = settings
            const filteredMovs = isMonthly ? processMonthlyData(allMovs) : allMovs
            setArrData(filteredMovs)
            setMonthtlyMovs(filteredMovs)
            setAllMovs(allMovs)

            setLastData(sortArray(allMovs, 'updatedAt', true)[0] || {})
            const updatedNegativeBalance = getNegativeBalance(filteredMovs)
            setNegativeBalance(updatedNegativeBalance)
          }
        }
        setLoading(false)
      } catch (err) {
        console.error(err)
        setLoading(false)
      }
    }
  }, [arrData, allMovs])

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
    if (_settings.useLastDate) setUseLastDate(_settings.useLastDate)
  }

  const handleEdit = (dataIndex) => {
    const item = arrData[dataIndex]
    setCheck(dataIndex)
    setData({
      ...item,
      date: new Date(item.date)
    })
    if (item.extraordinary) {
      setExtraordinary(true)
      setExtraType(item.extraordinary === 'down' ? true : false)
    }
    setTimeout(() => setShowDropDown(false), 100)
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
      if (mov[type] === col) sum += parseFloat(mov.amount)
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
        const sameDate = sortArray(allMovs, 'date', true).filter(mov => {
          const movDate = new Date(mov.date)
          const currentDate = new Date(data.date)
          if (movDate.getDate() === currentDate.getDate() &&
            movDate.getMonth() === currentDate.getMonth() &&
            movDate.getFullYear() === currentDate.getFullYear()) {
            return mov
          }
        })

        const parsedDate = new Date(sameDate[0] ? sameDate[0].date : data.date)
        parsedDate.setMinutes(parsedDate.getMinutes() + 1)

        const submitData = {
          ...data,
          date: parsedDate,
          extraordinary: extraordinary ? extraType ? 'down' : 'up' : '',
          amount: extraordinary ? !extraType && !data.amount.includes('-') ? `-${data.amount}` : `${data.amount.replace('-', '')}` : data.amount
        }
        if (!submitData.detail) submitData.detail = '-'

        if (isEdit) {
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

        setTimeout(() => getAllMovements(submitData), 200)

        setData({
          ...data,
          amount: '',
          detail: '',
          installments: 2,
          date: new Date(useLastDate ? lastData.date || new Date() : new Date()),
          ledger: ledger.id,
          user: user.email,
          extraordinary: extraordinary ? extraType ? 'down' : 'up' : ''
        })
        setLastData(arrData[0] || {})
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
    const lastDate = new Date(useLastDate ? lastData.date || new Date() : new Date())
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
      date: lastDate,
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
    const filteredMovs = monthlyMovs.filter(mov => {
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
      setData({ ...data, 'search': '' })
      setArrData(monthlyMovs)
    }
  }

  const updateData = (key, value) => {
    if (key === 'search') triggerSearch(value)
    else {
      const newData = key === 'amount' ?
        value.toString().replace(/[^.0-9]/g, '').replace('..', '.')
        : value

      setData({ ...data, [key]: newData })
    }
  }

  const updateLedgerSettings = async (newSettings) => {
    try {
      const ledgerSettings = JSON.parse(ledger.settings)
      const newLedger = await dispatch(updateLedgerData({
        settings: JSON.stringify({ ...ledgerSettings, ...newSettings }),
        id: ledger.id
      })).then(data => data.payload)

      if (newLedger) {
        localStorage.removeItem('ledger')
        localStorage.setItem('ledger', JSON.stringify(newLedger.data))
        setTimeout(() => {
          pullSettings()
        }, 2000)
      }

      return newLedger
    } catch (err) {
      console.error(err)
    }
  }

  const onChangeSw = async () => {
    try {
      const newLedger = await updateLedgerSettings({ isMonthly: !sw })
      if (newLedger) {
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

  const renderTableAndGraphs = () => {
    return (
      <div style={{ filter: (openModal || removeModal) && 'blur(10px)' }} className='table-div'>
        <MovementsTable
          tableData={arrData}
          tableTitle={`${MESSAGE[lan].MOVEMENTS} (${arrData.length})`}
          tableYear={year}
          setIsEdit={setIsEdit}
          isEdit={isEdit}
          setCheck={handleEdit}
          check={check}
          darkMode={darkMode}
        />
        <div className='sub-table-btns'>
          <SwitchBTN
            on={MESSAGE[lan].YES}
            off={MESSAGE[lan].NO}
            value={sw}
            setValue={onChangeSw}
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
              style={{ transform: 'scale(.85)' }}
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
            disabled={loading}
          />
        </div>
        {!openModal && (arrData.length || data.search) ?
          <div className='div-charts'>
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
      </div>
    )
  }

  const renderLoading = () => {
    return (
      <div style={{ position: 'fixed', zIndex: 10, alignSelf: 'center', top: '45%' }}>
        <PuffLoader color='#CCA43B' size={100} />
      </div>
    )
  }

  const renderMonthSelector = () => {
    return (
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
    )
  }

  const renderBalance = () => {
    return (
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
      </div>
    )
  }

  const closeModal = () => {
    setCloseAnimation('close-animation')
    setTimeout(() => {
      handleCancel()
      setCloseAnimation('')
    }, 300)
  }

  const renderModal = () => {
    const renderModalDetails = () => {
      return (
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
              style={{ width: '45%' }}
              maxHeight='10rem'
            />
            <Dropdown
              options={allPayTypes}
              label={MESSAGE[lan].PAY_TYPE}
              name='pay_type'
              updateData={updateData}
              value={data.pay_type}
              darkMode={darkMode}
              style={{ width: '45%' }}
              maxHeight='10rem'
            />
          </div>
          <div className='fill-section-dd'>
            {!isEdit && !extraordinary &&
              <div className='installments-section' style={{ border: withInstallments ? '1px solid #CCA43B' : 'none' }}>
                <SwitchBTN
                  on={MESSAGE[lan].YES}
                  off={MESSAGE[lan].NO}
                  value={withInstallments}
                  setValue={setWithInstallments}
                  label={MESSAGE[lan].INSTALLMENTS}
                  style={{ marginLeft: withInstallments && '.5rem' }}
                />
                {withInstallments &&
                  <div className='installments-count'>
                    <CTAButton
                      handleClick={() => installments < 120 ? setInstallments(installments + 1) : {}}
                      label='+'
                      color={APP_COLORS.YELLOW}
                      style={{ color: 'black', fontWeight: 'bold', transform: 'scale(0.7)' }}
                      className='category-budget-setter'
                      disabled={loading}
                    />
                    <h4 style={{ alignSelf: 'center', margin: 0 }}>{installments}</h4>
                    <CTAButton
                      handleClick={() => installments > 2 ? setInstallments(installments - 1) : {}}
                      label='─'
                      color={APP_COLORS.YELLOW}
                      style={{ color: 'black', fontWeight: 'bold', transform: 'scale(0.7)' }}
                      className='category-budget-setter'
                      disabled={loading}
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
              style={{ width: '45%' }}
              maxHeight='10rem'
            />
          </div>
          <div className='div-modal-btns'>
            <CTAButton
              handleClick={closeModal}
              label={MESSAGE[lan].CANCEL}
              color={APP_COLORS.GRAY}
              style={{ width: '100%' }}
              size='50%'
              disabled={loading}
            />
            {isEdit ?
              <div onClick={() => setRemoveModal(true)}>
                <img style={{ transform: 'scale(0.7)' }} className='svg-trash' src={TrashCan} alt="Trash Can" />
              </div>
              : ''
            }
            <CTAButton
              handleClick={handleSave}
              label={MESSAGE[lan].SAVE}
              color={APP_COLORS.YELLOW}
              loading={loadingBtn}
              style={{ color: 'black', width: '100%' }}
              size='50%'
            />
          </div>
        </>
      )
    }

    return (
      <div className='modal-container' style={{ filter: removeModal && 'blur(10px)' }}>
        <div
          className={`fill-section-container ${closeAnimation}`}
          style={{
            backgroundColor: darkMode ? 'black' : '',
            boxShadow: darkMode ? '5px 5px 11px #1b1b1b' : '5px 5px 11px #9b9b9b'
          }}
          onClick={() => setShowDropDown(false)}>
          <h3 style={{ color: darkMode ? 'lightgray' : APP_COLORS.GRAY }}>{extraordinary ? MESSAGE[lan].EXTRA_INFO : MESSAGE[lan].MOV_INFO}:</h3>
          <div className='fill-section'>
            < div className='fill-datetime-row'>
              <CTAButton
                handleClick={() => setDateClicked(!dateClicked)}
                label={data.date.toLocaleDateString()}
                color={darkMode ? APP_COLORS.YELLOW : APP_COLORS.SPACE}
                style={{
                  color: darkMode ? 'black' : 'white',
                  width: '100%'
                }}
                disabled={loading}
                size='70%'
              />
              <SwitchBTN
                on={MESSAGE[lan].YES}
                off={MESSAGE[lan].NO}
                value={useLastDate}
                setValue={setUseLastDate}
                label={MESSAGE[lan].USE_LAST_DATE}
              />
            </div>
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
            <div className='fill-amount-row'>
              <InputField
                label=''
                updateData={updateData}
                placeholder={`${MESSAGE[lan].FIAT} -`}
                name='amount'
                value={data.amount}
                style={{
                  textAlign: 'center',
                  backgroundColor: '#fff8e8',
                  color: '#263d42',
                  fontWeight: 'bold',
                  width: '80%'
                }}
                size='100%'
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
                style={{ width: isMobile ? '100%' : '20rem' }}
              />
              :
              renderModalDetails()
            }
          </div>
        </div>
      </div>
    )
  }

  const renderRemoveModal = () => {
    return (
      <div className='remove-modal' style={{ backgroundColor: darkMode ? 'black' : '', boxShadow: darkMode ? 'none' : '' }}>
        <p>{MESSAGE[lan].TO_DELETE}:<br /><br /><strong>{arrData[check].detail}</strong> <br /> ${arrData[check].amount}</p>
        <div className='remove-btns'>
          <CTAButton
            label={MESSAGE[lan].CANCEL}
            color={APP_COLORS.GRAY}
            handleClick={() => setRemoveModal(false)}
            disabled={loading}
            style={{ width: '100%' }}
            size='100%'
          />
          <CTAButton
            label={MESSAGE[lan].CONFIRM}
            color={APP_COLORS.SPACE}
            handleClick={() => {
              setRemoveModal(false)
              closeModal()
              handleRemoveItem()
            }}
            loading={loading}
            style={{ width: '100%' }}
            size='100%'
          />
        </div>
      </div>
    )
  }

  return (
    <div className={`home-container ${darkMode ? 'dark-mode' : ''}`}>
      {removeModal ? renderRemoveModal() : ''}
      {!removeModal && openModal ? renderModal() : ''}
      {settings.isMonthly ? renderBalance() : <div style={{ height: '1.5rem' }}></div>}
      {settings.isMonthly ? renderMonthSelector() : ''}
      {/* {loading ? renderLoading() : ''} */}
      {renderTableAndGraphs()}
      {removeModal || openModal ? '' :
        <CTAButton
          label='+'
          color={APP_COLORS.YELLOW}
          handleClick={() => {
            setIsEdit(false)
            setOpenModal(!openModal)
          }}
          style={{ color: 'black', borderRadius: '10vw', fontSize: '4vw' }}
          className='new-task-btn-container'
          btnClass={`new-task-btn ${darkMode ? 'dark-mode-btn' : ''}`}
          disabled={openModal}
        />}
    </div>
  )
}
