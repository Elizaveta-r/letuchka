import { useState } from "react";
import styles from "./InputAuth.module.scss";
import { ErrorIcon } from "../../assets/icons/ErrorIcon";

export const InputAuth = ({
  label,
  value = "",
  readOnly = false,
  rightIcon,
  error,
  onBlurValidate,
  containerStyle,
  wrapperStyle,
  labelStyle,
  inputStyle,
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  const isFilled = value.length > 0;

  const handleBlur = () => {
    if (!readOnly) {
      setFocused(false);
      if (onBlurValidate) {
        onBlurValidate(value);
      }
    }
  };

  return (
    <div className={`${styles.container} ${containerStyle}`}>
      <div
        className={`${styles.inputWrapper} ${wrapperStyle}
        ${isFilled ? styles.filled : ""} 
        ${focused ? styles.focused : ""}
        ${error ? styles.error : ""}`}
      >
        <label className={`${styles.label} ${labelStyle}`}>{label}</label>
        <input
          className={`${styles.input} ${inputStyle}`}
          value={value}
          readOnly={readOnly}
          onFocus={() => {
            if (!readOnly) setFocused(true);
          }}
          onBlur={handleBlur}
          {...props}
        />
        {rightIcon}
      </div>
      {error && (
        <div className={styles.errorMessage}>
          <ErrorIcon size={12} fill={"#ff0000"} />
          {error}
        </div>
      )}
    </div>
  );
};
