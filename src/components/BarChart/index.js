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
        chartData
    } = props

    const options = {
        maintainAspectRatio: false,
        indexAxis: position ? 'y' : 'x',
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            x: {
                ticks: {
                    autoSkip: false
                }
            }
        }
    }


    return (
        <div className='barchart-container' style={{ width: barWidth, height: barHeight }}>
            <h4 className='table-title'>{title || ''}</h4>
            <img src={rotateIcon} className='chart-rotate-svg' onClick={() => setPosition(!position)} />
            <Bar data={chartData} height={barHeight} width={barWidth} options={options} />
        </div>
    )
}
