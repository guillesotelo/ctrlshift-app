import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Provider } from "react-redux"
import { BrowserRouter } from 'react-router-dom'
import store from './store'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ToastContainer } from 'react-toastify';

const mode = localStorage.getItem('darkMode') ? JSON.parse(localStorage.getItem('darkMode')) : false

ReactDOM.render(
  <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
    <Provider store={store}>
      <React.StrictMode>
        <BrowserRouter>
          <ToastContainer autoClose={2000} theme={mode ? 'dark' : 'light'} />
          <App />
        </BrowserRouter>
      </React.StrictMode>
    </Provider>
  </GoogleOAuthProvider>,
  document.getElementById('root')
);

reportWebVitals();
