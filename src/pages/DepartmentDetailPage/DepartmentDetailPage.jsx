import { Clock, Contact, Globe, Pencil, Trash } from "lucide-react";
import PageTitle from "../../components/PageTitle/PageTitle";
import styles from "./DepartmentDetailPage.module.scss";
import { useState } from "react";
import DeleteConfirmationModal from "../../modules/DeleteConfirmationModal/DeleteConfirmationModal";
import Hint from "../../ui/Hint/Hint";
import { getInitials } from "../../utils/methods/getInitials";
import { useNavigate } from "react-router-dom";

const employees = [
  {
    id: 1,
    name: "Иван Иванов",
    position: "Frontend разработчик",
  },
  {
    id: 2,
    name: "Петр Петров",
    position: "Frontend разработчик",
  },
  {
    id: 3,
    name: "Сидор Сидоров",
    position: "Frontend разработчик",
  },
];
export default function DepartmentDetailPage() {
  const navigate = useNavigate();

  const [visibleConfirmDeleteModal, setVisibleConfirmDeleteModal] =
    useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const handleOpenConfirmDeleteModal = (employee) => {
    setVisibleConfirmDeleteModal(true);
    setSelectedEmployee(employee);
  };

  const handleCloseConfirmDeleteModal = () => {
    setVisibleConfirmDeleteModal(false);
    setSelectedEmployee(null);
  };

  const handleGetDetails = (id) => navigate(`/employees/${id}`);

  return (
    <div className={styles.pageContent}>
      <PageTitle title="Отдел разработки (Frontend)" />

      <DeleteConfirmationModal
        isOpen={visibleConfirmDeleteModal}
        onClose={handleCloseConfirmDeleteModal}
        employeeName={selectedEmployee?.name}
        message={<MessageDelete employeeName={selectedEmployee?.name} />}
      />
      <div className={styles.content}>
        <p className={styles.desc}>
          Разработка пользовательских интерфейсов и оптимизация
          производительности.
        </p>
        <div className={styles.details}>
          <p className={styles.title}>Детали:</p>
          <div className={styles.detailsGrid}>
            <div className={styles.gridItem}>
              <div className={styles.headerCards}>
                <Clock size={"0.85rem"} color="#6b7280" />
                <p className={styles.label}>Чекин до:</p>
              </div>
              <p className={styles.time}>09:30</p>
            </div>
            <div className={styles.gridItem}>
              <div className={styles.headerCards}>
                <Clock size={"0.85rem"} color="#6b7280" />{" "}
                <p className={styles.label}>Чекаут с:</p>
              </div>
              <p className={styles.time}>18:00</p>
            </div>
            <div className={styles.gridItem}>
              <div className={styles.headerCards}>
                <Globe size={"0.85rem"} color="#6b7280" />{" "}
                <p className={styles.label}>Часовой пояс:</p>
              </div>
              <p className={styles.time}>UTC+3 (MSK)</p>
            </div>
          </div>
        </div>

        <div className={styles.employees}>
          <p className={styles.title}>Руководители:</p>
          <div className={styles.employeeGrid}>
            {employees.map((emp) => (
              <EmployeeRow
                key={emp.id}
                name={emp.name}
                post={emp.position}
                id={emp.id}
                onGetDetails={() => handleGetDetails(emp.id)}
                onDelete={() => handleOpenConfirmDeleteModal(emp)}
              />
            ))}
          </div>
        </div>

        <div className={styles.employees}>
          <p className={styles.title}>Сотрудники:</p>
          <div className={styles.employeeGrid}>
            {employees.map((emp) => (
              <EmployeeRow
                key={emp.id}
                name={emp.name}
                post={emp.position}
                id={emp.id}
                onGetDetails={() => handleGetDetails(emp.id)}
                onDelete={() => handleOpenConfirmDeleteModal(emp)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const EmployeeRow = ({ name, post, onDelete, onGetDetails }) => {
  const initials = getInitials(name);
  return (
    <div className={styles.dataItem}>
      <div className={styles.avatar}>{initials}</div>
      <p className={styles.nameEmp} onClick={onGetDetails}>
        {name}
      </p>
      <p className={styles.postEmp}>{post}</p>
      <div className={styles.actions}>
        <Hint hintContent="Посмотреть контактные данные" hasIcon={false}>
          <div className={styles.contact} onClick={onDelete}>
            <Contact size={16} />
          </div>
        </Hint>

        <Hint hintContent="Удалить сотрудника из отдела" hasIcon={false}>
          <div
            className={styles.trash}
            data-tooltip="Удалить"
            onClick={onDelete}
          >
            <Trash size={16} />
          </div>
        </Hint>
      </div>
    </div>
  );
};

const MessageDelete = ({ employeeName }) => {
  return (
    <>
      Вы уверены, что хотите <strong>удалить</strong> сотрудника
      <span className={styles.employeeName}> {employeeName}</span> из отдела?
      Это действие необратимо.
    </>
  );
};
