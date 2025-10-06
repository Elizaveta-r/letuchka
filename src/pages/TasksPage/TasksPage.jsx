import styles from "./TasksPage.module.scss";
import PageTitle from "../../components/PageTitle/PageTitle";
import { TaskCard } from "../../components/TaskCard/TaskCard";
import { useState } from "react";
import UpdateTaskModal from "../../modules/UpdateTaskModal/UpdateTaskModal";

const tasks = [
  {
    position_title: "Повар",
    task_title: "Прием рабочего места в начале смены",
    task_time: "9:30:00",
    deadline: "10:00:00",
    photo_required: true,
    photo_mandatory: true,
    notify_on_overdue: true,
    include_in_report: true,
    acceptance_type: "Фото", // Пример
    acceptance_criteria: "Рабочее место должно быть чистым",
  },
  {
    position_title: "Повар",
    task_title: "Комментарии приемки рабочего места от прошлой смены",
    task_time: "08:00",
    deadline: "09:00",
    photo_required: false,
    photo_mandatory: false,
    notify_on_overdue: true,
    include_in_report: true,
    acceptance_type: "Текст", // Пример
    acceptance_criteria: "",
  },
  {
    position_title: "Повар",
    task_title: "Выслать информацию о списаниях в чат ",
    task_time: "10:30:00",
    deadline: "11:00:00",
    photo_required: false,
    photo_mandatory: false,
    notify_on_overdue: true,
    include_in_report: true,
    acceptance_type: "чекбокс", // Пример
    acceptance_criteria: "",
  },
  {
    position_title: "Администратор",
    task_title:
      "Наличие наклеек на крышках от крафт боксов и плоских для запеченных ",
    task_time: "10:15:00",
    deadline: "11:00:00",
    photo_required: false,
    photo_mandatory: false,
    notify_on_overdue: true,
    include_in_report: true,
    acceptance_type: "чекбокс", // Пример
    acceptance_criteria: "",
  },
];
export default function TasksPage() {
  const [visibleCreateModal, setVisibleCreateModal] = useState(false);

  const openCreateModal = () => {
    setVisibleCreateModal(true);
  };
  const closeCreateModal = () => {
    setVisibleCreateModal(false);
  };
  return (
    <div className={styles.container}>
      <PageTitle title={"Задачи"} hasButton onClick={openCreateModal} />
      <UpdateTaskModal
        isNew={true}
        isOpen={visibleCreateModal}
        handleClose={closeCreateModal}
      />
      <div className={styles.tasksContainer}>
        {tasks.map((task, index) => (
          <TaskCard key={index} task={task} />
        ))}
      </div>
    </div>
  );
}
