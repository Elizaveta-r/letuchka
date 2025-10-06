import React from "react";
import styles from "./ToggleSwitch.module.scss"; // Предполагаем, что стили находятся здесь

/**
 * Переиспользуемый компонент свитчера (Toggle Switch).
 * * @param {boolean} checked - Текущее состояние (true для ON/Активно).
 * @param {function} onChange - Функция, вызываемая при изменении состояния.
 * @param {string} [label] - Необязательный текстовый лейбл рядом со свитчером.
 * @param {string} [className] - Необязательный дополнительный класс для контейнера.
 */
const ToggleSwitch = ({ checked, onChange, label, className }) => {
  return (
    <div className={`${styles.switchContainer} ${className || ""}`}>
      {label && <span className={styles.switchLabel}>{label}</span>}

      <label className={styles.switch}>
        {/* Скрытый чекбокс управляет состоянием */}
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className={styles.switchInput}
        />
        {/* Визуальный ползунок (Slider) */}
        <span className={`${styles.slider} ${checked ? styles.checked : ""}`} />
      </label>
    </div>
  );
};

export default ToggleSwitch;
