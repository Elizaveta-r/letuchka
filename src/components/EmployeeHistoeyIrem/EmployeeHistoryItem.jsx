import { AlertTriangle, CheckCircle, Clock, Zap } from "lucide-react";
import styles from "./EmployeeHistoryItem.module.scss";

const formatDateTime = (isoString) => {
  const date = new Date(isoString);
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return date.toLocaleString("ru-RU", options);
};

export default function EmployeeHistoryItem({ item, onPhotoClick }) {
  const isDoneLate = item.status === "done_late";
  const isFailed = item.status === "failed";

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
  const date = formatDateTime(item.date);

  return (
    <div className={`${styles.historyItem} ${statusClass}`}>
      {/* 1. Визуальная метка статуса */}
      <div className={styles.statusIcon}>
        <Icon size={20} />
      </div>

      {/* 2. Основное содержание */}
      <div className={styles.contentArea}>
        <div className={styles.titleRow}>
          <p className={styles.taskTitle}>{item.task_title}</p>
          <span className={styles.date}>{date}</span>
        </div>

        {/* 3. Детали и фидбек */}
        <div className={styles.feedbackSection}>
          <p className={styles.criteria}>{item.task_acceptance_criteria}</p>

          {item.comment && (
            <p className={styles.comment}>
              <Zap size={14} className={styles.iconTiny} />
              Комментарий: {item.comment}
            </p>
          )}

          {item.ai_feedback === "OK" ? (
            <p className={`${styles.aiFeedback} ${styles.aiSuccess}`}>
              <CheckCircle size={14} /> AI Анализ: Успешно
            </p>
          ) : (
            <p className={`${styles.aiFeedback} ${styles.aiFail}`}>
              <AlertTriangle size={14} /> AI Анализ: Неудача ({item.ai_feedback}
              )
            </p>
          )}
        </div>
      </div>

      {/* 4. Кнопка просмотра фото */}
      <button
        className={styles.photoLink}
        onClick={() => onPhotoClick(item.photo_url)}
      >
        {item.photo_url ? "Фотоотчет" : "Нет фото"}
      </button>
    </div>
  );
}
