import React from "react";
import styles from "./DepartmentCard.module.scss";
// Импортируем иконки из Lucide React
import { Clock, Users, ArrowRight } from "lucide-react";
import Hint from "../../ui/Hint/Hint";

const DepartmentCard = ({
  title,
  description,
  timezone,
  checkInTime,
  checkOutTime,
  employeeCount,
  onDetailsClick,
}) => {
  // Функция для форматирования времени (оставлена как заглушка)
  const formatTime = (time) => time;

  return (
    <div className={styles.card}>
      {/* Верхняя часть с градиентным акцентом */}

      <div className={styles.headerAccent} />

      <div className={styles.content}>
        {/* Название и Описание */}
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>{description}</p>

        {/* --- */}

        {/* Блок с ключевыми данными */}
        <div className={styles.dataGrid}>
          {/* Таймзона */}

          <div className={styles.dataItem}>
            <span className={styles.dataLabel}>Часовой пояс:</span>

            <Hint
              position="top"
              hintContent="Определяет время получения автоматических задач и уведомлений сотрудниками."
            >
              <span className={styles.dataValue}>{timezone}</span>
            </Hint>
          </div>

          {/* Количество сотрудников */}
          <div className={styles.dataItem}>
            {/* Используем иконку Users */}
            <div className={styles.employeeCount}>
              <span className={styles.dataLabel}>Сотрудников:</span>
            </div>

            <span className={styles.dataValue}>{employeeCount}</span>
          </div>

          {/* Время Check-in */}
          <div className={styles.dataItem}>
            {/* Используем иконку Clock */}
            <div className={styles.checkInTime}>
              <span className={styles.dataLabel}>Чекин до:</span>
            </div>

            <Hint
              position="right"
              hintContent={`Сотрудник должен быть на рабочем месте и отметиться (сделать "чекин") не позднее указанного времени.`}
            >
              <span className={`${styles.dataValue} ${styles.checkIn}`}>
                {formatTime(checkInTime)}
              </span>
            </Hint>
          </div>

          {/* Время Check-out */}
          <div className={styles.dataItem}>
            {/* Используем иконку Clock */}
            <div className={styles.checkOutTime}>
              <span className={styles.dataLabel}>Чекаут с:</span>
            </div>

            <Hint
              position="top"
              hintContent={`Это самое раннее время, когда сотрудник может официально отметиться об уходе с работы (сделать "чекаут").`}
            >
              <span className={styles.dataValue}>
                {formatTime(checkOutTime)}
              </span>
            </Hint>
          </div>
        </div>

        {/* --- */}

        {/* Кнопки с акцентами */}
        <div className={styles.actions}>
          <button className={styles.buttonSecondary} onClick={onDetailsClick}>
            Подробнее <ArrowRight size={18} /> {/* Используем ArrowRight */}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepartmentCard;
