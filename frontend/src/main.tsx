import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

function Root() {
  useEffect(() => {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    const saved = localStorage.getItem('theme')
    const isDark = saved ? saved === 'dark' : prefersDark
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  return <App />
}

const container = document.getElementById('root')!
const root = createRoot(container)
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)


