import { useDispatch, useSelector } from "react-redux";
import CustomInput from "../../../ui/CustomInput/CustomInput";
import CustomSelect from "../../../ui/CustomSelect/CustomSelect";
import CustomTextArea from "../../../ui/CustomTextArea/CustomTextArea";
import styles from "./BasicTaskDetails.module.scss";

import {
  setAcceptCondition,
  setDepartmentId,
  setDoneType,
  setDraftName,
  setPositionIds,
} from "../../../store/slices/tasksSlice";
import Hint from "../../../ui/Hint/Hint";
import { useEffect } from "react";

const confirmationTypes = [
  { value: "photo", label: "Фото" },
  { value: "text", label: "Текст" },
  { value: "check_box", label: "Чекбокс" },
];

export const BasicTaskDetails = () => {
  const dispatch = useDispatch();

  const { isEdit } = useSelector((state) => state.tasks);
  const { department_id, position_ids, name, done_type, accept_condition } =
    useSelector((state) => state.tasks.draftTask);

  const { departments } = useSelector((state) => state?.departments);
  const { positions } = useSelector((state) => state?.positions);

  const departmentOptions = departments?.map((dep) => ({
    value: dep.id,
    label: dep.name,
  }));

  const positionOptions = positions?.map((pos) => ({
    value: pos.id,
    label: pos.name,
  }));

  useEffect(() => {
    if (!isEdit) {
      dispatch(setDepartmentId(departmentOptions[0]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, isEdit]);

  return (
    <div className={styles.basicTaskDetails}>
      <div className={styles.row}>
        <div className={styles.section}>
          <p className={styles.label}>Название задачи</p>
          <CustomInput
            name="name"
            placeholder="Название задачи"
            value={name}
            onChange={(e) => dispatch(setDraftName(e.target.value))}
          />
        </div>
        <div className={styles.section}>
          <Hint
            hintContent={
              <>
                Укажите, как исполнитель будет подтверждать выполнение:{" "}
                <strong>фотографией</strong>,{" "}
                <strong>кратким текстовым отчётом</strong> или простой{" "}
                <strong>отметкой о завершении</strong> (чекбоксом)
              </>
            }
          >
            <p className={styles.label}>Тип подтверждения</p>
          </Hint>
          <CustomSelect
            placeholder="Выберите тип подтверждения"
            options={confirmationTypes}
            value={done_type}
            onChange={(selectedOption) => dispatch(setDoneType(selectedOption))}
          />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.section}>
          <p className={styles.label}>Подразделение</p>
          <CustomSelect
            placeholder="Выберите подразделение"
            isSearchable
            options={departmentOptions}
            value={department_id}
            onChange={(selectedOption) =>
              dispatch(setDepartmentId(selectedOption))
            }
          />
        </div>
        <div className={styles.section}>
          <p className={styles.label}>Должности</p>
          <CustomSelect
            placeholder="Выберите должности"
            isSearchable
            isMulti
            options={positionOptions}
            value={position_ids}
            onChange={(selectedOption) =>
              dispatch(setPositionIds(selectedOption))
            }
          />
        </div>
      </div>

      {done_type.value === "photo" && (
        <div className={styles.section}>
          <Hint
            hintContent={
              <>
                Опишите, <strong>что именно должно быть видно</strong> на
                фотографии для успешного подтверждения задачи. <br /> Например:
                "Чек расположен на видном месте, все товары в фокусе, отсутствие
                посторонних предметов
              </>
            }
          >
            <p className={styles.label}>Критерий приемки</p>
          </Hint>
          <CustomTextArea
            placeholder={"Критерий приемки"}
            value={accept_condition}
            onChange={(e) => dispatch(setAcceptCondition(e.target.value))}
          />
        </div>
      )}
    </div>
  );
};
