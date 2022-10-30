import React, { useEffect, useState } from 'react'
import { APP_COLORS } from '../../constants/colors'
import CTAButton from '../CTAButton'
import './styles.css'

export default function Calculator(props) {

    const {
        value,
        updateData,
        setCalculator
    } = props

    const [val, setVal] = useState(value)
    const [val2, setVal2] = useState(0)
    const [resetScreen, setResetScreen] = useState(false)
    const [math, setMath] = useState('')

    const symbols = ['+', '-', '×', '÷', '=']

    const handleClick = e => {
        const input = e.target.textContent

        if (symbols.includes(input)) {
            setResetScreen(true)

            if (!math) {
                setVal2(val)
                setMath(input)
            }
            else {
                const current = math
                setVal(calculate(current))
                setMath(input)
            }
        } else {
            if (resetScreen) {
                setVal2(val)
                setVal(input)
                setResetScreen(false)
            } else {
                const value = val ? val + input : input
                setVal(value)
            }
        }
    }

    const calculate = type => {
        if (type === '=') {
            setMath('')
            return val
        }
        if (type === '+') return Number(val2) + Number(val)
        if (type === '-') return Number(val2) - Number(val)
        if (type === '×') return Number(val2) * Number(val)
        if (type === '÷') return Number(val2) / Number(val)
    }

    return (
        <div className='calculator-container'>
            <div className='calculator-frame'>
                <h4 className='calculator-screen'>{val}</h4>
                <div className='calculator-btns'>
                    <div className='calculator-row'>
                        <h4 onClick={handleClick} className='calculator-btn'>7</h4>
                        <h4 onClick={handleClick} className='calculator-btn'>8</h4>
                        <h4 onClick={handleClick} className='calculator-btn'>9</h4>
                        <h4 onClick={handleClick} className='calculator-btn diff-btn'>÷</h4>
                    </div>
                    <div className='calculator-row'>
                        <h4 onClick={handleClick} className='calculator-btn'>4</h4>
                        <h4 onClick={handleClick} className='calculator-btn'>5</h4>
                        <h4 onClick={handleClick} className='calculator-btn'>6</h4>
                        <h4 onClick={handleClick} className='calculator-btn diff-btn'>×</h4>
                    </div>
                    <div className='calculator-row'>
                        <h4 onClick={handleClick} className='calculator-btn'>1</h4>
                        <h4 onClick={handleClick} className='calculator-btn'>2</h4>
                        <h4 onClick={handleClick} className='calculator-btn'>3</h4>
                        <h4 onClick={handleClick} className='calculator-btn diff-btn'>-</h4>
                    </div>
                    <div className='calculator-row'>
                        <h4 onClick={handleClick} className='calculator-btn'>0</h4>
                        <h4 onClick={handleClick} className='calculator-btn diff-btn'>.</h4>
                        <h4 onClick={handleClick} className='calculator-btn diff-btn' style={{ backgroundColor: '#d6c9a7' }}>=</h4>
                        <h4 onClick={handleClick} className='calculator-btn diff-btn'>+</h4>
                    </div>
                    <div className='calculator-row'>
                        <CTAButton
                            label='Cancel'
                            handleClick={() => {
                                setCalculator(false)
                            }}
                            color={APP_COLORS.GRAY}
                            size='100%'
                        />
                        <CTAButton
                            label='Ok'
                            handleClick={() => {
                                setCalculator(false)
                                const newVal = val2 ? calculate(math) : val
                                updateData('amount', newVal.toFixed(2))
                            }}
                            color={APP_COLORS.YELLOW}
                            size='100%'
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
