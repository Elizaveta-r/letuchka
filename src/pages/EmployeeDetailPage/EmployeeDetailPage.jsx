import React, { useState, useMemo, useEffect } from "react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { Calendar, Trash2 } from "lucide-react";
import { addDays } from "date-fns";

import styles from "./EmployeeDetailPage.module.scss";
import { ImageModal } from "../../ui/ImageModal/ImageModal";
import PageTitle from "../../components/PageTitle/PageTitle";
import EmployeeDetailsCard from "../../modules/EmployeeDetailsCard/EmployeeDetailsCard";
import { ru } from "date-fns/locale";
import EmployeeHistoryItem from "../../components/EmployeeHistoeyIrem/EmployeeHistoryItem";

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
      date: "2025-10-04 09:11:53",
      task_title: "Прием рабочего места в начале смены",
      task_acceptance_criteria:
        "Рабочее место повара должно быть организовано так, чтобы все поверхности, инструменты и посуда были чистыми и продезинфицированными, продукты и сырые ингредиенты разделялись, мусор удалялся своевременно, а повар соблюдал личную гигиену и носил чистую форму.",
      status: "done",
      is_photo_required: true,
      photo_url:
        "https://api.telegram.org/file/bot8437135255:AAEQ3vDc8HKtvyD9n9fb3E21CXxH_Tuh8G0/photos/file_1760.jpg",
      ai_feedback: "OK",
      comment: "",
    },
    {
      date: "2025-10-05 09:11:53",
      task_title: "Чистота мойки",
      task_acceptance_criteria:
        "Мойка на кухне должна быть всегда чистой, свободной от остатков пищи и загрязнений, с регулярной дезинфекцией после каждого использования.",
      status: "done_late",
      is_photo_required: true,
      photo_url:
        "https://api.telegram.org/file/bot8437135255:AAEQ3vDc8HKtvyD9n9fb3E21CXxH_Tuh8G0/photos/file_1762.jpg",
      ai_feedback: "OK",
      comment: "Задача выполнена с опозданием. В 21:04:26",
    },
    {
      date: "2025-10-06 09:13:50",
      task_title: "Подготовка зоны выдачи",
      task_acceptance_criteria:
        "Проверка чистоты зоны выдачи, наличие салфеток, специй и соответствие выкладки стандартам.",
      status: "overdue",
      photo_url: "",
      is_photo_required: true,
      ai_feedback: "Отсутствует фотография обязательного элемента в кадре.",
      comment: "",
    },
    {
      date: "2025-10-03 09:00:00",
      task_title: "Комментарии приемки рабочего места от прошлой смены",
      task_acceptance_criteria:
        "Проверка чистоты зоны выдачи, наличие салфеток, специй и соответствие выкладки стандартам.",
      status: "done",
      photo_url: "",
      is_photo_required: false,
      ai_feedback: "",
      comment: "Все чисто, заготовки есть",
    },
    {
      date: "2025-10-03 09:00:00",
      task_title: "Чистота мойки",
      task_acceptance_criteria:
        "Мойка на кухне должна быть всегда чистой, свободной от остатков пищи и загрязнений, с регулярной дезинфекцией после каждого использования.",
      status: "overdue",
      photo_url:
        "https://api.telegram.org/file/bot8437135255:AAEQ3vDc8HKtvyD9n9fb3E21CXxH_Tuh8G0/photos/file_1782.jpg",
      is_photo_required: true,
      ai_feedback:
        "❌ На фото отсутствует мойка. Рекомендации: Сделайте фото мойки на кухне, демонстрируя её чистоту и отсутствие остатков пищи и загрязнений.",
      comment: "",
    },
  ],
};

const INITIAL_RANGE = {
  startDate: addDays(new Date(), -7),
  endDate: new Date(),
  key: "selection",
};

export default function EmployeeDetailPage() {
  const [modalPhotoUrl, setModalPhotoUrl] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const [dateRange, setDateRange] = useState([INITIAL_RANGE]);
  const [tempDateRange, setTempDateRange] = useState([INITIAL_RANGE]);

  const handleOpenPhotoModal = (url) => {
    setModalPhotoUrl(url);
  };

  const handleClosePhotoModal = () => {
    setModalPhotoUrl(null);
  };

  const handleApplyDateFilter = () => {
    setDateRange(tempDateRange);
    setShowCalendar(false);
  };

  const handleReset = () => {
    setDateRange([{ startDate: null, endDate: null, key: "selection" }]);
    setShowCalendar(false);
  };

  const filteredHistory = useMemo(() => {
    const { startDate, endDate } = dateRange[0];

    if (!startDate || !endDate) {
      return employee.history;
    }

    const endOfDay = addDays(endDate, 1);

    return employee.history.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate && itemDate < endOfDay;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employee.history, dateRange]);

  const rangeText = useMemo(() => {
    const { startDate, endDate } = dateRange[0];

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

  useEffect(() => {
    if (showCalendar) {
      // Копируем текущий примененный диапазон во временный при открытии модального окна
      setTempDateRange(dateRange);
    }
  }, [showCalendar]);

  return (
    <div className={styles.pageContent}>
      <PageTitle title={"Детали сотрудника"} />

      <div className={styles.mainGrid}>
        <EmployeeDetailsCard employee={employee} />

        {/* 2. ПРАВАЯ КОЛОНКА: ИСТОРИЯ ДЕЙСТВИЙ */}
        <div className={styles.historySection}>
          <div className={styles.historyHeader}>
            <h2 className={styles.historyTitle}>История выполнения задач</h2>

            {/* КНОПКА КАЛЕНДАРЯ */}
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

              {/* МОДАЛКА КАЛЕНДАРЯ */}
              {showCalendar && (
                <div className={styles.calendarModal}>
                  <DateRange
                    editableDateInputs={false}
                    onChange={(item) => setTempDateRange([item.selection])}
                    moveRangeOnFirstSelection={false}
                    ranges={tempDateRange}
                    direction="vertical"
                    locale={ru}
                    maxDate={new Date()}
                  />
                  <button
                    className={styles.applyFilterButton}
                    onClick={handleApplyDateFilter}
                  >
                    Применить и Закрыть
                  </button>
                  <button
                    className={styles.resetFilterButton}
                    onClick={handleReset}
                  >
                    Сбросить фильтр
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className={styles.historyList}>
            {filteredHistory.map((item, index) => (
              <EmployeeHistoryItem
                key={index}
                item={item}
                onPhotoClick={handleOpenPhotoModal}
              />
            ))}
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
