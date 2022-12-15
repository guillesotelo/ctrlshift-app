import React from 'react'
import { APP_COLORS } from '../../constants/colors'
import './styles.css'

export default function InputField(props) {
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
        value,
        cols,
        rows
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
        <div className='inputfield-container'>
            {label ? <h4 style={{ color: APP_COLORS.GRAY }} className='inputfield-label'>{label || ''}</h4> : ''}
            {type === 'textarea' ?
                <textarea
                    className='inputfield-textarea'
                    onChange={handleChange}
                    placeholder={placeholder || ''}
                    cols={cols || 2}
                    rows={rows || 4}
                    style={style || null}
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
                        style={style || null}
                        value={value}
                    />
                    {showDropDown && items && items.length ?
                        <div className='drop-item-container'>
                            {items.map((item, i) =>
                                <h5
                                    key={i}
                                    className='drop-item'
                                    style={{ borderBottom: i !== items.length - 1 && '1px solid #e7e7e7' }}
                                    onClick={() => {
                                        updateData(name, item)
                                        setShowDropDown(false)
                                    }}>{item}</h5>
                            )}
                        </div>
                        : ''}
                </>
            }
        </div>
    )
}
