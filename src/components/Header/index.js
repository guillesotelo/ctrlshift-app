import React, { useState, useEffect, useContext } from 'react'
import LedgerIcon from '../../assets/ledger-icon.svg'
import Menu from '../Menu'
import { useHistory } from "react-router-dom";
import './styles.css'
import { AppContext } from '../../AppContext';
import Hamburger from 'hamburger-react'

export default function Header() {
  const [menuClass, setMenuClass] = useState('menu-hidden')
  const [menuOpen, setMenuOpen] = useState(false)
  const { darkMode } = useContext(AppContext)
  const history = useHistory()
  const { name } = localStorage.getItem('ledger') ? JSON.parse(localStorage.getItem('ledger')) : {}

  useEffect(() => {
    window.addEventListener('mouseup', e => {
      if (e.target != document.querySelector('.hamburger-react')) setMenuOpen(false)
    })
  }, [])

  useEffect(() => {
    setMenuClass(menuOpen ? 'menu-toggled' : 'menu-hidden')

    const html = document.querySelector('html')
    html.style.overflow = menuOpen ? 'hidden' : ''
  }, [menuOpen])

  return (
    <>
      <div className={`header-container ${darkMode ? 'dark-mode-header' : ''}`}>
        <div onClick={() => history.push('/ledger')}>
          <img style={{ transform: 'scale(1.2)' }} className='svg-menu' src={LedgerIcon} alt="User Group" />
        </div>

        <div onClick={name ? () => history.push('/home') : () => { }}>
          <h4 className='user-group-title'>{name || ''}</h4>
        </div>
        <Hamburger size={25} toggled={menuOpen} toggle={setMenuOpen} color='#CCA43B' easing="ease-in" rounded label="Show menu" />
      </div>
      <Menu menuClass={menuClass} setMenuClass={setMenuClass} />
    </>
  )
}
