import React, { useEffect } from "react";
import styles from "./EditPositionModal.module.scss";
import { AnimatePresence } from "framer-motion";
import Modal from "../../ui/Modal/Modal";
import CustomInput from "../../ui/CustomInput/CustomInput";
import CustomTextArea from "../../ui/CustomTextArea/CustomTextArea";
import { useDispatch, useSelector } from "react-redux";
import {
  createPosition,
  updatePosition,
} from "../../utils/api/actions/positions";
import { RingLoader } from "react-spinners";
import { toast } from "sonner";

export default function EditPositionModal({
  isOpen,
  onClose,
  position,
  isNew,
}) {
  const dispatch = useDispatch();

  const { loading } = useSelector((state) => state?.positions);

  const [input, setInput] = React.useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (!isNew) {
      setInput({
        name: position?.name || "",
        description: position?.description || "",
      });
    }
  }, [isNew, position]);

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

  const handleConfirmCreate = () => {
    if (!input.name) {
      toast.error("Пожалуйста, заполните название должности.");
      return;
    }
    dispatch(
      createPosition({
        name: input.name,
        description: input.description,
      })
    ).then((res) => {
      if (res.status === 200) {
        handleClose();
      }
    });
  };

  const handleConfirmUpdate = () => {
    if (!input.name) {
      toast.error("Пожалуйста, заполните название должности.");
      return;
    }
    dispatch(
      updatePosition({
        position_id: position.id,
        name: input.name,
        description: input.description,
      })
    ).then((res) => {
      if (res.status === 200) {
        handleClose();
      }
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          title={!isNew ? "Редактирование должности" : "Создание должности"}
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
                  placeholder={"Введите описание должности (необязательно)"}
                />
              </div>
            </div>
            <div className={styles.actions}>
              <button className={styles.buttonCancel} onClick={handleClose}>
                Отмена
              </button>
              <button
                className={styles.buttonConfirm}
                onClick={!isNew ? handleConfirmUpdate : handleConfirmCreate}
              >
                {loading && <RingLoader color="white" size={12} />}
                {loading ? "Подождите..." : !isNew ? "Сохранить" : "Создать"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
}
