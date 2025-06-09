import ColorTheme from "../../functions/ColorTheme";
import Back from '@mui/icons-material/ArrowBackRounded';
import { useLocalStorage } from 'react-haiku';
import { useNavigate, useLocation } from 'react-router-dom';

export default function LoginNav() {
  const [theme] = useLocalStorage('theme', '');
  const navigate = useNavigate();
  const location = useLocation();

  // Define the color values you passed to ColorTheme
  const colorDark = 'black';
  const colorLight = 'white';

  const arrowColor = theme === 'light' ? colorDark : colorLight;

  const handleBack = () => {
    if (location.pathname === '/Login') {
      navigate('/');
    }
    else {
      navigate('/Login');
    }
  };

  return (
    <nav className="navbarLogin">
      <ul className="navListLogin">
        <li className="navItemLogin">
          <a onClick={handleBack}>
            <Back sx={{ color: arrowColor }} />
          </a>
        </li>
        <li className="navColorTheme">
          <ColorTheme colorDark={colorDark} colorLight={colorLight} />
        </li>
      </ul>
    </nav>
  );
}
