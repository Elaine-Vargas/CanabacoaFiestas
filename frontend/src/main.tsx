import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/fonts.scss'
import './styles/theme.scss';


const App = React.lazy(() => import('./pages/App.tsx'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
