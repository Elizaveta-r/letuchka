import styles from "./Logo.module.scss";

import Logotype from "../../assets/img/logo.png";
import { useNavigate } from "react-router-dom";

export default function Logo() {
  const navigate = useNavigate();

  const handleGoHome = () => navigate("/");

  return (
    <div className={styles.logo} onClick={handleGoHome}>
      {/* <div className={styles.imgContainer}>
        <img className={styles.img} src={Logotype} alt="Логотип 'Летучка'" />
      </div> */}
      {/* <p className={styles.text}>Летучка</p> */}
      <p className={styles.text}>На будущее</p>
    </div>
  );
}
