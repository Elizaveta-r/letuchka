import styles from "./PageLayout.module.scss";
import { Header } from "../../components/Header/Header";
import { BaseLayout } from "../BaseLayout/BaseLayout";
import { LeftMenu } from "../../components/LeftMenu/LeftMenu";
import { Outlet } from "react-router-dom";
import { useMediaQuery } from "react-responsive";

export const PageLayout = ({ children }) => {
  const isMobile = useMediaQuery({
    query: "(max-width: 1023px)",
  });
  return (
    <BaseLayout>
      <Header />
      <div
        className={styles.layout}
        style={{ paddingBottom: isMobile && "75px" }}
      >
        <div className={styles.leftMenu}>{!isMobile && <LeftMenu />}</div>
        <div className={`${styles.children} `}>
          {children ? children : <Outlet />}
        </div>
      </div>
    </BaseLayout>
  );
};
