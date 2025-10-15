import React, { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import CustomInput from "../../ui/CustomInput/CustomInput";
import Modal from "../../ui/Modal/Modal";
import styles from "./CreateDepartmentModal.module.scss";
import { timeZoneOptions } from "../../utils/methods/generateTimeZoneOptions";
import CustomSelect from "../../ui/CustomSelect/CustomSelect";
import CustomTextArea from "../../ui/CustomTextArea/CustomTextArea";
import { toast } from "sonner";
import Hint from "../../ui/Hint/Hint";
import { useDispatch, useSelector } from "react-redux";
import { RingLoader } from "react-spinners";
import { formatTime } from "../../utils/methods/formatTime";
import { setDepartment } from "../../store/slices/departmentsSlice";

export default function CreateDepartmentModal({
  isOpen,
  onClose,
  onConfirm,
  onUpdate,
}) {
  const dispatch = useDispatch();
  const { loading, department } = useSelector((state) => state?.departments);

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

  const handleClose = () => {
    onClose();
    setFormData({
      name: "",
      description: "",
      checkInTime: "09:00",
      checkOutTime: "18:00",
    });
  };

  const handleConfirm = () => {
    if (!formData.name) {
      toast.error("Пожалуйста, заполните название подразделения.");
      return;
    }

    onConfirm({ ...formData, timeZone }).then((res) => {
      if (res && res.status === 200) {
        setFormData({
          name: "",
          description: "",
          checkInTime: "09:00",
          checkOutTime: "18:00",
        });
        handleClose();
      }
    });
  };

  const handleUpdate = () => {
    if (!formData.name) {
      toast.error("Пожалуйста, заполните название подразделения.");
      return;
    }

    onUpdate({ ...formData, timeZone, id: department?.id }).then((res) => {
      if (res && res.status === 200) {
        setFormData({
          name: "",
          description: "",
          checkInTime: "09:00",
          checkOutTime: "18:00",
        });

        handleClose();
        dispatch(setDepartment(null));
      }
    });
  };

  useEffect(() => {
    if (department) {
      setFormData({
        name: department?.name,
        description: department?.description,
        checkInTime: formatTime(department?.check_in_time),
        checkOutTime: formatTime(department?.check_out_time),
      });
      setTimeZone({ value: department?.timezone, label: department?.timezone });
    } else {
      setFormData({
        name: "",
        description: "",
        checkInTime: "09:00",
        checkOutTime: "18:00",
      });
      setTimeZone("");
    }
  }, [department, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={handleClose}
          title={`${
            department ? "Редактирование" : "Создание нового"
          } подразделения`}
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
            <button
              className={styles.buttonConfirm}
              onClick={department ? handleUpdate : handleConfirm}
            >
              {loading && <RingLoader color="#fff" size={12} />}
              {loading
                ? "Создание..."
                : department
                ? "Сохранить"
                : "Создать подразделение"}
            </button>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
}
