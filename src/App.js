import "./App.css";
import React from "react";
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
import { useSelector } from "react-redux";
// import NotFound from './pages/NotFound'

function App() {

  const hasMovs = useSelector(state => state.movement && state.movement.data) || null

  return (
    <Switch>
      <Route exact path="/">
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
        {hasMovs && <Footer />}
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
        <Footer />
      </Route>
      <Route path="/notes">
        <Header />
        <Notes />
      </Route>
      <Route path="/tasks">
        <Header />
        <Tasks />
      </Route>
    </Switch>
  )
}

export default App;
