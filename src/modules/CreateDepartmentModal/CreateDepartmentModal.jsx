import React from "react";
import { AnimatePresence } from "framer-motion";
import CustomInput from "../../ui/CustomInput/CustomInput";
import Modal from "../../ui/Modal/Modal";
import styles from "./CreateDepartmentModal.module.scss";
import { timeZoneOptions } from "../../utils/methods/generateTimeZoneOptions";
import CustomSelect from "../../ui/CustomSelect/CustomSelect";
import CustomTextArea from "../../ui/CustomTextArea/CustomTextArea";
import { toast } from "sonner";
import Hint from "../../ui/Hint/Hint";

export default function CreateDepartmentModal({ isOpen, onClose, onConfirm }) {
  const [formData, setFormData] = React.useState({
    name: "",
    description: "",
    checkInTime: "09:00",
    checkOutTime: "18:00",
  });
  const [timeZone, setTimeZone] = React.useState("");

  const handleInputChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleConfirm = () => {
    if (!formData.name || !formData.description) {
      toast.error("Пожалуйста, заполните название и описание подразделения.");
      return;
    }

    onConfirm({ ...formData, timeZone });

    setFormData({
      name: "",
      description: "",
      checkInTime: "09:00",
      checkOutTime: "18:00",
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          title="Создание нового подразделения"
        >
          <div className={styles.formContent}>
            {/* 1. Название и Описание */}
            <div className={styles.section}>
              <label className={styles.label} htmlFor="name">
                Название подразделения
              </label>
              <CustomInput
                id="name"
                name="name"
                placeholder="Например, Frontend-разработка"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>

            {/* 2. Таймзона  */}
            <div className={styles.section}>
              <Hint
                hintContent="Определяет время получения автоматических задач и уведомлений сотрудниками."
                minWidth={"500px"}
              >
                <label className={styles.label}>Часовой пояс</label>
              </Hint>

              <CustomSelect
                placeholder="Выберите часовой пояс"
                options={timeZoneOptions}
                onChange={setTimeZone}
                value={timeZone}
                isSearchable
              />
            </div>

            {/* 3. Описание подразделения */}
            <div className={styles.section}>
              <label className={styles.label} htmlFor="description">
                Описание подразделения
              </label>
              <CustomTextArea
                id="description"
                name="description"
                placeholder="Краткое описание функций"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
              />
            </div>

            {/* 4. Время Check-in и Check-out */}
            <div className={styles.timeGrid}>
              <div className={styles.section}>
                <Hint
                  hintContent={`Сотрудник должен быть на рабочем месте и отметиться (сделать "чекин") не позднее указанного времени.`}
                >
                  <label className={styles.label} htmlFor="checkInTime">
                    Чекин (до)
                  </label>
                </Hint>

                <CustomInput
                  id="checkInTime"
                  name="checkInTime"
                  type="time"
                  value={formData.checkInTime}
                  onChange={handleInputChange}
                />
              </div>
              <div className={styles.section}>
                <Hint
                  hintContent={`Это самое раннее время, когда сотрудник может официально отметиться об уходе с работы (сделать "чекаут").`}
                >
                  <label className={styles.label} htmlFor="checkOutTime">
                    Чекаут (с)
                  </label>
                </Hint>

                <CustomInput
                  id="checkOutTime"
                  name="checkOutTime"
                  type="time"
                  value={formData.checkOutTime}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Кнопки действий */}
          <div className={styles.actions}>
            <button className={styles.buttonCancel} onClick={onClose}>
              Отмена
            </button>
            <button className={styles.buttonConfirm} onClick={handleConfirm}>
              Создать подразделение
            </button>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
}
