import React, { useState, useEffect } from 'react'
import MenuIcon from '../../assets/menu-icon.svg'
import LedgerIcon from '../../assets/ledger-icon.svg'
import Menu from '../Menu'
import { useHistory } from "react-router-dom";
import './styles.css'

export default function Header() {
  const [menuClass, setMenuClass] = useState('menu-hidden')
  const [darkMode, setDarkMode] = useState(false)
  const history = useHistory()
  const { name } = localStorage.getItem('ledger') ? JSON.parse(localStorage.getItem('ledger')) : {}

  useEffect(() => {
    const mode = localStorage.getItem('darkMode') ? JSON.parse(localStorage.getItem('darkMode')) : false
    setDarkMode(mode)
    window.addEventListener('mouseup', e => {
      if (e.target != document.querySelector('#menu-icon')) setMenuClass('menu-hidden')
    })
  }, [])

  const toggleMenu = () => {
    menuClass === 'menu-hidden' ? setMenuClass('menu-toggled') : setMenuClass('menu-hidden')
  }

  return (
    <>
      <div className={`header-container ${darkMode ? 'dark-mode-header' : ''}`}>
        <div onClick={() => history.push('/ledger')}>
          <img style={{ transform: 'scale(1.2)' }} className='svg-menu' src={LedgerIcon} alt="User Group" />
        </div>

        <div onClick={name ? () => history.push('/home') : () => { }}>
          <h4 className='user-group-title'>{name || ''}</h4>
        </div>

        <div className='header-menu' onClick={() => toggleMenu()}>
          <img id='menu-icon' className='svg-menu' src={MenuIcon} alt="Menu" />
        </div>
      </div>
      <Menu menuClass={menuClass} setMenuClass={setMenuClass} />
    </>
  )
}
