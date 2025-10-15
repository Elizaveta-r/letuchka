import { Contact, Pencil, Trash } from "lucide-react";
import styles from "./EmployeeRow.module.scss";
import { getInitials } from "../../utils/methods/getInitials";
import { useSelector } from "react-redux";

export default function EmployeeRow({
  id,
  departments,
  firstname,
  patronymic,
  surname,
  positions,
  role,

  checkedIn,
  onShowDetails,
  onShowContacts,
  onDelete,
  onEdit,
}) {
  const allDepartments = useSelector(
    (state) => state?.departments?.departments
  );
  const allPositions = useSelector((state) => state?.positions?.positions);

  const employeeDepartmentIdsSet = new Set(departments.map((dep) => dep.id));
  const employeePositionIdsSet = new Set(positions.map((pos) => pos.id));

  const getRoleName = () => {
    switch (role) {
      case "employee":
        return "Сотрудник";
      case "head":
        return "Руководитель";
      default:
        return "";
    }
  };

  const departmentsForEmployee = allDepartments.filter((department) =>
    employeeDepartmentIdsSet.has(department.id)
  );

  const positionsForEmployee = allPositions.filter((position) =>
    employeePositionIdsSet.has(position.id)
  );

  const fullName = `${surname} ${firstname} ${patronymic}`;
  const initials = getInitials(fullName);

  return (
    <div className={styles.dataItem}>
      <div
        className={styles.nameCell}
        onClick={onShowDetails}
        style={{ cursor: "pointer" }}
      >
        <div className={styles.avatar}>{initials}</div>
        <p className={styles.nameEmp}>{fullName}</p>
      </div>

      <div>
        {positionsForEmployee.map((position, index) => {
          return (
            <p key={`position-${index}`} className={styles.positionCol}>
              {position.name}
            </p>
          );
        })}
      </div>

      <p className={styles.roleCol}>{getRoleName()}</p>

      <div>
        {departmentsForEmployee.map((department, index) => {
          return (
            <p key={`department-${index}`} className={styles.department}>
              {department.name}
            </p>
          );
        })}
      </div>

      <div className={styles.statusIndicator}>
        <div
          className={`${styles.dot} ${checkedIn ? styles.on : styles.off}`}
        ></div>
      </div>

      <div className={styles.actions}>
        <div className={styles.edit} onClick={onShowContacts}>
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
