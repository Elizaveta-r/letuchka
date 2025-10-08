import { Plus } from "lucide-react";
import { Button } from "../../ui/Button/Button";
import styles from "./PageTitle.module.scss";

export default function PageTitle({
  title,
  hasButton,
  onClick,
  buttonTitle = "Добавить",
}) {
  return (
    <div className={styles.container}>
      <div className={styles.title}>{title}</div>
      {hasButton && (
        <Button
          secondary
          leftIcon={<Plus size={16} />}
          title={buttonTitle}
          onClick={onClick}
        />
      )}
    </div>
  );
}
