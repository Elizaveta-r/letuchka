import { Clock, Contact, Globe, Pencil, Trash, Users } from "lucide-react";
import PageTitle from "../../components/PageTitle/PageTitle";
import styles from "./DepartmentDetailPage.module.scss";
import { useEffect, useState } from "react";
import DeleteConfirmationModal from "../../modules/DeleteConfirmationModal/DeleteConfirmationModal";
import Hint from "../../ui/Hint/Hint";
import { getInitials } from "../../utils/methods/getInitials";
import { useNavigate, useParams } from "react-router-dom";
import EmployeeContactModal from "../../modules/EmployeeContactModal/EmployeeContactModal";
import { formatTime } from "../../utils/methods/formatTime";
import { getFormattedTimeZoneLabel } from "../../utils/methods/generateTimeZoneOptions";
import { useDispatch, useSelector } from "react-redux";
import { getDepartmentById } from "../../utils/api/actions/departments";
import {
  setDepartment,
  setLoadingGetDetails,
  toggleDepartmentIsDefault,
} from "../../store/slices/departmentsSlice";
import { CustomCheckbox } from "../../ui/CustomCheckbox/CustomCheckbox";
import { HintWithPortal } from "../../ui/HintWithPortal/HintWithPortal";

export default function DepartmentDetailPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { id } = useParams();

  const { department, loading } = useSelector((state) => state?.departments);

  const description = department?.description;
  const check_in_time = department?.check_in_time;
  const check_out_time = department?.check_out_time;
  const timezone = department?.timezone;

  const employees = department?.employees;
  const managers = department?.manager;

  const [visibleConfirmDeleteModal, setVisibleConfirmDeleteModal] =
    useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [visibleContactModal, setVisibleContactModal] = useState(false);

  const handleIsDefaultChange = (newCheckedValue) => {
    if (!department || !department.id) return; // Защита от отсутствия данных

    // Вызываем Thunk, который сам управляет оптимистичным обновлением и откатом
    dispatch(
      toggleDepartmentIsDefault({
        department: department,
        newValue: newCheckedValue,
      })
    );
  };

  const handleOpenConfirmDeleteModal = (employee) => {
    setVisibleConfirmDeleteModal(true);
    setSelectedEmployee(employee);
  };

  const handleCloseConfirmDeleteModal = () => {
    setVisibleConfirmDeleteModal(false);
    setSelectedEmployee(null);
  };

  const handleOpenContactModal = (employee) => {
    setSelectedEmployee(employee);
    setVisibleContactModal(true);
  };

  const handleCloseContactModal = () => {
    setVisibleContactModal(false);
  };

  const handleGetDetails = (id) => navigate(`/employees/${id}`);

  useEffect(() => {
    dispatch(getDepartmentById(id));
  }, [dispatch, id]);

  useEffect(() => {
    dispatch(setLoadingGetDetails(""));

    if (!department) {
      dispatch(getDepartmentById(id));
    }

    return () => {
      dispatch(setDepartment(null));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, id]);

  return (
    <div className={styles.pageContent}>
      <PageTitle title={department?.name} />

      <div className={styles.isDefault}>
        <CustomCheckbox
          checked={department.is_default}
          onChange={handleIsDefaultChange}
          label={"Использовать по умолчанию"}
        />
      </div>

      <DeleteConfirmationModal
        isOpen={visibleConfirmDeleteModal}
        onClose={handleCloseConfirmDeleteModal}
        employeeName={selectedEmployee?.name}
        message={<MessageDelete employeeName={selectedEmployee?.name} />}
        loading={loading}
      />

      {selectedEmployee && (
        <EmployeeContactModal
          isOpen={visibleContactModal}
          onClose={handleCloseContactModal}
          employee={selectedEmployee}
        />
      )}
      <div className={styles.content}>
        <p className={styles.desc}>{description}</p>
        <div className={styles.details}>
          <p className={styles.title}>Детали:</p>
          <div className={styles.detailsGrid}>
            <div className={styles.gridItem}>
              <div className={styles.headerCards}>
                <Clock size={"0.85rem"} color="#6b7280" />
                <p className={styles.label}>Чекин до:</p>
              </div>
              <p className={styles.time}>{formatTime(check_in_time)}</p>
            </div>
            <div className={styles.gridItem}>
              <div className={styles.headerCards}>
                <Clock size={"0.85rem"} color="#6b7280" />{" "}
                <p className={styles.label}>Чекаут с:</p>
              </div>
              <p className={styles.time}>{formatTime(check_out_time)}</p>
            </div>
            <div className={styles.gridItem}>
              <div className={styles.headerCards}>
                <Globe size={"0.85rem"} color="#6b7280" />{" "}
                <p className={styles.label}>Часовой пояс:</p>
              </div>
              <p className={styles.time}>
                {getFormattedTimeZoneLabel(timezone)}
              </p>
            </div>
            <div className={styles.gridItem}>
              <div className={styles.headerCards}>
                <Users size={"0.85rem"} color="#6b7280" />{" "}
                <p className={styles.label}>Всего сотрудников:</p>
              </div>
              <p className={styles.time}>
                {department?.employees_count || "0"}
              </p>
            </div>
          </div>
        </div>

        <div className={styles.employees}>
          <p className={styles.title}>Руководители:</p>
          <div className={styles.employeeGrid}>
            {managers ? (
              managers?.map((emp) => (
                <EmployeeRow
                  key={emp.id}
                  name={`${emp.surname} ${emp.firstname} ${emp.patronymic}`}
                  post={emp.positions}
                  id={emp.id}
                  onShowContacts={() => handleOpenContactModal(emp)}
                  onGetDetails={() => handleGetDetails(emp.id)}
                  onDelete={() => handleOpenConfirmDeleteModal(emp)}
                />
              ))
            ) : (
              <p className={styles.empty}>Нет руководителей</p>
            )}
          </div>
        </div>

        <div className={styles.employees}>
          <p className={styles.title}>Сотрудники:</p>
          <div className={styles.employeeGrid}>
            {employees ? (
              employees?.map((emp) => (
                <EmployeeRow
                  key={emp.id}
                  name={`${emp.surname} ${emp.firstname} ${emp.patronymic}`}
                  post={emp.positions}
                  id={emp.id}
                  onShowContacts={() => handleOpenContactModal(emp)}
                  onGetDetails={() => handleGetDetails(emp.id)}
                  onDelete={() => handleOpenConfirmDeleteModal(emp)}
                />
              ))
            ) : (
              <p className={styles.empty}>Нет сотрудников</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const EmployeeRow = ({
  name,
  post,
  onDelete,
  onShowContacts,
  onGetDetails,
}) => {
  const initials = getInitials(name);
  const positionNames = post?.map((pos) => pos.name);
  const positionsString = positionNames?.join(", ");
  return (
    <div className={styles.dataItem}>
      <div className={styles.avatar}>{initials}</div>
      <p className={styles.nameEmp} onClick={onGetDetails}>
        {name}
      </p>

      <p className={styles.postEmp}>{positionsString}</p>
      <div className={styles.actions}>
        <Hint hintContent="Посмотреть контактные данные" hasIcon={false}>
          <div className={styles.contact} onClick={onShowContacts}>
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
