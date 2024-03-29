import React, { useState } from 'react'
import { Bar } from 'react-chartjs-2'
import rotateIcon from '../../assets/rotate-icon.svg'
import './styles.css'

export default function BarChart(props) {
    const [position, setPosition] = useState(false)
    const isMobile = window.screen.width <= 768
    const barHeight = isMobile ? window.screen.height * 0.45 : 400
    const barWidth = isMobile ? window.screen.width * 0.9 : 500

    const {
        title,
        chartData,
        darkMode
    } = props

    const options = {
        maintainAspectRatio: false,
        indexAxis: position ? 'y' : 'x',
        plugins: {
            legend: {
                display: false,
                labels: {
                    color: darkMode ? 'lightgray' : 'black'
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    autoSkip: false,
                    color: darkMode ? 'lightgray' : 'black'
                }
            },
            y: {
                ticks: {
                    autoSkip: false,
                    color: darkMode ? 'lightgray' : 'black'
                }
            }
        }
    }


    return (
        <div className='barchart-container' style={{ width: barWidth, height: barHeight }}>
            <h4 className='table-title' style={{ color: darkMode ? 'lightgray' : '#263d42' }}>{title || ''}</h4>
            <img src={rotateIcon} className={`chart-rotate-svg ${darkMode ? 'dark-svg' : ''}`} onClick={() => setPosition(!position)} />
            <Bar data={chartData} height={barHeight} width={barWidth} options={options} />
        </div>
    )
}
