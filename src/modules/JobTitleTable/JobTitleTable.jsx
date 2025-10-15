import { Pencil, Trash, Users } from "lucide-react";
import styles from "./JobTitleTable.module.scss";

const JobTitleTable = ({ positions, onEdit, onDelete }) => {
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
          {positions ? (
            positions?.map((job) => (
              <tr key={job.id}>
                <td className={styles.jobName}>{job.name}</td>
                <td className={styles.jobDescription}>{job.description}</td>
                <td>
                  <div className={styles.employeeCell}>
                    <Users size={16} className={styles.userIcon} />
                    <span>{job.employees_count}</span>
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
            ))
          ) : (
            <tr>
              <td colSpan="4" className={styles.noData}>
                Список должностей пуст. Нажмите "Добавить", чтобы создать первую
                должность.
              </td>
            </tr>
          )}

          {positions?.length === 0 && (
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
