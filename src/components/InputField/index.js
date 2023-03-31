import React from 'react'
import { APP_COLORS } from '../../constants/colors'
import './styles.css'

export default function InputField(props) {
    const darkMode = localStorage.getItem('darkMode') ? JSON.parse(localStorage.getItem('darkMode')) : false

    const {
        name,
        type,
        label,
        placeholder,
        style,
        updateData,
        autoComplete,
        items,
        showDropDown,
        setShowDropDown,
        dropSelected,
        setDropSelected,
        value,
        cols,
        rows,
        size
    } = props

    const handleChange = (newValue) => {
        const { valueAsNumber, value } = newValue.target
        if (type === 'number') {
            updateData(name, valueAsNumber)
        }
        else {
            updateData(name, value)
        }
    }

    return (
        <div className='inputfield-container' style={{ width: size }}>
            {label ? <h4 style={{ color: darkMode ? 'lightgray' : APP_COLORS.GRAY }} className='inputfield-label'>{label || ''}</h4> : ''}
            {type === 'textarea' ?
                <textarea
                    className='inputfield-textarea'
                    onChange={handleChange}
                    placeholder={placeholder || ''}
                    cols={cols || 2}
                    rows={rows || 4}
                    style={{
                        ...style,
                        backgroundColor: darkMode ? '#2B2B2B' : '',
                        color: darkMode ? 'lightgray' : '',
                        border: darkMode ? '1px solid gray' : ''
                    }}
                    value={value}
                />
                :
                <>
                    <input
                        className='inputfield-field'
                        autoComplete={autoComplete}
                        onChange={handleChange}
                        placeholder={placeholder || ''}
                        type={type || 'text'}
                        style={{
                            ...style,
                            backgroundColor: darkMode ? '#2B2B2B' : '',
                            color: darkMode ? 'lightgray' : '',
                            border: darkMode ? '1px solid gray' : ''
                        }}
                        value={value}
                    />
                    {showDropDown && !dropSelected && items && items.length ?
                        <div className={`drop-item-container ${darkMode ? 'dark-mode' : ''}`}>
                            {items.map((item, i) =>
                                <h5
                                    key={i}
                                    className={`drop-item ${darkMode ? 'dark-mode' : ''}`}
                                    style={{ borderBottom: i !== items.length - 1 && '1px solid #e7e7e7' }}
                                    onClick={() => {
                                        updateData(name, item)
                                        setShowDropDown(false)
                                        setDropSelected(true)
                                    }}>{item}</h5>
                            )}
                        </div>
                        : ''}
                </>
            }
        </div>
    )
}
