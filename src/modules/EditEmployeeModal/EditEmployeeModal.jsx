import { useState } from "react";
import Modal from "../../ui/Modal/Modal";
import { AnimatePresence } from "motion/react";
import CustomInput from "../../ui/CustomInput/CustomInput";
import CustomSelect from "../../ui/CustomSelect/CustomSelect";
import styles from "./EditEmployeeModal.module.scss";
import { Button } from "../../ui/Button/Button";

const positions = [
  { value: "manager", label: "Менеджер" },
  { value: "developer", label: "Разработчик" },
  { value: "tester", label: "Тестировщик" },
  { value: "designer", label: "Дизайнер" },
];

const roles = [
  { value: "employee", label: "Сотрудник" },
  { value: "manager", label: "Руководитель" },
];

const departments = [
  { value: "frontend", label: "Разработка (Frontend)" },
  { value: "backend", label: "Разработка (Backend)" },
  { value: "design", label: "Дизайн" },
];

export default function EditEmployeeModal({
  isOpen,
  onClose,
  employee,
  onConfirm,
  isNew,
}) {
  const getRoleValue = (role) => {
    switch (role) {
      case "Сотрудник":
        return { value: "employee", label: "Сотрудник" };
      case "Руководитель":
        return { value: "manager", label: "Руководитель" };
      default:
        return "";
    }
  };

  const getDepartmentValue = (department) => {
    switch (department) {
      case "Разработка (Frontend)":
        return { value: "frontend", label: "Разработка (Frontend)" };
      case "Разработка (Backend)":
        return { value: "backend", label: "Разработка (Backend)" };
      case "Дизайн":
        return { value: "design", label: "Дизайн" };
      default:
        return "";
    }
  };

  const getPosition = (position) => {
    switch (position) {
      case "Менеджер":
        return { value: "manager", label: "Менеджер" };
      case "Разработчик":
        return { value: "developer", label: "Разработчик" };
      case "Тестировщик":
        return { value: "tester", label: "Тестировщик" };
      case "Дизайнер":
        return { value: "designer", label: "Дизайнер" };
      default:
        return "";
    }
  };

  const [input, setInput] = useState({
    name: employee?.name || "",
    telegramId: employee?.telegramId || "",
    telegramName: employee?.telegramName || "",
  });

  const [role, setRole] = useState(getRoleValue(employee?.role) || "");
  const [position, setPosition] = useState(
    getPosition(employee?.position) || ""
  );
  const [department, setDepartment] = useState(
    getDepartmentValue(employee?.department) || ""
  );

  const handleChangeInput = (e) => {
    setInput({
      ...input,
      [e.target.name]: e.target.value,
    });
  };
  const handleClose = () => {
    onClose();
    setInput({
      name: employee?.name || "",
      telegramId: employee?.telegramId || "",
      telegramName: employee?.telegramName || "",
    });
    setRole(employee?.role || "");
    setPosition(employee?.position || "");
    setDepartment(employee?.department || "");
  };

  console.log(role);

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={handleClose}
          title={`${isNew ? "Создание" : "Редактирование"} сотрудника`}
        >
          <div className={styles.content}>
            <div className={styles.formGrid}>
              <div className={styles.formRow}>
                <div className={styles.formItem}>
                  <p className={styles.formLabel}>ФИО</p>
                  <CustomInput
                    placeholder={"Введите ФИО..."}
                    value={input.name}
                    name="name"
                    onChange={handleChangeInput}
                  />
                </div>
                <div className={styles.formItem}>
                  <p className={styles.formLabel}>Должность</p>
                  <CustomSelect
                    isMulti
                    options={positions}
                    value={position}
                    onChange={setPosition}
                    placeholder={"Выберите должность..."}
                    isSearchable
                    isCreatable
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formItem}>
                  <p className={styles.formLabel}>Роль</p>
                  <CustomSelect
                    options={roles}
                    value={role}
                    onChange={setRole}
                    placeholder={"Выберите роль..."}
                    isSearchable
                  />
                </div>
                <div className={styles.formItem}>
                  <p className={styles.formLabel}>Отдел</p>
                  <CustomSelect
                    options={departments}
                    value={department}
                    onChange={setDepartment}
                    placeholder={"Выберите отдел..."}
                    isSearchable
                    isMulti={role?.value === "manager"}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formItem}>
                  <p className={styles.formLabel}>Telegram ID</p>
                  <CustomInput
                    placeholder={"Введите Telegram ID..."}
                    value={input.telegramId}
                    name="telegramId"
                    onChange={handleChangeInput}
                  />
                </div>

                <div className={styles.formItem}>
                  <p className={styles.formLabel}>Telegram Name</p>
                  <CustomInput
                    placeholder={"Введите Telegram Name..."}
                    value={input.telegramName}
                    name="telegramName"
                    onChange={handleChangeInput}
                  />
                </div>
              </div>
            </div>
            <div className={styles.actions}>
              <Button
                title="Отмена"
                onClick={handleClose}
                className={styles.buttonCancel}
                secondary
              />
              <Button
                className={styles.button}
                title={isNew ? "Создать" : "Сохранить"}
                onClick={onConfirm}
                secondary
              />
            </div>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
}
