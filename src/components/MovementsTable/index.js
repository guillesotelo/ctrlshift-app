import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { MESSAGE } from '../../constants/messages'
import { getUserLanguage } from '../../helpers';
import MoonLoader from "react-spinners/MoonLoader"
import './styles.css'

export default function MovementsTable(props) {
    const [maxItems, setMaxItems] = useState(10)
    const [startTime, setStartTime] = useState(new Date())
    const [loadingTime, setLoadingTime] = useState(0)

    const {
        tableData,
        tableTitle,
        tableYear,
        setIsEdit,
        isEdit,
        setCheck,
        check,
        darkMode,
        loading,
        name
    } = props
    const rowData = tableData && tableData.length ? tableData : []
    const lan = getUserLanguage()
    const headers = MESSAGE[lan].TABLE_HEADERS

    useEffect(() => {
        setStartTime(new Date())
        setLoadingTime(0)
    }, [loading])

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date()
            const miliSeconds = now.getTime() - startTime.getTime()
            const elapsedSeconds = Math.floor(miliSeconds / 1000)
            setLoadingTime(elapsedSeconds)
        }, 1000)

        return () => clearInterval(interval)
    }, [startTime])

    const handleCheck = key => {
        if (isEdit) {
            if (key !== check) setCheck(key)
            else {
                setCheck(-1)
                setIsEdit(!isEdit)
            }
        }
        else {
            setCheck(key)
            setIsEdit(!isEdit)
        }
    }

    const getCellColor = position => {
        if (position % 2 === 0) {
            if (darkMode) return '#353535'
            return '#eaeaea'
        } else {
            if (darkMode) return '#414141'
            return 'white'
        }
    }

    const loadingText = () => {
        return loadingTime > 3 ? <h4>
            {lan === 'es' ? 'Esto está tomando más tiempo de lo esperado...'
                : lan === 'se' ? 'Det här tar lite längre tid än väntat..' :
                    'This is taking a little longer than expected...'}
        </h4>
            : <h4>{`Loading ${name || 'table data'}...`}</h4>
    }

    const renderLoading = () => {
        return <div className='table-loading'>
            <MoonLoader color='#0057ad' size={50} />
            {loadingText()}
        </div>
    }

    return (
        <div className={`table-container ${darkMode ? 'dark-mode-table' : ''}`}>
            <div className={`table-titles ${darkMode ? 'dark-mode-titles' : ''}`}>
                <h4 className='table-title'>{tableTitle || ''}</h4>
                <h4 className='table-year'>{tableYear || ''}</h4>
            </div>
            <div className={`table-headers ${darkMode ? 'dark-mode-headers' : ''}`}>
                {
                    headers.map((header, i) => <h4 key={i} className='table-header'>{header}</h4>)
                }
            </div>
            {
                loading && !rowData.length ? renderLoading() :
                    rowData.length ?
                        <>
                            {rowData.map((row, i) => i < maxItems &&
                                <div
                                    key={i}
                                    className='table-row'
                                    onClick={() => handleCheck(i)}
                                    style={{
                                        backgroundColor: check === i ? darkMode ? '#95741e' : '#cea22f' : getCellColor(i),
                                        color: row.extraordinary === 'up' ? '#1aae00' : row.extraordinary === 'down' ? '#d80000' : darkMode ? '#e6e6e6' : 'black',
                                        animationDelay: `${((i || 1) + (maxItems > 10 ? 10 - maxItems : maxItems)) / 30}s`
                                    }}>
                                    <h4 className='table-row-item'>{new Date(row.date).toLocaleDateString()}</h4>
                                    <h4 className='table-row-item detail'>{row.detail || 'n/a'}</h4>
                                    <h4 className='table-row-item'>{row.author || 'n/a'}</h4>
                                    <h4 className='table-row-item'>{row.category || 'n/a'}</h4>
                                    <h4 className='table-row-item'>{row.pay_type || 'n/a'}</h4>
                                    <h4 className='table-row-item'>{lan !== 'se' ? `$ ${row.amount.replace('-', '')}` : `${row.amount.replace('-', '')} Kr` || 'n/a'}</h4>
                                </div>
                            )}
                            {maxItems < rowData.length &&
                                <button className={`table-lazy-btn  ${darkMode ? 'dark-mode-headers' : ''}`} onClick={() => setMaxItems(maxItems + 10)}>▼</button>
                            }
                        </>
                        :
                        <div className='table-row' style={{
                            backgroundColor: darkMode ? '#353535' : '#eaeaea',
                            height: '2.5vw',
                            justifyContent: 'center'
                        }}>
                            {MESSAGE[lan].NO_MOVEMENTS}
                        </div>
            }
        </div>
    )
}
