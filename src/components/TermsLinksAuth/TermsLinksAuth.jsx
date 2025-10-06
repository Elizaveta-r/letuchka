import styles from "./TermsLinksAuth.module.scss";
import { Link } from "react-router-dom";

export const TermsLinksAuth = () => {
  return (
    <div className={styles.links}>
      <Link to={"/terms-of-use"}>Политика использования</Link>
      <div className={styles.line}></div>
      <Link to={"/privacy-policy"}>Политика конфиденциальности</Link>
    </div>
  );
};
