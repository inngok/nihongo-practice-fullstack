import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'   
import RouteMap from './routes/RouteMap'
import './index.css'
import { AuthProvider } from './context/AuthContext'

import { SpeedInsights } from "@vercel/speed-insights/react"

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <RouteMap />
        <SpeedInsights />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
)
