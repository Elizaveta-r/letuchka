import styles from "./Overview.module.scss";
import { useState } from "react";
import formatWithSpaces from "../../../../utils/methods/formatNumberWithSpaces";
import { Clock, Zap, CreditCard, Eye, Info } from "lucide-react";
import TariffsModal from "../../../TariffsModal/TariffsModal";

// 💡 Мок-данные для демонстрации
const TARIFF_PLAN = "Базовый";
const TARIFF_END_DATE = "01.12.2025";

export const Overview = () => {
  const [loading] = useState(false);
  const balance = "10053.75";

  const [isTariffsModalOpen, setIsTariffsModalOpen] = useState(false);

  const balanceFormatter = () => {
    if (balance) {
      return `${formatWithSpaces(balance)} ₽`;
    } else {
      return loading ? "" : "0,00 ₽";
    }
  };

  const handleChangeTariff = () => {
    setIsTariffsModalOpen(true);
  };

  const handleViewTariffs = () => {
    setIsTariffsModalOpen(true);
  };

  const handleCloseTariffsModal = () => {
    setIsTariffsModalOpen(false);
  };

  return (
    <div className={styles.content}>
      <div className={styles.title}>Состояние счёта</div>

      <div className={styles.balanceWrapper}>
        {/* 1. ГЛАВНОЕ ЗНАЧЕНИЕ БАЛАНСА */}
        <div className={styles.balance}>
          {!balance && loading ? <p>Загрузка...</p> : balanceFormatter()}
        </div>

        {/* 2. СЕКЦИЯ ДЕТАЛЕЙ */}
        <div className={styles.detailsContainer}>
          {/* Информация о тарифе */}
          <div className={styles.detailItem}>
            <div className={styles.iconTariff}>
              <Zap size={20} />
            </div>
            <div className={styles.detailContent}>
              <span className={styles.detailLabel}>Тариф</span>
              <span className={styles.detailValue}>{TARIFF_PLAN}</span>
            </div>
          </div>

          {/* Срок действия */}
          <div className={styles.detailItem}>
            <div className={styles.iconDate}>
              <Clock size={20} />
            </div>
            <div className={styles.detailContent}>
              <span className={styles.detailLabel}>Действует до</span>
              <span className={styles.detailValue}>{TARIFF_END_DATE}</span>
            </div>
          </div>
        </div>

        {/* 3. ПОДСКАЗКА */}
        <div className={styles.statusTip}>
          <Info size={16} className={styles.statusIcon} />
          <span>
            Баланс автоматически списывается за услуги согласно вашему тарифу.
          </span>
        </div>

        {/* 4. СЕКЦИЯ ДЕЙСТВИЙ */}
        <div className={styles.actionsContainer}>
          <button
            className={`${styles.actionButton} ${styles.primaryAction}`}
            onClick={handleChangeTariff}
          >
            <CreditCard size={18} />
            <span>Сменить тариф</span>
          </button>
          <button
            className={`${styles.actionButton} ${styles.secondaryAction}`}
            onClick={handleViewTariffs}
          >
            <Eye size={18} />
            <span>Все тарифы</span>
          </button>
        </div>
      </div>
      <TariffsModal
        isOpen={isTariffsModalOpen}
        onClose={handleCloseTariffsModal}
      />
    </div>
  );
};
