import React from 'react'
import { Doughnut } from 'react-chartjs-2'
import './styles.css'

export default function PieChart(props) {

    const {
        title,
        chartData,
        darkMode
    } = props

    const options = {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: tooltipItem => ` ${tooltipItem.label.replace(/%/g, '')} ${tooltipItem.formattedValue}%`
                }
            }
        }
    }

    const pieWidth = window.innerWidth - 200

    return (
        <div className='piechart-container'>
            <h4 className='table-title' style={{ color: darkMode ? 'lightgray' : '#263d42' }}>{title || ''}</h4>
            <Doughnut data={chartData} options={options} />
        </div>
    )
}