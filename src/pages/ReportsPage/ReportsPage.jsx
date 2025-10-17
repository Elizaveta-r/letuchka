import { useEffect, useMemo, useState } from "react";
import EmployeeHistoryItem from "../../components/EmployeeHistoeyIrem/EmployeeHistoryItem";
import PageTitle from "../../components/PageTitle/PageTitle";
import { ImageModal } from "../../ui/ImageModal/ImageModal";
import styles from "./ReportsPage.module.scss";
import { ru } from "date-fns/locale";
import { DateRange } from "react-date-range";
import { X, Calendar } from "lucide-react";
import { addDays } from "date-fns";
import CustomSelect from "../../ui/CustomSelect/CustomSelect";

const employees = [
  {
    id: 1,
    name: "Иван Иванов",
    position: "Frontend разработчик",
    // 💡 История: Надежный сотрудник, но был один серьезный провал.
    history: [
      {
        date: "2025-10-08 09:05:00",
        task_title: "Прием рабочего места в начале смены",
        task_acceptance_criteria:
          "Рабочее место должно быть чистым, инструменты дезинфицированы.",
        status: "done",
        is_photo_required: true,
        photo_url:
          "https://api.telegram.org/file/bot8437135255:AAEQ3vDc8HKtvyD9n9fb3E21CXxH_Tuh8G0/photos/file_1760.jpg",
        ai_feedback: "OK",
        comment: "",
      },
      {
        date: "2025-10-07 15:30:00",
        task_title: "Чистота мойки (Дневная проверка)",
        task_acceptance_criteria:
          "Мойка должна быть чистой, свободной от остатков пищи и загрязнений.",
        status: "overdue", // ❌ Провал/Просрочка
        is_photo_required: true,
        photo_url:
          "https://api.telegram.org/file/bot8437135255:AAEQ3vDc8HKtvyD9n9fb3E21CXxH_Tuh8G0/photos/file_1782.jpg",
        ai_feedback:
          "❌ На фото отсутствует мойка. Рекомендации: Сделайте фото мойки на кухне, демонстрируя её чистоту.",
        comment: "Забыл сфотографировать мойку, исправлю.",
      },
      {
        date: "2025-10-06 09:13:50",
        task_title: "Подготовка зоны выдачи",
        task_acceptance_criteria:
          "Проверка чистоты зоны выдачи, наличие салфеток, специй и соответствие выкладки стандартам.",
        status: "done",
        is_photo_required: true,
        photo_url:
          "https://api.telegram.org/file/bot8437135255:AAEQ3vDc8HKtvyD9n9fb3E21CXxH_Tuh8G0/photos/file_1762.jpg",
        ai_feedback: "OK",
        comment: "",
      },
      {
        date: "2025-10-05 08:50:00",
        task_title: "Комментарии приемки рабочего места от прошлой смены",
        task_acceptance_criteria:
          "Проверка чистоты зоны выдачи, наличие салфеток, специй и соответствие выкладки стандартам.",
        status: "done",
        is_photo_required: false,
        photo_url: "",
        ai_feedback: "",
        comment: "Быстро проверил, место в порядке. Все заготовки на месте.",
      },
      {
        date: "2025-10-04 18:00:00",
        task_title: "Сдача смены (Уборка)",
        task_acceptance_criteria:
          "Полная уборка рабочего места, дезинфекция поверхностей, замена мусорных пакетов.",
        status: "done_late", // 🟡 Задержка
        is_photo_required: true,
        photo_url:
          "https://api.telegram.org/file/bot8437135255:AAEQ3vDc8HKtvyD9n9fb3E21CXxH_Tuh8G0/photos/file_1800.jpg",
        ai_feedback: "OK",
        comment:
          "Пришлось задержаться на 15 минут из-за срочного заказа. Сдал в 18:15:22.",
      },
    ],
  },
  {
    id: 2,
    name: "Петр Петров",
    position: "Backend разработчик",
    // 💡 История: Много задержек, частые опоздания по дедлайнам.
    history: [
      {
        date: "2025-10-08 09:30:00",
        task_title: "Прием рабочего места в начале смены",
        task_acceptance_criteria:
          "Рабочее место должно быть чистым, инструменты дезинфицированы.",
        status: "done_late", // 🟡 Задержка
        is_photo_required: true,
        photo_url:
          "https://api.telegram.org/file/bot8437135255:AAEQ3vDc8HKtvyD9n9fb3E21CXxH_Tuh8G0/photos/file_1761.jpg",
        ai_feedback: "OK",
        comment: "Опоздал на 20 минут. Начал работу в 09:30:05.",
      },
      {
        date: "2025-10-07 10:00:00",
        task_title: "Подготовка зоны выдачи",
        task_acceptance_criteria:
          "Проверка чистоты зоны выдачи, наличие салфеток, специй и соответствие выкладки стандартам.",
        status: "done_late", // 🟡 Задержка
        is_photo_required: true,
        photo_url:
          "https://api.telegram.org/file/bot8437135255:AAEQ3vDc8HKtvyD9n9fb3E21CXxH_Tuh8G0/photos/file_1763.jpg",
        ai_feedback: "OK",
        comment: "Занят был другой задачей, сдал с опозданием в 10:05:40.",
      },
      {
        date: "2025-10-06 09:00:00",
        task_title: "Комментарии приемки рабочего места от прошлой смены",
        task_acceptance_criteria:
          "Оценить состояние чистоты и оставить комментарий.",
        status: "overdue", // 🔴 Провал/Просрочка
        is_photo_required: false,
        photo_url: "",
        ai_feedback: "",
        comment: "Отчет не сдан. Задача просрочена.",
      },
      {
        date: "2025-10-05 16:30:00",
        task_title: "Чистота холодильника (Плановая)",
        task_acceptance_criteria:
          "Все продукты маркированы, нет просрочки, полки чистые.",
        status: "done",
        is_photo_required: true,
        photo_url:
          "https://api.telegram.org/file/bot8437135255:AAEQ3vDc8HKtvyD9n9fb3E21CXxH_Tuh8G0/photos/file_1785.jpg",
        ai_feedback: "OK",
        comment: "Проверка прошла успешно.",
      },
    ],
  },
  {
    id: 3,
    name: "Сидор Сидоров",
    position: "Тестировщик",
    // 💡 История: Много провалов по качеству фото, но вовремя.
    history: [
      {
        date: "2025-10-08 09:15:00",
        task_title: "Прием рабочего места в начале смены",
        task_acceptance_criteria:
          "Рабочее место должно быть чистым, инструменты дезинфицированы.",
        status: "done",
        is_photo_required: true,
        photo_url:
          "https://api.telegram.org/file/bot8437135255:AAEQ3vDc8HKtvyD9n9fb3E21CXxH_Tuh8G0/photos/file_1762.jpg",
        ai_feedback: "OK",
        comment: "Все отлично, начал вовремя.",
      },
      {
        date: "2025-10-07 11:30:00",
        task_title: "Чистота мойки",
        task_acceptance_criteria:
          "Мойка должна быть всегда чистой, без остатков пищи.",
        status: "done_late",
        is_photo_required: true,
        photo_url:
          "https://api.telegram.org/file/bot8437135255:AAEQ3vDc8HKtvyD9n9fb3E21CXxH_Tuh8G0/photos/file_1783.jpg",
        ai_feedback: "OK",
        comment: "Сдано в 11:35:00. Небольшое опоздание.",
      },
      {
        date: "2025-10-06 14:00:00",
        task_title: "Контроль температурного режима",
        task_acceptance_criteria:
          "Все холодильники и морозильники должны быть в пределах нормы.",
        status: "overdue", // 🔴 Провал/Просрочка
        is_photo_required: true,
        photo_url:
          "https://api.telegram.org/file/bot8437135255:AAEQ3vDc8HKtvyD9n9fb3E21CXxH_Tuh8G0/photos/file_1784.jpg",
        ai_feedback:
          "❌ На фото видны только показания одного холодильника. Рекомендации: Сделайте общий кадр, подтверждающий контроль всех зон.",
        comment: "Задание провалено из-за неполного фотоотчета.",
      },
      {
        date: "2025-10-05 09:00:00",
        task_title: "Комментарии приемки рабочего места от прошлой смены",
        task_acceptance_criteria:
          "Оценить состояние чистоты и оставить комментарий.",
        status: "done",
        is_photo_required: false,
        photo_url: "",
        ai_feedback: "",
        comment: "Место принял, все хорошо. Оставил замечание по вытяжке.",
      },
      {
        date: "2025-10-04 12:00:00",
        task_title: "Заполнение чек-листа по HACCP",
        task_acceptance_criteria: "Чек-лист заполнен полностью и без ошибок.",
        status: "done",
        is_photo_required: false,
        photo_url: "",
        ai_feedback: "OK",
        comment: "",
      },
    ],
  },
];

const getTodayRange = () => [
  {
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  },
];

const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  return date1.toDateString() === date2.toDateString();
};

const INITIAL_RANGE = getTodayRange();
const DEFAULT_EMPLOYEE_ID = 0;

export default function ReportsPage() {
  const [modalPhotoUrl, setModalPhotoUrl] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const [selectedEmployeeId, setSelectedEmployeeId] =
    useState(DEFAULT_EMPLOYEE_ID);
  const [dateRange, setDateRange] = useState(INITIAL_RANGE);
  const [tempDateRange, setTempDateRange] = useState(INITIAL_RANGE);

  const handleEmployeeChange = (selectedOption) => {
    const newId = selectedOption ? selectedOption.value : DEFAULT_EMPLOYEE_ID;
    setSelectedEmployeeId(newId);
  };

  const employeeOptions = useMemo(() => {
    const options = employees?.map((employee) => ({
      value: employee?.id,
      label: employee?.name,
    }));
    // Добавляем опцию "Все сотрудники" в начало
    options.unshift({ value: DEFAULT_EMPLOYEE_ID, label: "Все сотрудники" });
    return options;
  }, [employees]);

  // ⭐️ 2. ПОЛУЧАЕМ ТЕКУЩЕЕ ЗНАЧЕНИЕ ДЛЯ SELECT (объект {value, label})
  const currentEmployeeValue = useMemo(() => {
    return (
      employeeOptions.find((opt) => opt.value === selectedEmployeeId) || null
    );
  }, [selectedEmployeeId, employeeOptions]);

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
    setDateRange(getTodayRange());
    setShowCalendar(false);
  };

  const handleDateReset = () => {
    setDateRange(INITIAL_RANGE);
    setShowCalendar(false);
  };

  const filteredEmployees = useMemo(() => {
    let employeesToDisplay = [];
    const { startDate, endDate } = dateRange[0];

    // Шаг 1: Фильтрация по выбранному сотруднику
    if (selectedEmployeeId === DEFAULT_EMPLOYEE_ID) {
      employeesToDisplay = employees;
    } else {
      const employee = employees.find((emp) => emp.id === selectedEmployeeId);
      if (employee) {
        employeesToDisplay = [employee];
      }
    }

    // Шаг 2: Фильтрация истории по дате
    return employeesToDisplay
      ?.map((employee) => {
        let filteredHistory = employee.history;

        if (startDate && endDate) {
          // Нормализация конечной даты до 23:59:59 текущего дня
          const endOfDay = addDays(endDate, 1);

          filteredHistory = employee?.history?.filter((item) => {
            const itemDate = new Date(item.date);
            // Используем isWithinInterval для надежной проверки
            return itemDate >= startDate && itemDate < endOfDay;
          });
        }

        // Сортируем историю внутри сотрудника по убыванию даты
        filteredHistory?.sort((a, b) => new Date(b.date) - new Date(a.date));

        return {
          ...employee,
          history: filteredHistory,
        };
      })
      ?.filter((employee) => employee.history.length > 0); // Убираем сотрудников, у которых не осталось задач после фильтрации
  }, [employees, selectedEmployeeId, dateRange]);

  // Форматирование текста для кнопки даты
  const rangeText = useMemo(() => {
    const { startDate, endDate } = dateRange[0];

    // Если обе даты null (хотя при новой логике это почти невозможно)
    if (!startDate && !endDate) {
      return "Весь период";
    }

    // Если это одна и та же дата (Сегодня или любой другой один день)
    if (
      startDate &&
      endDate &&
      startDate.toDateString() === endDate.toDateString()
    ) {
      const today = new Date();
      // Если это сегодня, показываем "Сегодня"
      if (startDate.toDateString() === today.toDateString()) {
        return "Сегодня";
      }
      // Если это любой другой один день
      return startDate.toLocaleDateString("ru-RU");
    }

    // Диапазон
    if (startDate && endDate) {
      return (
        startDate.toLocaleDateString("ru-RU") +
        " — " +
        endDate.toLocaleDateString("ru-RU")
      );
    }

    return "Выберите период";
  }, [dateRange]);

  const isDateFilterActive = useMemo(() => {
    const { startDate, endDate } = dateRange[0];
    const today = new Date();

    // Проверяем, совпадает ли выбранный диапазон с диапазоном "Сегодня - Сегодня"
    const isDefaultTodayRange =
      isSameDay(startDate, today) && isSameDay(endDate, today);

    // Фильтр активен, если это НЕ дефолтный диапазон (isDefaultTodayRange == false)
    return !isDefaultTodayRange;
  }, [dateRange]);

  useEffect(() => {
    if (showCalendar) {
      // Копируем текущий примененный диапазон во временный при открытии модального окна
      setTempDateRange(dateRange);
    }
  }, [showCalendar]);

  return (
    <div className={styles.container}>
      <PageTitle
        title={"Отчеты по сотрудникам"}
        hasButton
        buttonTitle="Запросить отчет"
      />

      <div className={styles.filterBar}>
        {/* ФИЛЬТР ПО СОТРУДНИКУ (SELECT) */}
        <CustomSelect
          value={currentEmployeeValue}
          options={employeeOptions}
          onChange={handleEmployeeChange}
          placeholder="Выберите сотрудника"
          displayFormat="dd.MM.yyyy"
        />
        {/* ФИЛЬТР ПО ДАТЕ (DateRange) */}
        <div className={styles.calendarControls}>
          <button
            className={styles.filterButton}
            onClick={() => setShowCalendar(!showCalendar)}
          >
            <Calendar size={18} />
            <span>{rangeText}</span>
          </button>

          {isDateFilterActive && (
            <button
              className={styles.resetDateButton}
              onClick={handleDateReset}
              title="Сбросить фильтр даты"
            >
              <X size={16} />
            </button>
          )}

          {/* Модальное окно календаря */}
          {showCalendar && (
            <div className={styles.calendarModal}>
              <DateRange
                editableDateInputs={true}
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

      <div className={styles.employeesContainer}>
        {filteredEmployees?.length > 0 ? (
          filteredEmployees?.map((employee) => (
            // ⭐️ Возвращаемся к циклу по сотрудникам
            <div className={styles.employees} key={employee.id}>
              {/* ⭐️ Заголовок ФИО: */}
              <p className={styles.title}>{employee.name}:</p>
              <div className={styles.employeeGrid}>
                {employee.history.length > 0 ? (
                  employee.history.map((history, index) => (
                    <EmployeeHistoryItem
                      key={`${employee.id}-${history.date}-${index}`}
                      item={history}
                      onPhotoClick={handleOpenPhotoModal}
                    />
                  ))
                ) : (
                  // Если у сотрудника нет истории в диапазоне (но сам сотрудник выбран)
                  <p className={styles.noData}>
                    Задач не найдено в выбранном диапазоне.
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          // Если ни один сотрудник не прошел фильтр или нет данных
          <p className={styles.noData}>
            Задач не найдено по вашим критериям фильтрации.
          </p>
        )}
      </div>
      <ImageModal photoUrl={modalPhotoUrl} onClose={handleClosePhotoModal} />
    </div>
  );
}
