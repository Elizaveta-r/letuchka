import styles from "./PageLayout.module.scss";
import { Header } from "../../components/Header/Header";
import { BaseLayout } from "../BaseLayout/BaseLayout";
import { LeftMenu } from "../../components/LeftMenu/LeftMenu";
import { Outlet } from "react-router-dom";

export const PageLayout = ({ children }) => {
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
    </BaseLayout>
  );
};
