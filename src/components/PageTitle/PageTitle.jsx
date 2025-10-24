import { Plus } from "lucide-react";
import { Button } from "../../ui/Button/Button";
import styles from "./PageTitle.module.scss";

export default function PageTitle({
  dataTour,
  id,
  btnId,
  title,
  hasButton,
  leftIcon = <Plus size={16} />,
  onClick,
  buttonTitle = "Добавить",
  hint,
}) {
  return (
    <div className={styles.container}>
      <div className={styles.title} id={id}>
        {title}
        <p className={styles.info}>{hint}</p>
      </div>
      {hasButton && (
        <Button
          dataTour={dataTour}
          id={btnId}
          secondary
          leftIcon={leftIcon}
          title={buttonTitle}
          onClick={onClick}
        />
      )}
    </div>
  );
}
