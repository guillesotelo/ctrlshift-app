import React, { useEffect, useState } from 'react'
import { APP_COLORS } from '../../constants/colors'
import './styles.css'

export default function Dropdown(props) {
    const [openDrop, setOpenDrop] = useState(false)
    const [selected, setSelected] = useState(null)

    const {
        label,
        name,
        updateData,
        items,
        setItems,
        options,
        value,
        index,
        style,
        size,
        darkMode
    } = props

    useEffect(() => {
        window.addEventListener('mouseup', e => {
            if (e.target && e.target.className) {
                if (e.target.className !== 'dropdown-option') setOpenDrop(false)
            } else setOpenDrop(false)
        })
    }, [])

    return (
        <div className='dropdown-container' style={style}>
            {label ?
                <h4 className='dropdown-label' style={{ color: darkMode ? APP_COLORS.YELLOW : '' }}>
                    {label || ''}
                </h4> : ''}
            <div className='dropdown-select-section'>
                <div
                    className='dropdown-select'
                    style={{
                        border: openDrop && '1px solid #E4C69C',
                        width: size ? size : '',
                        backgroundColor: darkMode ? '#252525' : '',
                        color: darkMode ? 'lightgray' : 'black'
                    }}
                    onClick={() => setOpenDrop(!openDrop)}>
                    <h4 className='dropdown-selected' style={{ color: darkMode ? 'lightgray' : '' }}>
                        {value ? value : selected ? selected : 'Select'}
                    </h4>
                    < h4 className='dropdown-selected' style={{ color: darkMode ? 'lightgray' : '' }}>▾</h4>
                </div>
                {openDrop ?
                    <div
                        className='dropdown-options'
                        style={{
                            border: !darkMode && openDrop && '1px solid #E4C69C',
                            borderTop: 'none',
                            width: size ? size : ''
                        }}>
                        {options.map((option, i) =>
                            option && option !== '' &&
                            <h4
                                key={i}
                                className='dropdown-option'
                                style={{
                                    borderTop: i === 0 && 'none',
                                    backgroundColor: darkMode ? '#252525' : '',
                                    color: darkMode ? 'lightgray' : 'black'
                                }}
                                onClick={() => {
                                    updateData(name, option, index)
                                    setSelected(option)
                                    if (items && setItems) {
                                        let newItems = items
                                        newItems.push(option)
                                        setItems([...new Set(newItems)])
                                    }
                                    setOpenDrop(false)
                                }}>{option}</h4>
                        )}
                    </div>
                    : ''}
            </div>
        </div >
    )
}
