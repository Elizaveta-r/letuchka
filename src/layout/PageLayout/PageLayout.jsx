import styles from "./PageLayout.module.scss";
import { Header } from "../../components/Header/Header";
import { BaseLayout } from "../BaseLayout/BaseLayout";
import { LeftMenu } from "../../components/LeftMenu/LeftMenu";
import { Outlet, useNavigate } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getEmployeesList } from "../../utils/api/actions/employees";
import { getDepartmentsList } from "../../utils/api/actions/departments";
import { getPositionsList } from "../../utils/api/actions/positions";
import { selectIsLoggedIn } from "../../store/slices/userSlice";
import AppTours from "../../tour/new/AppTours";

export const PageLayout = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isLoggedIn = useSelector(selectIsLoggedIn);

  const [startTour, setStartTour] = useState(false);

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
    const checkStartTour = () => {
      const value = sessionStorage.getItem("start_tour");
      if (value === "true") {
        setStartTour(true);
      }
    };

    // проверяем при монтировании
    checkStartTour();

    // слушаем, если изменилось в другом месте (например, после логина)
    window.addEventListener("storage", checkStartTour);

    return () => window.removeEventListener("storage", checkStartTour);
  }, [navigate]);

  useEffect(() => {
    const onAllFinished = () => setStartTour(false);

    // на всякий случай синхронизируемся с текущим значением в storage
    onAllFinished();

    window.addEventListener("tour:all:finished", onAllFinished);

    return () => {
      window.removeEventListener("tour:all:finished", onAllFinished);
    };
  }, []);

  useEffect(() => {
    const off = () => setStartTour(false);
    window.addEventListener("tour:all:finished", off);
    return () => window.removeEventListener("tour:all:finished", off);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      dispatch(getEmployeesList(1, 1000));
      dispatch(getDepartmentsList(1, 1000));
      dispatch(getPositionsList(1, 1000));
    }
  }, [dispatch, isLoggedIn]);

  const raw = localStorage.getItem("tours_state_v1");
  let allCompleted = false;
  try {
    const st = JSON.parse(raw || "null");
    allCompleted =
      !!st?.completed &&
      ["departments", "positions", "tasks", "employees"].every(
        (k) => st.completed[k]
      );
  } catch {
    //
  }

  return (
    <BaseLayout>
      <Header />
      <div
        className={styles.layout}
        style={{ paddingBottom: isMobile && "75px" }}
      >
        {startTour && !allCompleted && <AppTours />}
        <div className={styles.leftMenu}>{!isMobile && <LeftMenu />}</div>
        <div className={`${styles.children} `}>
          {children ? children : <Outlet />}
        </div>
      </div>
    </BaseLayout>
  );
};
