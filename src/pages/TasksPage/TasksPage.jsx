import styles from "./TasksPage.module.scss";
import PageTitle from "../../components/PageTitle/PageTitle";
import { TaskCard } from "../../components/TaskCard/TaskCard";
import { useEffect, useMemo } from "react";
import { getTasksList } from "../../utils/api/actions/tasks";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { resetDraftTask, setIsEdit } from "../../store/slices/tasksSlice";
import { TaskFilter } from "../../modules/TaskFilter/TaskFilter";
import { toast } from "sonner";

export default function TasksPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    taskFilters,
    data: tasks,
    // sort,
    viewMode,
  } = useSelector((state) => state?.tasks);
  const { departments } = useSelector((state) => state?.departments);

  const { searchText, department_id, position_id } = taskFilters;

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];

    const normalizedSearchText = searchText ? searchText.toLowerCase() : null;

    return tasks?.filter((task) => {
      const matchesSearch = normalizedSearchText
        ? [
            task?.title,
            task?.ai_prompt,
            task?.positions?.map((p) => p.name).join(" "),
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
        ? task.positions?.some((p) => p.id === position_id.value)
        : true;

      return matchesSearch && matchesDepartment && matchesPosition;
    });
  }, [tasks, searchText, department_id, position_id]);

  // const sortedTasks = useMemo(() => {
  //   if (filteredTasks.length === 0) return [];

  //   // Создаем копию уже отфильтрованного массива для сортировки
  //   const sortableTasks = [...filteredTasks];
  //   const { key, order } = sort;

  //   // ... (функция compare остается без изменений) ...
  //   const compare = (a, b) => {
  //     let valA, valB;

  //     if (key === "title") {
  //       valA = a.title.toLowerCase();
  //       valB = b.title.toLowerCase();
  //     } else if (key === "start_time") {
  //       // Извлекаем HH:mm для сравнения
  //       const getTimePart = (fullTime) =>
  //         fullTime?.split(" ")[1]?.substring(0, 5) || "00:00";
  //       valA = getTimePart(a.start_time);
  //       valB = getTimePart(b.start_time);
  //     } else {
  //       return 0;
  //     }

  //     if (valA < valB) {
  //       return order === "asc" ? -1 : 1;
  //     }
  //     if (valA > valB) {
  //       return order === "asc" ? 1 : -1;
  //     }
  //     return 0;
  //   };

  //   return sortableTasks?.sort(compare);
  // }, [filteredTasks, sort]);

  const handleGoToNewTask = () => {
    dispatch(setIsEdit(false));
    dispatch(resetDraftTask());
    if (!departments) {
      toast("Подразделение не найдено", {
        description:
          "Для того чтобы продолжить, создайте хотя бы 1 подразделение.",
        action: {
          label: "Создать",
          onClick: () => navigate("/departments?create=true"),
        },
        style: { textAlign: "left" },
      });
    } else {
      navigate("/tasks/new");
    }
  };

  useEffect(() => {
    dispatch(getTasksList(1, 200));
  }, [dispatch]);

  return (
    <div className={styles.container}>
      <PageTitle
        title={"Задачи"}
        hasButton
        onClick={handleGoToNewTask}
        dataTour={"tasks.add"}
        dataTourMobile={"menu.tasks"}
      />
      {tasks && <TaskFilter />}
      {tasks ? (
        <div
          className={styles.tasksContainer}
          style={{
            display: filteredTasks?.length === 0 ? "flex" : "grid",
            justifyContent: filteredTasks?.length === 0 && "center",
          }}
        >
          {filteredTasks?.length > 0 ? (
            filteredTasks?.map((task, index) => (
              <TaskCard
                key={index}
                task={task}
                isViewShort={viewMode === "short"}
              />
            ))
          ) : (
            <div className={styles.empty}>
              Список задач пуст. <br /> Попробуйте{" "}
              <strong>изменить фильтры</strong>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.empty}>
          Список задач пуст. <br /> Нажмите <strong>"Добавить"</strong>, чтобы
          создать первую задачу.
        </div>
      )}
    </div>
  );
}
