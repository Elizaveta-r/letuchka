import { useEffect, useState } from "react";
import CustomInput from "../../ui/CustomInput/CustomInput";
import styles from "./EmployeeContactModal.module.scss";
import { PhoneInput } from "../../ui/PhoneInput/PhoneInput";
import { AnimatePresence } from "motion/react";
import Modal from "../../ui/Modal/Modal";
import { Button } from "../../ui/Button/Button";

export default function EmployeeContactModal({ isOpen, onClose, employee }) {
  const [input, setInput] = useState({
    email: "",
    phone: "",
    telegramName: "",
    telegramId: "",
  });

  useEffect(() => {
    if (employee) {
      setInput({
        email: employee?.email || "",
        phone: employee?.phone || "",
        telegramName: employee?.telegramName || "",
        telegramId: employee?.telegramId || "",
      });
    }
  }, [employee]);

  const handleChangeInput = (e) => {
    setInput({
      ...input,
      [e.target.name]: e.target.value,
    });
  };

  const handleCancel = () => {
    onClose();
    setInput({
      email: "",
      phone: "",
      telegramName: "",
      telegramId: "",
    });
  };

  const handleSave = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          title={`Контактные данные сотрудника ${employee.name}`}
        >
          <div className={styles.content}>
            <div className={styles.form}>
              <PhoneInput
                name={"phone"}
                value={input.phone}
                onChange={handleChangeInput}
                label="Телефон для связи"
              />
              <div className={styles.formItem}>
                <p className={styles.formLabel}>Telegram</p>
                <div className={styles.inputs}>
                  <CustomInput
                    placeholder={"Имя пользователя..."}
                    value={input.telegramName}
                    name="telegramName"
                    onChange={handleChangeInput}
                  />
                  <CustomInput
                    placeholder={"Telegram ID..."}
                    value={input.telegramId}
                    name="telegramId"
                    onChange={handleChangeInput}
                  />
                </div>
              </div>
              <div className={styles.formItem}>
                <p className={styles.formLabel}>Адрес электронной почты</p>

                <CustomInput
                  placeholder={"Email..."}
                  value={input.email}
                  name="email"
                  onChange={handleChangeInput}
                />
              </div>
            </div>

            <div className={styles.actions}>
              <Button
                title="Отмена"
                onClick={handleCancel}
                className={styles.buttonCancel}
                secondary
              />
              <Button
                className={styles.button}
                title={"Сохранить"}
                onClick={handleSave}
                secondary
              />
            </div>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
}
