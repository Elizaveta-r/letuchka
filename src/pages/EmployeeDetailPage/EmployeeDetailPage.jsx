// import styles from "./EmployeeDetailPage.module.scss";
// import { useState } from "react";
// import { ImageModal } from "../../ui/ImageModal/ImageModal";
// import PageTitle from "../../components/PageTitle/PageTitle";
// import EmployeeDetailsCard from "../../modules/EmployeeDetailsCard/EmployeeDetailsCard";
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
      // YYYY-MM-DD HH:MM:SS
      date: "2025-09-04 09:11:53",
      task_title: "Прием рабочего места в начале смены",
      task_acceptance_criteria:
        "Рабочее место повара должно быть организовано так, чтобы все поверхности, инструменты и посуда были чистыми и продезинфицированными, продукты и сырые ингредиенты разделялись, мусор удалялся своевременно, а повар соблюдал личную гигиену и носил чистую форму.",
      status: "done",
      photo_url:
        "https://api.telegram.org/file/bot8437135255:AAEQ3vDc8HKtvyD9n9fb3E21CXxH_Tuh8G0/photos/file_1760.jpg",
      ai_feedback: "OK",
      comment: "",
    },
    {
      date: "2025-09-04 09:11:53",
      task_title: "Чистота мойки",
      task_acceptance_criteria:
        "Мойка на кухне должна быть всегда чистой, свободной от остатков пищи и загрязнений, с регулярной дезинфекцией после каждого использования.",
      status: "done_late",
      photo_url:
        "https://api.telegram.org/file/bot8437135255:AAEQ3vDc8HKtvyD9n9fb3E21CXxH_Tuh8G0/photos/file_1760.jpg",
      ai_feedback: "OK",
      comment: "Задача выполнена с опозданием. Время зафиксировано в 10:02:45",
    },
    {
      date: "2025-09-04 09:13:50",
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

// export default function EmployeeDetailPage() {
//   const [modalPhotoUrl, setModalPhotoUrl] = useState(null);

//   const handleOpenPhotoModal = (url) => {
//     setModalPhotoUrl(url);
//   };

//   const handleClosePhotoModal = () => {
//     setModalPhotoUrl(null);
//   };

//   return (
//     <div className={styles.pageContent}>
//       {/* Заголовок с именем */}
//       <PageTitle title={"Детали сотрудника"} />

//       <div className={styles.mainGrid}>
//         <EmployeeDetailsCard employee={employee} />

//         {/* 2. ПРАВАЯ КОЛОНКА: ИСТОРИЯ ДЕЙСТВИЙ */}
//         <div className={styles.historySection}>
//           <h2 className={styles.historyTitle}>История выполнения задач</h2>

//           <div className={styles.historyList}>
//             {employee.history.map((item, index) => (
//               <EmployeeHistoryItem
//                 key={index}
//                 item={item}
//                 onPhotoClick={handleOpenPhotoModal}
//               />
//             ))}
//             {/* Сообщение, если история пуста */}
//             {employee.history.length === 0 && (
//               <p className={styles.noHistory}>
//                 Действий сотрудника пока не зафиксировано.
//               </p>
//             )}
//           </div>
//         </div>
//         <ImageModal photoUrl={modalPhotoUrl} onClose={handleClosePhotoModal} />
//       </div>
//     </div>
//   );
// }

import React, { useState, useMemo } from "react"; // Импортируем useMemo
import { DateRange } from "react-date-range"; // ⭐️ Импортируем DateRange
import "react-date-range/dist/styles.css"; // Основные стили
import "react-date-range/dist/theme/default.css"; // Тема по умолчанию
import { Calendar, Trash2 } from "lucide-react"; // Иконка календаря
import { addDays } from "date-fns"; // Для инициализации диапазона

import styles from "./EmployeeDetailPage.module.scss";
import { ImageModal } from "../../ui/ImageModal/ImageModal";
import PageTitle from "../../components/PageTitle/PageTitle";
import EmployeeDetailsCard from "../../modules/EmployeeDetailsCard/EmployeeDetailsCard";
import { ru } from "date-fns/locale";

const INITIAL_RANGE = {
  startDate: addDays(new Date(), -7), // Последние 7 дней
  endDate: new Date(),
  key: "selection",
};

export default function EmployeeDetailPage() {
  const [modalPhotoUrl, setModalPhotoUrl] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const [dateRange, setDateRange] = useState([INITIAL_RANGE]);

  const handleOpenPhotoModal = (url) => {
    setModalPhotoUrl(url);
  };

  const handleClosePhotoModal = () => {
    setModalPhotoUrl(null);
  };

  const handleReset = () => {
    // Устанавливаем даты в null, чтобы сигнализировать об отсутствии фильтра
    setDateRange([{ startDate: null, endDate: null, key: "selection" }]);
    setShowCalendar(false);
  };

  const filteredHistory = useMemo(() => {
    const { startDate, endDate } = dateRange[0];

    // Если startDate === null, значит фильтр сброшен: показываем всю историю
    if (!startDate || !endDate) {
      return employee.history;
    }

    // Нормализация конечной даты (до конца дня)
    const endOfDay = addDays(endDate, 1);

    // Фильтруем
    return employee.history.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate && itemDate < endOfDay;
    });
  }, [employee.history, dateRange]);

  const rangeText = useMemo(() => {
    const { startDate, endDate } = dateRange[0];

    // Если даты null, показываем "Весь период"
    if (!startDate || !endDate) {
      return "Весь период";
    }

    return (
      startDate.toLocaleDateString("ru-RU") +
      " — " +
      endDate.toLocaleDateString("ru-RU")
    );
  }, [dateRange]);

  const isFilterActive = !!dateRange[0].startDate;

  return (
    <div className={styles.pageContent}>
      {/* Заголовок с именем */}
      <PageTitle title={"Детали сотрудника"} />

      <div className={styles.mainGrid}>
        <EmployeeDetailsCard employee={employee} />

        {/* 2. ПРАВАЯ КОЛОНКА: ИСТОРИЯ ДЕЙСТВИЙ */}
        <div className={styles.historySection}>
          <div className={styles.historyHeader}>
            <h2 className={styles.historyTitle}>История выполнения задач</h2>

            {/* ⭐️ КНОПКА КАЛЕНДАРЯ */}
            <div className={styles.calendarControls}>
              <div className={styles.filterButtonWrapper}>
                {/* Кнопка сброса видна, только если фильтр активен */}
                {isFilterActive && (
                  <button
                    className={styles.resetButton}
                    onClick={handleReset}
                    title="Сбросить фильтр"
                  >
                    <Trash2 size={18} />
                  </button>
                )}

                <button
                  className={`${styles.filterButton} ${
                    isFilterActive ? styles.active : ""
                  }`}
                  onClick={() => setShowCalendar(!showCalendar)}
                >
                  <Calendar size={18} />
                  <span>{rangeText}</span>
                </button>
              </div>

              {/* ⭐️ МОДАЛКА КАЛЕНДАРЯ */}
              {showCalendar && (
                <div className={styles.calendarModal}>
                  <DateRange
                    editableDateInputs={true}
                    onChange={(item) => setDateRange([item.selection])}
                    moveRangeOnFirstSelection={false}
                    ranges={dateRange.map((r) => ({
                      // Используем Date() для null-дат, чтобы DateRange не сломался в UI,
                      // но фактическое управление фильтром происходит через логику useMemo.
                      startDate: r.startDate || INITIAL_RANGE.startDate,
                      endDate: r.endDate || INITIAL_RANGE.endDate,
                      key: r.key,
                    }))}
                    direction="vertical"
                    locale={ru}
                    maxDate={new Date()}
                  />
                  <button
                    className={styles.applyFilterButton}
                    onClick={() => setShowCalendar(false)}
                  >
                    Применить и Закрыть
                  </button>
                  {/* Кнопка Сброс в модальном окне */}
                  <button
                    className={styles.resetFilterButton} // Новый стиль
                    onClick={handleReset}
                  >
                    Сбросить фильтр
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className={styles.historyList}>
            {filteredHistory.map(
              (
                item,
                index // ⭐️ ИСПОЛЬЗУЕМ ОТФИЛЬТРОВАННЫЕ ДАННЫЕ
              ) => (
                <EmployeeHistoryItem
                  key={index}
                  item={item}
                  onPhotoClick={handleOpenPhotoModal}
                />
              )
            )}
            {/* Сообщение, если история пуста */}
            {filteredHistory.length === 0 && (
              <p className={styles.noHistory}>
                Действий сотрудника не найдено в выбранном диапазоне.
              </p>
            )}
          </div>
        </div>
        <ImageModal photoUrl={modalPhotoUrl} onClose={handleClosePhotoModal} />
      </div>
    </div>
  );
}
