import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { formatDataForSelect } from "../../utils/methods/formatDataForSelect";
import {
  resetTaskFilters,
  areTaskFiltersChanged,
  // setSort,
  setTaskFilter,
  setViewMode,
} from "../../store/slices/tasksSlice";

import styles from "./TaskFilter.module.scss";
import { SearchInput } from "../../ui/SearchInput/SearchInput";
import CustomSelect from "../../ui/CustomSelect/CustomSelect";
import { ArrowDownAZ, Eye, Filter, LayoutGrid, LayoutList } from "lucide-react";
import { HintWithPortal } from "../../ui/HintWithPortal/HintWithPortal";
import { useMediaQuery } from "react-responsive";
import { Button } from "../../ui/Button/Button";

// const sortOptions = [
//   { value: "name_asc", label: "Название А-Я", key: "name", order: "asc" },
//   { value: "name_desc", label: "Название Я-А", key: "name", order: "desc" },
//   {
//     value: "time_asc",
//     label: "Время начала ↑",
//     key: "start_time",
//     order: "asc",
//   },
//   {
//     value: "time_desc",
//     label: "Время начала ↓",
//     key: "start_time",
//     order: "desc",
//   },
// ];

const viewOptions = [
  {
    value: "full",
    label: "Стандартное отображение",
    icon: <LayoutList size={12} />,
  },
  {
    value: "short",
    label: "Упрощённое отображение",
    icon: <LayoutGrid size={12} />,
  },
];

export const TaskFilter = () => {
  const dispatch = useDispatch();

  const isBigScreen = useMediaQuery({
    query: "(min-width: 1331px)",
  });

  const isTablet = useMediaQuery({
    query: "(max-width: 767px)",
  });

  const isSmallDesktop = useMediaQuery({
    query: "(max-width: 1330px)",
  });

  const isMobile = useMediaQuery({
    query: "(max-width: 479px)",
  });

  const isSmallMobile = useMediaQuery({
    query: "(max-width: 369px)",
  });

  const { positions } = useSelector((state) => state?.positions);
  const { departments } = useSelector((state) => state?.departments);
  const { taskFilters, viewMode /* sort */ } = useSelector(
    (state) => state?.tasks
  );

  const [visibleAllFilters, setVisibleAllFilters] = useState(false);

  const filtersAreActive = useSelector(areTaskFiltersChanged);

  const { searchText, department_id, position_id } = taskFilters;

  // const currentSortOption = sortOptions.find(
  //   (opt) => opt.key === sort.key && opt.order === sort.order
  // );

  const currentOption = viewOptions.find((o) => o.value === viewMode);

  const positionsOptions = useMemo(
    () => formatDataForSelect(positions || []),
    [positions]
  );

  const departmentsOptions = useMemo(
    () => formatDataForSelect(departments || []),
    [departments]
  );

  // const handleSortChange = (selectedOption) => {
  //   dispatch(
  //     setSort({
  //       key: selectedOption.key,
  //       order: selectedOption.order,
  //     })
  //   );
  // };
  const handleViewModeChange = (option) => {
    dispatch(setViewMode(option.value));
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
      {isSmallDesktop && !isMobile && !isTablet && (
        <div className={styles.filtersMobile}>
          <SearchInput
            placeholder={"Поиск по задачам..."}
            value={searchText}
            onChange={handleSearchChange}
          />
          <div className={styles.selects}>
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
              viewMode={currentOption}
              options={viewOptions}
              onChange={handleViewModeChange}
            />
          </div>
        </div>
      )}

      {(isMobile || isTablet) && (
        <div className={styles.filtersMobile}>
          <div className={styles.inputs}>
            <SearchInput
              placeholder={isSmallMobile ? "Поиск..." : "Поиск по задачам..."}
              value={searchText}
              onChange={handleSearchChange}
            />
            <Sorting
              viewMode={currentOption}
              options={viewOptions}
              onChange={handleViewModeChange}
            />
            <Button
              onClick={() => setVisibleAllFilters(!visibleAllFilters)}
              leftIcon={<Filter size={16} className={styles.sortIcon} />}
              className={styles.filtersButton}
            />
          </div>

          {visibleAllFilters && (
            <div className={styles.selects}>
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
            </div>
          )}
        </div>
      )}

      {isBigScreen && (
        <>
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
            viewMode={currentOption}
            options={viewOptions}
            onChange={handleViewModeChange}
            isSmallDesktop={isSmallDesktop}
          />
        </>
      )}

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

const getSortIcon = (key) => {
  // В зависимости от ключа, выбираем тип иконки
  switch (key) {
    // case "name":
    //   return order === "asc" ? ArrowDownAZ : ArrowUpAZ;
    // case "start_time":
    // case "deadline_time":
    //   return order === "asc" ? Clock : Calendar; // Пример: часы для времени
    // case "custom_field":
    //   return order === "asc" ? ArrowDownWideNarrow : ArrowUpNarrowWide; // Пример: для пользовательских полей
    case "full":
      return LayoutList;
    case "short":
      return LayoutGrid;
    default:
      return ArrowDownAZ;
  }
};
const Sorting = ({ viewMode, options, onChange, isSmallDesktop }) => {
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
  const CurrentIcon = viewMode?.value ? getSortIcon(viewMode.value) : Eye;

  return (
    <div className={styles.sort} ref={sortRef}>
      <HintWithPortal
        hasIcon={false}
        hintContent={"Тип отображения"}
        position={isSmallDesktop ? "right" : "top"}
      >
        <div className={styles.sortHeader} onClick={handleToggle}>
          {/* 💡 Отображаем ТОЛЬКО иконку текущего типа сортировки */}
          <CurrentIcon size={18} className={styles.sortIcon} />
        </div>
      </HintWithPortal>

      {visibleOptions && (
        <div className={styles.sortOptions}>
          {options?.map((option) => (
            <div
              onClick={() => handleOptionClick(option)}
              key={`${option.value}`}
              className={`${styles.optionContainer} ${
                viewMode?.value === option.value ? styles.activeOption : ""
              }`}
            >
              <div className={styles.icon}>{option.icon}</div>

              {/* Отображаем полный текст опции */}
              <p className={styles.option}>{option.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
