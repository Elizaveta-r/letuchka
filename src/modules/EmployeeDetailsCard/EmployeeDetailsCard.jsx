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

export default function EmployeeDetailsCard({ employee }) {
  const [visibleConfirmDeleteModal, setVisibleConfirmDeleteModal] =
    useState(false);
  const [visibleEditModal, setVisibleEditModal] = useState(false);
  const [visibleContactModal, setVisibleContactModal] = useState(false);

  const initials = getInitials(employee.name);
  const statusText = employee.checkedIn ? "На работе c 9:00" : "Нет на работе";

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

  const mockEmployee = {
    name: employee.name,
    email: "employee.email@example.com",
    phone: "+79788888888",
    telegramId: employee.telegramId,
    telegramName: employee.telegramName,
  };

  return (
    <div className={styles.profileSummary}>
      <EditEmployeeModal
        isOpen={visibleEditModal}
        onClose={handleCloseEditModal}
        employee={employee}
      />
      <DeleteConfirmationModal
        isOpen={visibleConfirmDeleteModal}
        onClose={handleCloseConfirmDeleteModal}
        message={<MessageDelete employeeName={employee.name} />}
      />
      <EmployeeContactModal
        isOpen={visibleContactModal}
        onClose={handleCloseContactModal}
        employee={mockEmployee}
      />
      {/* Аватар и Должность */}
      <div className={styles.profileHeader}>
        <div className={styles.avatar}>{initials}</div>
        <div className={styles.profileText}>
          <h2 className={styles.position}>{employee.name}</h2>
          <div
            className={`${styles.statusPill} ${
              employee.checkedIn ? styles.on : styles.off
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
              {employee.position?.length > 1 ? "Должности:" : "Должность:"}
            </span>
            <span className={styles.value}>{employee.position}</span>
          </div>
        </div>
        <div className={styles.dataItem}>
          <div className={styles.icon}>
            <FileBadge2 size={18} className={styles.iconPrimary} />
          </div>
          <div className={styles.valueContainer}>
            <span className={styles.label}>Роль:</span>
            <span className={styles.value}>{employee.role}</span>
          </div>
        </div>
        <div className={styles.dataItem}>
          <div className={styles.icon}>
            <Building2 size={18} className={styles.iconPrimary} />
          </div>
          <div className={styles.valueContainer}>
            <span className={styles.label}>
              {employee.department?.length > 1
                ? "Подразделения:"
                : "Подразделение:"}
            </span>
            <span className={styles.value}>{employee.department}</span>
          </div>
        </div>
      </div>

      {/* Кнопки действий */}
      <div className={styles.actions}>
        <button className={styles.editButton} onClick={handleOpenContactModal}>
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
      Вы уверены, что хотите <strong>удалить</strong> сотрудника
      <span className={styles.employeeName}> {employeeName}</span>? Это действие
      необратимо.
    </>
  );
};
