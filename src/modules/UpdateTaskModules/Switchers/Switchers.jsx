import styles from "./Switchers.module.scss";
import ToggleSwitch from "../../../ui/ToggleSwitch/ToggleSwitch";
import { useDispatch, useSelector } from "react-redux";
import {
  setExpiredNotify,
  setNeedPhoto,
  setPhotoRequired,
  setToFinalReport,
} from "../../../store/slices/tasksSlice";
import { useEffect } from "react";

export const Switchers = () => {
  const dispatch = useDispatch();

  const {
    need_photo,
    photo_required,
    expired_notify,
    to_final_report,
    done_type,
  } = useSelector((state) => state.tasks.draftTask);

  useEffect(() => {
    if (done_type.value === "photo") {
      dispatch(setNeedPhoto(true));
    }
  }, [dispatch, done_type.value]);

  return (
    <div className={styles.switchers}>
      <ToggleSwitch
        labelStyle={styles.switcherLabel}
        label="Уведомить о просрочке"
        checked={expired_notify}
        onChange={() => dispatch(setExpiredNotify(!expired_notify))}
      />
      {done_type.value === "photo" && (
        <ToggleSwitch
          labelStyle={styles.switcherLabel}
          label="Требуется фото"
          checked={need_photo}
          onChange={() => dispatch(setNeedPhoto(!need_photo))}
        />
      )}
      {done_type.value === "photo" && (
        <ToggleSwitch
          labelStyle={styles.switcherLabel}
          label="Фото обязательно"
          checked={photo_required}
          onChange={() => dispatch(setPhotoRequired(!photo_required))}
        />
      )}
      <ToggleSwitch
        labelStyle={styles.switcherLabel}
        label="В итоговый отчет"
        checked={to_final_report}
        onChange={() => dispatch(setToFinalReport(!to_final_report))}
      />
    </div>
  );
};
