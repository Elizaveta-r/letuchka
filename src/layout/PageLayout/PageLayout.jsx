import styles from "./PageLayout.module.scss";
import { Header } from "../../components/Header/Header";
import { BaseLayout } from "../BaseLayout/BaseLayout";
import { LeftMenu } from "../../components/LeftMenu/LeftMenu";
import { Outlet, useLocation } from "react-router-dom";
import { Footer } from "../../components/Footer/Footer";

export const PageLayout = ({ children }) => {
  const location = useLocation();

  const pathname = location.pathname;

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
        <div
          className={`${styles.children} ${
            pathname === "/api-keys" ||
            pathname === "/billing" ||
            pathname === "/statistics" ||
            pathname === "/n8n/manage" ||
            pathname === "/n8n/marketplace" ||
            pathname === "/author" ||
            pathname === "/creator"
              ? styles.apiKeys
              : ""
          }`}
        >
          {children ? children : <Outlet />}
        </div>
      </div>
      {!isInStandaloneMode() && <Footer />}
    </BaseLayout>
  );
};
