import styles from "./PageLayout.module.scss";
import { Header } from "../../components/Header/Header";
import { BaseLayout } from "../BaseLayout/BaseLayout";
import { LeftMenu } from "../../components/LeftMenu/LeftMenu";
import { Outlet } from "react-router-dom";
import { Footer } from "../../components/Footer/Footer";

export const PageLayout = ({ children }) => {
  function isInStandaloneMode() {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    );
  }

  return (
    <BaseLayout>
      <Header />
      <div className={styles.layout}>
        <div className={styles.leftMenu}>
          <LeftMenu />
        </div>
        <div className={`${styles.children} `}>
          {children ? children : <Outlet />}
        </div>
      </div>
      {!isInStandaloneMode() && <Footer />}
    </BaseLayout>
  );
};
