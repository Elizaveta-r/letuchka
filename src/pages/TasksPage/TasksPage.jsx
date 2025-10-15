import styles from "./TasksPage.module.scss";
import PageTitle from "../../components/PageTitle/PageTitle";
import { TaskCard } from "../../components/TaskCard/TaskCard";
import { useEffect, useMemo } from "react";
import { getTasksList } from "../../utils/api/actions/tasks";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { resetDraftTask, setIsEdit } from "../../store/slices/tasksSlice";
import { TaskFilter } from "../../modules/TaskFilter/TaskFilter";

export default function TasksPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    taskFilters,
    data: tasks,
    sort,
  } = useSelector((state) => state?.tasks);

  const { searchText, department_id, position_id } = taskFilters;

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];

    const normalizedSearchText = searchText ? searchText.toLowerCase() : null;

    return tasks.filter((task) => {
      console.log(task.positions.map((p) => p.name).join(" "));
      const matchesSearch = normalizedSearchText
        ? [
            task.name,
            task.accept_condition,
            task.positions.map((p) => p.name).join(" "),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(normalizedSearchText)
        : true;

      const matchesDepartment = department_id
        ? task.department_id === department_id.value
        : true;

      const matchesPosition = position_id
        ? task.positions.some((p) => p.id === position_id.value)
        : true;

      return matchesSearch && matchesDepartment && matchesPosition;
    });
  }, [tasks, searchText, department_id, position_id]);

  const sortedTasks = useMemo(() => {
    if (filteredTasks.length === 0) return [];

    // Создаем копию уже отфильтрованного массива для сортировки
    const sortableTasks = [...filteredTasks];
    const { key, order } = sort;

    // ... (функция compare остается без изменений) ...
    const compare = (a, b) => {
      let valA, valB;

      if (key === "name") {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      } else if (key === "start_time") {
        // Извлекаем HH:mm для сравнения
        const getTimePart = (fullTime) =>
          fullTime?.split(" ")[1]?.substring(0, 5) || "00:00";
        valA = getTimePart(a.start_time);
        valB = getTimePart(b.start_time);
      } else {
        return 0;
      }

      if (valA < valB) {
        return order === "asc" ? -1 : 1;
      }
      if (valA > valB) {
        return order === "asc" ? 1 : -1;
      }
      return 0;
    };

    return sortableTasks.sort(compare);
  }, [filteredTasks, sort]);

  const handleGoToNewTask = () => {
    dispatch(setIsEdit(false));
    dispatch(resetDraftTask());
    navigate("/tasks/new");
  };

  useEffect(() => {
    dispatch(getTasksList(1, 200));
  }, [dispatch]);

  return (
    <div className={styles.container}>
      <PageTitle title={"Задачи"} hasButton onClick={handleGoToNewTask} />
      <TaskFilter />
      <div className={styles.tasksContainer}>
        {sortedTasks.map((task, index) => (
          <TaskCard key={index} task={task} />
        ))}
      </div>
    </div>
  );
}
