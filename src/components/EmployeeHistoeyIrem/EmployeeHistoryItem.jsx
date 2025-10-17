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
  const isDoneLate = item?.status_type === "late";
  const isFailed = item?.status_type === "overdue";
  const isPhotoRequired = item?.ai_comment ? true : false;

  const aiComment = item?.ai_comment;

  const historyType = item?.history_type;

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
  const date = formatDateTime(item.done_time);

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
            {historyType === "checkin"
              ? "Чекин"
              : historyType === "checkout"
              ? "Чекаут"
              : item.task_name}
          </p>
          <span className={styles.date}>{date}</span>
        </div>

        {/* 3. Детали и фидбек */}

        {(item.task_condition || item.comment || item.ai_comment) && (
          <div className={styles.feedbackSection}>
            {item.task_condition && (
              <p className={styles.criteria}>{item.task_condition}</p>
            )}

            {item.comment && (
              <p className={styles.comment}>
                <Zap size={14} className={styles.iconTiny} />
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
