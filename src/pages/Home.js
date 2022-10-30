import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from 'react-router-dom'
import { ExportToCsv } from 'export-to-csv';
import DatePicker from 'react-datepicker'
import CTAButton from '../components/CTAButton'
import DropdownBTN from '../components/DropdownBTN'
import InputField from '../components/InputField'
import MovementsTable from '../components/MovementsTable'
import BarChart from '../components/BarChart'
import PieChart from '../components/PieChart'
import PolarChart from '../components/PolarChart'
import Calculator from '../components/Calculator'
import TrashCan from '../assets/trash-can.svg'
import CalculatorIcon from '../assets/calculator-icon2.svg'
import EyeClosed from '../assets/eye-closed.svg'
import { getMovements, saveMovement, editMovement, removeMovement } from '../store/reducers/movement'
import { updateLedgerData, getLedger } from '../store/reducers/ledger';
import { APP_COLORS, PALETTE } from '../constants/colors'
import { ToastContainer, toast } from 'react-toastify';
import "react-datepicker/dist/react-datepicker.css";
import 'react-toastify/dist/ReactToastify.css';
import SwitchBTN from '../components/SwitchBTN';
import { MESSAGE } from '../constants/messages'
import { getUserLanguage } from '../helpers';

export default function Home() {
  const [data, setData] = useState({ search: '' })
  const [user, setUser] = useState({})
  const [ledger, setLedger] = useState('')
  const [settings, setSettings] = useState('')
  const [arrData, setArrData] = useState([])
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
  const [calculator, setCalculator] = useState(false)
  const dispatch = useDispatch()
  const history = useHistory()
  const lan = getUserLanguage()
  const months = MESSAGE[lan].MONTHS

  useEffect(() => {
    const localUser = JSON.parse(localStorage.getItem('user'))
    const localLedger = JSON.parse(localStorage.getItem('ledger'))
    if (!localLedger || !localLedger.email) history.push('/ledger')

    if (!localUser || !localUser.email) history.push('/login')

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
      pay_type: payTypes[0],
      author: authors[0],
      amount: 0,
      detail: '',
      installments: 2,
      date: new Date(),
      category: categories[0],
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
  }, [data.salary, arrData.length])

  useEffect(() => {
    if (!data.search) renderCharts()
  }, [data, allCategories, allPayTypes, arrData])

  useEffect(() => {
    getAllMovements(data)
  }, [month])

  const randomColors = array => {
    return array.map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value)
  }

  const renderCharts = () => {
    const categoryPattern = allCategories.map(_ => randomColors(PALETTE)[0])
    const payTypePattern = allPayTypes.map(_ => randomColors(PALETTE)[0])
    const authorPattern = allUsers.map(_ => randomColors(PALETTE)[0])

    const localLedger = JSON.parse(localStorage.getItem('ledger'))
    const { salary, isMonthly } = JSON.parse(localLedger.settings)

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
      const movs = await dispatch(getMovements(newData)).then(d => d.payload)

      if (movs) {
        let filteredMovs = movs.data
        const localLedger = JSON.parse(localStorage.getItem('ledger'))
        const localSettings = JSON.parse(localLedger.settings)
        setSettings(localSettings)
        const { isMonthly } = localSettings
        if (isMonthly) setArrData(processMonthlyData(filteredMovs))
        else setArrData(filteredMovs)

        setLastData(movs.data[0] || {})
      }
    } catch (err) { console.error(err) }
  }

  const processMonthlyData = allData => {
    if (allData) {
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
    } catch (err) { console.error(err) }
  }

  const checkDataOk = dataToCheck => {
    const num = dataToCheck.amount
    if (isNaN(num) || num < 0 || num === 0) return false
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
      if (checkDataOk(data)) {
        let saved = {}
        const submitData = data
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

        setTimeout(() => getAllMovements(submitData), 250)

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
          user: user.email
        })
        setOpenModal(false)
        setIsEdit(false)
        setWithInstallments(false)
        setInstallments(2)
        setCheck(-1)

        setTimeout(() => renderCharts(), 500)
      }
      else toast.error(MESSAGE[lan].CHECK_FIELDS)
    } catch (err) { toast.error(MESSAGE[lan].SAVE_ERR) }
  }

  const handleCancel = () => {
    setIsEdit(false)
    setCheck(-1)
    setOpenModal(false)
    setWithInstallments(false)
    setInstallments(2)
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

  const updateData = (key, newData) => {
    if (key === 'search') {
      const filteredMovs = arrData.filter(mov =>
        mov.detail.toLowerCase().includes(newData.toLowerCase()) ||
        mov.pay_type.toLowerCase().includes(newData.toLowerCase()) ||
        mov.author.toLowerCase().includes(newData.toLowerCase()) ||
        mov.category.toLowerCase().includes(newData.toLowerCase())
      )
      if (newData) {
        setData({ ...data, [key]: newData })
        setArrData(filteredMovs)
      }
      else {
        const newData = {
          ...data,
          ledger: ledger.id || -1,
          user: ledger.email
        }
        setData({ ...data, [key]: '' })
        getAllMovements(newData)
      }
    }
    else setData({ ...data, [key]: newData })
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
    <div className='home-container'>
      <ToastContainer autoClose={2000} />
      {removeModal &&
        <div className='remove-modal'>
          <h3>{MESSAGE[lan].TO_DELETE}:<br /><br />{arrData[check].detail} <br /> ${arrData[check].amount}</h3>
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
      {openModal &&
        <div className='fill-section-container'>
          <h3 style={{ color: APP_COLORS.GRAY }}>{MESSAGE[lan].MOV_INFO}:</h3>
          <div className='fill-section'>
            <CTAButton
              handleClick={() => setDateClicked(!dateClicked)}
              label={data.date.toLocaleDateString()}
              size='100%'
              color={APP_COLORS.SPACE}
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
            <div className='fill-amount-row'>
              <InputField
                label=''
                updateData={updateData}
                placeholder={`${MESSAGE[lan].FIAT} -`}
                name='amount'
                type='number'
                value={data.amount || ''}
                size='100%'
                style={{ textAlign: 'center' }}
              />
              <img onClick={() => setCalculator(!calculator)} className='svg-calculator' src={CalculatorIcon} alt="Calculate" />
            </div>
            {calculator ?
              <Calculator
                updateData={updateData}
                value={data.amount || 0}
                setCalculator={setCalculator}
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
                />
                <DropdownBTN
                  options={allUsers}
                  label={MESSAGE[lan].AUTHOR}
                  name='author'
                  updateData={updateData}
                  value={data.author}
                />
                <DropdownBTN
                  options={allPayTypes}
                  label={MESSAGE[lan].PAY_TYPE}
                  name='pay_type'
                  updateData={updateData}
                  value={data.pay_type}
                />
                {!isEdit &&
                  <div className='installments-section' style={{ border: withInstallments ? '1px solid #CCA43B' : 'none' }}>
                    <SwitchBTN
                      sw={withInstallments}
                      onChangeSw={() => setWithInstallments(!withInstallments)}
                      label={MESSAGE[lan].INSTALLMENTS}
                      style={{ transform: 'scale(0.8)', margin: 0 }}
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
                <DropdownBTN
                  options={allCategories}
                  label={MESSAGE[lan].CATEGORY}
                  name='category'
                  updateData={updateData}
                  value={data.category}
                />
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
            color={APP_COLORS.GRAY}
            disabled={!isEdit}
            style={{ fontSize: '4vw' }}
          />
          {isEdit &&
            <div onClick={() => setRemoveModal(true)}>
              <img style={{ transform: 'scale(0.7)' }} className='svg-trash' src={TrashCan} alt="Trash Can" />
            </div>
          }
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

      <div className='salary-div' onClick={() => setViewSalary(!viewSalary)} style={{ filter: (openModal || removeModal) && 'blur(10px)' }}>
        <h4 className='salary-text'>{MESSAGE[lan].SALARY}:</h4>
        {
          viewSalary ? <h4 className='salary'>{MESSAGE[lan].FIAT} {salary.toLocaleString('us-US', { currency: 'ARS' })}</h4>
            : <img className='svg-eye' src={EyeClosed} alt="Show Salary" />
        }
      </div>

      {settings.isMonthly ?
        <div className='home-month-tab' style={{ filter: (openModal || removeModal) && 'blur(10px)' }}>
          <h4 className='month-before' onClick={() => {
            if (months[month - 1]) {
              setMonth(month - 1)
            } else {
              setMonth(11)
              setYear(year - 1)
            }
          }}>
            {months[month - 1] ? months[month - 1] : months[11]}
          </h4>
          <h4 className='actual-month'>{months[month]}</h4>
          <h4 className='month-after' onClick={() => {
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

      <div style={{ filter: (openModal || removeModal) && 'blur(10px)' }} className='table-div'>
        <MovementsTable
          tableData={arrData}
          tableTitle={`${MESSAGE[lan].MOVEMENTS} (${arrData.length})`}
          tableYear={year}
          setIsEdit={setIsEdit}
          isEdit={isEdit}
          setCheck={setCheck}
          check={check}
        />
        <div className='sub-table-btns'>
          <SwitchBTN
            sw={sw}
            onChangeSw={onChangeSw}
            label={MESSAGE[lan].MONTHLY}
          />
          <CTAButton
            handleClick={downloadCSV}
            label={`⇩ ${MESSAGE[lan].CSV_BTN}`}
            size='fit-content'
            color={APP_COLORS.SPACE}
            style={{ fontSize: '3.5vw', margin: '2vw', alignSelf: 'flex-end', cursor: 'pointer' }}
          />
        </div>
        <div className='search-container'>
          <InputField
            label=''
            updateData={updateData}
            placeholder={MESSAGE[lan].MOV_SEARCH}
            type='text'
            name='search'
            value={data.search || ''}
          />
          {data.search !== '' &&
            <h3
              className='search-erase-btn'
              onClick={() => {
                updateData('search', '')
                setData({ ...data, search: '' })
              }}>✖</h3>}
        </div>
        {
          arrData.length || data.search ? <div className='div-charts'>
            <div className='separator' style={{ width: '85%' }}></div>
            {Object.keys(budget).length > 1 && settings.isMonthly ?
              <>
                <BarChart chartData={budgetChart} title={MESSAGE[lan].CAT_REST} />
                <div className='separator' style={{ width: '85%' }}></div>
                <PieChart chartData={budgetChart2} title={`${MESSAGE[lan].CAT_BUD} %`} />
                <div className='separator' style={{ width: '85%' }}></div>
              </>
              : ''
            }
            {!settings.isMonthly ?
              <>
                <BarChart chartData={balanceChart} title={MESSAGE[lan].AN_BAL} />
                <div className='separator' style={{ width: '85%' }}></div>
              </>
              : ''
            }
            <BarChart chartData={categoryChart} title={MESSAGE[lan].CAT_EXP} />
            <div className='separator' style={{ width: '85%' }}></div>
            <PolarChart chartData={typeChart} title={MESSAGE[lan].PAY_TYPES} />
            <div className='separator' style={{ width: '85%' }}></div>
            <PolarChart chartData={authorChart} title={MESSAGE[lan].AUTHORS} />
          </div>
            : ''
        }
      </div>
    </div>
  )
}
