import styles from "./FrequencySelector.module.scss";
import CustomSelect from "../../../ui/CustomSelect/CustomSelect";
import DaysGrid from "../../../components/DaysGrid/DaysGrid";
import { Calendar } from "react-date-range";
import CustomInput from "../../../ui/CustomInput/CustomInput";
import Hint from "../../../ui/Hint/Hint";
import { ru } from "date-fns/locale";
import { useDispatch, useSelector } from "react-redux";
import {
  setDeadlineTime,
  setDisposableDate,
  setStartTime,
  setTimeType,
  setWeekDays,
} from "../../../store/slices/tasksSlice";

const frequency = [
  { value: "daily", label: "Ежедневно" },
  { value: "weekly", label: "Еженедельно" },
  { value: "monthly", label: "Ежемесячно" },
  { value: "onetime", label: "Единоразово" },
];

const weekDays = [
  { value: 1, label: "Понедельник" },
  { value: 2, label: "Вторник" },
  { value: 3, label: "Среда" },
  { value: 4, label: "Четверг" },
  { value: 5, label: "Пятница" },
  { value: 6, label: "Суббота" },
  { value: 7, label: "Воскресенье" },
];

export const FrequencySelector = () => {
  const dispatch = useDispatch();

  const { task_type, week_days, start_time, deadline_time, onetime_date } =
    useSelector((state) => state?.tasks?.draftTask);

  return (
    <div className={styles.wrapper}>
      <div className={styles.section}>
        <Hint hintContent="Установите, как часто должна повторяться задача: каждый день, по определенным дням недели, раз в месяц или единоразово">
          <p className={styles.label}>Периодичность</p>
        </Hint>
        <CustomSelect
          options={frequency}
          value={task_type}
          onChange={(selectedOption) => dispatch(setTimeType(selectedOption))}
          placeholder="Выберите периодичность"
        />
      </div>

      <div className={styles.timeSection}>
        {task_type.value === "weekly" && (
          <div className={styles.timeSection}>
            <div className={styles.section}>
              <p className={styles.label}>Выберите дни неделни</p>
              <div className={styles.weekDays}>
                {weekDays?.map((day) => (
                  <div
                    className={`${styles.day} ${
                      week_days.some((d) => d.value === day.value)
                        ? styles.selected
                        : ""
                    }`}
                    key={day.value}
                    onClick={() => {
                      if (week_days?.includes(day)) {
                        dispatch(
                          setWeekDays(week_days.filter((d) => d !== day))
                        );
                      } else {
                        dispatch(setWeekDays([...week_days, day]));
                      }
                    }}
                  >
                    {day.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {task_type.value === "monthly" && (
          <div className={styles.section}>
            <p className={styles.label}>Выберите дни месяца</p>
            <DaysGrid />
          </div>
        )}

        {task_type.value === "onetime" && (
          <div className={styles.section}>
            <p className={styles.label}>Выберите дату выполнения</p>
            <Calendar
              date={onetime_date}
              onChange={(date) => {
                const dateUTC = new Date(
                  Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
                );
                dispatch(setDisposableDate(dateUTC.toISOString()));
              }}
              minDate={new Date()}
              locale={ru}
              color={"#16a34a"}
              dateDisplayFormat="dd.MM.yyyy"
            />
          </div>
        )}
        <div className={styles.section}>
          <p className={styles.label}>Время начала задачи</p>
          <CustomInput
            type="time"
            name="startTime"
            placeholder="Время задачи"
            value={start_time}
            onChange={(e) => dispatch(setStartTime(e.target.value))}
          />
        </div>

        <div className={styles.section}>
          <Hint hintContent="Время, до которого должна быть выполнена задача">
            <p className={styles.label}>Дедлайн задачи</p>
          </Hint>
          <CustomInput
            type="time"
            name="deadline"
            placeholder="Дедлайн задачи"
            value={deadline_time}
            onChange={(e) => dispatch(setDeadlineTime(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
};
