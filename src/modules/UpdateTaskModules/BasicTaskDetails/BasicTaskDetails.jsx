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
import { HintWithPortal } from "../../../ui/HintWithPortal/HintWithPortal";

const confirmationTypes = [
  { value: "photo", label: "Фото" },
  { value: "text", label: "Текст" },
  { value: "check_box", label: "Чекбокс" },
];

export const BasicTaskDetails = () => {
  const dispatch = useDispatch();

  const { isEdit } = useSelector((state) => state.tasks);
  const { department_id, position_ids, title, done_type, ai_prompt } =
    useSelector((state) => state.tasks.draftTask);

  const { departments } = useSelector((state) => state?.departments);
  const { positions } = useSelector((state) => state?.positions);

  const departmentOptions = departments?.map((dep) => ({
    value: dep.id,
    label: dep.title,
  }));

  const positionOptions = positions?.map((pos) => ({
    value: pos.id,
    label: pos.title,
  }));

  useEffect(() => {
    if (!isEdit) {
      dispatch(setDepartmentId(departmentOptions[0]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, isEdit]);

  useEffect(() => {
    if (!department_id || !departmentOptions?.length) return;

    // поддержим оба варианта: {value} или просто строка id
    const rawId =
      typeof department_id === "string" ? department_id : department_id.value;
    const match = departmentOptions.find((o) => o.value === rawId);

    // если уже есть label — ничего не делаем
    if (typeof department_id === "object" && department_id.label) return;

    if (match) {
      dispatch(setDepartmentId(match));
    }
  }, [department_id, departmentOptions, dispatch]);

  useEffect(() => {
    if (
      !Array.isArray(position_ids) ||
      !position_ids.length ||
      !positionOptions?.length
    )
      return;

    const needHydrate = position_ids.some((p) => !p?.label);
    if (!needHydrate) return;

    const mapped = position_ids
      .map((p) => {
        const rawId = typeof p === "string" ? p : p.value;
        return positionOptions.find((o) => o.value === rawId);
      })
      .filter(Boolean); // убираем не найденные

    if (mapped.length) {
      dispatch(setPositionIds(mapped));
    }
  }, [position_ids, positionOptions, dispatch]);

  return (
    <div className={styles.basicTaskDetails}>
      <div className={styles.row}>
        <div className={styles.section}>
          <p className={styles.label}>Название задачи</p>
          <CustomInput
            name="title"
            placeholder="Название задачи"
            value={title}
            onChange={(e) => dispatch(setDraftName(e.target.value))}
          />
        </div>
        <div className={styles.section}>
          <HintWithPortal
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
          </HintWithPortal>
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
          <HintWithPortal
            hintContent={
              <>
                Укажите, <b>что именно должно быть видно на фото</b>, чтобы ИИ
                смог понять, что задача выполнена. <br />
                <br /> Чем <b>точнее и подробнее</b> вы опишете критерии{" "}
                <small>
                  (что должно быть на снимке, в каком виде, при каких условиях)
                </small>
                , тем <b>лучше система распознает результат</b>.
              </>
            }
          >
            <p className={styles.label}>Критерий приемки</p>
          </HintWithPortal>
          <CustomTextArea
            placeholder={"Критерий приемки"}
            value={ai_prompt}
            onChange={(e) => dispatch(setAcceptCondition(e.target.value))}
          />
        </div>
      )}
    </div>
  );
};
