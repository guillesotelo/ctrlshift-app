import React, { useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { useSelector } from 'react-redux'
import CTAButton from '../CTAButton'
import { VERSION } from '../../constants/app'
import { MESSAGE } from '../../constants/messages'
import { getUserLanguage } from '../../helpers';
import AccountIcon from '../../assets/menu/account.svg'
import ExpensesIcon from '../../assets/menu/expenses.svg'
import SettingsIcon from '../../assets/menu/settings.svg'
import NotesIcon from '../../assets/menu/notes.svg'
import TasksIcon from '../../assets/menu/tasks.svg'
import ReportsIcon from '../../assets/menu/reports.svg'
import LogoutIcon from '../../assets/menu/logout.svg'

import './styles.css'

export default function Menu(props) {
  const { menuClass, setMenuClass } = props
  const history = useHistory()
  const lan = getUserLanguage()
  const { name } = localStorage.getItem('ledger') &&
    localStorage.getItem('ledger') !== null ? JSON.parse(localStorage.getItem('ledger')) : {}

  const handleLogOut = () => {
    setMenuClass('menu-hidden')
    localStorage.clear()
    history.push('/login')
  }

  const handleAccount = () => {
    history.push('/account')
    setMenuClass('menu-hidden')
  }

  return (
    <div className={`menu-container ${menuClass}`}>
      <div className='menu-items'>
        <div
          className='menu-item'
          onClick={handleAccount}
        >
          <img src={AccountIcon} className='menu-item-svg' alt={`${MESSAGE[lan].MY_ACCOUNT} image`} />
          <h4 className='menu-item-text'>{MESSAGE[lan].MY_ACCOUNT}</h4>
        </div>
        {
          name &&
          <>
            <div
              className='menu-item'
              onClick={() => {
                setMenuClass('menu-hidden')
                history.push('/home')
              }}
            >
              <img src={ExpensesIcon} className='menu-item-svg' alt={`${MESSAGE[lan].MOVEMENTS} image`} />
              <h4 className='menu-item-text'>{MESSAGE[lan].MOVEMENTS}</h4>
            </div>
            <div
              className='menu-item'
              onClick={() => {
                setMenuClass('menu-hidden')
                history.push('/settings')
              }}
            >
              <img src={SettingsIcon} className='menu-item-svg' alt={`${MESSAGE[lan].SETTINGS} image`} />
              <h4 className='menu-item-text'>{MESSAGE[lan].SETTINGS}</h4>
            </div>
            <div
              className='menu-item'
              onClick={() => {
                setMenuClass('menu-hidden')
                history.push('/notes')
              }}
            >
              <img src={NotesIcon} className='menu-item-svg' alt={`${MESSAGE[lan].NOTES} image`} />
              <h4 className='menu-item-text'>{MESSAGE[lan].NOTES}</h4>
            </div>
            <div
              className='menu-item'
              onClick={() => {
                setMenuClass('menu-hidden')
                history.push('/tasks')
              }}
            >
              <img src={TasksIcon} className='menu-item-svg' alt={`${MESSAGE[lan].TASKS} image`} />
              <h4 className='menu-item-text'>{MESSAGE[lan].TASKS}</h4>
            </div>
            <div style={{ borderBottom: '1px solid #CCA438', margin: '2vw 0' }}></div>
            <div
              className='menu-item'
              onClick={() => {
                setMenuClass('menu-hidden')
                history.push('/reportIssue')
              }}
            >
              <img src={ReportsIcon} className='menu-item-svg' alt={`${MESSAGE[lan].REPORT_ISSUE} image`} />
              <h4 className='menu-item-text'>{MESSAGE[lan].REPORT_ISSUE}</h4>
            </div>

          </>
        }
        <div
          className='menu-item'
          onClick={handleLogOut}
        >
          <img src={LogoutIcon} className='menu-item-svg' alt={`${MESSAGE[lan].LOGOUT} image`} />
          <h4 className='menu-item-text'>{MESSAGE[lan].LOGOUT}</h4>
        </div>
      </div>
      <h4 className='app-version'>{VERSION}</h4>
    </div >
  )
}
