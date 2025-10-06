import styles from "./EmployeeDetailPage.module.scss";
import { useState } from "react";
import { ImageModal } from "../../ui/ImageModal/ImageModal";
import PageTitle from "../../components/PageTitle/PageTitle";
import EmployeeDetailsCard from "../../modules/EmployeeDetailsCard/EmployeeDetailsCard";
import EmployeeHistoryItem from "../../components/EmployeeHistoeyIrem/EmployeeHistoryItem";

// ----------------------------------------------------------------------
// Mock Data (для демонстрации)
// ----------------------------------------------------------------------

const employee = {
  id: 5107679353,
  name: "Иван Иванов",
  telegramId: 6455897008,
  telegramName: "@ivan_fe",
  position: ["Повар"],
  role: "Сотрудник",
  department: ["Разработка (Frontend)"],
  checkedIn: true,
  history: [
    {
      date: "2025-09-04 9:11:53",
      task_title: "Прием рабочего места в начале смены",
      task_acceptance_criteria:
        "Рабочее место повара должно быть организовано так, чтобы все поверхности, инструменты и посуда были чистыми и продезинфицированными, продукты и сырые ингредиенты разделялись, мусор удалялся своевременно, а повар соблюдал личную гигиену и носил чистую форму.",
      status: "done",
      photo_url:
        "https://api.telegram.org/file/bot8437135255:AAEQ3vDc8HKtvyD9n9fb3E21CXxH_Tuh8G0/photos/file_808.jpg",
      ai_feedback: "OK",
      comment: "",
    },
    {
      date: "2025-09-04 9:11:53",
      task_title: "Чистота мойки",
      task_acceptance_criteria:
        "Мойка на кухне должна быть всегда чистой, свободной от остатков пищи и загрязнений, с регулярной дезинфекцией после каждого использования.",
      status: "done_late",
      photo_url:
        "https://api.telegram.org/file/bot8437135255:AAEQ3vDc8HKtvyD9n9fb3E21CXxH_Tuh8G0/photos/file_842.jpg",
      ai_feedback: "OK",
      comment: "Задача выполнена с опозданием. Время зафиксировано в 10:02:45",
    },
    {
      date: "2025-09-04 9:13:50",
      task_title: "Подготовка зоны выдачи",
      task_acceptance_criteria:
        "Проверка чистоты зоны выдачи, наличие салфеток, специй и соответствие выкладки стандартам.",
      status: "failed",
      photo_url: "",
      ai_feedback: "FAIL",
      comment: "Отсутствует фотография обязательного элемента в кадре.",
    },
  ],
};

export default function EmployeeDetailPage() {
  const [modalPhotoUrl, setModalPhotoUrl] = useState(null);

  const handleOpenPhotoModal = (url) => {
    setModalPhotoUrl(url);
  };

  const handleClosePhotoModal = () => {
    setModalPhotoUrl(null);
  };

  return (
    <div className={styles.pageContent}>
      {/* Заголовок с именем */}
      <PageTitle title={"Детали сотрудника"} />

      <div className={styles.mainGrid}>
        <EmployeeDetailsCard employee={employee} />

        {/* 2. ПРАВАЯ КОЛОНКА: ИСТОРИЯ ДЕЙСТВИЙ */}
        <div className={styles.historySection}>
          <h2 className={styles.historyTitle}>История выполнения задач</h2>

          <div className={styles.historyList}>
            {employee.history.map((item, index) => (
              <EmployeeHistoryItem
                key={index}
                item={item}
                onPhotoClick={handleOpenPhotoModal}
              />
            ))}
            {/* Сообщение, если история пуста */}
            {employee.history.length === 0 && (
              <p className={styles.noHistory}>
                Действий сотрудника пока не зафиксировано.
              </p>
            )}
          </div>
        </div>
        <ImageModal photoUrl={modalPhotoUrl} onClose={handleClosePhotoModal} />
      </div>
    </div>
  );
}
