import "./App.css";
import React, { useEffect, useState } from "react";
import { Switch, Route } from "react-router-dom";
import SplashScreen from "./components/SplashScreen";
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Header from './components/Header'
import Ledger from './components/Ledger'
import Account from './pages/Account'
import Settings from './pages/Settings'
import Footer from "./components/Footer";
import Notes from "./pages/Notes";
import Tasks from "./pages/Tasks";
import ChangePass from "./pages/ChangePass";
import Report from "./pages/Report";
import { useSelector } from "react-redux";
import Landing from './pages/Landing'
import { AppProvider } from './AppContext';

function App() {
  const [darkMode, setDarkMode] = useState(false)
  const hasMovs = useSelector(state => state.movement && state.movement.data) || null
  const isMobile = window.screen.width <= 768

  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') ? JSON.parse(localStorage.getItem('darkMode')) : getSystemMode()
    const root = document.querySelector('#root')
    const body = document.querySelector('body')
    root.style.backgroundColor = isDarkMode ? '#1E1F21' : ''
    body.style.backgroundColor = isDarkMode ? '#1E1F21' : ''

    setDarkMode(isDarkMode)
  }, [])

  const getSystemMode = () => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches || false
  }

  return (
    <AppProvider darkMode={darkMode} setDarkMode={setDarkMode} isMobile={isMobile}>
      <Switch>
        <Route exact path="/">
          <Landing darkMode={darkMode} setDarkMode={setDarkMode} />
        </Route>
        <Route exact path="/splash">
          <SplashScreen />
        </Route>
        <Route path="/login">
          <Login />
        </Route>
        <Route path="/register">
          <Register />
        </Route>
        <Route path="/changePass">
          <ChangePass />
        </Route>
        <Route path="/home">
          <Header />
          <Home />
          {hasMovs && <Footer darkMode={darkMode} />}
        </Route>
        <Route path="/ledger">
          <Header />
          <Ledger />
        </Route>
        <Route path="/account">
          <Header />
          <Account />
        </Route>
        <Route path="/settings">
          <Header />
          <Settings />
          <Footer darkMode={darkMode} />
        </Route>
        <Route path="/notes">
          <Header />
          <Notes />
        </Route>
        <Route path="/tasks">
          <Header />
          <Tasks />
        </Route>
        <Route path="/reportIssue">
          <Header />
          <Report />
        </Route>
        <Route>
          <SplashScreen />
        </Route>
      </Switch>
    </AppProvider>
  )
}

export default App;
