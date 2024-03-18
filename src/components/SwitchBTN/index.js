import React, { useContext } from 'react'
import './styles.css'
import { AppContext } from '../../AppContext'

export default function SwitchBTN(props) {
    const { darkMode } = useContext(AppContext)

    const {
        label,
        on,
        off,
        value,
        setValue,
        style
    } = props

    return (
        <div
            className="switch__container"
            onClick={() => setValue(!value)}
            style={style}
        >
            {label ? <p className={`switch__label${darkMode ? '--dark' : ''}`}>{label}</p> : ''}
            <div
                className={`switch__row${darkMode ? '--dark' : ''}`}
                style={{
                    backgroundColor: value ? '#a4d8a4' : '',
                }}>
                <p className="switch__on">{on || 'ON'}</p>
                <p className={`switch__slider${value ? '--on' : '--off'}`} style={{ color: darkMode ? 'black' : '' }}></p>
                <p className="switch__off" style={{ color: darkMode ? 'lightgray' : '' }}>{off || 'OFF'}</p>
            </div>
        </div>
    )
}
