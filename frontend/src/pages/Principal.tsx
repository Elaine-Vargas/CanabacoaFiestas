import PrincipalCard from '../components/principal/PrincipalCard';
import PrincipalMenu from '../components/principal/PrincipalMenu'
import "../styles/principal.scss";

export default function Principal() {
  return (
<>
<div className="principalContainer">
<PrincipalMenu/>

      <PrincipalCard/>
     
    </div>



</>
  )
}
