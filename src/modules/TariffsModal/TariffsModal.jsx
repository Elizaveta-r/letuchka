import { Check, X, Info, Plus, Minus } from "lucide-react";
import { useState } from "react";
import styles from "./TariffsModal.module.scss";

// Константа стоимости дополнительного сотрудника
const ADDITIONAL_EMPLOYEE_COST = 150;

const TARIFF_PLANS = [
  {
    id: 1,
    name: "Бесплатный",
    price: 0,
    period: "месяц",
    maxEmployees: 5,
    description: "Для небольших команд с базовыми потребностями",
    isPopular: false,
    isCurrent: true,
    features: [
      { text: "До 5 активных сотрудников", included: true },
      {
        text: "Неограниченное количество задач, подразделений и должностей",
        included: true,
      },
      { text: "Интеграция с Telegram ботом", included: true },
      { text: "AI-контроль", included: false },
    ],
    color: "#6b7280",
    canAddEmployees: false,
  },
  {
    id: 2,
    name: "Старт",
    price: 2990,
    period: "месяц",
    maxEmployees: 10,
    description: "Для растущих команд с AI-проверкой",
    isPopular: true,
    isCurrent: false,
    features: [
      { text: "До 10 активных сотрудников", included: true },
      {
        text: "Неограниченное количество задач, подразделений и должностей",
        included: true,
      },
      { text: "Интеграция с Telegram ботом", included: true },
      { text: "AI-контроль", included: true },
    ],
    color: "#22c55e",
    canAddEmployees: true,
  },
  {
    id: 3,
    name: "Стандарт",
    price: 4990,
    period: "месяц",
    maxEmployees: 25,
    description: "Полный функционал для команд среднего размера",
    isPopular: false,
    isCurrent: false,
    features: [
      { text: "До 25 активных сотрудников", included: true },
      {
        text: "Неограниченное количество задач, подразделений и должностей",
        included: true,
      },
      { text: "Интеграция с Telegram ботом", included: true },
      { text: "AI-контроль", included: true },
    ],
    color: "#3b82f6",
    canAddEmployees: true,
  },
];

export default function Tariffs({ isOpen, onClose }) {
  const [additionalEmployees, setAdditionalEmployees] = useState({});

  if (!isOpen) return null;

  const handleSelectTariff = (tariffId) => {
    const additionalCount = additionalEmployees[tariffId] || 0;
    console.log(
      "Выбран тариф:",
      tariffId,
      "Дополнительных сотрудников:",
      additionalCount
    );
  };

  const handleEmployeeChange = (tariffId, delta) => {
    setAdditionalEmployees((prev) => {
      const current = prev[tariffId] || 0;
      const newValue = Math.max(0, current + delta);
      return { ...prev, [tariffId]: newValue };
    });
  };

  const calculateTotalPrice = (tariff) => {
    if (tariff.price === 0) return 0;

    const basePrice = tariff.price;
    const additionalCount = additionalEmployees[tariff.id] || 0;
    const additionalCost = additionalCount * ADDITIONAL_EMPLOYEE_COST;

    return basePrice + additionalCost;
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.headerTitle}>Тарифные планы</h2>
            <p className={styles.headerSubtitle}>
              Выберите подходящий тариф для вашего бизнеса
            </p>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          <div className={styles.tariffGrid}>
            {TARIFF_PLANS.map((tariff) => {
              const additionalCount = additionalEmployees[tariff.id] || 0;
              const totalPrice = calculateTotalPrice(tariff);
              // const hasAdditionalEmployees = additionalCount > 0;

              return (
                <div
                  key={tariff.id}
                  className={`${styles.tariffCard} ${
                    tariff.isCurrent ? styles.tariffCardCurrent : ""
                  }`}
                >
                  {tariff.isPopular && (
                    <div className={styles.popularBadge}>Популярный</div>
                  )}

                  {tariff.isCurrent && (
                    <div className={styles.currentBadge}>Текущий</div>
                  )}

                  <div className={styles.tariffContent}>
                    <div className={styles.tariffHeader}>
                      <h3 className={styles.tariffName}>{tariff.name}</h3>
                      <p className={styles.tariffDescription}>
                        {tariff.description}
                      </p>
                    </div>

                    <div className={styles.tariffPrice}>
                      <div className={styles.priceWrapper}>
                        <span className={styles.price}>
                          {tariff.price === 0
                            ? "Бесплатно"
                            : `${totalPrice.toLocaleString("ru-RU")} ₽`}
                        </span>
                        {tariff.price > 0 && (
                          <span className={styles.period}>/мес</span>
                        )}
                      </div>

                      {/* {hasAdditionalEmployees && (
                        <div className={styles.priceBreakdown}>
                          <span className={styles.basePrice}>
                            Базовый: {tariff.price.toLocaleString("ru-RU")} ₽
                          </span>
                          <span className={styles.additionalPrice}>
                            + {additionalCount} сотр. ×{" "}
                            {ADDITIONAL_EMPLOYEE_COST} ₽
                          </span>
                        </div>
                      )} */}
                    </div>

                    {/* Добавление сотрудников */}
                    {tariff.canAddEmployees && (
                      <div className={styles.employeeAdder}>
                        <div className={styles.employeeAdderHeader}>
                          <span className={styles.employeeAdderLabel}>
                            Дополнительные сотрудники
                          </span>
                          <span className={styles.employeeAdderCost}>
                            {ADDITIONAL_EMPLOYEE_COST} ₽/мес за каждого
                          </span>
                        </div>
                        <div className={styles.employeeAdderControls}>
                          <button
                            onClick={() => handleEmployeeChange(tariff.id, -1)}
                            disabled={additionalCount === 0}
                            className={styles.employeeButton}
                          >
                            <Minus size={16} />
                          </button>
                          <span className={styles.employeeCount}>
                            {additionalCount}
                          </span>
                          <button
                            onClick={() => handleEmployeeChange(tariff.id, 1)}
                            className={styles.employeeButton}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <p className={styles.totalEmployees}>
                          Всего: {tariff.maxEmployees + additionalCount}{" "}
                          сотрудников
                        </p>
                      </div>
                    )}

                    <ul className={styles.featureList}>
                      {tariff?.features?.map((feature, idx) => (
                        <li key={idx} className={styles.featureItem}>
                          {feature.included ? (
                            <Check size={16} className={styles.iconIncluded} />
                          ) : (
                            <X size={16} className={styles.iconExcluded} />
                          )}
                          <span
                            className={
                              feature.included
                                ? styles.featureIncluded
                                : styles.featureExcluded
                            }
                          >
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleSelectTariff(tariff.id)}
                      disabled={tariff.isCurrent}
                      className={`${styles.ctaButton} ${
                        tariff.isCurrent
                          ? styles.ctaButtonDisabled
                          : tariff.isPopular
                          ? styles.ctaButtonPrimary
                          : styles.ctaButtonSecondary
                      }`}
                    >
                      {tariff.isCurrent ? "Текущий тариф" : "Выбрать тариф"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.infoBox}>
            <Info size={24} className={styles.infoIcon} />
            <div className={styles.infoContent}>
              <h4 className={styles.infoTitle}>Важная информация</h4>
              <ul className={styles.infoList}>
                <li>• Вы можете сменить тариф в любое время</li>
                <li>
                  • Дополнительные сотрудники: {ADDITIONAL_EMPLOYEE_COST}{" "}
                  ₽/месяц за каждого
                </li>
                <li>• Оплата списывается ежемесячно автоматически</li>
                <li>• Возврат средств возможен в течение 14 дней</li>
                <li>• Все тарифы включают бесплатные обновления</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
