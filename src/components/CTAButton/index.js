import React from 'react'
import { SyncLoader } from 'react-spinners'
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
        loading,
        className,
        btnClass,
        svg
    } = props

    const buttonStyle = {
        ...style,
        backgroundColor: color || APP_COLORS.SPACE,
        opacity: disabled ? 0.25 : 1
    }

    return (
        <div className={className || 'cta-btn-container'} style={{ width: size }}>
            {loading ?
                <SyncLoader speedMultiplier={0.8} color={color || '#CCA43B'} />
                :
                svg ? <div className='cta-btn-svg-container'>
                    <img src={svg} className='cta-btn-svg' alt={`${label} image`} />
                    <button className={btnClass || 'cta-btn'} onClick={handleClick} style={buttonStyle} disabled={disabled}>
                        {label || ''}
                    </button>
                </div>
                    :
                    <button className={btnClass || 'cta-btn'} onClick={handleClick} style={buttonStyle} disabled={disabled}>
                        {label || ''}
                    </button>
            }
        </div>
    )
}
