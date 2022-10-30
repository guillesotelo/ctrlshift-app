import { configureStore } from "@reduxjs/toolkit"
import logger from 'redux-logger'
import movementReducer from "./reducers/movement"
import userReducer from "./reducers/user"
import ledgerReducer from "./reducers/ledger"

const logs = process.env.NODE_ENV !== 'development' ? logger : []

const store = configureStore({
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false
    }).concat(logs),
    devTools: process.env.NODE_ENV !== 'production',
    reducer: {
        user: userReducer,
        movement: movementReducer,
        ledger: ledgerReducer
    }
})

export default store