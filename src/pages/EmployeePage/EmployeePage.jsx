import PageTitle from "../../components/PageTitle/PageTitle";
import styles from "./EmployeePage.module.scss";
import { useState } from "react";
import EditEmployeeModal from "../../modules/EditEmployeeModal/EditEmployeeModal";
import EmployeeRow from "../../components/EmployeeRow/EmployeeRow";
import EmployeeRowHeader from "../../modules/EmployeeRowHeader/EmployeeRowHeader";
import { useNavigate } from "react-router-dom";
import DeleteConfirmationModal from "../../modules/DeleteConfirmationModal/DeleteConfirmationModal";

export default function EmployeePage() {
  const navigate = useNavigate();

  const [isNewEmployee, setIsNewEmployee] = useState(false);
  const [editedEmployee, setEditedEmployee] = useState(null);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [visibleConfirmDeleteModal, setVisibleConfirmDeleteModal] =
    useState(false);

  const handleOpenNewEmployeeModal = () => {
    setIsNewEmployee(true);
    setEditedEmployee(null);
    setIsEmployeeModalOpen(true);
  };

  const handleOpenEmployeeModal = (employee) => {
    setIsNewEmployee(false);
    setEditedEmployee(employee);
    setIsEmployeeModalOpen(true);
  };

  const handleCloseEmployeeModal = () => {
    setIsNewEmployee(false);
    setIsEmployeeModalOpen(false);
  };

  const handleOpenConfirmDeleteModal = (employee) => {
    setVisibleConfirmDeleteModal(true);
    setEditedEmployee(employee);
  };

  const handleCloseConfirmDeleteModal = () => {
    setVisibleConfirmDeleteModal(false);
  };

  const handleDetails = (id) => navigate(`${id}`);

  return (
    <div className={styles.pageContent}>
      <EditEmployeeModal
        isOpen={isEmployeeModalOpen}
        isNew={isNewEmployee}
        employee={editedEmployee}
        onClose={handleCloseEmployeeModal}
      />
      <PageTitle
        title="Ваши сотрудники"
        hasButton
        onClick={handleOpenNewEmployeeModal}
      />

      <DeleteConfirmationModal
        isOpen={visibleConfirmDeleteModal}
        onClose={handleCloseConfirmDeleteModal}
        message={<MessageDelete employeeName={editedEmployee?.name} />}
      />

      <div className={styles.content}>
        <EmployeeRowHeader />

        {/* СТРОКИ ДАННЫХ */}
        {employees.map((employee) => (
          <EmployeeRow
            key={employee.id}
            {...employee}
            onShowDetails={() => handleDetails(employee.id)}
            onEdit={() => handleOpenEmployeeModal(employee)}
            onDelete={() => handleOpenConfirmDeleteModal(employee)}
          />
        ))}
      </div>
    </div>
  );
}

const MessageDelete = ({ employeeName }) => {
  return (
    <>
      Вы уверены, что хотите <strong>удалить</strong> сотрудника
      <span className={styles.employeeName}> {employeeName}</span>? Это действие
      необратимо.
    </>
  );
};

// ----------------------------------------------------------------------
// Моковые данные
// ----------------------------------------------------------------------

const employees = [
  {
    id: 1,
    name: "Иван Иванов",
    telegramId: 6455897008,
    telegramName: "@ivan_fe",
    position: "Frontend разработчик",
    role: "Сотрудник",
    department: "Разработка (Frontend)",
    checkedIn: true,
  },
  {
    id: 2,
    name: "Петр Петров-Синицин",
    telegramId: 6455897008,
    telegramName: "@petr_lead",
    position: "Ведущий Backend",
    role: "Руководитель",
    department: "Разработка (Backend)",
    checkedIn: false,
  },
  {
    id: 3,
    name: "Сидор Сидоров",
    telegramId: 6455897008,
    telegramName: "@sidor_qa",
    position: "Старший тестировщик",
    role: "Сотрудник",
    department: "Обеспечение качества",
    checkedIn: true,
  },
];
