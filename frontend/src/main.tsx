import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/fonts.scss'
import App from './pages/App.tsx'
import './styles/theme.scss';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
