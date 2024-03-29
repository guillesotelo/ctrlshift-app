import React, { useContext, useEffect, useState } from 'react'
import { APP_COLORS } from '../../constants/colors'
import CTAButton from '../CTAButton'
import './styles.css'
import { AppContext } from '../../AppContext'

export default function Calculator(props) {

    const {
        value,
        updateData,
        setCalculator,
        style,
    } = props

    const [val, setVal] = useState(value)
    const [val2, setVal2] = useState(0)
    const [resetScreen, setResetScreen] = useState(false)
    const [math, setMath] = useState('')
    const [screenStyle, setScreenStyle] = useState({})
    const { darkMode } = useContext(AppContext)

    const symbols = ['+', '-', '×', '÷', '=']

    const handleClick = e => {
        const input = e.target.textContent

        if (symbols.includes(input)) {
            setScreenStyle({ color: '#272727' })
            setTimeout(() => setScreenStyle({}), 30)

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
        <div className='calculator-container' style={style}>
            <div className='calculator-frame' style={{
                backgroundColor: darkMode ? '#525252' : '',
                boxShadow: darkMode ? 'none' : ''
            }}>
                <h4 className='calculator-screen' style={{
                    ...screenStyle,
                    backgroundColor: darkMode ? '#272727' : '#d4d4d4'
                }}>{val}</h4>
                <div className='calculator-btns'>
                    <div className='calculator-row'>
                        <h4 onClick={handleClick} style={{
                            color: darkMode ? 'lightgray' : '',
                            backgroundColor: darkMode ? '#272727' : '',
                            boxShadow: darkMode ? 'none' : ''
                        }} className='calculator-btn'>7</h4>
                        <h4 onClick={handleClick} style={{
                            color: darkMode ? 'lightgray' : '',
                            backgroundColor: darkMode ? '#272727' : '',
                            boxShadow: darkMode ? 'none' : ''
                        }} className='calculator-btn'>8</h4>
                        <h4 onClick={handleClick} style={{
                            color: darkMode ? 'lightgray' : '',
                            backgroundColor: darkMode ? '#272727' : '',
                            boxShadow: darkMode ? 'none' : ''
                        }} className='calculator-btn'>9</h4>
                        <h4 onClick={handleClick} style={{
                            color: darkMode ? 'lightgray' : '',
                            backgroundColor: darkMode ? '#898246' : '',
                            boxShadow: darkMode ? 'none' : ''
                        }} className='calculator-btn diff-btn'>÷</h4>
                    </div>
                    <div className='calculator-row'>
                        <h4 onClick={handleClick} style={{
                            color: darkMode ? 'lightgray' : '',
                            backgroundColor: darkMode ? '#272727' : '',
                            boxShadow: darkMode ? 'none' : ''
                        }} className='calculator-btn'>4</h4>
                        <h4 onClick={handleClick} style={{
                            color: darkMode ? 'lightgray' : '',
                            backgroundColor: darkMode ? '#272727' : '',
                            boxShadow: darkMode ? 'none' : ''
                        }} className='calculator-btn'>5</h4>
                        <h4 onClick={handleClick} style={{
                            color: darkMode ? 'lightgray' : '',
                            backgroundColor: darkMode ? '#272727' : '',
                            boxShadow: darkMode ? 'none' : ''
                        }} className='calculator-btn'>6</h4>
                        <h4 onClick={handleClick} style={{
                            color: darkMode ? 'lightgray' : '',
                            backgroundColor: darkMode ? '#898246' : '',
                            boxShadow: darkMode ? 'none' : ''
                        }} className='calculator-btn diff-btn'>×</h4>
                    </div>
                    <div className='calculator-row'>
                        <h4 onClick={handleClick} style={{
                            color: darkMode ? 'lightgray' : '',
                            backgroundColor: darkMode ? '#272727' : '',
                            boxShadow: darkMode ? 'none' : ''
                        }} className='calculator-btn'>1</h4>
                        <h4 onClick={handleClick} style={{
                            color: darkMode ? 'lightgray' : '',
                            backgroundColor: darkMode ? '#272727' : '',
                            boxShadow: darkMode ? 'none' : ''
                        }} className='calculator-btn'>2</h4>
                        <h4 onClick={handleClick} style={{
                            color: darkMode ? 'lightgray' : '',
                            backgroundColor: darkMode ? '#272727' : '',
                            boxShadow: darkMode ? 'none' : ''
                        }} className='calculator-btn'>3</h4>
                        <h4 onClick={handleClick} style={{
                            color: darkMode ? 'lightgray' : '',
                            backgroundColor: darkMode ? '#898246' : '',
                            boxShadow: darkMode ? 'none' : ''
                        }} className='calculator-btn diff-btn'>-</h4>
                    </div>
                    <div className='calculator-row'>
                        <h4 onClick={handleClick} style={{
                            color: darkMode ? 'lightgray' : '',
                            backgroundColor: darkMode ? '#272727' : '',
                            boxShadow: darkMode ? 'none' : ''
                        }} className='calculator-btn'>0</h4>
                        <h4 onClick={handleClick} style={{
                            color: darkMode ? 'lightgray' : '',
                            backgroundColor: darkMode ? '#898246' : '',
                            boxShadow: darkMode ? 'none' : ''
                        }} className='calculator-btn diff-btn'>.</h4>
                        <h4 onClick={handleClick} style={{
                            color: darkMode ? 'lightgray' : '',
                            backgroundColor: '#b07f00',
                            boxShadow: darkMode ? 'none' : ''
                        }} className='calculator-btn diff-btn'>=</h4>
                        <h4 onClick={handleClick} style={{
                            color: darkMode ? 'lightgray' : '',
                            backgroundColor: darkMode ? '#898246' : '',
                            boxShadow: darkMode ? 'none' : ''
                        }} className='calculator-btn diff-btn'>+</h4>
                    </div>
                    <div className='calculator-row'>
                        <CTAButton
                            label='Cancel'
                            handleClick={() => {
                                setCalculator(false)
                            }}
                            color={APP_COLORS.GRAY}
                            size='50%'
                            style={{ width: '100%' }}
                        />
                        <CTAButton
                            label='Ok'
                            handleClick={() => {
                                setCalculator(false)
                                const newVal = val2 ? calculate(math) : val
                                updateData('amount', newVal % 1 !== 0 ? newVal.toFixed(2) : newVal)
                            }}
                            color={APP_COLORS.YELLOW}
                            size='50%'
                            style={{ color: 'black', width: '100%' }}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
