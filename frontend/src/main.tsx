import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#2f4550',
            color: '#e9edef',
            border: '1px solid #3b4a52',
          },
          success: {
            iconTheme: {
              primary: '#00a884',
              secondary: '#e9edef',
            },
          },
          error: {
            iconTheme: {
              primary: '#ff6b6b',
              secondary: '#e9edef',
            },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
)
