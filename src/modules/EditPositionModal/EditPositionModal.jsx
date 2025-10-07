import React, { useEffect } from "react";
import styles from "./EditPositionModal.module.scss";
import { AnimatePresence } from "framer-motion";
import Modal from "../../ui/Modal/Modal";
import CustomInput from "../../ui/CustomInput/CustomInput";
import CustomTextArea from "../../ui/CustomTextArea/CustomTextArea";

export default function EditPositionModal({ isOpen, onClose, position }) {
  const [input, setInput] = React.useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (position) {
      setInput({
        name: position?.name || "",
        description: position?.description || "",
      });
    }
  }, [position]);

  const handleChangeInput = (e) => {
    setInput({
      ...input,
      [e.target.name]: e.target.value,
    });
  };

  const handleClose = () => {
    onClose();
    setInput({
      name: "",
      description: "",
    });
  };

  const handleConfirm = () => {
    console.log("object");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          title={position ? "Редактирование должности" : "Создание должности"}
        >
          <div className={styles.content}>
            <div className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Название:</label>
                <CustomInput
                  id="name"
                  name="name"
                  value={input.name}
                  onChange={handleChangeInput}
                  placeholder={"Введите название должности"}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Описание:</label>
                <CustomTextArea
                  name="description"
                  value={input.description}
                  onChange={handleChangeInput}
                  placeholder={"Введите описание должности"}
                />
              </div>
            </div>
            <div className={styles.actions}>
              <button className={styles.buttonCancel} onClick={handleClose}>
                Отмена
              </button>
              <button className={styles.buttonConfirm} onClick={handleConfirm}>
                {position ? "Сохранить" : "Создать"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
}
