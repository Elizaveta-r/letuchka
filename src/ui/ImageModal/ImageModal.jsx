import { X } from "lucide-react";
import styles from "./ImageModal.module.scss";

export const ImageModal = ({ photoUrl, onClose }) => {
  if (!photoUrl) return null;

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalCloseButton} onClick={onClose}>
          <X size={24} />
        </button>
        <img
          src={photoUrl}
          alt="Фотоотчет сотрудника"
          className={styles.modalImage}
        />
      </div>
    </div>
  );
};
