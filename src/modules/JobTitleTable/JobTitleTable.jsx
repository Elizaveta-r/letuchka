import React from "react";
import { Pencil, Trash, Users, Plus } from "lucide-react";
import styles from "./JobTitleTable.module.scss";

// Моковые данные должностей
const mockJobTitles = [
  {
    id: 1,
    name: "Повар",
    description:
      "Отвечает за полный цикл приготовления блюд горячего и холодного цехов, контролирует качество сырья",
    employeeCount: 5,
  },
  {
    id: 2,
    name: "Администратор",
    description:
      "Осуществляет контроль работы зала, встречает гостей, решает конфликтные ситуации, ведет отчетность",
    employeeCount: 2,
  },
  {
    id: 3,
    name: "Курьер",
    description:
      "Своевременная доставка заказов клиентам, работа с мобильным приложением и навигацией",
    employeeCount: 8,
  },
  {
    id: 4,
    name: "Руководитель разработки",
    description:
      "Управление командой, принятие архитектурных решений, код-ревью",
    employeeCount: 0,
  },
];

const JobTitleTable = ({ jobTitles = mockJobTitles, onEdit, onDelete }) => {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.jobTable}>
        {/* Заголовок таблицы */}
        <thead>
          <tr>
            <th>Название должности</th>
            <th>Описание</th>
            <th>Сотрудников</th>
            <th className={styles.actionsHeader}>Действия</th>
          </tr>
        </thead>

        {/* Тело таблицы */}
        <tbody>
          {jobTitles.map((job) => (
            <tr key={job.id}>
              <td className={styles.jobName}>{job.name}</td>
              <td className={styles.jobDescription}>{job.description}</td>
              <td>
                <div className={styles.employeeCell}>
                  <Users size={16} className={styles.userIcon} />
                  <span>{job.employeeCount}</span>
                </div>
              </td>

              {/* Кнопки действий */}
              <td>
                <div className={styles.actionsCell}>
                  <button
                    className={styles.editButton}
                    onClick={() => onEdit(job.id)}
                    title="Редактировать"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => onDelete(job.id)}
                    title="Удалить"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {jobTitles.length === 0 && (
            <tr>
              <td colSpan="4" className={styles.noData}>
                Список должностей пуст. Нажмите "Добавить", чтобы создать первую
                должность.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default JobTitleTable;
