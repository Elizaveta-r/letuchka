import Hint from "../../ui/Hint/Hint";
import styles from "./FormSectionComponent.module.scss";

export const FormSectionComponent = ({
  dataTour,
  children,
  label,
  hintContent,
  hintPosition,
  hasHintIcon,
  isMaxWidth,
}) => {
  return (
    <div className={styles.section} data-tour={dataTour}>
      {hintContent ? (
        <Hint
          hintContent={hintContent}
          position={hintPosition}
          hasIcon={hasHintIcon}
          isMaxWidth={isMaxWidth}
        >
          <p className={styles.label}>{label}</p>
        </Hint>
      ) : (
        <p className={styles.label}>{label}</p>
      )}

      {children}
    </div>
  );
};
