import { useNavigate } from "react-router-dom";

import styles from "./Header.module.scss";
import { LogoutIcon } from "../../assets/icons/LogoutIcon";
import { Button } from "../../ui/Button/Button";
import { useDispatch, useSelector } from "react-redux";
import { useMediaQuery } from "react-responsive";
import { Headset, Menu, Settings } from "lucide-react";
import { useState } from "react";
import Logo from "../Logo/Logo";
import { revokeSession } from "../../utils/api/actions/sessions";
import { logout } from "../../store/slices/userSlice";

export const Header = () => {
  const isMobile = useMediaQuery({
    query: "(max-width: 1023px)",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userData = useSelector((state) => state?.user?.data);

  const sessionId = userData?.session?.id;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogOut = async () => {
    try {
      await dispatch(revokeSession(sessionId, setLoading));
    } catch (error) {
      console.warn("Сессия уже завершена или не найдена:", error);
    } finally {
      localStorage.clear();
      dispatch(logout());
      navigate("/auth", { replace: true });
    }
  };

  const handleSignIn = () => {
    navigate("/auth", { replace: true });
  };

  const handleGoHome = () => navigate("/");
  const handleGoToSettings = () => navigate("/settings");

  return (
    <div className={styles.header}>
      <div className={styles.logo} onClick={handleGoHome}>
        <Logo />
      </div>

      {isMenuOpen && (
        <div className={styles.menu}>
          <div onClick={() => setIsMenuOpen(false)}>
            <Menu />
          </div>
        </div>
      )}

      {isMobile ? (
        <div className={styles.block}>
          <div onClick={() => setIsMenuOpen(true)}>
            <Menu />
          </div>
        </div>
      ) : (
        <div className={styles.block}>
          <div className={styles.buttons}>
            <div className={styles.settings} onClick={handleGoToSettings}>
              <Settings size={24} strokeWidth={1.5} />
            </div>
          </div>

          <Button
            leftIcon={userData && <LogoutIcon size={15} fill={"#fff"} />}
            title={userData ? "Выйти" : "Войти"}
            className={styles.logoutButton}
            loading={loading}
            onClick={userData ? handleLogOut : handleSignIn}
          />
        </div>
      )}
    </div>
  );
};
