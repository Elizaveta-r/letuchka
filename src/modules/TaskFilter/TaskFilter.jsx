import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { formatDataForSelect } from "../../utils/methods/formatDataForSelect";
import {
  resetTaskFilters,
  areTaskFiltersChanged,
  setSort,
  setTaskFilter,
} from "../../store/slices/tasksSlice";

import styles from "./TaskFilter.module.scss";
import { SearchInput } from "../../ui/SearchInput/SearchInput";
import CustomSelect from "../../ui/CustomSelect/CustomSelect";
import {
  ArrowDownAZ,
  ArrowDownWideNarrow,
  ArrowUpAZ,
  ArrowUpNarrowWide,
  Calendar,
  ChevronDown,
  Clock,
} from "lucide-react";

const sortOptions = [
  { value: "name_asc", label: "Название А-Я", key: "name", order: "asc" },
  { value: "name_desc", label: "Название Я-А", key: "name", order: "desc" },
  {
    value: "time_asc",
    label: "Время начала ↑",
    key: "start_time",
    order: "asc",
  },
  {
    value: "time_desc",
    label: "Время начала ↓",
    key: "start_time",
    order: "desc",
  },
];

export const TaskFilter = () => {
  const dispatch = useDispatch();

  const { positions } = useSelector((state) => state?.positions);
  const { departments } = useSelector((state) => state?.departments);
  const { taskFilters, sort } = useSelector((state) => state?.tasks);

  const filtersAreActive = useSelector(areTaskFiltersChanged);

  const { searchText, department_id, position_id } = taskFilters;

  const currentSortOption = sortOptions.find(
    (opt) => opt.key === sort.key && opt.order === sort.order
  );

  const positionsOptions = useMemo(
    () => formatDataForSelect(positions || []),
    [positions]
  );

  const departmentsOptions = useMemo(
    () => formatDataForSelect(departments || []),
    [departments]
  );

  const handleSortChange = (selectedOption) => {
    dispatch(
      setSort({
        key: selectedOption.key,
        order: selectedOption.order,
      })
    );
  };
  const handleSearchChange = (e) => {
    dispatch(
      setTaskFilter({
        key: "searchText",
        value: e.target.value,
      })
    );
  };

  const handleSelectChange = (key, selectedOption) => {
    dispatch(
      setTaskFilter({
        key: key,
        value: selectedOption,
      })
    );
  };

  return (
    <div className={styles.filters}>
      <SearchInput
        placeholder={"Поиск по задачам..."}
        value={searchText}
        onChange={handleSearchChange}
      />
      <CustomSelect
        onChange={(selectedOption) =>
          handleSelectChange("position_id", selectedOption)
        }
        value={position_id}
        options={positionsOptions}
        placeholder="Выберите должность"
      />
      <CustomSelect
        options={departmentsOptions}
        placeholder="Выберите отдел"
        value={department_id}
        onChange={(selectedOption) =>
          handleSelectChange("department_id", selectedOption)
        }
      />

      <Sorting
        value={currentSortOption}
        options={sortOptions}
        onChange={handleSortChange}
      />

      {filtersAreActive && (
        <button
          className={styles.clearFiltersBtn}
          onClick={() => dispatch(resetTaskFilters())}
        >
          Очистить фильтры
        </button>
      )}
    </div>
  );
};

const getSortIcon = (key, order) => {
  // В зависимости от ключа, выбираем тип иконки
  switch (key) {
    case "name":
      return order === "asc" ? ArrowDownAZ : ArrowUpAZ;
    case "start_time":
    case "deadline_time":
      return order === "asc" ? Clock : Calendar; // Пример: часы для времени
    case "custom_field":
      return order === "asc" ? ArrowDownWideNarrow : ArrowUpNarrowWide; // Пример: для пользовательских полей
    default:
      return ArrowDownAZ;
  }
};
const Sorting = ({ value, options, onChange }) => {
  const sortRef = useRef(null);
  const [visibleOptions, setVisibleOptions] = useState(false);

  const handleToggle = () => {
    setVisibleOptions(!visibleOptions);
  };

  const handleOptionClick = (option) => {
    onChange(option);
    setVisibleOptions(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setVisibleOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 💡 Определяем текущую иконку для отображения в заголовке
  const CurrentIcon = value?.key
    ? getSortIcon(value.key, value.order)
    : ArrowDownAZ;

  return (
    <div className={styles.sort} ref={sortRef}>
      <div className={styles.sortHeader} onClick={handleToggle}>
        {/* 💡 Отображаем ТОЛЬКО иконку текущего типа сортировки */}
        <CurrentIcon size={18} className={styles.sortIcon} />
      </div>

      {visibleOptions && (
        <div className={styles.sortOptions}>
          {options?.map((option) => (
            <p
              onClick={() => handleOptionClick(option)}
              key={`${option.key}-${option.order}`}
              className={styles.option}
            >
              {/* Отображаем полный текст опции */}
              {option.label}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};
