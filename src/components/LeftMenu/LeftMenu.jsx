import { useLocation, useNavigate } from "react-router-dom";
import styles from "./LeftMenu.module.scss";
import {
  AlarmClockCheck,
  Briefcase,
  Building2,
  Cable,
  CreditCard,
  FileBarChart,
  Home,
  IdCardLanyard,
} from "lucide-react";

const renderItemsData = [
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
];

export const LeftMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isParentActive = (item) =>
    location.pathname === item.path ||
    location.pathname.startsWith(item.path + "/");

  const handleItemClick = (item) => {
    navigate(item.path);
  };

  const handleKey = (e, item) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleItemClick(item);
    }
  };

  return (
    <nav className={styles.leftMenu} aria-label="Главное меню">
      {renderItemsData.map((item, index) => {
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
  );
};
