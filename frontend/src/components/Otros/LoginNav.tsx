
import Back from '@mui/icons-material/ArrowBackRounded';
import { useLocalStorage } from 'react-haiku';

export default function LoginNav() {
  const [theme] = useLocalStorage('theme', '');

  // Define the color values you passed to ColorTheme
  const colorDark = 'black';
  const colorLight = 'white';

  const arrowColor = theme === 'light' ? colorDark : colorLight;

  return (
    <nav className="navbarLogin">
      <ul className="navListLogin">
        <li className="navItemLogin">
          <a href="/">
            <Back sx={{ color: arrowColor }} />
          </a>
        </li>
      </ul>
    </nav>
  );
}
