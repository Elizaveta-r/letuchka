import React from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import styles from "./StaffingTablePage.module.scss";

const renderHeader = [
  "Подразделение / Сотрудник",
  ...Array.from({ length: 31 }, (_, i) => `${i + 1}`),
  "Итог",
];

const staffingData = [
  {
    id: "dep-1",
    title: "ПВЗ №1",
    employees: [
      {
        id: "emp-1",
        fullName: "Иванов Иван",
        position: "Оператор",
        workDays: {
          1: 8,
          2: 8,
          3: 0,
          4: 8,
          5: 0,
          6: 8,
          7: 0,
        },
        totalHours: 32,
      },
      {
        id: "emp-2",
        fullName: "Петров Петр",
        position: "Помощник",
        workDays: {
          1: 8,
          3: 8,
          4: 8,
          5: 8,
        },
        totalHours: 32,
      },
    ],
  },
  {
    id: "dep-2",
    title: "ПВЗ №2",
    employees: [
      {
        id: "emp-3",
        fullName: "Сидоров Сергей",
        position: "Кладовщик",
        workDays: {
          2: 8,
          3: 8,
          4: 8,
          6: 8,
        },
        totalHours: 32,
      },
    ],
  },
];

export default function StaffingTablePage() {
  return (
    <div className={styles.page}>
      <PageTitle title="Штатное расписание" />

      <div className={styles.tableContainer}>
        <div className={styles.scrollWrapper}>
          <div
            className={styles.grid}
            style={{
              gridTemplateColumns: `280px repeat(31, 70px) 90px`,
            }}
          >
            {/* ==== ШАПКА ==== */}
            {renderHeader.map((h, index) => (
              <div
                key={h}
                className={`${styles.headerCell} ${
                  index === 0 ? styles.stickyEmployee : ""
                } ${
                  index === renderHeader.length - 1 ? styles.stickyTotal : ""
                }`}
              >
                {h}
              </div>
            ))}

            {/* ==== КОНТЕНТ ==== */}
            {staffingData.map((dep) => (
              <React.Fragment key={dep.id}>
                {/* Подразделение */}
                <div
                  className={styles.departmentCell}
                  style={{ gridColumn: "1 / -1" }}
                >
                  {dep.title}
                </div>

                {/* Сотрудники */}
                {dep.employees.map((emp) => (
                  <React.Fragment key={emp.id}>
                    {/* Имя сотрудника */}
                    <div
                      className={`${styles.employeeCell} ${styles.stickyEmployee}`}
                    >
                      <div className={styles.name}>{emp.fullName}</div>
                      <div className={styles.position}>{emp.position}</div>
                    </div>

                    {/* Часы по дням */}
                    {Array.from({ length: 31 }, (_, i) => {
                      const day = (i + 1).toString();
                      const hours = emp.workDays?.[day];
                      return (
                        <div key={day} className={styles.dayCell}>
                          {hours > 0 ? hours : "–"}
                        </div>
                      );
                    })}

                    {/* Итог */}
                    <div
                      className={`${styles.totalCell} ${styles.stickyTotal}`}
                    >
                      {emp.totalHours}
                    </div>
                  </React.Fragment>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
