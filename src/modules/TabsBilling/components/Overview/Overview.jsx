import styles from "./Overview.module.scss";
import { useState } from "react";
import formatWithSpaces from "../../../../utils/methods/formatNumberWithSpaces";
import { Clock, Zap } from "lucide-react"; // Оставляем только нужные иконки

// 💡 Мок-данные для демонстрации
const TARIFF_PLAN = "Базовый";
// Дата, когда заканчивается текущий тариф
const TARIFF_END_DATE = "01.12.2025";

export const Overview = () => {
  const [loading] = useState(false);

  // ⭐️ Используем мок-баланс
  const balance = "10053.75";

  const balanceFormatter = () => {
    if (balance) {
      return `${formatWithSpaces(balance)} ₽`;
    } else {
      return loading ? "" : "0,00 ₽";
    }
  };

  return (
    <div className={styles.content}>
      <div className={styles.title}>Состояние счёта</div>

      <div className={styles.balanceWrapper}>
        {/* 1. ГЛАВНОЕ ЗНАЧЕНИЕ БАЛАНСА */}
        <div className={styles.balance}>
          {/* Обернем текст баланса в div, чтобы легче было стилизовать */}
          {!balance && loading ? <p>Загрузка...</p> : balanceFormatter()}
        </div>

        {/* 2. СЕКЦИЯ ДЕТАЛЕЙ */}
        <div className={styles.detailsContainer}>
          {/* Информация о тарифе */}
          <div className={styles.detailItem}>
            <Zap size={18} className={styles.iconTariff} />
            <span className={styles.detailLabel}>Тариф:</span>
            <span className={styles.detailValue}>{TARIFF_PLAN}</span>
          </div>

          {/* Срок действия */}
          <div className={styles.detailItem}>
            <Clock size={18} className={styles.iconDate} />
            <span className={styles.detailLabel}>Действует до:</span>
            <span className={styles.detailValue}>{TARIFF_END_DATE}</span>
          </div>
        </div>

        {/* 3. Добавим индикатор статуса/подсказку, чтобы заполнить место */}
        <div className={styles.statusTip}>
          Баланс автоматически списывается за услуги согласно вашему тарифу.
        </div>
      </div>
    </div>
  );
};
