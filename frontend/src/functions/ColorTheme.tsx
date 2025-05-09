import { usePrefersTheme } from 'react-haiku';
import { useEffect } from 'react';

const ColorTheme = () => {
    const theme = usePrefersTheme('dark');

    useEffect(() => {
        document.body.className = theme; 
    }, [theme]);
  
  return (
console.log(theme)
  )
}

export default ColorTheme
