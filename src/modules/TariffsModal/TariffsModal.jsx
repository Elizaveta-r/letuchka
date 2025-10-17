import { Check, X, Zap, Info } from "lucide-react";
import { useState } from "react";
import styles from "./TariffsModal.module.scss";

// Моковые данные тарифов
const TARIFF_PLANS = [
  {
    id: 1,
    name: "Стартовый (Free)",
    price: 0,
    period: "месяц",
    // 💡 ИЗМЕНЕНО: Ограничение по сотрудникам
    description:
      "Начните работу: до 5 активных сотрудников и базовый функционал",
    isPopular: false,
    isCurrent: false,
    features: [
      { text: "До 5 активных сотрудников", included: true },
      { text: "Неограниченное количество задач", included: true },
      { text: "Базовые типы подтверждения (Текст, Чекбокс)", included: true },
      { text: "Ежедневная/еженедельная отчетность", included: true },
      { text: "Управление по должностям и отделам", included: false },
      { text: "Фотоподтверждение задач", included: false },
      { text: "Экспорт данных", included: false },
    ],
    color: "#6b7280",
  },
  {
    id: 2,
    name: "Базовый (Pro)",
    price: 1990,
    period: "месяц",
    // 💡 ИЗМЕНЕНО: Базовый функционал для малых команд
    description:
      "Для команд до 25 сотрудников с расширенными настройками задач",
    isPopular: true,
    isCurrent: true,
    features: [
      { text: "До 25 активных сотрудников", included: true },
      {
        text: "Фотоподтверждение задач (обязательное/необязательное)",
        included: true,
      },
      { text: "Отчетность по просрочкам и KPI", included: true },
      { text: "Шаблоны задач и дублирование", included: true },
      { text: "Управление доступом по должностям и отделам", included: true },
      { text: "API для базовой интеграции", included: false },
      { text: "Экспорт данных в XLSX", included: false },
    ],
    color: "#22c55e",
  },
  {
    id: 3,
    name: "Профессиональный (Business)",
    price: 4990,
    period: "месяц",
    // 💡 ИЗМЕНЕНО: Для растущих команд с потребностью в отчетности
    description: "Для команд до 100 сотрудников и полной аналитикой",
    isPopular: false,
    isCurrent: false,
    features: [
      { text: "До 100 активных сотрудников", included: true },
      { text: "Все функции Базового тарифа", included: true },
      { text: "Продвинутый конструктор отчетов", included: true },
      { text: "Доступ к API (чтение и запись)", included: true },
      { text: "Интеграция с 1С и ERP системами", included: true },
      { text: "Приоритетная поддержка 24/7", included: true },
      { text: "Webhooks и уведомления", included: true },
    ],
    color: "#3b82f6",
  },
  {
    id: 4,
    name: "Корпоративный (Enterprise)",
    price: null,
    period: "месяц",
    // 💡 ИЗМЕНЕНО: Индивидуальное решение
    description:
      "Для крупного бизнеса с индивидуальными требованиями к безопасности и интеграции",
    isPopular: false,
    isCurrent: false,
    features: [
      { text: "Неограниченное количество сотрудников", included: true },
      { text: "Выделенные сервера и SLA гарантии", included: true },
      { text: "SSO (Single Sign-On)", included: true },
      { text: "Кастомная разработка функционала", included: true },
      { text: "Выделенный менеджер по внедрению", included: true },
      { text: "Все функции тарифа Профессиональный", included: true },
      { text: "Онлайн-обучение команды", included: true },
    ],
    color: "#8b5cf6",
  },
];

export default function Tariffs({ isOpen, onClose }) {
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  if (!isOpen) return null;

  const handleSelectTariff = (tariffId) => {
    console.log("Выбран тариф:", tariffId);
  };

  const formatPrice = (price) => {
    if (price === null) return "По запросу";
    if (price === 0) return "Бесплатно";

    const finalPrice =
      selectedPeriod === "year" ? Math.floor(price * 12 * 0.8) : price;
    return `${finalPrice.toLocaleString("ru-RU")} ₽`;
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

        {/* Period Toggle */}
        <div className={styles.periodToggle}>
          <button
            onClick={() => setSelectedPeriod("month")}
            className={`${styles.periodButton} ${
              selectedPeriod === "month" ? styles.periodButtonActive : ""
            }`}
          >
            Помесячно
          </button>
          <button
            onClick={() => setSelectedPeriod("year")}
            className={`${styles.periodButton} ${
              selectedPeriod === "year" ? styles.periodButtonActive : ""
            }`}
          >
            За год
            <span className={styles.discountBadge}>-20%</span>
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          <div className={styles.tariffGrid}>
            {TARIFF_PLANS.map((tariff) => (
              <div
                key={tariff.id}
                className={`${styles.tariffCard} ${
                  tariff.isCurrent ? styles.tariffCardCurrent : ""
                }`}
              >
                {tariff.isPopular && (
                  <div className={styles.popularBadge}>
                    <Zap size={12} />
                    Популярный
                  </div>
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
                        {formatPrice(tariff.price)}
                      </span>
                      {tariff.price !== null && (
                        <span className={styles.period}>
                          /{selectedPeriod === "year" ? "год" : "мес"}
                        </span>
                      )}
                    </div>
                    {selectedPeriod === "year" && tariff.price > 0 && (
                      <p className={styles.savings}>
                        Экономия{" "}
                        {(tariff.price * 12 * 0.2).toLocaleString("ru-RU")} ₽ в
                        год
                      </p>
                    )}
                  </div>

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
                    {tariff.isCurrent
                      ? "Текущий тариф"
                      : tariff.price === null
                      ? "Связаться с нами"
                      : "Выбрать тариф"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.infoBox}>
            <Info size={24} className={styles.infoIcon} />
            <div className={styles.infoContent}>
              <h4 className={styles.infoTitle}>Важная информация</h4>
              <ul className={styles.infoList}>
                <li>• Вы можете сменить тариф в любое время</li>
                <li>
                  • При превышении лимита запросы будут временно приостановлены
                </li>
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
