import React, { useContext, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import AccountIcon from '../assets/account-icon.svg'
import CTAButton from '../components/CTAButton'
import InputField from '../components/InputField'
import Dropdown from 'react-bootstrap/Dropdown'
import Flag from 'react-world-flags'
import { LANGUAGES } from '../constants/languages.js'
import { MESSAGE } from '../constants/messages'
import { APP_COLORS } from '../constants/colors'
import { changePassword, updateUserData } from '../store/reducers/user'
import { getUserLanguage } from '../helpers';
import { toast } from 'react-toastify'
import PuffLoader from "react-spinners/PuffLoader";
import { AppContext } from '../AppContext.jsx'

export default function Account() {
  const [showPassBox, setShowPassBox] = useState(false)
  const [showEmailBox, setShowEmailBox] = useState(false)
  const [showNameBox, setShowNameBox] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [lan, setLan] = useState(getUserLanguage())
  const [toggleContents, setToggleContents] = useState(<><Flag code={lan} height="16" />{MESSAGE[lan].SET_LAN}</>)
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')))
  const [data, setData] = useState(user)
  const ledger = JSON.parse(localStorage.getItem('ledger'))
  const dispatch = useDispatch()
  const history = useHistory()
  const { darkMode } = useContext(AppContext)

  const updateData = (key, newData) => {
    setIsEdit(true)
    setData({ ...data, [key]: newData })
  }

  const saveUserData = async () => {
    try {
      if (data.newEmail) {
        if (!data.newEmail.includes('@') || !data.newEmail.includes('.')) return toast.error(MESSAGE[lan].CHECK_FIELDS)
      }
      if (data.password) {
        if (data.password !== data.password2 || !data.password2) return toast.error(MESSAGE[lan].CHECK_FIELDS)
      }

      setLoading(true)
      const saved = await dispatch(updateUserData(data)).then(data => data.payload)

      if (saved) {
        setUser(saved)

        setLoading(false)
        toast.success(MESSAGE[lan].SAVE_SUCC)
      }
      else {
        setLoading(false)
        toast.error(MESSAGE[lan].SAVE_ERR)
      }
      setIsEdit(false)
      setShowPassBox(false)
      setShowEmailBox(false)
      setData({})
    } catch (err) { toast.error(MESSAGE[lan].SAVE_ERR) }
  }

  return (
    <div className={`account-container ${darkMode ? 'dark-mode' : ''}`}>
      <div className='account-info'>
        <img style={{ transform: 'scale(1.2)' }} className='svg-account' src={AccountIcon} alt="User Group" />
        <div className='account-separator' style={{ borderLeft: '1px solid lightgray', height: '20vw' }}></div>
        <div className='info-section'>
          <h3><b>{MESSAGE[lan].NAME}: </b>{user.username}</h3>
          <h3><b>Email: </b>{user.email}</h3>
          {ledger ? <h3><b>{MESSAGE[lan].LEDGER}: </b>{ledger.name}</h3>
            :
            <button onClick={() => history.push('/ledger')} className='login-register-link'>{MESSAGE[lan].CONN_LED}</button>
          }
        </div>
      </div>
      <Dropdown
        style={{ margin: '2vw 0' }}
        onSelect={selected => {
          const { code, title } = LANGUAGES.find(({ code }) => selected === code)
          setLan(selected)
          updateData('language', selected)
          setIsEdit(true)
          setToggleContents(<><Flag code={code} height="16" /> {title}</>)
        }}
      >
        <Dropdown.Toggle variant="secondary" id="dropdown-btn" className="text-left" style={{ width: '114%' }}>
          {toggleContents}
        </Dropdown.Toggle>

        <Dropdown.Menu style={{ gap: 20, padding: 25, width: 'fit-content', borderRadius: '1vw' }}>
          {LANGUAGES.map(({ code, title }) => (
            <Dropdown.Item key={code} eventKey={code}><Flag height="16" code={code} /> {title}</Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>

      {showNameBox ?
        <div className='account-change-pass'>
          <InputField
            updateData={updateData}
            placeholder={MESSAGE[lan].NAME}
            name='newName'
            type='text'
            autoComplete='new-password'
            value={data.newName || data.newName === '' ? data.newName : user.username}
          />
        </div>
        :
        <CTAButton
          label={MESSAGE[lan].CHANGE_NAME}
          handleClick={() => setShowNameBox(true)}
          size='55%'
          color={APP_COLORS.SPACE}
          disabled={loading}
        />
      }

      {showEmailBox ?
        <div className='account-change-pass'>
          <InputField
            updateData={updateData}
            placeholder={MESSAGE[lan].EMAIL_PHR}
            name='newEmail'
            type='email'
            autoComplete='new-password'
            value={data.newEmail || data.newEmail === '' ? data.newEmail : user.email}
          />
        </div>
        :
        <CTAButton
          label={MESSAGE[lan].CHANGE_EMAIL}
          handleClick={() => setShowEmailBox(true)}
          size='55%'
          color={APP_COLORS.SPACE}
          disabled={loading}
        />
      }

      {showPassBox ?
        <div className='account-change-pass'>
          <InputField
            updateData={updateData}
            placeholder={MESSAGE[lan].ACTUAL_PASS}
            name='currentPass'
            type='password'
            autoComplete='new-password'
          />
          <InputField
            updateData={updateData}
            placeholder={MESSAGE[lan].NEW_PASS}
            name='password'
            type='password'
            autoComplete='new-password'
          />
          <InputField
            updateData={updateData}
            placeholder={MESSAGE[lan].PASS2}
            name='password2'
            type='password'
            autoComplete='new-password'
          />
        </div>
        :
        <CTAButton
          label={MESSAGE[lan].CHANGE_PASS}
          handleClick={() => setShowPassBox(true)}
          size='55%'
          color={APP_COLORS.SPACE}
          disabled={loading}
        />
      }

      {loading ? <PuffLoader color='#CCA43B' />
        : showPassBox || isEdit ?
          <>
            {(data.password && data.currentPass && (data.password !== data.currentPass))
              || (!showPassBox && isEdit) || data.newEmail || data.newName ?
              <CTAButton
                label={MESSAGE[lan].SAVE}
                handleClick={() => saveUserData()}
                size='55%'
                color={APP_COLORS.YELLOW}
                style={{ color: 'black' }}
                disabled={loading}
              />
              : ''
            }
            <CTAButton
              label={MESSAGE[lan].CANCEL}
              handleClick={() => {
                const lang = getUserLanguage()
                setIsEdit(false)
                setShowNameBox(false)
                setShowPassBox(false)
                setShowEmailBox(false)
                setLan(lang)
                setToggleContents(<><Flag code={lang} height="16" />{MESSAGE[lang].SET_LAN}</>)
                setData({})
              }}
              size='55%'
              color={APP_COLORS.GRAY}
              disabled={loading}
            />
          </>
          : ''
      }
    </div>
  )
}
