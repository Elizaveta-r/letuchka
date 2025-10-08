import styles from "./DepartmentsPage.module.scss";
import DepartmentCard from "../../components/DepartmentCard/DepartmentCard";
import PageTitle from "../../components/PageTitle/PageTitle";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import CreateDepartmentModal from "../../modules/CreateDepartmentModal/CreateDepartmentModal";

export default function DepartmentsPage() {
  const navigate = useNavigate();

  const [visibleCreateModal, setVisibleCreateModal] = useState(false);

  const handleDetails = (id) => navigate(`${id}`);
  const handleCheckIn = () => console.log("Отметка о приходе...");

  return (
    <div className={styles.pageContent}>
      <PageTitle
        title="Ваши подразделения"
        hasButton
        onClick={() => setVisibleCreateModal(true)}
      />
      <CreateDepartmentModal
        isOpen={visibleCreateModal}
        onClose={() => setVisibleCreateModal(false)}
        onConfirm={() => setVisibleCreateModal(false)}
      />

      <div className={styles.content}>
        {departmentData.map((department, index) => (
          <DepartmentCard
            key={index}
            {...department}
            onDetailsClick={() => handleDetails(department.id)}
            onCheckInClick={handleCheckIn}
          />
        ))}
      </div>
    </div>
  );
}

const departmentData = [
  {
    id: 1,
    title: "Отдел разработки (Frontend)",
    description:
      "Разработка пользовательских интерфейсов и оптимизация производительности.",
    timezone: "UTC+3 (MSK)",
    checkInTime: "09:30",
    checkOutTime: "18:00",
    employeeCount: 14,
  },
  {
    id: 2,
    title: "Отдел разработки (Frontend)",
    description:
      "Разработка пользовательских интерфейсов и оптимизация производительности.",
    timezone: "UTC+3 (MSK)",
    checkInTime: "09:30",
    checkOutTime: "18:00",
    employeeCount: 14,
  },
  {
    id: 3,
    title: "Отдел разработки (Frontend)",
    description:
      "Разработка пользовательских интерфейсов и оптимизация производительности.",
    timezone: "UTC+3 (MSK)",
    checkInTime: "09:30",
    checkOutTime: "18:00",
    employeeCount: 14,
  },
  {
    id: 4,
    title: "Отдел разработки (Frontend)",
    description:
      "Разработка пользовательских интерфейсов и оптимизация производительности.",
    timezone: "UTC+3 (MSK)",
    checkInTime: "09:30",
    checkOutTime: "18:00",
    employeeCount: 14,
  },
];
