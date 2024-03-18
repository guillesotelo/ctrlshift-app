import React, { useContext, useEffect, useRef } from 'react'
import { AppContext } from '../../AppContext'
import { APP_COLORS } from '../../constants/colors'
import './styles.css'

export default function InputField(props) {
    const { darkMode, isMobile } = useContext(AppContext)
    const inputRef = useRef(null)
    const dropRef = useRef(null)

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
    } = props

    useEffect(() => {
        if (inputRef.current && dropRef.current) {
            const bounding = inputRef.current.getBoundingClientRect()
            if (bounding) {
                dropRef.current.style.width = (bounding.width).toFixed(0) + 'px'
            }
        }
    }, [value, showDropDown])

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
        <div className='inputfield-container'>
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
                        ref={inputRef}
                    />
                    {showDropDown && !dropSelected && items && items.length ?
                        <div className={`drop-item-container ${darkMode ? 'dark-mode' : ''}`} ref={dropRef}>
                            {items.map((item, i) =>
                                <h5
                                    key={i}
                                    className={`drop-item ${darkMode ? 'dark-mode' : ''}`}
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
