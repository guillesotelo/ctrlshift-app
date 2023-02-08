import React from 'react'
import { PolarArea } from 'react-chartjs-2'
import './styles.css'

export default function PolarChart(props) {

    const {
        title,
        chartData,
        darkMode
    } = props

    return (
        <div className='polarchart-container'>
            <h4 className='table-title' style={{ color: darkMode ? 'lightgray' : '#263d42' }}>{title || ''}</h4>
            <PolarArea data={chartData} />
        </div>
    )
}