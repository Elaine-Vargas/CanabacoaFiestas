import { useEffect } from 'react';
import { usePrefersTheme, useLocalStorage } from 'react-haiku';
import DarkMode from '@mui/icons-material/Brightness4';
import LightMode from '@mui/icons-material/Brightness4Outlined';

const ColorTheme = ({ colorLight, colorDark }: { colorLight: string; colorDark: string }) => {
  const preferred = usePrefersTheme('light'); // Detecta el tema del sistema
  const [theme, setTheme] = useLocalStorage('theme', '');

  // Si no hay un tema guardado, usa el preferido por el sistema
  useEffect(() => {
    if (!theme) {
      setTheme(preferred);
      document.documentElement.setAttribute('data-theme', preferred);
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [preferred, theme, setTheme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  return (
    <button onClick={toggleTheme} title="Cambiar Tema" style={{ background: 'none', border: 'none', cursor: 'pointer', transition: 'transform 0.2s ease', transform: 'scale(1)' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
      {theme === 'light' ? <DarkMode sx={{color: colorDark}}/> : <LightMode sx={{color:colorLight}}/>}
    </button>
  );
};

export default ColorTheme;