import {
  BriefcaseBusiness,
  Building2,
  Contact,
  FileBadge2,
  Pencil,
  Trash,
} from "lucide-react";
import styles from "./EmployeeDetailsCard.module.scss";
import { TelegramIcon } from "../../assets/icons/TelegramIcon";
import { useState } from "react";
import EditEmployeeModal from "../EditEmployeeModal/EditEmployeeModal";
import DeleteConfirmationModal from "../DeleteConfirmationModal/DeleteConfirmationModal";
import { getInitials } from "../../utils/methods/getInitials";
import EmployeeContactModal from "../EmployeeContactModal/EmployeeContactModal";
import { useDispatch } from "react-redux";
import {
  deleteEmployee,
  updateEmployee,
} from "../../utils/api/actions/employees";
import { useNavigate } from "react-router-dom";

const displayedRole = (role) => {
  switch (role) {
    case "employee":
      return "Сотрудник";
    case "head":
      return "Руководитель";
    default:
      return "";
  }
};

export default function EmployeeDetailsCard({ employee }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [visibleConfirmDeleteModal, setVisibleConfirmDeleteModal] =
    useState(false);
  const [visibleEditModal, setVisibleEditModal] = useState(false);
  const [visibleContactModal, setVisibleContactModal] = useState(false);

  const fullName = `${employee?.surname} ${employee?.firstname} ${employee?.patronymic}`;

  const initials = getInitials(fullName);
  const statusText = employee?.checkedIn ? "На работе c 9:00" : "Нет на работе";
  const positions = employee?.positions?.map((position) => position.name);
  const departments = employee?.departments?.map(
    (department) => department.name
  );

  const positionsString = positions?.join(", ");
  const departmentsString = departments?.join(", ");

  const role = displayedRole(employee?.role);

  const handleOpenConfirmDeleteModal = () => {
    setVisibleConfirmDeleteModal(true);
  };

  const handleCloseConfirmDeleteModal = () => {
    setVisibleConfirmDeleteModal(false);
  };

  const handleOpenEditModal = () => {
    setVisibleEditModal(true);
  };

  const handleCloseEditModal = () => {
    setVisibleEditModal(false);
  };

  const handleOpenContactModal = () => {
    setVisibleContactModal(true);
  };

  const handleCloseContactModal = () => {
    setVisibleContactModal(false);
  };

  const handleUpdate = (data) => {
    return dispatch(updateEmployee(data));
  };

  const handleDeleteEmployee = () => {
    dispatch(deleteEmployee(employee?.id)).then((res) => {
      if (res.status === 200) {
        setVisibleConfirmDeleteModal(false);
        navigate(-1);
      }
    });
  };

  return (
    <div className={styles.profileSummary}>
      <EditEmployeeModal
        isOpen={visibleEditModal}
        onClose={handleCloseEditModal}
        onUpdate={handleUpdate}
        isNew={false}
        employee={employee}
      />
      <DeleteConfirmationModal
        isOpen={visibleConfirmDeleteModal}
        onClose={handleCloseConfirmDeleteModal}
        onConfirm={handleDeleteEmployee}
        message={<MessageDelete employeeName={fullName} />}
      />
      {employee && (
        <EmployeeContactModal
          isOpen={visibleContactModal}
          onClose={handleCloseContactModal}
          employee={employee}
        />
      )}
      {/* Аватар и Должность */}
      <div className={styles.profileHeader}>
        <div className={styles.avatar}>{initials}</div>
        <div className={styles.profileText}>
          <h2 className={styles.position}>{fullName}</h2>
          <div
            className={`${styles.statusPill} ${
              employee?.checkedIn ? styles.on : styles.off
            }`}
          >
            <div className={styles.dot}></div>
            <span>{statusText}</span>
          </div>
        </div>
      </div>

      {/* Основные данные */}
      <div className={styles.dataList}>
        <div className={styles.dataItem}>
          <div className={styles.icon}>
            <BriefcaseBusiness size={18} className={styles.iconPrimary} />
          </div>
          <div className={styles.valueContainer}>
            <span className={styles.label}>
              {employee?.positions?.length > 1 ? "Должности:" : "Должность:"}
            </span>

            <span className={styles.value}>{positionsString}</span>
          </div>
        </div>
        <div className={styles.dataItem}>
          <div className={styles.icon}>
            <FileBadge2 size={18} className={styles.iconPrimary} />
          </div>
          <div className={styles.valueContainer}>
            <span className={styles.label}>Роль:</span>
            <span className={styles.value}>{role}</span>
          </div>
        </div>
        <div className={styles.dataItem}>
          <div className={styles.icon}>
            <Building2 size={18} className={styles.iconPrimary} />
          </div>
          <div className={styles.valueContainer}>
            <span className={styles.label}>
              {employee?.departments?.length > 1
                ? "Подразделения:"
                : "Подразделение:"}{" "}
              <span className={styles.value}>{departmentsString}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Кнопки действий */}
      <div className={styles.actions}>
        <button
          className={styles.contactButton}
          onClick={handleOpenContactModal}
        >
          <Contact size={18} /> Контактные данные
        </button>
        <button className={styles.editButton} onClick={handleOpenEditModal}>
          <Pencil size={18} /> Редактировать
        </button>
        <button
          className={styles.deleteButton}
          onClick={handleOpenConfirmDeleteModal}
        >
          <Trash size={18} /> Удалить
        </button>
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
