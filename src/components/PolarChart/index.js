import React from 'react'
import { PolarArea } from 'react-chartjs-2'
import './styles.css'

export default function PolarChart(props) {

    const {
        title,
        chartData
    } = props

    return (
        <div className='polarchart-container'>
            <h4 className='table-title'>{title || ''}</h4>
            <PolarArea data={chartData}/>
        </div>
    )
}