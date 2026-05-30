import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App, { EmbedCard } from './App.jsx'

const embedMatch = window.location.pathname.match(/^\/embed\/deal\/([0-9a-f-]+)/i)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {embedMatch ? <EmbedCard dealId={embedMatch[1]} /> : <App />}
  </StrictMode>,
)
