import React from 'react'
import { Bar } from 'react-chartjs-2'
import './styles.css'

export default function BarChart(props) {

    const {
        title,
        chartData
    } = props

    const options = {
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
    
    const barHeight = isMobile ? window.outerHeight * 0.4 : window.outerHeight * 0.7
    const barWidth = window.outerWidth * 0.85

    return (
        <div className='barchart-container'>
            <h4 className='table-title'>{title || ''}</h4>
            <Bar data={chartData} height={barHeight} width={barWidth} options={options}/>
        </div>
    )
}
