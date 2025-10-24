import styles from "./PageLayout.module.scss";
import { Header } from "../../components/Header/Header";
import { BaseLayout } from "../BaseLayout/BaseLayout";
import { LeftMenu } from "../../components/LeftMenu/LeftMenu";
import { Outlet, useNavigate } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getEmployeesList } from "../../utils/api/actions/employees";
import { getDepartmentsList } from "../../utils/api/actions/departments";
import { getPositionsList } from "../../utils/api/actions/positions";
import { selectIsLoggedIn } from "../../store/slices/userSlice";

export const PageLayout = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isLoggedIn = useSelector(selectIsLoggedIn);

  const isMobile = useMediaQuery({
    query: "(max-width: 1023px)",
  });

  useEffect(() => {
    const checkIntegrations = () => {
      const value = localStorage.getItem("hasIntegrations");
      if (value === "no") {
        navigate("/create-bot");
      }
    };

    // проверяем при монтировании
    checkIntegrations();

    // слушаем, если изменилось в другом месте (например, после логина)
    window.addEventListener("storage", checkIntegrations);

    return () => window.removeEventListener("storage", checkIntegrations);
  }, [navigate]);

  useEffect(() => {
    if (isLoggedIn) {
      dispatch(getEmployeesList(1, 1000));
      dispatch(getDepartmentsList(1, 1000));
      dispatch(getPositionsList(1, 1000));
    }
  }, [dispatch, isLoggedIn]);

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
