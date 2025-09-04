import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

console.log('Main.jsx loading...')
console.log('Root element:', document.getElementById('root'))

try {
  const root = createRoot(document.getElementById('root'))
  console.log('React root created successfully')
  
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
  console.log('React app rendered successfully')
} catch (error) {
  console.error('Error rendering React app:', error)
}
