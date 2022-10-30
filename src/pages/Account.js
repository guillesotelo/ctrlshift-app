import React, { useState } from 'react'
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
import { toast, ToastContainer } from 'react-toastify'
import MoonLoader from "react-spinners/MoonLoader";

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


  const updateData = (key, newData) => {
    setIsEdit(true)
    setData({ ...data, [key]: newData })
  }

  const saveUserData = async () => {
    try {
      if(data.newEmail) {
        if(!data.newEmail.includes('@','.')) return toast.error(MESSAGE[lan].CHECK_DATA)
      }
      
      setLoading(true)
      const saved = await dispatch(updateUserData(data)).then(data => data.payload)

      if (saved) {
        localStorage.removeItem('user')
        localStorage.setItem('user', JSON.stringify(saved.data))
        setUser(saved.data)

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
    <div className='account-container'>
      <ToastContainer autoClose={2000} />
      <div className='account-info'>
        <img style={{ transform: 'scale(1.2)' }} className='svg-account' src={AccountIcon} alt="User Group" />
        <div style={{ borderLeft: '1px solid lightgray', height: '20vw' }}></div>
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
        <Dropdown.Toggle variant="secondary" id="cta-btn" className="text-left" style={{ width: '114%' }}>
          {toggleContents}
        </Dropdown.Toggle>

        <Dropdown.Menu>
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
            style={{ fontWeight: 'normal', fontSize: '4vw' }}
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
          style={{ marginTop: '6vw', fontSize: '4vw' }}
        />
      }

      {showEmailBox ?
        <div className='account-change-pass'>
          <InputField
            updateData={updateData}
            placeholder={MESSAGE[lan].EMAIL_PHR}
            name='newEmail'
            type='email'
            style={{ fontWeight: 'normal', fontSize: '4vw' }}
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
          style={{ marginTop: '6vw', fontSize: '4vw' }}
        />
      }

      {showPassBox ?
        <div className='account-change-pass'>
          <InputField
            updateData={updateData}
            placeholder={MESSAGE[lan].ACTUAL_PASS}
            name='currentPass'
            type='password'
            style={{ fontWeight: 'normal', fontSize: '4vw' }}
            autoComplete='new-password'
          />
          <InputField
            updateData={updateData}
            placeholder={MESSAGE[lan].NEW_PASS}
            name='password'
            type='password'
            style={{ fontWeight: 'normal', fontSize: '4vw' }}
            autoComplete='new-password'
          />
        </div>
        :
        <CTAButton
          label={MESSAGE[lan].CHANGE_PASS}
          handleClick={() => setShowPassBox(true)}
          size='55%'
          color={APP_COLORS.SPACE}
          style={{ marginTop: '6vw', fontSize: '4vw' }}
        />
      }

      {loading ? <MoonLoader color='#CCA43B' />
        : showPassBox || isEdit ?
          <>
            {(data.password && data.currentPass && (data.password !== data.currentPass)) 
              || (!showPassBox && isEdit) || data.newEmail || data.newName ?
              <CTAButton
                label={MESSAGE[lan].SAVE}
                handleClick={() => saveUserData()}
                size='55%'
                color={APP_COLORS.YELLOW}
                style={{ marginTop: '6vw', fontSize: '4vw', color: 'black' }}
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
              style={{ marginTop: '6vw', fontSize: '4vw' }}
            />
          </>
          : ''
      }
    </div>
  )
}
