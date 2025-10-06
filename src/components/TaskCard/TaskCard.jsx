import {
  Clock,
  Camera,
  Zap,
  CheckSquare,
  XCircle,
  Bell,
  Pencil,
  Trash,
} from "lucide-react";
import styles from "./TaskCard.module.scss";
import { useState } from "react";
import DeleteConfirmationModal from "../../modules/DeleteConfirmationModal/DeleteConfirmationModal";
import UpdateTaskModal from "../../modules/UpdateTaskModal/UpdateTaskModal";

export const TaskCard = ({ task }) => {
  const [visibleDeleteModal, setVisibleDeleteModal] = useState(false);
  const [visibleUpdateModal, setVisibleUpdateModal] = useState(false);

  // Определяем бейджи для фото
  const photoBadge = task.photo_mandatory
    ? styles.badgeMandatory
    : task.photo_required
    ? styles.badgeRequired
    : styles.badgeInfo;
  const photoText = task.photo_mandatory
    ? "Фото (ОБЯЗАТЕЛЬНО)"
    : task.photo_required
    ? "Фото (Требуется)"
    : "Без фото";
  const PhotoIcon = task.photo_mandatory ? Zap : Camera;

  // Определяем бейдж для уведомлений
  const notifyBadge = task.notify_on_overdue
    ? styles.badgeAlert
    : styles.badgeMuted;

  const handleDelete = () => {
    setVisibleDeleteModal(true);
  };

  const handleUpdate = () => {
    setVisibleUpdateModal(true);
  };

  return (
    <div className={styles.taskCard}>
      <DeleteConfirmationModal
        isOpen={visibleDeleteModal}
        onClose={() => setVisibleDeleteModal(false)}
        message={<Message taskName={task.task_title} />}
        buttonTitle="Удалить задачу"
        buttonIcon={<XCircle size={20} />}
      />
      <UpdateTaskModal
        isOpen={visibleUpdateModal}
        handleClose={() => setVisibleUpdateModal(false)}
        task={task}
      />
      {/* 1. ЗАГОЛОВОК И ДЕДЛАЙН */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h3 className={styles.taskTitle}>{task.task_title}</h3>
          <div className={styles.positionBadge}>{task.position_title}</div>
        </div>

        <div className={styles.headerActionsContainer}>
          <div className={styles.headerActions}>
            <div className={styles.edit} onClick={handleUpdate}>
              <Pencil size={16} />
            </div>
            <div className={styles.trash} onClick={handleDelete}>
              <Trash size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* 2. БЕЙДЖИ И КЛЮЧЕВЫЕ НАСТРОЙКИ */}
      <div className={styles.badgesContainer}>
        {/* 2.1. Бейдж фото */}
        <div className={`${styles.badge} ${photoBadge}`}>
          <PhotoIcon size={14} /> <span>{photoText}</span>
        </div>

        {/* 2.2. Бейдж уведомлений */}
        <div className={`${styles.badge} ${notifyBadge}`}>
          <Bell size={14} />{" "}
          <span>
            {task.notify_on_overdue
              ? "Уведомление при просрочке"
              : "Без уведомлений"}
          </span>
        </div>

        {/* 2.3. Бейдж отчета */}
        <div
          className={`${styles.badge} ${
            task.include_in_report ? styles.badgePrimary : styles.badgeMuted
          }`}
        >
          <CheckSquare size={14} />{" "}
          <span>
            {task.include_in_report ? "В итоговом отчете" : "Вне отчета"}
          </span>
        </div>
      </div>

      {/* 3. ОСНОВНЫЕ ДЕТАЛИ (GRID) */}
      <div className={styles.detailsGrid}>
        {/* Время и Дедлайн (1-й ряд) */}
        <div className={styles.detailItem}>
          <span className={styles.label}>
            <Clock size={16} /> Время начала:
          </span>
          <span className={styles.value}>{task.task_time}</span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.label}>
            <Clock size={16} /> Дедлайн:
          </span>
          <span className={styles.valueAccent}>{task.deadline}</span>
        </div>

        {/* Тип подтверждения (2-й ряд) */}
        <div className={styles.detailItemFullWidth}>
          <span className={styles.label}>
            <CheckSquare size={16} /> Тип подтверждения:
          </span>
          <span className={styles.value}>{task.acceptance_type}</span>
        </div>
      </div>

      {/* 4. КРИТЕРИЙ ПРИЕМКИ (FOOTER) */}
      <div className={styles.criteriaSection}>
        <p className={styles.criteriaTitle}>Критерий приемки:</p>
        <p className={styles.criteriaText}>
          {task.acceptance_criteria ? task.acceptance_criteria : "Отсутствует"}
        </p>
      </div>
    </div>
  );
};

const Message = ({ taskName }) => {
  return (
    <div>
      <p>Вы действительно хотите удалить задачу?</p> "
      <strong>{taskName}</strong>"
    </div>
  );
};
