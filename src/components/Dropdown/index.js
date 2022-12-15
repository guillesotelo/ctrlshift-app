import React, { useState } from 'react'
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
        size
    } = props

    return (
        <div className='dropdown-container' style={style}>
            {label ?
                <h4 className='dropdown-label'>
                    {label || ''}
                </h4> : ''}
            <div className='dropdown-select-section'>
                <div
                    className='dropdown-select'
                    style={{
                        border: openDrop && '1px solid #E4C69C',
                        width: size ? size : ''
                    }}
                    onClick={() => setOpenDrop(!openDrop)}>
                    <h4 className='dropdown-selected'>
                        {value ? value : selected ? selected : 'Select'}
                    </h4>
                    < h4 className='dropdown-selected'>▾</h4>
                </div>
                {openDrop ?
                    <div
                        className='dropdown-options'
                        style={{
                            border: openDrop && '1px solid #E4C69C',
                            borderTop: 'none',
                            width: size ? size : ''
                        }}>
                        {options.map((option, i) =>
                            option && option !== '' &&
                            <h4
                                key={i}
                                className='dropdown-option'
                                style={{ borderTop: i === 0 && 'none' }}
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
