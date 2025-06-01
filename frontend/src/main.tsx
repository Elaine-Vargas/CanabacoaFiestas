import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/font-faces/Fonts.scss'
import './styles/basics/Theme.scss';
import { UserProvider } from './contexts/UserContext.tsx';

const App = React.lazy(() => import('./pages/App.tsx'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </StrictMode>,
)
