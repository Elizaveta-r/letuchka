import { useEffect, useState } from "react";
import CustomInput from "../../ui/CustomInput/CustomInput";
import styles from "./EmployeeContactModal.module.scss";
import { PhoneInput } from "../../ui/PhoneInput/PhoneInput";
import { AnimatePresence } from "motion/react";
import Modal from "../../ui/Modal/Modal";
import { Button } from "../../ui/Button/Button";

const transformContacts = (contactsArray) => {
  if (!Array.isArray(contactsArray)) {
    return {};
  }

  return contactsArray.reduce((acc, contact) => {
    let key = contact.type;
    if (key.includes("_")) {
      key = key.replace(/_(\w)/g, (match, p1) => p1.toUpperCase());
    }

    acc[key] = contact.value;
    return acc;
  }, {});
};

export default function EmployeeContactModal({ isOpen, onClose, employee }) {
  const fullName = `${employee?.surname} ${employee?.firstname} ${employee?.patronymic}`;

  const contacts = employee?.contacts;

  const [input, setInput] = useState({
    email: "",
    phone: "",
    telegramName: "",
    telegramId: "",
  });

  useEffect(() => {
    if (contacts) {
      const transformed = transformContacts(contacts);
      setInput({
        email: transformed.email || "",
        phone: transformed.phone || "",

        telegramName: transformed.telegramName || "",
        telegramId: transformed.telegramId || "",
      });
    } else {
      setInput({
        email: "",
        phone: "",
        telegramName: "",
        telegramId: "",
      });
    }
  }, [contacts]);

  const handleChangeInput = (e) => {
    setInput({
      ...input,
      [e.target.name]: e.target.value,
    });
  };

  const handleCancel = () => {
    const transformed = transformContacts(contacts);
    onClose();
    setInput({
      email: transformed.email || "",
      phone: transformed.phone || "",

      telegramName: transformed.telegramName || "",
      telegramId: transformed.telegramId || "",
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
          title={`Контактные данные сотрудника ${fullName}`}
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
