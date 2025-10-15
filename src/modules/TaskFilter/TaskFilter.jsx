import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { formatDataForSelect } from "../../utils/methods/formatDataForSelect";
import { setSort, setTaskFilter } from "../../store/slices/tasksSlice";

import styles from "./TaskFilter.module.scss";
import { SearchInput } from "../../ui/SearchInput/SearchInput";
import CustomSelect from "../../ui/CustomSelect/CustomSelect";

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
      <CustomSelect
        options={sortOptions}
        placeholder="Сортировка"
        value={currentSortOption}
        onChange={handleSortChange}
        className={styles.sortSelect}
      />
    </div>
  );
};
