import PageTitle from "../../components/PageTitle/PageTitle";
import styles from "./EmployeePage.module.scss";
import { useEffect, useState } from "react";
import EditEmployeeModal from "../../modules/EditEmployeeModal/EditEmployeeModal";
import EmployeeRow from "../../components/EmployeeRow/EmployeeRow";
import EmployeeRowHeader from "../../modules/EmployeeRowHeader/EmployeeRowHeader";
import { useNavigate } from "react-router-dom";
import DeleteConfirmationModal from "../../modules/DeleteConfirmationModal/DeleteConfirmationModal";
import EmployeeContactModal from "../../modules/EmployeeContactModal/EmployeeContactModal";
import { useDispatch, useSelector } from "react-redux";
import {
  createEmployee,
  getEmployeeById,
  getEmployeesList,
  updateEmployee,
} from "../../utils/api/actions/employees";
import { setLoadingGetEmployee } from "../../store/slices/employeesSlice";

export default function EmployeePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { employees } = useSelector((state) => state?.employees);

  const [isNewEmployee, setIsNewEmployee] = useState(false);
  const [editedEmployee, setEditedEmployee] = useState(null);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [visibleConfirmDeleteModal, setVisibleConfirmDeleteModal] =
    useState(false);
  const [visibleContactModal, setVisibleContactModal] = useState(false);

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

  const handleOpenContactModal = (employee) => {
    setEditedEmployee(employee);
    setVisibleContactModal(true);
  };

  const handleCloseContactModal = () => {
    setVisibleContactModal(false);
  };

  const handleDetails = (id) => {
    dispatch(setLoadingGetEmployee(id));
    dispatch(getEmployeeById(id)).then(() => {
      navigate(`${id}`);
    });
  };

  const handleCreateEmployee = (data) => {
    return dispatch(createEmployee(data));
  };

  const handleUpdateEmployee = (data) => {
    return dispatch(updateEmployee(data));
  };

  useEffect(() => {
    dispatch(getEmployeesList(1, 10));
  }, [dispatch]);

  return (
    <div className={styles.pageContent}>
      <EditEmployeeModal
        isOpen={isEmployeeModalOpen}
        isNew={isNewEmployee}
        employee={editedEmployee}
        onClose={handleCloseEmployeeModal}
        onConfirm={handleCreateEmployee}
        onUpdate={handleUpdateEmployee}
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

      <EmployeeContactModal
        isOpen={visibleContactModal}
        onClose={handleCloseContactModal}
        contacts={editedEmployee}
      />

      <div className={styles.content}>
        <EmployeeRowHeader />

        {/* СТРОКИ ДАННЫХ */}
        {employees
          ? employees.map((employee) => (
              <EmployeeRow
                key={employee.id}
                {...employee}
                onShowDetails={() => handleDetails(employee.id)}
                onShowContacts={() => handleOpenContactModal(employee)}
                onEdit={() => handleOpenEmployeeModal(employee)}
                onDelete={() => handleOpenConfirmDeleteModal(employee)}
              />
            ))
          : null}
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

// const employees = [
//   {
//     id: 1,
//     name: "Иван Иванов",
//     telegramId: 6455897008,
//     telegramName: "@ivan_fe",
//     position: "Frontend разработчик",
//     role: "Сотрудник",
//     department: "Разработка (Frontend)",
//     checkedIn: true,
//   },
//   {
//     id: 2,
//     name: "Петр Петров-Синицин",
//     telegramId: 6455897008,
//     telegramName: "@petr_lead",
//     position: "Ведущий Backend",
//     role: "Руководитель",
//     department: "Разработка (Backend)",
//     checkedIn: false,
//   },
//   {
//     id: 3,
//     name: "Сидор Сидоров",
//     telegramId: 6455897008,
//     telegramName: "@sidor_qa",
//     position: "Старший тестировщик",
//     role: "Сотрудник",
//     department: "Обеспечение качества",
//     checkedIn: true,
//   },
// ];
