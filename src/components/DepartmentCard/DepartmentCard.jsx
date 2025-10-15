import React from "react";
import styles from "./DepartmentCard.module.scss";
// Импортируем иконки из Lucide React
import { Clock, Users, ArrowRight, PencilLine, Trash } from "lucide-react";
import Hint from "../../ui/Hint/Hint";
import { formatTime } from "../../utils/methods/formatTime";
import { getFormattedTimeZoneLabel } from "../../utils/methods/generateTimeZoneOptions";
import { useSelector } from "react-redux";
import { RingLoader } from "react-spinners";

const DepartmentCard = ({
  id,
  name,
  description,
  timezone,
  check_in_time,
  check_out_time,
  employees_count,
  onDetailsClick,
  onUpdateClick,
  // onDeleteClick,
}) => {
  const { loadingGetDetails } = useSelector((state) => state?.departments);

  const handleUpdateClick = () => {
    onUpdateClick(id);
  };

  return (
    <div className={styles.card}>
      <div className={styles.headerAccent} />

      <div className={styles.content}>
        <h2 className={styles.title}>{name}</h2>
        <p className={styles.description}>{description}</p>

        {/* Блок с ключевыми данными */}
        <div className={styles.dataGrid}>
          <div className={styles.dataItem}>
            <span className={styles.dataLabel}>Часовой пояс:</span>

            <Hint
              position="top"
              hintContent="Определяет время получения автоматических задач и уведомлений сотрудниками."
            >
              <span className={styles.dataValue}>
                {getFormattedTimeZoneLabel(timezone)}
              </span>
            </Hint>
          </div>

          {/* Количество сотрудников */}
          <div className={styles.dataItem}>
            <div className={styles.employeeCount}>
              <span className={styles.dataLabel}>Сотрудников:</span>
            </div>

            <span className={styles.dataValue}>{employees_count}</span>
          </div>

          {/* Время Check-in */}
          <div className={styles.dataItem}>
            <div className={styles.checkInTime}>
              <span className={styles.dataLabel}>Чекин до:</span>
            </div>

            <Hint
              position="right"
              hintContent={`Сотрудник должен быть на рабочем месте и отметиться (сделать "чекин") не позднее указанного времени.`}
            >
              <span className={`${styles.dataValue} ${styles.checkIn}`}>
                {formatTime(check_in_time)}
              </span>
            </Hint>
          </div>

          {/* Время Check-out */}
          <div className={styles.dataItem}>
            <div className={styles.checkOutTime}>
              <span className={styles.dataLabel}>Чекаут с:</span>
            </div>

            <Hint
              position="top"
              hintContent={`Это самое раннее время, когда сотрудник может официально отметиться об уходе с работы (сделать "чекаут").`}
            >
              <span className={styles.dataValue}>
                {formatTime(check_out_time)}
              </span>
            </Hint>
          </div>
        </div>

        {/* --- */}

        {/* Кнопки с акцентами */}
        <div className={styles.actions}>
          {loadingGetDetails === id ? (
            <button className={styles.buttonSecondary} onClick={onDetailsClick}>
              Подробнее <RingLoader color="#16a34a" size={18} />{" "}
              {/* Используем ArrowRight */}
            </button>
          ) : (
            <button className={styles.buttonSecondary} onClick={onDetailsClick}>
              Подробнее <ArrowRight size={18} /> {/* Используем ArrowRight */}
            </button>
          )}
          <button
            className={`${styles.buttonSecondary} ${styles.buttonIcon}`}
            onClick={handleUpdateClick}
          >
            <PencilLine size={18} />
          </button>

          {/* 3. Кнопка "Удалить" (иконка, стиль удаления) */}
          <button
            className={`${styles.buttonSecondary} ${styles.buttonIcon} ${styles.buttonDelete}`}
          >
            <Trash size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepartmentCard;
