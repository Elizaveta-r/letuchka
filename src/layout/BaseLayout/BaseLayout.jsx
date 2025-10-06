import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { selectIsLoggedIn } from "../../store/slices/userSlice";
import styles from "./BaseLayout.module.scss";

export const BaseLayout = ({ children }) => {
  const isLoggedIn = useSelector(selectIsLoggedIn);

  if (!isLoggedIn) {
    return <Navigate to="/auth" replace />;
  }

  return <div className={styles.layout}>{children}</div>;
};
