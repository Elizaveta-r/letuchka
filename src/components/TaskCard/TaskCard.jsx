import {
  Clock,
  Camera,
  Zap,
  CheckSquare,
  XCircle,
  Bell,
  Pencil,
  Trash,
  Building2,
  BugPlay,
} from "lucide-react";
import styles from "./TaskCard.module.scss";
import { useEffect, useState } from "react";
import DeleteConfirmationModal from "../../modules/DeleteConfirmationModal/DeleteConfirmationModal";
import UpdateTaskModal from "../../modules/UpdateTaskModal/UpdateTaskModal";
import { useNavigate } from "react-router-dom";
import Hint from "../../ui/Hint/Hint";
import { formatTime } from "../../utils/methods/formatTime";
import { useDispatch, useSelector } from "react-redux";
import { getDepartmentById } from "../../utils/api/actions/departments";
import {
  setDraftFromEditedTask,
  setIsEdit,
} from "../../store/slices/tasksSlice";
import { getTaskById } from "../../utils/api/actions/tasks";

const getLabelDoneType = (type) => {
  switch (type) {
    case "photo":
      return "Фото";
    case "text":
      return "Текст";
    case "check_box":
      return "Чекбокс";
    default:
      return "Фото";
  }
};

export const TaskCard = ({ task, isFull }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { departments } = useSelector((state) => state?.departments);

  const department = departments?.find((dep) => dep.id === task?.department_id);

  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [visibleDeleteModal, setVisibleDeleteModal] = useState(false);
  const [visibleUpdateModal, setVisibleUpdateModal] = useState(false);

  // Определяем бейджи для фото
  const photoBadge = task?.photo_required
    ? styles.badgeMandatory
    : task?.need_photo
    ? styles.badgeRequired
    : styles.badgeInfo;
  const photoText = task?.photo_required
    ? "Фото (ОБЯЗАТЕЛЬНО)"
    : task?.need_photo
    ? "Фото (Требуется)"
    : "Без фото";

  const PhotoIcon = task?.photo_required ? Zap : Camera;

  // Определяем бейдж для уведомлений
  const notifyBadge = task?.expired_notify
    ? styles.badgeAlert
    : styles.badgeMuted;

  const handleDelete = () => {
    setVisibleDeleteModal(true);
  };

  const handleUpdate = () => {
    dispatch(setIsEdit(true));
    dispatch(getTaskById(task?.id)).then((res) => {
      dispatch(setDraftFromEditedTask(res.data.task));
      navigate(`/tasks/update/${task?.id}`);
    });
  };

  const handleGoToDetails = () => {
    dispatch(getTaskById(task?.id)).then(() => {
      navigate(`${task?.id}`);
    });
  };

  useEffect(() => {
    if (!department) {
      dispatch(getDepartmentById(task?.department_id)).then((res) => {
        setSelectedDepartment(res?.data?.department);
      });
    }
  }, [dispatch, department, task?.department_id]);

  return (
    <div className={styles.taskCard}>
      <DeleteConfirmationModal
        isOpen={visibleDeleteModal}
        onClose={() => setVisibleDeleteModal(false)}
        message={<Message taskName={task?.name} />}
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
          <div className={styles.row}>
            <div
              className={`${styles.taskTitle} ${isFull ? styles.full : ""}`}
              onClick={isFull ? () => {} : handleGoToDetails}
            >
              {task?.name}
            </div>

            <div className={styles.headerActionsContainer}>
              <div className={styles.headerActions}>
                <Hint hintContent="Проверить работу задачи" hasIcon={false}>
                  <div className={styles.edit} onClick={handleUpdate}>
                    <BugPlay size={16} />
                  </div>
                </Hint>
                <Hint hintContent="Редактировать" hasIcon={false}>
                  <div className={styles.edit} onClick={handleUpdate}>
                    <Pencil size={16} />
                  </div>
                </Hint>
                <Hint hintContent="Удалить" hasIcon={false}>
                  <div className={styles.trash} onClick={handleDelete}>
                    <Trash size={16} />
                  </div>
                </Hint>
              </div>
            </div>
          </div>

          <div className={`${styles.positions} ${isFull ? styles.full : ""}`}>
            {task?.positions.map((position, index) => (
              <div
                key={`${position?.id}-${index}`}
                className={styles.positionBadge}
              >
                {position?.name}
              </div>
            ))}
            {/* <div className={styles.shadow} /> */}
          </div>
        </div>
      </div>

      {/* 2. БЕЙДЖИ И КЛЮЧЕВЫЕ НАСТРОЙКИ */}
      <div className={styles.badgesContainer}>
        <div className={`${styles.badge} ${photoBadge}`}>
          <PhotoIcon size={14} /> <span>{photoText}</span>
        </div>

        <div className={`${styles.badge} ${notifyBadge}`}>
          <Bell size={14} />{" "}
          <span>
            {task?.expired_notify
              ? "Уведомление при просрочке"
              : "Без уведомлений"}
          </span>
        </div>
        <div
          className={`${styles.badge} ${
            task?.to_final_report ? styles.badgePrimary : styles.badgeMuted
          }`}
        >
          <CheckSquare size={14} />{" "}
          <span>
            {task?.to_final_report ? "В итоговом отчете" : "Вне отчета"}
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
          <span className={styles.value}>{formatTime(task?.start_time)}</span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.label}>
            <Clock size={16} /> Дедлайн:
          </span>
          <span className={styles.valueAccent}>
            {formatTime(task?.deadline_time)}
          </span>
        </div>

        {/* Тип подтверждения (2-й ряд) */}
        <div className={styles.detailItem}>
          <span className={styles.label}>
            <CheckSquare size={16} /> Тип подтверждения:
          </span>
          <span className={styles.value}>
            {getLabelDoneType(task?.done_type)}
          </span>
        </div>

        <div className={styles.detailItem}>
          <span className={styles.label}>
            <Building2 size={16} /> Подразделение:
          </span>
          <span className={styles.value}>
            {task?.department_id
              ? department
                ? department?.name
                : selectedDepartment?.name
              : "-"}
          </span>
        </div>
      </div>

      {/* 4. КРИТЕРИЙ ПРИЕМКИ (FOOTER) */}
      <div className={styles.criteriaSection}>
        <p className={styles.criteriaTitle}>Критерий приемки:</p>
        <p className={`${styles.criteriaText} ${isFull ? styles.full : ""}`}>
          {task?.accept_condition ? task?.accept_condition : "Отсутствует"}
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
