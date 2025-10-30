import {
  AlarmClock,
  AlertTriangle,
  CheckCircle,
  Clock,
  MessageCircleMore,
  TriangleAlert,
  Zap,
} from "lucide-react";
import styles from "./EmployeeHistoryItem.module.scss";
import { getFormattedTimeZoneLabel } from "../../utils/methods/generateTimeZoneOptions";

const formatDateTimeString = (datePart, timePart) => {
  // если передан один аргумент — как раньше
  if (timePart === undefined && typeof datePart === "string") {
    const date = new Date(datePart);
    return date.toLocaleString("ru-RU", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // если пришли отдельные дата и время
  if (datePart && timePart) {
    // безопасно собираем ISO-строку
    const combined = `${datePart}T${
      timePart.length === 5 ? timePart + ":00" : timePart
    }`;
    const date = new Date(combined);
    if (isNaN(date.getTime())) return "-";

    return date.toLocaleString("ru-RU", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return "-";
};

const formatTimeToWords = (timeStr) => {
  if (!timeStr) return "-";

  const [hours, minutes] = timeStr.split(":").map(Number);

  if (isNaN(hours) || isNaN(minutes)) return "-";

  return `${hours} ч ${minutes} мин`;
};

export default function EmployeeHistoryItem({ timezone, item, onPhotoClick }) {
  const isDoneLate = item?.status_type === "late";
  const isFailed = item?.status_type === "not_done";
  const isPhotoRequired = item?.ai_comment ? true : false;

  const aiComment = item?.ai_comment;

  const historyType = item?.action_type;

  let Icon = CheckCircle;
  let statusClass = styles.done;

  if (isDoneLate) {
    Icon = Clock;
    statusClass = styles.doneLate;
  } else if (isFailed) {
    Icon = AlertTriangle;
    statusClass = styles.failed;
  }

  // Используем дату в качестве ключа, если нет другого ID
  const date = formatDateTimeString(item.done_date, item.done_time);

  return (
    <div
      className={`${styles.historyItem} ${
        isPhotoRequired ? styles.photo : ""
      } ${statusClass}`}
    >
      {/* 1. Визуальная метка статуса */}
      <div className={styles.statusIcon}>
        <Icon size={20} />
      </div>

      {/* 2. Основное содержание */}
      <div className={styles.contentArea}>
        <div className={styles.titleRow}>
          <p className={styles.taskTitle}>
            {historyType === "check_in"
              ? "Чекин"
              : historyType === "check_out"
              ? "Чекаут"
              : item.title}
          </p>
          <span className={styles.date}>
            {date} ({getFormattedTimeZoneLabel(timezone)})
          </span>
        </div>

        <div className={styles.deadlineContainer}>
          <div className={styles.deadline}>
            <AlarmClock color="#6b7280" size={12} />{" "}
            {item?.action_type === "check_in"
              ? "Ожидаемое время чекина"
              : item?.action_type === "check_out"
              ? "Ожидаемое время чекаута"
              : "Дедлайн"}
            : {item.deadline_time}
          </div>
          {item?.late_time && item?.late_time !== "00:00" && (
            <div className={styles.late}>
              <TriangleAlert color="#f59e0b" size={12} />
              {item?.action_type === "check_in"
                ? "Выполнен с опозданием на"
                : item?.action_type === "check_out"
                ? "Выполнен раньше на"
                : "Выполнена с опозданием на"}
              : {formatTimeToWords(item.late_time)}
            </div>
          )}
        </div>

        {/* 3. Детали и фидбек */}

        {(item.ai_prompt || item.comment || item.ai_comment) && (
          <div className={styles.feedbackSection}>
            {item.ai_prompt && (
              <p className={styles.criteria}>{item.ai_prompt}</p>
            )}

            {item.comment && (
              <p className={styles.comment}>
                <MessageCircleMore size={14} className={styles.iconTiny} />
                Комментарий: {item.comment}
              </p>
            )}

            {item.ai_comment?.includes("OK") ? (
              <p className={`${styles.aiFeedback} ${styles.aiSuccess}`}>
                <CheckCircle size={14} /> AI Анализ: Успешно
              </p>
            ) : (
              aiComment && (
                <p className={`${styles.aiFeedback} ${styles.aiFail}`}>
                  <AlertTriangle size={14} /> AI Анализ: Неудача (
                  {item.ai_comment})
                </p>
              )
            )}
          </div>
        )}
      </div>

      {/* 4. Предпросмотр фотоотчета */}
      {isPhotoRequired &&
        (item.photo_link ? (
          <div
            className={`${styles.photoContainer} ${
              isPhotoRequired && !item?.photo_link ? styles.photoNeed : ""
            }`}
            onClick={() => onPhotoClick(item?.photo_link)}
          >
            <img
              src={item.photo_link}
              alt="Фотоотчет сотрудника"
              className={styles.photo}
            />
          </div>
        ) : (
          <div className={`${styles.photoContainer} ${styles.empty}`}>
            <p>Нет фото</p>
          </div>
        ))}
    </div>
  );
}
