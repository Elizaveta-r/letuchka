import { createSlice } from "@reduxjs/toolkit";

const initialDraftTask = {
  name: "",
  time_type: { value: "daily", label: "Ежедневно" }, // Передаем на бек строку value
  week_days: [],
  month_days: [],
  start_time: "",
  deadline_time: "",
  disposable_date: "", // Единоразовая дата
  need_photo: false, // фото требуется
  photo_required: false, // фото обязательно
  expired_notify: false, // просрочка
  to_final_report: false, // в итоговый отчет
  done_type: "", // Тип подтверждения
  accept_condition: "", // Критерий приемки
  department_id: "",
  position_ids: [],
};

const initialTaskFilters = {
  department_id: null,
  position_id: null,
  searchText: "",
};

const initialState = {
  data: localStorage.getItem("tasksData")
    ? JSON.parse(localStorage.getItem("tasksData"))
    : null,
  isEdit: sessionStorage.getItem("isEdit")
    ? JSON.parse(sessionStorage.getItem("isEdit"))
    : false,
  draftTask: sessionStorage.getItem("draftTask")
    ? JSON.parse(sessionStorage.getItem("draftTask"))
    : initialDraftTask,
  activeTask: sessionStorage.getItem("activeTask")
    ? JSON.parse(sessionStorage.getItem("activeTask"))
    : null,
  sort: {
    key: "name", // 'name', 'start_time' или другой ключ
    order: "asc", // 'asc' (по возрастанию) или 'desc' (по убыванию)
  },
  taskFilters: initialTaskFilters,
  loadingTask: false,
};

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setIsEdit(state, action) {
      state.isEdit = action.payload;
      sessionStorage.setItem("isEdit", action.payload);
    },
    setActiveTask(state, action) {
      state.activeTask = action.payload;
      sessionStorage.setItem("activeTask", JSON.stringify(action.payload));
    },
    setLoadingTask(state, action) {
      state.loadingTask = action.payload;
    },
    setTaskFilter(state, action) {
      const { key, value } = action.payload;
      state.taskFilters[key] = value;
    },
    setTaskFilters(state, action) {
      state.taskFilters = action.payload;
    },
    resetTaskFilters(state) {
      state.taskFilters = initialTaskFilters;
    },
    setSort(state, action) {
      const { key, order } = action.payload;
      state.sort.key = key;
      state.sort.order = order;
    },
    setDraftFromEditedTask(state, action) {
      const serverTask = action.payload;

      // Конвертация поля time_type
      const timeTypeOptions = [
        { value: "daily", label: "Ежедневно" },
        { value: "weekly", label: "Еженедельно" },
        { value: "monthly", label: "Ежемесячно" },
        { value: "disposable", label: "Единоразово" },
      ];
      const timeType = timeTypeOptions.find(
        (o) => o.value === serverTask.time_type
      ) || { value: serverTask.time_type, label: "Неизвестно" };

      // Конвертация week_days
      const weekDaysOptions = [
        { value: "monday", label: "Понедельник" },
        { value: "tuesday", label: "Вторник" },
        { value: "wednesday", label: "Среда" },
        { value: "thursday", label: "Четверг" },
        { value: "friday", label: "Пятница" },
        { value: "saturday", label: "Суббота" },
        { value: "sunday", label: "Воскресенье" },
      ];
      const weekDays = serverTask.week_days
        ? serverTask.week_days.map(
            (dayValue) =>
              weekDaysOptions.find((d) => d.value === dayValue) || {
                value: dayValue,
                label: dayValue,
              }
          )
        : [];

      // Конвертация done_type (Тип подтверждения)
      const doneTypeOptions = [
        { value: "photo", label: "Фото" },
        { value: "text", label: "Текст" },
        { value: "check_box", label: "Чекбокс" },
      ];

      const doneType = doneTypeOptions.find(
        (o) => o.value === serverTask.done_type
      ) || { value: serverTask.done_type, label: "Неизвестно" };

      const department = serverTask.department_id;

      const positionIds = serverTask.positions
        ? serverTask.positions.map((p) => ({ value: p.id, label: p.name }))
        : [];

      const getFormattedTime = (fullTime) => {
        if (!fullTime || fullTime === "0000-01-01 00:00:00 +0000 UTC")
          return "";
        const match = fullTime.match(/(\d{2}:\d{2}):\d{2}/);
        return match ? match[1] : "";
      };

      const getFormattedDate = (dateString) => {
        if (!dateString || dateString === "0001-01-01 00:00:00 +0000 UTC")
          return "";
        return new Date(dateString).toISOString();
      };

      state.draftTask = {
        ...state.draftTask,

        name: serverTask.name,
        time_type: timeType,
        week_days: weekDays,
        month_days: serverTask.month_days || [],

        start_time: getFormattedTime(serverTask.start_time),
        deadline_time: getFormattedTime(serverTask.deadline_time),
        disposable_date: getFormattedDate(serverTask.disposable_date),

        isPhotoRequired: serverTask.need_photo,
        isPhotoMandatory: serverTask.photo_required,
        isNotification: serverTask.expired_notify, // Предполагаем обратное соответствие
        isReport: serverTask.to_final_report, // Предполагаем обратное соответствие

        done_type: doneType,
        accept_condition: serverTask.accept_condition,

        department_id: department,
        position_ids: positionIds,

        id: serverTask.id, // ID задачи
      };
    },
    setDepartmentIdToDraft(state, action) {
      // action.payload ожидает объект { value: id, label: name }
      state.draftTask.department_id = action.payload;
    },
    setTasks(state, action) {
      state.data = action.payload;
    },
    resetDraftTask(state) {
      state.draftTask = initialDraftTask;
    },
    loadTaskToDraft(state, action) {
      state.draftTask = { ...initialDraftTask, ...action.payload };
    },
    setDraftName(state, action) {
      state.draftTask.name = action.payload;
    },
    setTimeType(state, action) {
      state.draftTask.time_type = action.payload;
    },
    setWeekDays(state, action) {
      state.draftTask.week_days = action.payload;
    },
    setMonthDays(state, action) {
      state.draftTask.month_days = action.payload;
    },
    setStartTime(state, action) {
      state.draftTask.start_time = action.payload;
    },
    setDeadlineTime(state, action) {
      state.draftTask.deadline_time = action.payload;
    },
    setDisposableDate(state, action) {
      state.draftTask.disposable_date = action.payload;
    },
    setNeedPhoto(state, action) {
      state.draftTask.need_photo = action.payload;
    },
    setPhotoRequired(state, action) {
      state.draftTask.photo_required = action.payload;
    },
    setExpiredNotify(state, action) {
      state.draftTask.expired_notify = action.payload;
    },
    setToFinalReport(state, action) {
      state.draftTask.to_final_report = action.payload;
    },
    setDoneType(state, action) {
      state.draftTask.done_type = action.payload;
    },
    setAcceptCondition(state, action) {
      state.draftTask.accept_condition = action.payload;
    },
    setDepartmentId(state, action) {
      state.draftTask.department_id = action.payload;
    },
    setPositionIds(state, action) {
      state.draftTask.position_ids = action.payload;
    },
  },
});

export const areTaskFiltersChanged = (state) => {
  const currentFilters = state.tasks.taskFilters;

  // Проверяем, отличается ли хоть один ключ от начального состояния
  return Object.keys(initialTaskFilters).some((key) => {
    const initialValue = initialTaskFilters[key];
    const currentValue = currentFilters[key];

    // Специальная проверка для null/undefined/пустой строки
    if (key === "searchText") {
      return currentValue !== initialValue;
    }

    // Для department_id и position_id, которые могут быть null/undefined
    return currentValue !== initialValue;
  });
};

export const {
  setIsEdit,
  setActiveTask,
  setTaskFilter,
  setLoadingTask,
  setTaskFilters,
  setSort,
  setDraftFromEditedTask,
  setDepartmentIdToDraft,
  setTasks,
  resetDraftTask,
  loadTaskToDraft,
  setDraftName,
  setTimeType,
  setWeekDays,
  setMonthDays,
  setStartTime,
  setDeadlineTime,
  setDisposableDate,
  setNeedPhoto,
  setPhotoRequired,
  setExpiredNotify,
  setToFinalReport,
  setDoneType,
  setAcceptCondition,
  setDepartmentId,
  resetTaskFilters,
  setPositionIds,
} = tasksSlice.actions;
export default tasksSlice.reducer;
