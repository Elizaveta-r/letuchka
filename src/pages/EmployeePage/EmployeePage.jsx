import PageTitle from "../../components/PageTitle/PageTitle";
import styles from "./EmployeePage.module.scss";
import { useEffect, useState } from "react";
import EmployeeRow from "../../components/EmployeeRow/EmployeeRow";
import EmployeeRowHeader from "../../modules/EmployeeRowHeader/EmployeeRowHeader";
import { useNavigate } from "react-router-dom";
import DeleteConfirmationModal from "../../modules/DeleteConfirmationModal/DeleteConfirmationModal";
import EmployeeContactModal from "../../modules/EmployeeContactModal/EmployeeContactModal";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteEmployee,
  getEmployeesList,
  getEmployeeWithHistory,
} from "../../utils/api/actions/employees";
import { setEditedEmployee } from "../../store/slices/employeesSlice";

export default function EmployeePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { editedEmployee, employees } = useSelector(
    (state) => state?.employees
  );

  const [visibleConfirmDeleteModal, setVisibleConfirmDeleteModal] =
    useState(false);
  const [visibleContactModal, setVisibleContactModal] = useState(false);

  const fullName = `${editedEmployee?.surname} ${editedEmployee?.firstname} ${editedEmployee?.patronymic}`;

  const handleOpenNewEmployeeModal = () => {
    dispatch(setEditedEmployee(null));
    navigate("new");
  };

  const handleOpenEmployeeModal = (employee) => {
    navigate(`${employee?.id}/update`);
    dispatch(setEditedEmployee(employee));
  };

  const handleOpenConfirmDeleteModal = (employee) => {
    setVisibleConfirmDeleteModal(true);
    dispatch(setEditedEmployee(employee));
  };

  const handleCloseConfirmDeleteModal = () => {
    setVisibleConfirmDeleteModal(false);
  };

  const handleOpenContactModal = (employee) => {
    setVisibleContactModal(true);
    dispatch(setEditedEmployee(employee));
  };

  const handleCloseContactModal = () => {
    setVisibleContactModal(false);
  };

  const handleDetails = (id) => {
    dispatch(getEmployeeWithHistory(id, 1, 1000)).then((res) => {
      if (res.status === 200) {
        navigate(`${id}`);
      }
    });
    // dispatch(getEmployeeById(id, 1, 1000)).then((res) => {
    //   if (res.status === 200) {
    //     navigate(`${id}`);
    //   }
    // });
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
      {/* <EditEmployeeModal
        isOpen={isEmployeeModalOpen}
        isNew={isNewEmployee}
        employee={editedEmployee}
        onClose={handleCloseEmployeeModal}
        onConfirm={handleCreateEmployee}
        onUpdate={handleUpdateEmployee}
      /> */}
      <PageTitle
        title="Ваши сотрудники"
        hasButton
        dataTour="employees.add"
        onClick={handleOpenNewEmployeeModal}
      />

      <DeleteConfirmationModal
        isOpen={visibleConfirmDeleteModal}
        onClose={handleCloseConfirmDeleteModal}
        onConfirm={handleDeleteEmployee}
        message={<MessageDelete employeeName={fullName} />}
      />

      <EmployeeContactModal
        isOpen={visibleContactModal}
        onClose={handleCloseContactModal}
        employee={editedEmployee}
      />

      <div className={styles.content}>
        {employees && <EmployeeRowHeader />}

        {/* СТРОКИ ДАННЫХ */}
        {employees ? (
          employees?.map((employee) => (
            <EmployeeRow
              key={employee.id}
              checkedIn={employee.checked_in}
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
    <div>
      Вы уверены, что хотите <strong>удалить</strong> сотрудника <br />
      <span className={styles.employeeName}>{employeeName}</span>? <br /> Это
      действие <strong>необратимо</strong>.
    </div>
  );
};
