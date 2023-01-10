import React, { useState } from 'react'
import { Bar } from 'react-chartjs-2'
import rotateIcon from '../../assets/rotate-icon.svg'
import './styles.css'

export default function BarChart(props) {
    const [position, setPosition] = useState(false)

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

    const isMobile = navigator.userAgentData && navigator.userAgentData.mobile

    const barHeight = isMobile ? 350 : 400
    const barWidth = isMobile ? window.outerWidth * 0.9 : 500

    return (
        <div className='barchart-container' style={{ width: barWidth, height: barHeight }}>
            <h4 className='table-title'>{title || ''}</h4>
            <img src={rotateIcon} className='chart-rotate-svg' onClick={() => setPosition(!position)} />
            <Bar data={chartData} height={barHeight} width={barWidth} options={options} />
        </div>
    )
}
