import React from "react";
import styles from "./UpdateTaskModal.module.scss";
import Modal from "../../ui/Modal/Modal";
import { AnimatePresence } from "motion/react";
import CustomSelect from "../../ui/CustomSelect/CustomSelect";
import CustomInput from "../../ui/CustomInput/CustomInput";
import ToggleSwitch from "../../ui/ToggleSwitch/ToggleSwitch";
import CustomTextArea from "../../ui/CustomTextArea/CustomTextArea";
import Hint from "../../ui/Hint/Hint";

const positions = [
  { value: "Повар", label: "Повар" },
  { value: "Администратор", label: "Администратор" },
];

const confirmationTypes = [
  { value: "photo", label: "Фото" },
  { value: "text", label: "Текст" },
  { value: "checkbox", label: "Чекбокс" },
];

export default function UpdateTaskModal({ isOpen, handleClose, isNew, task }) {
  const [position, setPosition] = React.useState("");
  const [name, setName] = React.useState(task?.task_title || "");
  const [startTime, setStartTime] = React.useState(task?.task_time || "");
  const [deadline, setDeadline] = React.useState(task?.deadline || "");
  const [isPhotoRequired, setIsPhotoRequired] = React.useState(
    task?.photo_required || false
  );
  const [isPhotoMandatory, setIsPhotoMandatory] = React.useState(false);
  const [isNotification, setIsNotification] = React.useState(true);
  const [isReport, setIsReport] = React.useState(true);
  const [confirmationType, setConfirmationType] = React.useState("");
  const [description, setDescription] = React.useState(
    task?.acceptance_criteria || ""
  );

  const onClose = () => {
    handleClose();
    setPosition("");
    setName("");
    setStartTime("");
    setDeadline("");
    setIsPhotoRequired(false);
    setIsPhotoMandatory(false);
    setIsNotification(true);
    setIsReport(true);
    setConfirmationType("");
    setDescription("");
  };

  const handleConfirm = () => {
    const updatedTask = {
      task_title: name,
      task_time: startTime,
      deadline,
      photo_required: isPhotoRequired,
      acceptance_criteria: description,
      confirmation_type: confirmationType,
    };
    console.log(updatedTask);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={handleClose}
          title={`${isNew ? "Создание" : "Редактирование"} задачи`}
        >
          <div className={styles.container}>
            <div className={styles.form}>
              <div className={styles.section}>
                <p className={styles.label}>Должности</p>
                <CustomSelect
                  placeholder="Выберите должности"
                  isSearchable
                  isMulti
                  options={positions}
                  value={position}
                  onChange={setPosition}
                />
              </div>

              <div className={styles.section}>
                <p className={styles.label}>Название задачи</p>
                <CustomInput
                  name="name"
                  placeholder="Название задачи"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className={styles.timeSection}>
                <div className={styles.section}>
                  <p className={styles.label}>Время начала задачи</p>
                  <CustomInput
                    type="time"
                    name="startTime"
                    placeholder="Время задачи"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>

                <div className={styles.section}>
                  <Hint hintContent="Время, до которого должна быть выполнена задача">
                    <p className={styles.label}>Дейдлайн задачи</p>
                  </Hint>
                  <CustomInput
                    type="time"
                    name="deadline"
                    placeholder="Дедлайн задачи"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.switchers}>
                <ToggleSwitch
                  label="Уведомить о просрочке"
                  checked={isNotification}
                  onChange={() => setIsNotification(!isNotification)}
                />
                <ToggleSwitch
                  label="Требуется фото"
                  checked={isPhotoRequired}
                  onChange={() => setIsPhotoRequired(!isPhotoRequired)}
                />
                <ToggleSwitch
                  label="В итоговый отчет"
                  checked={isReport}
                  onChange={() => setIsReport(!isReport)}
                />

                <ToggleSwitch
                  label="Фото обязательно"
                  checked={isPhotoMandatory}
                  onChange={() => setIsPhotoMandatory(!isPhotoMandatory)}
                />
              </div>
              <div className={styles.section}>
                <p className={styles.label}>Тип подтверждения</p>
                <CustomSelect
                  placeholder="Выберите тип подтверждения"
                  options={confirmationTypes}
                  value={confirmationType}
                  onChange={setConfirmationType}
                />
              </div>

              <div className={styles.section}>
                <p className={styles.label}>Критерий приемки</p>
                <CustomTextArea
                  placeholder={"Критерий приемки"}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
            <div className={styles.actions}>
              <button className={styles.buttonCancel} onClick={onClose}>
                Отмена
              </button>
              <button className={styles.buttonConfirm} onClick={handleConfirm}>
                {isNew ? "Создать" : "Сохранить"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
}
