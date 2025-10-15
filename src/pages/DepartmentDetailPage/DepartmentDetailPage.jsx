import { Clock, Contact, Globe, Pencil, Trash } from "lucide-react";
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
} from "../../store/slices/departmentsSlice";

const employees = [
  {
    id: 1,
    name: "Иван Иванов",
    position: "Frontend разработчик",
    telegramId: 6455897008,
    telegramName: "@ivan_fe",
    phone: "+7 (123) 456-78-90",
    email: "2EYHb@example.com",
  },
  {
    id: 2,
    name: "Петр Петров",
    position: "Frontend разработчик",
    telegramId: 6455897008,
    telegramName: "@petr_fe",
    phone: "+7 (123) 456-78-90",
    email: "2EYHb@example.com",
  },
  {
    id: 3,
    name: "Сидор Сидоров",
    position: "Frontend разработчик",
    telegramId: 6455897008,
    telegramName: "@sidor_fe",
    phone: "+7 (123) 456-78-90",
    email: "2EYHb@example.com",
  },
];
export default function DepartmentDetailPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { id } = useParams();

  const { department, loading } = useSelector((state) => state?.departments);

  const description = department?.description;
  const check_in_time = department?.check_in_time;
  const check_out_time = department?.check_out_time;
  const timezone = department?.timezone;

  const [visibleConfirmDeleteModal, setVisibleConfirmDeleteModal] =
    useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [visibleContactModal, setVisibleContactModal] = useState(false);

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

  const mockEmployee = {
    name: selectedEmployee?.name,
    email: selectedEmployee?.email,
    phone: selectedEmployee?.phone,
    telegramId: selectedEmployee?.telegramId,
    telegramName: selectedEmployee?.telegramName,
  };

  const handleGetDetails = (id) => navigate(`/employees/${id}`);

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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.pageContent}>
      <PageTitle title={department?.name} />

      <DeleteConfirmationModal
        isOpen={visibleConfirmDeleteModal}
        onClose={handleCloseConfirmDeleteModal}
        employeeName={selectedEmployee?.name}
        message={<MessageDelete employeeName={selectedEmployee?.name} />}
      />

      <EmployeeContactModal
        isOpen={visibleContactModal}
        onClose={handleCloseContactModal}
        employee={mockEmployee}
      />
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
                onShowContacts={() => handleOpenContactModal(emp)}
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
                onShowContacts={() => handleOpenContactModal(emp)}
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

const EmployeeRow = ({
  name,
  post,
  onDelete,
  onShowContacts,
  onGetDetails,
}) => {
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
