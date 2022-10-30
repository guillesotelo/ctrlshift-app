import React from 'react'
import { APP_COLORS } from '../../constants/colors'
import './styles.css'

export default function CTAButton(props) {
    const { 
        label, 
        color, 
        size, 
        style, 
        handleClick, 
        disabled,
        className,
        btnClass
    } = props

    const buttonStyle = {
        ...style,
        padding: '3vw',
        width: size || 'auto',
        backgroundColor: color || APP_COLORS.SPACE,
        opacity: disabled ? 0.25 : 1
    }

    return (
        <div className={className || 'cta-btn-container'}>
            <button className={btnClass || 'cta-btn'} onClick={handleClick} style={buttonStyle} disabled={disabled || false}>
                {label || ''}
            </button>
        </div>
    )
}
