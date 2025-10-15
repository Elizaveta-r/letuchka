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

export default function EditPositionModal({ isOpen, onClose, position }) {
  const dispatch = useDispatch();

  const { loading } = useSelector((state) => state?.positions);

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

  const handleConfirmCreate = () => {
    dispatch(
      createPosition({
        name: input.name,
        description: input.description,
      })
    ).then((res) => {
      if (res.status === 200) {
        onClose();
        setInput({
          name: "",
          description: "",
        });
      }
    });
  };

  const handleConfirmUpdate = () => {
    dispatch(
      updatePosition({
        position_id: position.id,
        name: input.name,
        description: input.description,
      })
    ).then((res) => {
      if (res.status === 200) {
        onClose();
        setInput({
          name: "",
          description: "",
        });
      }
    });
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
              <button
                className={styles.buttonConfirm}
                onClick={position ? handleConfirmUpdate : handleConfirmCreate}
              >
                {loading && <RingLoader color="white" size={12} />}
                {loading ? "Подождите..." : position ? "Сохранить" : "Создать"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
}
