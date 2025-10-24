import { useDispatch, useSelector } from "react-redux";
import PageTitle from "../../components/PageTitle/PageTitle";
import styles from "./UpdateTaskPage.module.scss";
import {
  resetDraftTask,
  setDepartmentIdToDraft,
} from "../../store/slices/tasksSlice";
import { useNavigate } from "react-router-dom";
import CancelButton from "../../ui/CancelButton/CancelButton";
import { Button } from "../../ui/Button/Button";
import {
  BasicTaskDetails,
  FrequencySelector,
  Switchers,
} from "../../modules/UpdateTaskModules";
import { createTask, updateTask } from "../../utils/api/actions/tasks";
import { useEffect } from "react";
import { getDepartmentById } from "../../utils/api/actions/departments";

export default function UpdateTaskPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isEdit, draftTask } = useSelector((state) => state?.tasks);
  const { departments } = useSelector((state) => state?.departments);

  const serverDepartmentId = isEdit
    ? draftTask?.department_id?.value
      ? draftTask?.department_id?.value
      : draftTask?.department_id
    : null;

  let disposableDateString = null;

  useEffect(() => {
    if (!isEdit || !serverDepartmentId) return;

    // 1. ПОПЫТКА НАЙТИ ОТДЕЛ В REDUX
    const departmentInRedux = departments.find(
      (dept) => dept.id === serverDepartmentId
    );

    if (departmentInRedux) {
      // ✅ Нашли в Redux: Записываем в draftTask в формате {value, label}
      dispatch(
        setDepartmentIdToDraft({
          value: departmentInRedux.id,
          label: departmentInRedux.name,
        })
      );
      return;
    }

    dispatch(getDepartmentById(serverDepartmentId)) // Предполагаем, что этот экшен возвращает Promise
      .then((res) => {
        if (res.data && res.data.department) {
          const loadedDepartment = res.data.department;

          // ✅ Записываем загруженный отдел в draftTask
          dispatch(
            setDepartmentIdToDraft({
              value: loadedDepartment.id,
              label: loadedDepartment.name,
            })
          );

          // Опционально: можно сохранить его в общий список departments для будущего использования
        }
      })
      .catch((error) => {
        console.error("Ошибка загрузки отдела по ID:", error);
      });
  }, [isEdit, serverDepartmentId, departments, dispatch]);

  const handleCancel = () => {
    navigate(-1);
    dispatch(resetDraftTask());
  };

  const handleConfirm = () => {
    if (draftTask?.onetime_date) {
      const isoString = draftTask?.onetime_date;
      disposableDateString = isoString.split("T")[0];
    }

    const taskDataToSend = {
      ...draftTask,
      task_type: draftTask?.task_type.value,
      week_days: draftTask?.week_days?.map((d) => d.value),
      department_id: draftTask?.department_id?.value,
      done_type: draftTask?.done_type.value,
      onetime_date: disposableDateString,
      position_ids: draftTask?.position_ids?.map((p) => p.value),
    };

    const taskDataToEdit = {
      ...draftTask,
      task_id: draftTask?.id,
      task_type: draftTask?.task_type.value,
      week_days: draftTask?.week_days?.map((d) => d.value),
      department_id: draftTask?.department_id?.value,
      done_type: draftTask?.done_type.value,
      onetime_date: disposableDateString,
      position_ids: draftTask?.position_ids?.map((p) => p.value),
    };

    if (isEdit) {
      dispatch(updateTask(taskDataToEdit)).then((res) => {
        if (res.status === 200) {
          handleCancel();
        }
      });
    } else {
      dispatch(createTask(taskDataToSend)).then((res) => {
        if (res.status === 200) {
          handleCancel();
        }
      });
    }
  };

  return (
    <div className={styles.page}>
      <PageTitle title={isEdit ? "Редактирование задачи" : "Новая задача"} />
      <BasicTaskDetails />
      <FrequencySelector />

      <Switchers />

      <div className={styles.actions}>
        <CancelButton className={styles.cancelButton} onClick={handleCancel} />
        <Button
          secondary
          onClick={handleConfirm}
          title={isEdit ? "Сохранить" : "Добавить"}
        />
      </div>
    </div>
  );
}
