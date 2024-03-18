import React, { useContext, useEffect, useRef, useState } from 'react'
import { APP_COLORS } from '../../constants/colors'
import './styles.css'
import { AppContext } from '../../AppContext'

export default function Dropdown(props) {
    const [openDrop, setOpenDrop] = useState(false)
    const [selected, setSelected] = useState(null)
    const { isMobile } = useContext(AppContext)
    const dropRef = useRef(null)
    const optionsRef = useRef(null)

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
        darkMode,
        bg,
        setIsEdit
    } = props

    useEffect(() => {
        window.addEventListener('mouseup', e => {
            if (e.target && e.target.className) {
                if (e.target.className !== 'dropdown-option') setOpenDrop(false)
            } else setOpenDrop(false)
        })
    }, [])

    useEffect(() => {
        if (dropRef.current && optionsRef.current) {
            const bounding = dropRef.current.getBoundingClientRect()
            if (bounding) {
                optionsRef.current.style.marginTop = (bounding.height - 2).toFixed(0) + 'px'
                optionsRef.current.style.width = (bounding.width + (isMobile ? 0 : -2)).toFixed(0) + 'px'
            }
        }
    }, [openDrop])

    return (
        <div
            className='dropdown-container'
            style={{
                ...style,
                backgroundColor: darkMode ? 'black' : ''
            }}>
            {label ?
                <h4 className='dropdown-label' style={{
                    color: darkMode ? APP_COLORS.YELLOW : '',
                    backgroundColor: darkMode ? bg ? bg : 'black' : ''
                }}>
                    {label || ''}
                </h4> : ''}
            <div className='dropdown-select-section' ref={dropRef}>
                <div
                    className='dropdown-select'
                    style={{
                        border: openDrop && '1px solid #E4C69C',
                        width: size ? size : '',
                        backgroundColor: darkMode ? '#1E1F21' : '',
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
                        className={`dropdown-options ${darkMode ? 'dark-mode' : ''}`}
                        style={{
                            border: !darkMode && openDrop && '1px solid #E4C69C',
                            borderTop: 'none',
                            width: size ? size : ''
                        }}
                        ref={optionsRef}>
                        {options.map((option, i) =>
                            option && option !== '' &&
                            <h4
                                key={i}
                                className='dropdown-option'
                                style={{
                                    borderTop: i === 0 && 'none',
                                    backgroundColor: darkMode ? '#1E1F21' : '',
                                    color: darkMode ? 'lightgray' : 'black'
                                }}
                                onClick={() => {
                                    updateData(name, option, index)
                                    setSelected(option)
                                    if (setIsEdit) setIsEdit(true)
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
