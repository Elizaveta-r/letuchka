import React, { useState, useMemo, useEffect } from "react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { Calendar, Trash2 } from "lucide-react";

import styles from "./EmployeeDetailPage.module.scss";
import { ImageModal } from "../../ui/ImageModal/ImageModal";
import PageTitle from "../../components/PageTitle/PageTitle";
import EmployeeDetailsCard from "../../modules/EmployeeDetailsCard/EmployeeDetailsCard";
import { ru } from "date-fns/locale";
import EmployeeHistoryItem from "../../components/EmployeeHistoeyIrem/EmployeeHistoryItem";
import { useDispatch, useSelector } from "react-redux";
import { setLoadingGetEmployee } from "../../store/slices/employeesSlice";
import { getEmployeeWithHistory } from "../../utils/api/actions/employees";
import { useParams } from "react-router-dom";
import { RingLoader } from "react-spinners";

// const INITIAL_RANGE = {
//   startDate: addDays(new Date(), -7),
//   endDate: new Date(),
//   key: "selection",
// };

const INITIAL_RANGE = {
  startDate: new Date(),
  endDate: new Date(),
  key: "selection",
};

const formatDateLocal = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const normalizeDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// const history = [
//   {
//     date: "2025-10-08 09:05:00",
//     task_title: "Прием рабочего места в начале смены",
//     task_acceptance_criteria:
//       "Рабочее место должно быть чистым, инструменты дезинфицированы.",
//     status: "done",
//     is_photo_required: true,
//     photo_url:
//       "https://api.telegram.org/file/bot8437135255:AAEQ3vDc8HKtvyD9n9fb3E21CXxH_Tuh8G0/photos/file_1760.jpg",
//     ai_feedback: "OK",
//     comment: "",
//     checkedIn: true,
//   },
//   {
//     date: "2025-10-07 15:30:00",
//     task_title: "Чистота мойки (Дневная проверка)",
//     task_acceptance_criteria:
//       "Мойка должна быть чистой, свободной от остатков пищи и загрязнений.",
//     status: "overdue", // ❌ Провал/Просрочка
//     is_photo_required: true,
//     photo_url:
//       "https://api.telegram.org/file/bot8437135255:AAEQ3vDc8HKtvyD9n9fb3E21CXxH_Tuh8G0/photos/file_1782.jpg",
//     ai_feedback:
//       "❌ На фото отсутствует мойка. Рекомендации: Сделайте фото мойки на кухне, демонстрируя её чистоту.",
//     comment: "Забыл сфотографировать мойку, исправлю.",
//     checkedIn: true,
//   },
//   {
//     date: "2025-10-06 09:13:50",
//     task_title: "Подготовка зоны выдачи",
//     task_acceptance_criteria:
//       "Проверка чистоты зоны выдачи, наличие салфеток, специй и соответствие выкладки стандартам.",
//     status: "done",
//     is_photo_required: true,
//     photo_url:
//       "https://api.telegram.org/file/bot8437135255:AAEQ3vDc8HKtvyD9n9fb3E21CXxH_Tuh8G0/photos/file_1762.jpg",
//     ai_feedback: "OK",
//     comment: "",
//     checkedIn: true,
//   },
//   {
//     date: "2025-10-05 08:50:00",
//     task_title: "Комментарии приемки рабочего места от прошлой смены",
//     task_acceptance_criteria:
//       "Проверка чистоты зоны выдачи, наличие салфеток, специй и соответствие выкладки стандартам.",
//     status: "done",
//     is_photo_required: false,
//     photo_url: "",
//     ai_feedback: "",
//     checkedIn: false,
//     comment: "Быстро проверил, место в порядке. Все заготовки на месте.",
//   },
//   {
//     checkedIn: false,
//     date: "2025-10-04 18:00:00",
//     task_title: "Сдача смены (Уборка)",
//     task_acceptance_criteria:
//       "Полная уборка рабочего места, дезинфекция поверхностей, замена мусорных пакетов.",
//     status: "done_late", // 🟡 Задержка
//     is_photo_required: true,
//     photo_url:
//       "https://api.telegram.org/file/bot8437135255:AAEQ3vDc8HKtvyD9n9fb3E21CXxH_Tuh8G0/photos/file_1800.jpg",
//     ai_feedback: "OK",
//     comment:
//       "Пришлось задержаться на 15 минут из-за срочного заказа. Сдал в 18:15:22.",
//   },
// ];

export default function EmployeeDetailPage() {
  const dispatch = useDispatch();

  const { id } = useParams();

  const { employee, loadingGetEmployee } = useSelector(
    (state) => state?.employees
  );

  const history = employee?.history;

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
    dispatch(
      getEmployeeWithHistory(
        id,
        1,
        1000,
        formatDateLocal(tempDateRange[0].startDate),
        formatDateLocal(tempDateRange[0].endDate)
      )
    ).then((res) => {
      if (res.status === 200) {
        setDateRange(tempDateRange);
        setShowCalendar(false);
      }
    });
  };

  const handleReset = () => {
    dispatch(getEmployeeWithHistory(id, 1, 1000)).then((res) => {
      if (res.status === 200) {
        setDateRange([{ startDate: null, endDate: null, key: "selection" }]);
        setShowCalendar(false);
      }
    });
  };

  const filteredHistory = useMemo(() => {
    if (!history) return [];

    const { startDate, endDate } = dateRange[0];

    const parsed = history.map((item) => {
      const dateTimeStr = `${item.done_date}T${item.done_time}:00`;
      return {
        ...item,
        _parsedDate: new Date(dateTimeStr),
      };
    });

    const filtered =
      startDate && endDate
        ? parsed.filter((i) => {
            const d = normalizeDate(i._parsedDate);
            return d >= normalizeDate(startDate) && d <= normalizeDate(endDate);
          })
        : parsed;

    // сортировка по дате (сначала новые)
    return filtered.sort((a, b) => b._parsedDate - a._parsedDate);
  }, [dateRange, history]);

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
    dispatch(setLoadingGetEmployee(""));

    if (!employee || employee?.history?.length === 0) {
      dispatch(getEmployeeWithHistory(id, 1, 1000));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, id]);

  useEffect(() => {
    if (showCalendar) {
      setTempDateRange(dateRange);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCalendar]);

  useEffect(() => {
    dispatch(getEmployeeWithHistory(id, 1, 1000));
  }, [dispatch, id]);

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
                    {loadingGetEmployee ? (
                      <RingLoader size={18} />
                    ) : (
                      <Trash2 size={18} />
                    )}
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
                    color="#16a34a"
                    maxDate={new Date()}
                  />
                  <button
                    className={styles.applyFilterButton}
                    onClick={handleApplyDateFilter}
                    disabled={loadingGetEmployee}
                  >
                    {loadingGetEmployee && (
                      <RingLoader color="white" size={12} />
                    )}
                    {loadingGetEmployee ? "Загрузка..." : "Применить и Закрыть"}
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
            {filteredHistory?.map((item, index) => (
              <EmployeeHistoryItem
                key={index}
                item={item}
                timezone={employee?.timezone}
                onPhotoClick={handleOpenPhotoModal}
              />
            ))}
            {filteredHistory?.length === 0 && (
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
