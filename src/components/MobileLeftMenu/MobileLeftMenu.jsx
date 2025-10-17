import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import styles from "./MobileLeftMenu.module.scss";
import {
  AlarmClockCheck,
  Briefcase,
  Building2,
  Cable,
  CreditCard,
  FileBarChart,
  Home,
  IdCardLanyard,
  Menu,
  Settings,
  X,
} from "lucide-react";

const mainMenuItems = [
  { name: "Обзор", path: "/", icon: <Home size={20} /> },
  { name: "Отчеты", path: "/reports", icon: <FileBarChart size={20} /> },
  { name: "Интеграции", path: "/integrations", icon: <Cable size={20} /> },
  { name: "Сотрудники", path: "/employees", icon: <IdCardLanyard size={20} /> },
];

const burgerMenuItems = [
  { name: "Биллинг", path: "/billing", icon: <CreditCard size={18} /> },
  { name: "Задачи", path: "/tasks", icon: <AlarmClockCheck size={18} /> },
  { name: "Должности", path: "/positions", icon: <Briefcase size={18} /> },
  {
    name: "Подразделения",
    path: "/departments",
    icon: <Building2 size={18} />,
  },
  {
    name: "Настройки",
    path: "/settings",
    icon: <Settings size={18} />,
  },
];

const allMenuItems = [
  { name: "Обзор", path: "/", icon: <Home size={18} /> },
  { name: "Биллинг", path: "/billing", icon: <CreditCard size={18} /> },
  { name: "Отчеты", path: "/reports", icon: <FileBarChart size={18} /> },
  { name: "Задачи", path: "/tasks", icon: <AlarmClockCheck size={18} /> },
  { name: "Должности", path: "/positions", icon: <Briefcase size={18} /> },
  { name: "Сотрудники", path: "/employees", icon: <IdCardLanyard size={18} /> },
  { name: "Интеграции", path: "/integrations", icon: <Cable size={18} /> },
  {
    name: "Подразделения",
    path: "/departments",
    icon: <Building2 size={18} />,
  },
  {
    name: "Настройки",
    path: "/settings",
    icon: <Settings size={18} />,
  },
];

export const MobileLeftMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isParentActive = (item) =>
    location.pathname === item.path ||
    location.pathname.startsWith(item.path + "/");

  const handleItemClick = (item) => {
    navigate(item.path);
    setIsOpen(false);
  };

  const handleKey = (e, item) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleItemClick(item);
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Закрытие меню при изменении размера окна
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Блокировка скролла при открытом меню
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Десктопное меню */}
      <nav className={styles.leftMenu} aria-label="Главное меню">
        {allMenuItems.map((item, index) => {
          return (
            <div key={`left-menu-${item.name}-${index}`}>
              <div
                role="button"
                tabIndex={0}
                className={`${styles.item} ${
                  isParentActive(item) ? styles.active : ""
                }`}
                onClick={() => handleItemClick(item)}
                onKeyDown={(e) => handleKey(e, item)}
              >
                <div className={styles.labelContainer}>
                  {item.icon && <div className={styles.icon}>{item.icon}</div>}
                  <span className={styles.label}>{item.name}</span>
                </div>
              </div>
              {item.name === "Биллинг" && <div className={styles.line} />}
              {item.name === "Статистика" && <div className={styles.line} />}
            </div>
          );
        })}
      </nav>

      {/* Мобильное меню */}
      <div className={styles.mobileMenuWrapper}>
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Оверлей */}
              <motion.div
                className={styles.overlay}
                onClick={() => setIsOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                aria-hidden="true"
              />

              {/* Бургер-меню */}
              <motion.nav
                className={styles.burgerMenu}
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                aria-label="Дополнительное меню"
              >
                <button
                  className={styles.closeButton}
                  onClick={() => setIsOpen(false)}
                  aria-label="Закрыть меню"
                >
                  <X size={24} />
                </button>

                {burgerMenuItems.map((item, index) => (
                  <motion.div
                    key={`burger-menu-${item.name}-${index}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 + 0.1 }}
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      className={`${styles.item} ${
                        isParentActive(item) ? styles.active : ""
                      }`}
                      onClick={() => handleItemClick(item)}
                      onKeyDown={(e) => handleKey(e, item)}
                    >
                      <div className={styles.labelContainer}>
                        {item.icon && (
                          <div className={styles.icon}>{item.icon}</div>
                        )}
                        <span className={styles.label}>{item.name}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.nav>
            </>
          )}
        </AnimatePresence>

        {/* Нижнее меню */}
        <nav className={styles.bottomMenu} aria-label="Главная навигация">
          {mainMenuItems.map((item, index) => (
            <div
              key={`bottom-menu-${item.name}-${index}`}
              role="button"
              tabIndex={0}
              className={`${styles.bottomItem} ${
                isParentActive(item) ? styles.active : ""
              }`}
              onClick={() => handleItemClick(item)}
              onKeyDown={(e) => handleKey(e, item)}
            >
              <div className={styles.bottomIcon}>{item.icon}</div>
              <span className={styles.bottomLabel}>{item.name}</span>
            </div>
          ))}

          {/* Кнопка бургер-меню */}
          <div
            role="button"
            tabIndex={0}
            className={`${styles.bottomItem} ${isOpen ? styles.active : ""}`}
            onClick={toggleMenu}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleMenu();
              }
            }}
            aria-label="Открыть меню"
            aria-expanded={isOpen}
          >
            <div className={styles.bottomIcon}>
              <Menu size={20} />
            </div>
            <span className={styles.bottomLabel}>Еще</span>
          </div>
        </nav>
      </div>
    </>
  );
};
