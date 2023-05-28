import React, { createContext } from 'react'

export const AppContext = createContext({})

export const AppProvider = ({ darkMode, setDarkMode, isMobile, children }) => (
    <AppContext.Provider value={{ darkMode, setDarkMode, isMobile }}>{children}</AppContext.Provider>
);
