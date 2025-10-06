import { Contact, Pencil, Trash } from "lucide-react";
import styles from "./EmployeeRow.module.scss";
import { getInitials } from "../../utils/methods/getInitials";

export default function EmployeeRow({
  name,
  position,
  role,
  department,
  checkedIn,
  onShowDetails,
  onDelete,
  onEdit,
}) {
  const initials = getInitials(name);

  return (
    <div className={styles.dataItem}>
      <div
        className={styles.nameCell}
        onClick={onShowDetails}
        style={{ cursor: "pointer" }}
      >
        <div className={styles.avatar}>{initials}</div>
        <p className={styles.nameEmp}>{name}</p>
      </div>

      <p className={styles.positionCol}>{position}</p>

      <p className={styles.roleCol}>{role}</p>

      <p className={styles.department}>{department}</p>

      <div className={styles.statusIndicator}>
        <div
          className={`${styles.dot} ${checkedIn ? styles.on : styles.off}`}
        ></div>
      </div>

      <div className={styles.actions}>
        <div className={styles.edit} onClick={onEdit}>
          <Contact size={16} />
        </div>
        <div className={styles.trash} onClick={onDelete}>
          <Trash size={16} />
        </div>
        <div className={styles.edit} onClick={onEdit}>
          <Pencil size={16} />
        </div>
      </div>
    </div>
  );
}
