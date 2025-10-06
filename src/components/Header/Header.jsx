import { useNavigate } from "react-router-dom";

import styles from "./Header.module.scss";
import { LogoutIcon } from "../../assets/icons/LogoutIcon";
import { Button } from "../../ui/Button/Button";
import { useSelector } from "react-redux";
import { useMediaQuery } from "react-responsive";
import { Headset, Menu, Settings } from "lucide-react";
import { useState } from "react";
import Logo from "../Logo/Logo";

export const Header = () => {
  const isMobile = useMediaQuery({
    query: "(max-width: 1023px)",
  });

  const navigate = useNavigate();

  const userData = useSelector((state) => state?.user?.data);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [visibleSupportMessage, setVisibleSupportMessage] = useState(false);

  const handleLogOut = async () => {
    console.log("handleLogOut");
  };

  const handleSignIn = () => {
    navigate("/auth", { replace: true });
  };

  const handleGoHome = () => navigate("/n8n/marketplace");
  const handleGoToSettings = () => navigate("/settings");

  return (
    <div className={styles.header}>
      <div className={styles.logo} onClick={handleGoHome}>
        <Logo />
      </div>

      {isMobile ? (
        <div className={styles.block}>
          <div onClick={() => setVisibleSupportMessage(true)}>
            <Headset size={18} strokeWidth={1} />
          </div>
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
            <div
              className={styles.settings}
              onClick={() => setVisibleSupportMessage(true)}
            >
              <Headset size={22} strokeWidth={1.5} color="black" />
            </div>
          </div>

          <Button
            leftIcon={userData && <LogoutIcon size={15} fill={"#fff"} />}
            title={userData ? "Выйти" : "Войти"}
            className={styles.logoutButton}
            onClick={userData ? handleLogOut : handleSignIn}
          />
        </div>
      )}
    </div>
  );
};
