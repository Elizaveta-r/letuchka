import React from "react";
import styles from "./TasksDetailsPage.module.scss";
import PageTitle from "../../components/PageTitle/PageTitle";
import { useParams } from "react-router-dom";
import { TaskCard } from "../../components/TaskCard/TaskCard";

const tasks = [
  {
    id: "1",
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
    id: "2",
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
    department: "Кухня",
  },
  {
    id: "3",
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
    department: "Кухня",
  },
  {
    id: "4",
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
    department: "Кухня",
  },
];

export default function TasksDetailsPage() {
  const params = useParams();
  const taskId = params.id;

  const task = tasks.find((task) => task.id === taskId);

  return (
    <div className={styles.container}>
      <PageTitle title={"Детали задачи"} />

      <TaskCard task={task} isFull />
    </div>
  );
}
