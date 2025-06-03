import PrincipalCard from '../components/principal/PrincipalCard';
import PrincipalInfo from '../components/principal/PrincipalInfo';
import PrincipalMenu from '../components/principal/PrincipalMenu'
import "../styles/mainPages/Principal.scss";

export default function Principal() {
  return (
    <>
      <div className="principalContainer">
        <PrincipalMenu/>
        <PrincipalCard/>
        <PrincipalInfo/>
    </div>



</>
  )
}
