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
  deleteEmployee,
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

  const fullName = `${editedEmployee?.surname} ${editedEmployee?.firstname} ${editedEmployee?.patronymic}`;

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

  const handleDeleteEmployee = () => {
    dispatch(deleteEmployee(editedEmployee?.id)).then((res) => {
      if (res.status === 200) {
        setVisibleConfirmDeleteModal(false);
      }
    });
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
        onConfirm={handleDeleteEmployee}
        message={<MessageDelete employeeName={fullName} />}
      />

      {editedEmployee && (
        <EmployeeContactModal
          isOpen={visibleContactModal}
          onClose={handleCloseContactModal}
          employee={editedEmployee}
        />
      )}

      <div className={styles.content}>
        {employees && <EmployeeRowHeader />}

        {/* СТРОКИ ДАННЫХ */}
        {employees ? (
          employees.map((employee) => (
            <EmployeeRow
              key={employee.id}
              {...employee}
              onShowDetails={() => handleDetails(employee.id)}
              onShowContacts={() => handleOpenContactModal(employee)}
              onEdit={() => handleOpenEmployeeModal(employee)}
              onDelete={() => handleOpenConfirmDeleteModal(employee)}
            />
          ))
        ) : (
          <div className={styles.empty}>
            Список сотрудников пуст. <br /> Нажмите <strong>"Добавить"</strong>,
            чтобы добавить первого сотрудника.
          </div>
        )}
      </div>
    </div>
  );
}

const MessageDelete = ({ employeeName }) => {
  return (
    <>
      Вы уверены, что хотите <strong>удалить</strong> сотрудника <br />
      <span className={styles.employeeName}>{employeeName}</span>? <br /> Это
      действие <strong>необратимо</strong>.
    </>
  );
};
